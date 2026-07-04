"""데모 시드 데이터.

⚠️ 모든 회사명·사건·처분 내용은 시연을 위해 창작된 가상의 것입니다.
   실존 기업·사건과 무관하며, 실서비스에서는 ingest 커넥터가 수집한
   실제 공개 데이터로 대체됩니다.

날짜는 서버 실행일 기준 상대 오프셋으로 생성되어 데모가 항상 '오늘' 기준으로 보입니다.
"""
from __future__ import annotations

from datetime import date, timedelta

from .models import Signal, CohortMeta


def _d(days_ago: int) -> str:
    return (date.today() - timedelta(days=days_ago)).isoformat()


def _deadline(months_ahead: int) -> str:
    return (date.today() + timedelta(days=months_ahead * 30)).isoformat()


def seed_signals() -> list[Signal]:
    return [
        # ── 1. 대건종합건설: 차음재 등급 미달 자재 대체 시공 (건설하자) ──────────
        Signal(id="sig-001", source="molit", date=_d(126),
               title="㈜대건종합건설 영업정지 2개월 처분 — 층간 차음재 성능기준 미달 시공",
               summary="국토부 특별점검 결과, 사업계획승인 도면상 1등급 완충재 대신 미인증 저가 자재로 대체 시공한 사실 확인. 건설산업기본법 위반 영업정지.",
               defendant="㈜대건종합건설", cause_tag="daegun-sound-insulation", category="건설하자",
               severity=5, evidence_weight=12, affected_estimate=0),
        Signal(id="sig-002", source="court", date=_d(84),
               title="수원지법 1심 — 청솔마을A단지 입주자대표회의 승소 (하자보수비 74억 인용)",
               summary="동일 시공사·동일 자재 대체 쟁점. 감정 결과 전 세대 차음성능 미달 인정, 손해배상 74억 원 인용. 항소심 계속 중.",
               defendant="㈜대건종합건설", cause_tag="daegun-sound-insulation", category="건설하자",
               severity=5, evidence_weight=12, affected_estimate=1120),
        Signal(id="sig-003", source="complaint", date=_d(41),
               title="B신도시 3개 단지 입주민 카페 — 층간소음 집단민원 급증 (주간 340건)",
               summary="동일 시공사 시공 단지 3곳에서 층간소음 민원이 입주 직후부터 폭증. '같은 자재 문제 아니냐'는 게시글 다수.",
               defendant="㈜대건종합건설", cause_tag="daegun-sound-insulation", category="건설하자",
               severity=3, evidence_weight=4, affected_estimate=2847),
        Signal(id="sig-004", source="news", date=_d(12),
               title="[단독] 대건건설, 최소 5개 현장서 차음재 무단 대체 정황 — 내부 구매서류 입수",
               summary="언론이 입수한 자재 구매 내역상 승인 자재와 시공 자재가 불일치하는 현장이 추가로 확인됨.",
               defendant="㈜대건종합건설", cause_tag="daegun-sound-insulation", category="건설하자",
               severity=4, evidence_weight=6, affected_estimate=4200),
        Signal(id="sig-005", source="dart", date=_d(7),
               title="㈜대건종합건설 — 소송 등의 제기 공시 (하자소송 3건 계류)",
               summary="자기자본 대비 12.4% 규모 하자 관련 소송 계류 공시. 충당부채 적립 개시.",
               defendant="㈜대건종합건설", cause_tag="daegun-sound-insulation", category="건설하자",
               severity=3, evidence_weight=5, affected_estimate=0),

        # ── 2. 청람자산운용: 사모펀드 불완전판매 (금융) ─────────────────────────
        Signal(id="sig-011", source="fss", date=_d(97),
               title="청람자산운용 기관경고·과태료 8.7억 — '글로벌인프라 7호' 부실 은폐",
               summary="기초자산 부실을 알고도 판매사에 고지하지 않고 판매 지속. 자본시장법상 부당권유 해당.",
               defendant="청람자산운용", cause_tag="chungram-fund", category="금융",
               severity=5, evidence_weight=12, affected_estimate=830),
        Signal(id="sig-012", source="fss", date=_d(55),
               title="금융분쟁조정위 — 대표 사례 손해액 40% 배상 결정",
               summary="분조위가 판매사 설명의무 위반 인정, 기본배상비율 40% 결정. 나머지 피해자는 개별 소송 필요.",
               defendant="청람자산운용", cause_tag="chungram-fund", category="금융",
               severity=4, evidence_weight=10, affected_estimate=830),
        Signal(id="sig-013", source="news", date=_d(19),
               title="청람운용 내부 문건 '손실 확정적, 판매는 계속' — 사기적 부정거래 정황",
               summary="부실 인지 시점을 앞당기는 내부 문건 보도. 민법 불법행위 및 자본시장법 손해배상 청구 근거 강화.",
               defendant="청람자산운용", cause_tag="chungram-fund", category="금융",
               severity=4, evidence_weight=6, affected_estimate=0),

        # ── 3. 에코모빌: 전기스쿠터 배터리 화재 (제조물) ────────────────────────
        Signal(id="sig-021", source="recall", date=_d(63),
               title="국표원 — ㈜에코모빌 전기스쿠터 EM-5 리콜 명령 (배터리 셀 결함)",
               summary="충전 중 발화 위험으로 판매 중지 및 리콜 명령. 대상 18,000대.",
               defendant="㈜에코모빌", cause_tag="ecomobil-battery", category="제조물",
               severity=5, evidence_weight=10, affected_estimate=18000),
        Signal(id="sig-022", source="complaint", date=_d(48),
               title="소비자원 위해정보 — EM-5 화재·발열 접수 6개월간 214건",
               summary="동일 모델 위해정보 급증. 재산피해 동반 사례 37건.",
               defendant="㈜에코모빌", cause_tag="ecomobil-battery", category="제조물",
               severity=4, evidence_weight=6, affected_estimate=214),
        Signal(id="sig-023", source="news", date=_d(9),
               title="지하주차장 화재로 차량 11대 전소 — 발화지점은 에코모빌 스쿠터",
               summary="소방당국 감식 결과 EM-5 배터리팩 발화로 추정. 인접 차주들 배상 문제 대두.",
               defendant="㈜에코모빌", cause_tag="ecomobil-battery", category="제조물",
               severity=4, evidence_weight=5, affected_estimate=0),

        # ── 4. 한빛중공업: 하도급대금 부당감액 (하도급) ─────────────────────────
        Signal(id="sig-031", source="ftc", date=_d(140),
               title="공정위 — ㈜한빛중공업 과징금 96억, 하도급대금 부당감액·부당특약",
               summary="협력사 140곳에 일률적 단가 인하 소급 적용. 하도급법 위반 시정명령 및 과징금.",
               defendant="㈜한빛중공업", cause_tag="hanbit-subcontract", category="하도급",
               severity=5, evidence_weight=12, affected_estimate=140),
        Signal(id="sig-032", source="court", date=_d(70),
               title="서울중앙지법 — 협력사 1곳 부당감액분 청구 일부승소 (감액분 + 지연이자 인용)",
               summary="공정위 의결서를 주요 증거로 부당감액분 12억 인용. 동일 구조 피해 협력사 다수 존재.",
               defendant="㈜한빛중공업", cause_tag="hanbit-subcontract", category="하도급",
               severity=4, evidence_weight=12, affected_estimate=1),
        Signal(id="sig-033", source="dart", date=_d(30),
               title="㈜한빛중공업 — 공정위 처분 관련 행정소송 제기 공시",
               summary="과징금 취소소송 제기. 민사 손해배상과 별개로 진행되나 쟁점 판단에 영향.",
               defendant="㈜한빛중공업", cause_tag="hanbit-subcontract", category="하도급",
               severity=2, evidence_weight=3, affected_estimate=0),

        # ── 5. 퀵딜리버리: 개인정보 87만건 유출 (개인정보) ──────────────────────
        Signal(id="sig-041", source="pipc", date=_d(52),
               title="개인정보위 — ㈜퀵딜리버리 과징금 23.4억, 이용자 87만명 정보 유출",
               summary="접근통제 미비로 이름·주소·전화번호 유출. 안전조치의무 위반 확인.",
               defendant="㈜퀵딜리버리", cause_tag="quickdel-breach", category="개인정보",
               severity=5, evidence_weight=12, affected_estimate=870000),
        Signal(id="sig-042", source="complaint", date=_d(33),
               title="유출 피해자 커뮤니티 개설 — 가입 2주만에 4.1만명, 스미싱 피해 보고 증가",
               summary="유출 정보 기반 스미싱·보이스피싱 2차 피해 사례 취합 중.",
               defendant="㈜퀵딜리버리", cause_tag="quickdel-breach", category="개인정보",
               severity=3, evidence_weight=4, affected_estimate=41000),
        Signal(id="sig-043", source="news", date=_d(21),
               title="퀵딜리버리, 유출 사실 인지 후 38일간 미통지 — 은폐 논란",
               summary="개인정보보호법상 통지의무 위반 정황. 위자료 산정에 가중 요소.",
               defendant="㈜퀵딜리버리", cause_tag="quickdel-breach", category="개인정보",
               severity=4, evidence_weight=5, affected_estimate=0),

        # ── 6. 네오바이오팜: 분식회계·허위공시 (증권) ───────────────────────────
        Signal(id="sig-051", source="dart", date=_d(45),
               title="㈜네오바이오팜 — 감사의견 거절, 매출 62% 허위계상 정황",
               summary="외부감사인이 매출채권 실재성 확인 불가로 의견거절. 거래정지.",
               defendant="㈜네오바이오팜", cause_tag="neobio-accounting", category="증권",
               severity=5, evidence_weight=8, affected_estimate=12000),
        Signal(id="sig-052", source="fss", date=_d(24),
               title="증선위 — 네오바이오팜 회계처리기준 위반 과징금·검찰 고발",
               summary="고의 분식 판단. 자본시장법 제162조 손해배상 및 증권관련집단소송 요건 사실상 충족.",
               defendant="㈜네오바이오팜", cause_tag="neobio-accounting", category="증권",
               severity=5, evidence_weight=12, affected_estimate=12000),
        Signal(id="sig-053", source="news", date=_d(5),
               title="네오바이오팜 소액주주 연대 결성 — 참여 주주 3,800명 돌파",
               summary="거래정지 직전 1년간 매수 주주 중심으로 집단소송 참여 모집 중.",
               defendant="㈜네오바이오팜", cause_tag="neobio-accounting", category="증권",
               severity=3, evidence_weight=4, affected_estimate=3800),
    ]


