"""코호트 클러스터링 — 신호를 '동일 피고 + 동일 원인' 단위로 묶는다.

클러스터 키는 추출 단계가 부여한 cause_tag다:
  - 데모 시드 신호: 시드에 미리 부여된 태그 → seed_cohort_meta()의 검토 완료 메타 사용
  - 라이브 신호: LLM 추출기가 생성한 원인 시그니처 → 메타가 없으므로
    추출기의 draft_cohort_meta()로 법률 검토 '초안'을 만들어 검토 대기 상태로 노출

실서비스 고도화 지점: 법인 동일성 해소(상호 변경·계열사·합병 이력 매칭)와
임베딩 유사도 기반 원인 병합이 이 단계에 추가된다.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date

from ..models import Signal, Cohort
from ..seed_data import seed_cohort_meta


def build_cohorts(signals: list[Signal], extractor=None) -> list[Cohort]:
    metas = seed_cohort_meta()
    grouped: dict[str, list[Signal]] = defaultdict(list)
    for s in signals:
        grouped[s.cause_tag].append(s)

    cohorts: list[Cohort] = []
    for i, (tag, sigs) in enumerate(sorted(grouped.items()), start=1):
        sigs = sorted(sigs, key=lambda s: s.date)
        meta = metas.get(tag)
        auto_drafted = False
        if meta is None:
            if extractor is None:
                continue
            # 미검토 클러스터 — 법률 메타 초안을 자동 생성해 검토 대기 큐로
            meta = extractor.draft_cohort_meta(tag, sigs)
            auto_drafted = True

        est_victims = max((s.affected_estimate for s in sigs), default=0)
        deadline = date.fromisoformat(meta.statute_deadline)
        months_left = max(0, (deadline - date.today()).days // 30)
        cohort = Cohort(
            id=f"cohort-{i:02d}",
            meta=meta,
            defendant=sigs[0].defendant,
            signals=sigs,
            est_victims=est_victims,
            est_total_claim=est_victims * meta.claim_per_victim,
            months_to_deadline=months_left,
        )
        if auto_drafted:
            cohort.status = "자동 초안 — 변호사 검토 대기"
        cohorts.append(cohort)
    return cohorts
