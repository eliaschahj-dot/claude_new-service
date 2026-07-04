"""원고레이더 (Plaintiff Radar) — 잠재 원고 발굴 엔진 API 서버.

실행:  uvicorn app.main:app --reload

파이프라인: 수집(ingest) → 구조화 추출(extract) → 클러스터링(cluster) → 스코어링(scoring)
API 키(DART_API_KEY, NAVER_CLIENT_ID/SECRET, ANTHROPIC_API_KEY)가 있으면 해당
컴포넌트가 라이브 모드로 동작하고, 없으면 데모 시드로 폴백한다.
"""
from __future__ import annotations

import logging
import uuid
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .engine.cluster import build_cohorts
from .engine.extract import get_extractor
from .engine.ingest import ALL_CONNECTORS, ingest_all
from .engine.scoring import score_all

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="원고레이더 — 잠재 원고 발굴 엔진", version="0.2.0")

WEB_DIR = Path(__file__).resolve().parent.parent / "web"

# ── 엔진 상태 ────────────────────────────────────────────────────────────
SIGNALS: list = []
COHORTS: list = []
EXTRACTOR = get_extractor()
CAMPAIGNS: dict[str, dict] = {}
LAST_RUN: str = ""


def run_pipeline() -> None:
    """수집 → 추출 → 클러스터링 → 스코어링 전체 파이프라인 실행."""
    global SIGNALS, COHORTS, LAST_RUN
    seeded, raw_events = ingest_all()
    extracted = EXTRACTOR.extract(raw_events) if raw_events else []
    SIGNALS = seeded + extracted
    COHORTS = score_all(build_cohorts(SIGNALS, extractor=EXTRACTOR))
    LAST_RUN = date.today().isoformat()


run_pipeline()


@app.get("/api/stats")
def stats():
    today = date.today()
    week_ago = (today - timedelta(days=7)).isoformat()
    counts = Counter(s.date for s in SIGNALS)
    trend = [
        {"date": (today - timedelta(days=d)).isoformat(),
         "count": counts.get((today - timedelta(days=d)).isoformat(), 0)}
        for d in range(29, -1, -1)
    ]
    return {
        "sources_active": len(ALL_CONNECTORS),
        "signals_total": len(SIGNALS),
        "signals_this_week": sum(1 for s in SIGNALS if s.date >= week_ago),
        "cohorts_active": len(COHORTS),
        "cohorts_urgent": sum(1 for c in COHORTS if c.status == "즉시 검토 권고"),
        "est_total_claim": sum(c.est_total_claim for c in COHORTS),
        "est_total_victims": sum(c.est_victims for c in COHORTS),
        "signal_trend": trend,
    }


@app.get("/api/pipeline")
def pipeline():
    """파이프라인 컴포넌트별 동작 모드."""
    return {
        "last_run": LAST_RUN,
        "components": [
            {"name": "수집 — 전자공시 (OpenDART)",
             "mode": "실시간 연동" if config.dart_live() else "데모 (DART_API_KEY 미설정)"},
            {"name": "수집 — 뉴스 (네이버 검색 API)",
             "mode": "실시간 연동" if config.naver_live() else "데모 (NAVER_CLIENT_ID/SECRET 미설정)"},
            {"name": "수집 — 기타 7개 소스",
             "mode": "데모 (커넥터별 실전 연동 예정)"},
            {"name": "구조화 추출", "mode": EXTRACTOR.mode},
            {"name": "클러스터링 + 스코어링", "mode": "엔진 내장"},
        ],
    }


@app.post("/api/refresh")
def refresh():
    """파이프라인 재실행 — 라이브 소스 재수집."""
    run_pipeline()
    return {"ok": True, "signals": len(SIGNALS), "cohorts": len(COHORTS)}


@app.get("/api/cohorts")
def cohorts():
    return [c.to_dict() for c in COHORTS]


@app.get("/api/cohorts/{cohort_id}")
def cohort_detail(cohort_id: str):
    for c in COHORTS:
        if c.id == cohort_id:
            return c.to_dict(with_signals=True)
    raise HTTPException(404, "코호트를 찾을 수 없습니다")


@app.get("/api/signals")
def signals(limit: int = 30):
    ordered = sorted(SIGNALS, key=lambda s: s.date, reverse=True)
    return [s.to_dict() for s in ordered[:limit]]


@app.get("/api/sources")
def sources():
    return [c.describe() for c in ALL_CONNECTORS]


@app.post("/api/cohorts/{cohort_id}/campaign")
def create_campaign(cohort_id: str):
    """수임 캠페인 초안 생성 — 피해자 접점 채널과 안내문 초안을 만든다.

    생성물은 어디까지나 '초안'이며, 게시 전 대한변협 변호사광고 규정에 따른
    심사·검토를 거치도록 워크플로우가 강제한다 (배포 버튼 없음).
    """
    cohort = next((c for c in COHORTS if c.id == cohort_id), None)
    if cohort is None:
        raise HTTPException(404, "코호트를 찾을 수 없습니다")

    campaign_id = f"cmp-{uuid.uuid4().hex[:8]}"
    m = cohort.meta
    draft = (
        f"[{m.category}] {m.name} — 권리구제 안내 (초안)\n\n"
        f"본 법률사무소는 {cohort.defendant} 관련 사안에 대하여 공개된 행정처분·판결 등 "
        f"객관적 자료를 검토한 결과, 유사한 피해를 입으신 분들에게 법적 구제 수단이 "
        f"존재할 수 있다고 판단하고 있습니다.\n\n"
        f"■ 검토된 법적 근거: {', '.join(m.legal_basis)}\n"
        f"■ 권리행사 기간 유의: {m.statute_note}\n"
        f"■ 예상 절차: 사실관계 확인 → 참여 접수 → 공동소송(또는 조정) 제기\n\n"
        f"해당 여부 확인 및 상담을 원하시는 분은 아래 확인 페이지에서 간단한 정보를 "
        f"입력해 주시기 바랍니다. 확인 절차는 무료이며 참여 의무가 없습니다.\n\n"
        f"※ 본 안내는 광고이며, 게시 전 대한변호사협회 광고규정 심사 대상입니다."
    )
    campaign = {
        "id": campaign_id,
        "cohort_id": cohort_id,
        "cohort_name": m.name,
        "created": date.today().isoformat(),
        "status": "초안 — 광고규정 심사 대기",
        "channels": ["피해자 확인 랜딩페이지", "관련 커뮤니티 공지(관리자 협의)", "보도자료"],
        "landing_url": f"/check?cohort={cohort_id}",
        "draft_notice": draft,
    }
    CAMPAIGNS[campaign_id] = campaign
    cohort.status = "캠페인 준비 중"
    return campaign


@app.get("/api/check/{cohort_id}")
def check_info(cohort_id: str):
    """피해자 셀프 확인 페이지용 — 공개 가능한 최소 정보만 노출."""
    for c in COHORTS:
        if c.id == cohort_id:
            return {
                "name": c.meta.name,
                "category": c.meta.category,
                "description": c.meta.description,
                "statute_note": c.meta.statute_note,
            }
    raise HTTPException(404, "코호트를 찾을 수 없습니다")


@app.get("/")
def index():
    return FileResponse(WEB_DIR / "index.html")


app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")
