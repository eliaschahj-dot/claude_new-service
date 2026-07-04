"""코호트 클러스터링 — 신호를 '동일 피고 + 동일 원인' 단위로 묶는다.

데모에서는 커넥터가 부여한 cause_tag를 그대로 클러스터 키로 사용한다.
실서비스에서는 이 단계가 LLM 파이프라인으로 대체된다:
  1) 신호 텍스트에서 (책임주체, 행위, 피해유형, 근거법령) 구조화 추출
  2) 법인 동일성 해소 (상호 변경·계열사·합병 이력 매칭)
  3) 임베딩 유사도 + 규칙 기반으로 '동일 원인' 판단 → cause_tag 부여
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date

from ..models import Signal, Cohort
from ..seed_data import seed_cohort_meta


def build_cohorts(signals: list[Signal]) -> list[Cohort]:
    metas = seed_cohort_meta()
    grouped: dict[str, list[Signal]] = defaultdict(list)
    for s in signals:
        grouped[s.cause_tag].append(s)

    cohorts: list[Cohort] = []
    for i, (tag, sigs) in enumerate(sorted(grouped.items()), start=1):
        meta = metas.get(tag)
        if meta is None:
            continue  # 메타 미검토 클러스터는 '검토 대기 큐'로 보낸다 (데모에서는 생략)
        est_victims = max((s.affected_estimate for s in sigs), default=0)
        deadline = date.fromisoformat(meta.statute_deadline)
        months_left = max(0, (deadline - date.today()).days // 30)
        cohorts.append(Cohort(
            id=f"cohort-{i:02d}",
            meta=meta,
            defendant=sigs[0].defendant,
            signals=sorted(sigs, key=lambda s: s.date),
            est_victims=est_victims,
            est_total_claim=est_victims * meta.claim_per_victim,
            months_to_deadline=months_left,
        ))
    return cohorts
