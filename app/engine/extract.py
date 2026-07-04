"""신호 구조화 추출 — RawEvent를 Signal로 변환한다.

두 가지 구현:
  LLMExtractor       Claude 구조화 출력(messages.parse + Pydantic)으로
                     (책임주체, 원인, 유형, 중대성, 증거강도, 피해규모)를 추출.
                     동일 원인 판단의 핵심인 cause_key(원인 시그니처)도 생성한다.
  RuleBasedExtractor 키워드 규칙 폴백 — ANTHROPIC_API_KEY가 없을 때.

대량 처리 시 확장 경로: 실서비스에서 일 수천 건 이상을 처리하게 되면
Message Batches API(50% 비용, 비동기)로 전환한다 — extract_batch() 참조 주석.
"""
from __future__ import annotations

import logging
import re
from enum import Enum

from pydantic import BaseModel, Field

from .. import config
from ..models import RawEvent, Signal, CohortMeta

log = logging.getLogger("wongo.extract")

CATEGORIES = ["건설하자", "금융", "제조물", "하도급", "개인정보", "증권", "기타"]


class Category(str, Enum):
    건설하자 = "건설하자"
    금융 = "금융"
    제조물 = "제조물"
    하도급 = "하도급"
    개인정보 = "개인정보"
    증권 = "증권"
    기타 = "기타"


class ExtractedSignal(BaseModel):
    """LLM이 원시 이벤트에서 추출하는 구조화 필드."""
    is_relevant: bool = Field(
        description="이 이벤트가 '다수 피해자의 민사 청구권'으로 이어질 수 있는 신호인지. "
                    "단순 실적공시, 인사, 광고성 기사 등은 false.")
    defendant: str = Field(
        description="잠재 피고(책임 주체) 법인명. 상호 표기를 정규화하고, 특정 불가하면 빈 문자열.")
    category: Category = Field(description="사건 유형 분류")
    cause_summary: str = Field(
        description="피해 원인 한 문장 요약 (예: '층간 차음재를 미인증 저가 자재로 대체 시공')")
    cause_key: str = Field(
        description="동일 원인 클러스터링용 시그니처. 소문자 영문 슬러그, "
                    "'회사식별자-원인식별자' 형태 (예: 'daegun-sound-insulation'). "
                    "같은 회사의 같은 원인이면 반드시 같은 값이 나오도록 일반적 단어를 사용.")
    severity: int = Field(ge=1, le=5, description="신호 중대성 1~5")
    evidence_weight: int = Field(
        ge=0, le=12,
        description="민사소송에서 증거로 원용 가능한 정도. 행정처분·판결·리콜명령 등 "
                    "공적 확인은 10~12, 언론 단독보도 5~7, 민원·커뮤니티 2~4.")
    affected_estimate: int = Field(
        ge=0, description="이 이벤트가 시사하는 피해자 규모 추정치. 근거 없으면 0.")


class CohortMetaDraft(BaseModel):
    """미검토 클러스터에 대한 법률 검토 메타 초안 — 반드시 변호사 검토를 거친다."""
    name: str = Field(description="코호트 이름 (예: '차음재 등급미달 대체시공 피해 단지')")
    description: str = Field(description="사건 구조와 청구권 미행사 상태에 대한 2~3문장 요약")
    legal_basis: list[str] = Field(description="검토할 법적 근거 조문 목록 (한국법)")
    statute_note: str = Field(description="소멸시효·제척기간 기산점과 유의사항 한 문장")
    statute_months_left: int = Field(ge=1, le=120, description="가장 임박한 시효까지 잔여 개월 추정")
    claim_per_victim: int = Field(ge=0, description="1인당 추정 청구액(원). 근거 없으면 0.")
    defendant_solvency: int = Field(ge=0, le=15, description="피고 자력 추정 0~15 (상장·대기업 여부)")


SYSTEM_PROMPT = """당신은 한국 로펌의 '잠재 원고 발굴 엔진'에서 공개 데이터 신호를 구조화하는 분석가다.

입력은 전자공시(DART), 행정처분, 리콜, 판결, 뉴스, 집단민원 등에서 수집된 원시 이벤트다.
목표는 '아직 청구권을 행사하지 않은 다수 피해자 집단'의 단서가 되는 신호를 골라내고,
동일 피고·동일 원인끼리 묶일 수 있도록 일관된 cause_key를 부여하는 것이다.

원칙:
- 사실만 사용한다. 입력에 없는 내용을 추정으로 단정하지 않는다.
- affected_estimate는 입력에 숫자 근거가 있을 때만 채우고, 없으면 0.
- cause_key는 클러스터링 키다: 같은 회사의 같은 원인은 항상 같은 슬러그가 되도록
  회사명 핵심어 + 원인 핵심어로 만든다.
- 법적 판단(승소 가능성 등)은 하지 않는다. 그것은 변호사의 영역이다."""

