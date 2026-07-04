"""데이터 소스 커넥터 계층.

각 커넥터는 fetch() 하나만 구현하면 되는 동일 인터페이스를 갖는다.
현재는 데모 모드(시드 데이터)로 동작하며, 실서비스 전환 시 커넥터별로
아래 명시된 실제 공개 API/열람 채널을 연동한다.

실전 연동 대상:
  DartConnector      → 금융감독원 OpenDART API (opendart.fss.or.kr) — 공시 전건 실시간
  FtcConnector       → 공정위 사건처리 의결서 공개 (ftc.go.kr) — RSS/크롤링
  FssConnector       → 금감원 제재정보 공개·분조위 결정례 (fss.or.kr)
  MolitConnector     → 국토부 건설산업지식정보시스템(KISCON) 행정처분 공개
  RecallConnector    → 소비자24 리콜정보 API (공공데이터포털), 소비자원 위해정보
  PipcConnector      → 개인정보위 처분 의결서 공개
  CourtConnector     → 대법원 판결서 인터넷열람 + 판결문 사본 제공 신청 자동화
  NewsConnector      → 뉴스 API (네이버 검색 API / 빅카인즈) + LLM 이벤트 추출
  ComplaintConnector → 국민신문고 공개민원 통계, 입주민·투자자 커뮤니티 모니터링
"""
from __future__ import annotations

from ..models import Signal, SOURCES
from ..seed_data import seed_signals


class BaseConnector:
    source: str = ""
    demo_mode: bool = True
    poll_interval_min: int = 60

    def fetch(self) -> list[Signal]:
        """데모 모드: 시드 신호 중 자기 소스 분만 반환."""
        return [s for s in seed_signals() if s.source == self.source]

    def describe(self) -> dict:
        info = SOURCES[self.source]
        return {
            "source": self.source,
            "label": info["label"],
            "org": info["org"],
            "mode": "데모 (시드 데이터)" if self.demo_mode else "실시간 연동",
            "poll_interval_min": self.poll_interval_min,
        }


class DartConnector(BaseConnector):      source = "dart";      poll_interval_min = 10
class FtcConnector(BaseConnector):       source = "ftc";       poll_interval_min = 360
class FssConnector(BaseConnector):       source = "fss";       poll_interval_min = 360
class MolitConnector(BaseConnector):     source = "molit";     poll_interval_min = 720
class RecallConnector(BaseConnector):    source = "recall";    poll_interval_min = 180
class PipcConnector(BaseConnector):      source = "pipc";      poll_interval_min = 720
class CourtConnector(BaseConnector):     source = "court";     poll_interval_min = 1440
class NewsConnector(BaseConnector):      source = "news";      poll_interval_min = 15
class ComplaintConnector(BaseConnector): source = "complaint"; poll_interval_min = 120


ALL_CONNECTORS: list[BaseConnector] = [
    DartConnector(), FtcConnector(), FssConnector(), MolitConnector(),
    RecallConnector(), PipcConnector(), CourtConnector(), NewsConnector(),
    ComplaintConnector(),
]


def ingest_all() -> list[Signal]:
    """전 커넥터에서 신호를 수집한다."""
    signals: list[Signal] = []
    for c in ALL_CONNECTORS:
        signals.extend(c.fetch())
    return signals
