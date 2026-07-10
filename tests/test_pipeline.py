"""파이프라인 단위 테스트 — 실행: python -m pytest tests/ 또는 python tests/test_pipeline.py"""
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.engine.cluster import build_cohorts
from app.engine.extract import RuleBasedExtractor, ExtractedSignal, CohortMetaDraft
from app.engine.ingest import ingest_all
from app.engine.scoring import score_all
from app.models import RawEvent


def test_demo_pipeline(monkeypatch):
    """키 없는 환경: 시드 신호만으로 6개 코호트가 스코어링된다."""
    # 실행 환경에 실키가 있어도 테스트는 항상 데모 모드로 — 네트워크 비의존
    from app import config
    monkeypatch.setattr(config, "DART_API_KEY", "")
    monkeypatch.setattr(config, "NAVER_CLIENT_ID", "")
    monkeypatch.setattr(config, "NAVER_CLIENT_SECRET", "")
    seeded, raw = ingest_all()
    assert len(seeded) == 20
    assert raw == []  # 키가 없으면 라이브 수집 없음
    cohorts = score_all(build_cohorts(seeded))
    assert len(cohorts) == 6
    assert all(0 < c.score <= 100 for c in cohorts)
    assert cohorts[0].score == max(c.score for c in cohorts)


def test_rule_based_extraction_and_auto_draft():
    """라이브 원시 이벤트 → 규칙 추출 → 미검토 클러스터가 '검토 대기'로 생성된다."""
    ext = RuleBasedExtractor()
    today = date.today().isoformat()
    events = [
        RawEvent(source="dart", date=today,
                 title="㈜테스트건설 — 행정처분 등 관련 공시 (영업정지 3개월)",
                 body="부실시공에 따른 영업정지 처분", org_hint="㈜테스트건설"),
        RawEvent(source="news", date=today,
                 title="테스트건설, 아파트 하자 집단 민원 확산",
                 body="같은 시공사 단지에서 하자 신고 급증"),
        RawEvent(source="news", date=today,
                 title="오늘의 증시 마감 시황", body="코스피 보합"),  # 무관 → 걸러짐
    ]
    signals = ext.extract(events)
    assert len(signals) == 2, [s.title for s in signals]
    assert all(s.defendant for s in signals)

    cohorts = score_all(build_cohorts(signals, extractor=ext))
    auto = [c for c in cohorts if "검토 대기" in c.status]
    assert auto, "미검토 클러스터가 자동 초안 상태로 생성되어야 함"
    assert "변호사 검토" in auto[0].meta.legal_basis[0]


def test_llm_schemas_valid():
    """LLM 구조화 출력 스키마가 Pydantic으로 유효하게 구성된다 (API 호출 없이)."""
    s = ExtractedSignal(
        is_relevant=True, defendant="㈜테스트", category="건설하자",
        cause_summary="자재 대체 시공", cause_key="test-material-sub",
        severity=4, evidence_weight=10, affected_estimate=100,
    )
    assert s.category.value == "건설하자"
    d = CohortMetaDraft(
        name="테스트 코호트", description="설명", legal_basis=["민법 제750조"],
        statute_note="안 날로부터 3년", statute_months_left=24,
        claim_per_victim=1_000_000, defendant_solvency=8,
    )
    assert d.statute_months_left == 24


if __name__ == "__main__":
    test_demo_pipeline()
    test_rule_based_extraction_and_auto_draft()
    test_llm_schemas_valid()
    print("모든 테스트 통과 ✓")