def seed_cohort_meta() -> dict[str, CohortMeta]:
    metas = [
        CohortMeta(
            cause_tag="daegun-sound-insulation",
            name="차음재 등급미달 대체시공 피해 단지",
            category="건설하자",
            description="동일 시공사가 다수 현장에서 승인 자재(1등급 완충재)를 미인증 저가 자재로 대체 시공. "
                        "1개 단지 1심 승소 판결이 이미 존재하며, 동일 쟁점·동일 감정방법이 그대로 적용 가능한 "
                        "인접 단지들이 아직 청구권 행사를 하지 않은 상태.",
            legal_basis=["집합건물법 제9조 하자담보책임", "공동주택관리법 제37조", "민법 제667조·제750조"],
            statute_note="주요구조부 외 하자 담보책임기간 및 인도 후 기산 제척기간 관리 필요 — 최선순위 단지 기준",
            statute_deadline=_deadline(14),
            claim_per_victim=6_500_000,
            defendant_solvency=11,
            precedent_note="수원지법 1심: 동일 자재 대체 쟁점으로 세대당 평균 660만 원 인용 (항소심 계속 중)",
        ),
        CohortMeta(
            cause_tag="chungram-fund",
            name="글로벌인프라 7호 펀드 불완전판매 피해자",
            category="금융",
            description="운용사가 기초자산 부실을 인지한 이후에도 판매를 지속. 분조위 40% 배상결정은 대표 사례에 "
                        "한정되어, 나머지 투자자 대부분이 개별 청구권 미행사 상태. 내부 문건 보도로 고의성 입증 가능성 상승.",
            legal_basis=["자본시장법 제48조·제64조", "민법 제750조 불법행위", "구 자본시장법 부당권유 금지"],
            statute_note="불법행위 손해배상 — 손해 및 가해자를 안 날로부터 3년 (분조위 결정일 기산 시 임박)",
            statute_deadline=_deadline(9),
            claim_per_victim=95_000_000,
            defendant_solvency=8,
            precedent_note="유사 사모펀드 사건 다수에서 판매사·운용사 공동불법행위 인정, 배상비율 40~80%",
        ),
        CohortMeta(
            cause_tag="ecomobil-battery",
            name="EM-5 배터리 결함 화재·재산피해자",
            category="제조물",
            description="리콜 명령으로 결함이 공적으로 확인된 상태. 화재로 인한 재산피해자(차량·건물)와 "
                        "리콜 미보상 구매자 그룹으로 이원화. 결함 입증 부담이 리콜 명령으로 크게 완화됨.",
            legal_basis=["제조물책임법 제3조", "민법 제750조", "소비자기본법"],
            statute_note="제조물책임 — 손해·배상의무자를 안 날로부터 3년, 공급일로부터 10년",
            statute_deadline=_deadline(28),
            claim_per_victim=4_200_000,
            defendant_solvency=6,
            precedent_note="배터리 발화 제조물 사건에서 리콜 명령을 결함 추정 근거로 채택한 하급심 다수",
        ),
        CohortMeta(
            cause_tag="hanbit-subcontract",
            name="하도급대금 부당감액 피해 협력사",
            category="하도급",
            description="공정위 의결서가 위반행위·감액 규모를 특정한 상태에서 협력사 1곳이 이미 민사 승소. "
                        "동일 의결서를 원용할 수 있는 나머지 협력사 139곳이 미청구 상태. 하도급법상 3배 배상 청구 검토 대상.",
            legal_basis=["하도급법 제35조 (징벌적 3배 배상)", "민법 제741조 부당이득", "공정위 의결서 원용"],
            statute_note="하도급법 손해배상 — 위반행위를 안 날로부터 3년 (공정위 의결 공개일 기산 유력)",
            statute_deadline=_deadline(18),
            claim_per_victim=850_000_000,
            defendant_solvency=13,
            precedent_note="서울중앙지법: 공정위 의결서의 사실인정을 그대로 채택하여 감액분 전액 인용",
        ),
        CohortMeta(
            cause_tag="quickdel-breach",
            name="퀵딜리버리 개인정보 유출 피해자",
            category="개인정보",
            description="과징금 처분으로 안전조치의무 위반이 확정적 수준으로 인정됨. 통지 지연으로 위자료 가중 요소 존재. "
                        "87만명 중 커뮤니티 결집 4.1만명 — 참여율을 높이면 규모의 경제가 성립하는 전형적 소액다수 사건.",
            legal_basis=["개인정보보호법 제39조 (법정손해배상 포함)", "민법 제750조·제751조"],
            statute_note="법정손해배상 선택 가능 — 안 날로부터 3년, 유출일로부터 10년",
            statute_deadline=_deadline(31),
            claim_per_victim=300_000,
            defendant_solvency=9,
            precedent_note="대규모 유출 사건 위자료 10만~30만 원 인용례 다수, 통지 지연 시 상향 경향",
        ),
        CohortMeta(
            cause_tag="neobio-accounting",
            name="네오바이오팜 분식회계 피해 소액주주",
            category="증권",
            description="증선위 고의 분식 판단 + 검찰 고발로 위법성 입증 부담이 사실상 해소. 증권관련집단소송 "
                        "허가요건(구성원 50인 이상, 지분 1만분의 1) 충족. 거래정지 전 1년 매수분 손해액 산정 자동화 가능.",
            legal_basis=["자본시장법 제162조", "증권관련집단소송법", "외부감사법 제31조"],
            statute_note="자본시장법 제162조 — 안 날로부터 1년, 공시일로부터 3년 (1년 단기시효 관리 시급)",
            statute_deadline=_deadline(10),
            claim_per_victim=18_000_000,
            defendant_solvency=4,
            precedent_note="고의 분식 + 의견거절 조합 사건에서 회사·감사인 연대책임 인정례 다수",
        ),
    ]
    return {m.cause_tag: m for m in metas}
