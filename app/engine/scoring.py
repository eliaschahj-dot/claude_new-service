"""코호트 스코어링 — 수임 우선순위 점수 (0~100).

구성 요소
  증거 강도 (0~30): 행정처분·판결·리콜 등 공적 확인 신호의 가중 합.
                    공정위 의결서·1심 승소처럼 민사에서 원용 가능한 증거일수록 높다.
  사건 규모 (0~25): 추정 총 청구액의 로그 스케일. 규모의 경제가 성립하는지.
  신호 응집 (0~15): 독립된 소스 수 + 신호 밀도. 서로 다른 기관이 같은 사실을
                    가리킬수록 오탐 가능성이 낮다.
  시효 긴급 (0~15): 소멸시효·제척기간 잔여. 6~24개월 구간이 최고점 —
                    너무 임박하면 실무상 수행 불가, 너무 멀면 우선순위 낮음.
  피고 자력 (0~15): 집행 가능성. 상장·대기업 여부, 자산 규모 프록시.
"""
from __future__ import annotations

import math

from ..models import Cohort


def score_cohort(c: Cohort) -> None:
    evidence = min(30, sum(s.evidence_weight for s in c.signals))

    scale = 0
    if c.est_total_claim > 0:
        # 1억 → ~8점, 100억 → ~17점, 1조 → 25점 상한
        scale = min(25, round(math.log10(c.est_total_claim / 1e8 + 1) * 8) + 8)

    sources = len({s.source for s in c.signals})
    cohesion = min(15, sources * 3 + max(0, len(c.signals) - sources))

    m = c.months_to_deadline
    if m <= 3:
        urgency = 6          # 수행 리스크가 큰 초임박 구간
    elif m <= 24:
        urgency = 15         # 골든타임
    elif m <= 36:
        urgency = 10
    else:
        urgency = 5

    solvency = min(15, c.meta.defendant_solvency)

    c.score_parts = {
        "증거 강도": {"value": evidence, "max": 30},
        "사건 규모": {"value": scale, "max": 25},
        "신호 응집": {"value": cohesion, "max": 15},
        "시효 긴급": {"value": urgency, "max": 15},
        "피고 자력": {"value": solvency, "max": 15},
    }
    c.score = evidence + scale + cohesion + urgency + solvency

    if c.status.startswith("자동 초안"):
        return  # 미검토 클러스터는 변호사 검토 전까지 상태를 유지한다
    if c.score >= 75:
        c.status = "즉시 검토 권고"
    elif c.score >= 55:
        c.status = "검토 대상"
    else:
        c.status = "모니터링"


def score_all(cohorts: list[Cohort]) -> list[Cohort]:
    for c in cohorts:
        score_cohort(c)
    return sorted(cohorts, key=lambda c: c.score, reverse=True)