META_SYSTEM_PROMPT = """당신은 한국 로펌의 사건 검토 보조 시스템이다. 동일 피고·동일 원인으로
묶인 신호 목록을 받아 코호트의 법률 검토 메타 '초안'을 작성한다. 이 초안은 반드시
변호사 검토를 거치며, 근거가 부족한 항목은 보수적으로(0 또는 낮게) 채운다.
legal_basis는 실제 한국 법령·조문 형식으로 제안하되 '검토 필요' 수준의 제안임을 전제한다."""


class LLMExtractor:
    """Claude 구조화 출력 기반 추출기."""

    def __init__(self) -> None:
        import anthropic  # 키가 있을 때만 임포트 (데모 모드는 SDK 불필요)
        self._anthropic = anthropic
        self._client = anthropic.Anthropic()

    @property
    def mode(self) -> str:
        return f"LLM ({config.LLM_MODEL})"

    def extract(self, events: list[RawEvent]) -> list[Signal]:
        # 확장 경로: 이벤트가 수백 건 이상이면 client.messages.batches.create()로
        # 전환해 비용 50% 절감 + 비동기 처리 (custom_id로 매칭).
        signals: list[Signal] = []
        for i, ev in enumerate(events):
            try:
                parsed = self._extract_one(ev)
            except self._anthropic.RateLimitError:
                log.warning("레이트리밋 — 남은 %d건은 다음 주기에 처리", len(events) - i)
                break
            except self._anthropic.APIStatusError as e:
                log.warning("추출 API 오류(%s): %s", e.status_code, ev.title[:50])
                continue
            except self._anthropic.APIConnectionError:
                log.warning("네트워크 오류 — 추출 중단")
                break
            if parsed is None or not parsed.is_relevant or not parsed.defendant:
                continue
            signals.append(Signal(
                id=f"sig-live-{ev.source}-{i:04d}",
                source=ev.source,
                date=ev.date,
                title=ev.title,
                summary=parsed.cause_summary or ev.body,
                defendant=parsed.defendant,
                cause_tag=parsed.cause_key,
                category=parsed.category.value,
                severity=parsed.severity,
                evidence_weight=parsed.evidence_weight,
                affected_estimate=parsed.affected_estimate,
                url=ev.url,
            ))
        return signals

    def _extract_one(self, ev: RawEvent) -> ExtractedSignal | None:
        prompt = (
            f"[소스] {ev.source}\n[날짜] {ev.date}\n[제목] {ev.title}\n"
            f"[본문] {ev.body}\n"
            + (f"[회사명 힌트] {ev.org_hint}\n" if ev.org_hint else "")
        )
        response = self._client.messages.parse(
            model=config.LLM_MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
            output_format=ExtractedSignal,
        )
        if response.stop_reason == "refusal":
            return None
        return response.parsed_output

    def draft_cohort_meta(self, cause_tag: str, signals: list[Signal]) -> CohortMeta:
        """미검토 클러스터의 법률 메타 초안을 생성한다 (변호사 검토 전 단계)."""
        from datetime import date, timedelta
        lines = "\n".join(
            f"- [{s.source}/{s.date}] {s.title} :: {s.summary}" for s in signals[:15]
        )
        prompt = f"피고: {signals[0].defendant}\n원인 시그니처: {cause_tag}\n신호 목록:\n{lines}"
        try:
            response = self._client.messages.parse(
                model=config.LLM_MODEL,
                max_tokens=2500,
                system=META_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
                output_format=CohortMetaDraft,
            )
            if response.stop_reason == "refusal" or response.parsed_output is None:
                raise ValueError("메타 초안 생성 거부/실패")
            d = response.parsed_output
            deadline = (date.today() + timedelta(days=d.statute_months_left * 30)).isoformat()
            return CohortMeta(
                cause_tag=cause_tag,
                name=f"{d.name} (자동 초안)",
                category=signals[0].category,
                description=d.description + " ※ 엔진 자동 생성 초안 — 변호사 검토 필수.",
                legal_basis=d.legal_basis,
                statute_note=d.statute_note,
                statute_deadline=deadline,
                claim_per_victim=d.claim_per_victim,
                defendant_solvency=d.defendant_solvency,
            )
        except Exception as e:  # 초안 실패는 파이프라인을 멈추지 않는다
            log.warning("메타 초안 실패(%s): %s", cause_tag, e)
            return generic_meta(cause_tag, signals)


