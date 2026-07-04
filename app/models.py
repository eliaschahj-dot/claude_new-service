"""도메인 모델 — 신호(Signal)와 코호트(Cohort).

신호: 공개 데이터 소스에서 수집된 단일 이벤트 (공시, 행정처분, 리콜, 판결, 뉴스, 집단민원).
코호트: 동일 피고 + 동일 원인으로 묶인 잠재 원고 집단.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


# 데이터 소스 식별자
SOURCES = {
    "dart":      {"label": "전자공시 (DART)",        "org": "금융감독원"},
    "ftc":       {"label": "공정위 의결·과징금",      "org": "공정거래위원회"},
    "fss":       {"label": "금융감독원 제재·분조위",  "org": "금융감독원"},
    "molit":     {"label": "국토부 행정처분",         "org": "국토교통부"},
    "recall":    {"label": "리콜·위해정보",           "org": "국표원·소비자원"},
    "pipc":      {"label": "개인정보위 처분",         "org": "개인정보보호위원회"},
    "court":     {"label": "판결문 (1심·하급심)",     "org": "대법원 판결서 열람"},
    "news":      {"label": "뉴스·언론 보도",          "org": "언론사 API"},
    "complaint": {"label": "집단 민원·커뮤니티",      "org": "국민신문고·커뮤니티 크롤링"},
}


@dataclass
class RawEvent:
    """커넥터가 수집한 가공 전 이벤트 — 추출 단계(extract)를 거쳐 Signal이 된다."""
    source: str                 # SOURCES 키
    date: str                   # YYYY-MM-DD
    title: str
    body: str = ""              # 요약/본문 (있는 만큼)
    url: str = ""
    org_hint: str = ""          # 소스가 이미 아는 회사명 (DART corp_name 등)


@dataclass
class Signal:
    id: str
    source: str                 # SOURCES 키
    date: str                   # YYYY-MM-DD
    title: str
    summary: str
    defendant: str              # 잠재 피고 (책임 주체)
    cause_tag: str              # 동일 원인 클러스터링 키
    category: str               # 사건 유형 (건설하자, 금융, 제조물, 하도급, 개인정보, 증권)
    severity: int = 3           # 1~5, 신호 자체의 중대성
    evidence_weight: int = 0    # 코호트 증거강도 기여 점수 (0~12)
    affected_estimate: int = 0  # 이 신호가 시사하는 피해자 규모
    url: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["source_label"] = SOURCES[self.source]["label"]
        d["source_org"] = SOURCES[self.source]["org"]
        return d


@dataclass
class CohortMeta:
    """cause_tag별 법률 검토 메타데이터 (엔진 규칙 + 변호사 검토로 채워지는 영역)."""
    cause_tag: str
    name: str
    category: str
    description: str
    legal_basis: list[str]
    statute_note: str           # 소멸시효/제척기간 요지
    statute_deadline: str       # YYYY-MM-DD (가장 임박한 기산 기준)
    claim_per_victim: int       # 1인당 추정 청구액 (원)
    defendant_solvency: int     # 피고 자력 0~15 (상장·대기업 여부 등)
    precedent_note: str = ""    # 유사 승소 판례 요지


@dataclass
class Cohort:
    id: str
    meta: CohortMeta
    defendant: str
    signals: list[Signal] = field(default_factory=list)
    est_victims: int = 0
    est_total_claim: int = 0
    months_to_deadline: int = 0
    score: int = 0
    score_parts: dict = field(default_factory=dict)
    status: str = "신규 포착"

    def to_dict(self, with_signals: bool = False) -> dict:
        d = {
            "id": self.id,
            "name": self.meta.name,
            "category": self.meta.category,
            "description": self.meta.description,
            "defendant": self.defendant,
            "legal_basis": self.meta.legal_basis,
            "statute_note": self.meta.statute_note,
            "statute_deadline": self.meta.statute_deadline,
            "precedent_note": self.meta.precedent_note,
            "claim_per_victim": self.meta.claim_per_victim,
            "est_victims": self.est_victims,
            "est_total_claim": self.est_total_claim,
            "months_to_deadline": self.months_to_deadline,
            "score": self.score,
            "score_parts": self.score_parts,
            "status": self.status,
            "signal_count": len(self.signals),
            "source_count": len({s.source for s in self.signals}),
        }
        if with_signals:
            d["signals"] = [s.to_dict() for s in sorted(self.signals, key=lambda s: s.date)]
        return d