class RuleBasedExtractor:
    """키워드 규칙 폴백 — LLM 키가 없는 환경에서 최소 동작을 보장한다."""

    RULES: list[tuple[tuple[str, ...], str, int, int]] = [
        # (키워드들, 카테고리, severity, evidence_weight)
        (("하자", "시공", "부실시공", "영업정지"), "건설하자", 4, 8),
        (("펀드", "불완전판매", "분쟁조정", "부당권유"), "금융", 4, 8),
        (("리콜", "결함", "화재", "위해"), "제조물", 4, 8),
        (("하도급", "부당감액", "납품단가"), "하도급", 4, 8),
        (("개인정보", "유출", "해킹"), "개인정보", 4, 8),
        (("분식", "감사의견", "의견거절", "허위공시", "거래정지"), "증권", 4, 8),
        (("과징금", "행정처분", "제재", "고발"), "기타", 3, 6),
        (("소송", "손해배상", "집단소송"), "기타", 3, 5),
    ]

    @property
    def mode(self) -> str:
        return "규칙 기반 (폴백)"

    def extract(self, events: list[RawEvent]) -> list[Signal]:
        signals: list[Signal] = []
        for i, ev in enumerate(events):
            text = f"{ev.title} {ev.body}"
            match = next(
                ((cat, sev, ew) for kws, cat, sev, ew in self.RULES
                 if any(k in text for k in kws)),
                None,
            )
            defendant = ev.org_hint or self._guess_company(ev.title)
            if match is None or not defendant:
                continue
            cat, sev, ew = match
            signals.append(Signal(
                id=f"sig-live-{ev.source}-{i:04d}",
                source=ev.source, date=ev.date, title=ev.title,
                summary=ev.body or ev.title,
                defendant=defendant,
                cause_tag=f"{_slug(defendant)}-{_slug(cat)}",
                category=cat, severity=sev, evidence_weight=ew,
                affected_estimate=0, url=ev.url,
            ))
        return signals

    _COMPANY_RE = re.compile(r"(?:\(주\)|㈜|주식회사\s*)?([가-힣A-Za-z0-9]{2,12}(?:건설|산업|중공업|전자|화학|제약|바이오|자산운용|증권|카드|캐피탈|은행|식품|모빌리티))")

    def _guess_company(self, text: str) -> str:
        m = self._COMPANY_RE.search(text)
        return m.group(0).strip() if m else ""

    def draft_cohort_meta(self, cause_tag: str, signals: list[Signal]) -> CohortMeta:
        return generic_meta(cause_tag, signals)


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9가-힣]+", "-", text.lower()).strip("-")[:24]


def generic_meta(cause_tag: str, signals: list[Signal]) -> CohortMeta:
    """메타 초안조차 없을 때의 최소 플레이스홀더 — '검토 대기' 상태로 노출된다."""
    from datetime import date, timedelta
    s0 = signals[0]
    return CohortMeta(
        cause_tag=cause_tag,
        name=f"{s0.defendant} — {s0.category} 관련 신호 클러스터 (검토 대기)",
        category=s0.category,
        description="엔진이 동일 피고·유사 원인으로 묶은 미검토 클러스터입니다. "
                    "법적 근거·시효·청구액은 변호사 검토 후 확정됩니다.",
        legal_basis=["변호사 검토 필요"],
        statute_note="시효 기산점 미확정 — 최초 신호일 기준 보수적 관리 필요",
        statute_deadline=(date.today() + timedelta(days=36 * 30)).isoformat(),
        claim_per_victim=0,
        defendant_solvency=5,
    )


def get_extractor() -> LLMExtractor | RuleBasedExtractor:
    if config.llm_live():
        try:
            return LLMExtractor()
        except Exception as e:
            log.warning("LLM 추출기 초기화 실패, 규칙 기반으로 폴백: %s", e)
    return RuleBasedExtractor()
