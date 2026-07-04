"""데이터 소스 커넥터 계층.

두 단계 인터페이스:
  fetch_raw() → list[RawEvent]   가공 전 이벤트 (라이브 커넥터의 산출물)
  fetch()     → list[Signal]     구조화 완료 신호 (데모 시드는 이미 구조화되어 있음)

라이브 커넥터(OpenDART, 네이버 뉴스)는 API 키가 있으면 fetch_raw()로 실데이터를
수집하고, 추출 단계(extract.py)가 RawEvent를 Signal로 구조화한다.
키가 없으면 데모 시드로 폴백한다.

나머지 소스의 실전 연동 대상:
  FtcConnector       → 공정위 사건처리 의결서 공개 (ftc.go.kr) — RSS/크롤링
  FssConnector       → 금감원 제재정보 공개·분조위 결정례 (fss.or.kr)
  MolitConnector     → 국토부 건설산업지식정보시스템(KISCON) 행정처분 공개
  RecallConnector    → 소비자24 리콜정보 API (공공데이터포털), 소비자원 위해정보
  PipcConnector      → 개인정보위 처분 의결서 공개
  CourtConnector     → 대법원 판결서 인터넷열람 + 판결문 사본 제공 신청 자동화
  ComplaintConnector → 국민신문고 공개민원 통계, 입주민·투자자 커뮤니티 모니터링
"""
from __future__ import annotations

import html
import logging
import re
from datetime import date, datetime, timedelta

import httpx

from .. import config
from ..models import RawEvent, Signal, SOURCES
from ..seed_data import seed_signals

log = logging.getLogger("wongo.ingest")

# 잠재 소송 신호로 볼 만한 공시/뉴스 필터 키워드
DART_KEYWORDS = (
    "소송", "행정처분", "과징금", "감사의견", "의견거절", "회계처리",
    "영업정지", "검찰", "고발", "제재", "리콜", "손해배상", "거래정지",
)
NEWS_QUERIES = (
    "과징금 부과", "리콜 명령", "행정처분 영업정지", "집단소송",
    "불완전판매 제재", "개인정보 유출 과징금", "하자 소송 판결",
)


class BaseConnector:
    source: str = ""
    poll_interval_min: int = 60

    @property
    def live(self) -> bool:
        return False

    def fetch_raw(self) -> list[RawEvent]:
        """라이브 모드에서 가공 전 이벤트를 수집한다. 데모 모드에서는 빈 리스트."""
        return []

    def fetch(self) -> list[Signal]:
        """데모 모드: 시드 신호 중 자기 소스 분만 반환."""
        if self.live:
            return []  # 라이브 신호는 fetch_raw → extract 경로로 생성된다
        return [s for s in seed_signals() if s.source == self.source]

    def describe(self) -> dict:
        info = SOURCES[self.source]
        return {
            "source": self.source,
            "label": info["label"],
            "org": info["org"],
            "mode": "실시간 연동" if self.live else "데모 (시드 데이터)",
            "poll_interval_min": self.poll_interval_min,
        }


class DartConnector(BaseConnector):
    """금융감독원 OpenDART 공시검색 API.

    https://opendart.fss.or.kr/api/list.json — DART_API_KEY 필요 (무료 발급).
    최근 N일 공시 중 소송·처분·회계 관련 보고서명을 필터해 RawEvent로 반환.
    """
    source = "dart"
    poll_interval_min = 10
    API_URL = "https://opendart.fss.or.kr/api/list.json"

    @property
    def live(self) -> bool:
        return config.dart_live()

    def fetch_raw(self) -> list[RawEvent]:
        if not self.live:
            return []
        end = date.today()
        begin = end - timedelta(days=config.INGEST_LOOKBACK_DAYS)
        events: list[RawEvent] = []
        try:
            with httpx.Client(timeout=20) as client:
                page, total_pages = 1, 1
                while page <= min(total_pages, 5):  # 최대 5페이지(500건) 안전장치
                    r = client.get(self.API_URL, params={
                        "crtfc_key": config.DART_API_KEY,
                        "bgn_de": begin.strftime("%Y%m%d"),
                        "end_de": end.strftime("%Y%m%d"),
                        "page_no": page,
                        "page_count": 100,
                    })
                    r.raise_for_status()
                    data = r.json()
                    if data.get("status") != "000":
                        log.warning("DART API 오류: %s %s", data.get("status"), data.get("message"))
                        break
                    total_pages = int(data.get("total_page", 1))
                    for item in data.get("list", []):
                        report = item.get("report_nm", "")
                        if not any(k in report for k in DART_KEYWORDS):
                            continue
                        rcept_no = item.get("rcept_no", "")
                        rcept_dt = item.get("rcept_dt", "")
                        events.append(RawEvent(
                            source="dart",
                            date=f"{rcept_dt[:4]}-{rcept_dt[4:6]}-{rcept_dt[6:]}" if len(rcept_dt) == 8 else rcept_dt,
                            title=f"{item.get('corp_name', '')} — {report}",
                            body=f"공시 제출인: {item.get('flr_nm', '')} / 법인구분: {item.get('corp_cls', '')}",
                            url=f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}",
                            org_hint=item.get("corp_name", ""),
                        ))
                    page += 1
        except httpx.HTTPError as e:
            log.warning("DART 수집 실패: %s", e)
        return events


class NaverNewsConnector(BaseConnector):
    """네이버 뉴스 검색 API.

    https://openapi.naver.com/v1/search/news.json — NAVER_CLIENT_ID/SECRET 필요.
    소송 신호성 쿼리들로 최신 기사를 수집해 RawEvent로 반환.
    """
    source = "news"
    poll_interval_min = 15
    API_URL = "https://openapi.naver.com/v1/search/news.json"
    TAG_RE = re.compile(r"<[^>]+>")

    @property
    def live(self) -> bool:
        return config.naver_live()

    def _clean(self, text: str) -> str:
        return html.unescape(self.TAG_RE.sub("", text)).strip()

    def fetch_raw(self) -> list[RawEvent]:
        if not self.live:
            return []
        headers = {
            "X-Naver-Client-Id": config.NAVER_CLIENT_ID,
            "X-Naver-Client-Secret": config.NAVER_CLIENT_SECRET,
        }
        events: list[RawEvent] = []
        seen_links: set[str] = set()
        try:
            with httpx.Client(timeout=20, headers=headers) as client:
                for query in NEWS_QUERIES:
                    r = client.get(self.API_URL, params={
                        "query": query, "display": 30, "sort": "date",
                    })
                    r.raise_for_status()
                    for item in r.json().get("items", []):
                        link = item.get("originallink") or item.get("link", "")
                        if link in seen_links:
                            continue
                        seen_links.add(link)
                        try:
                            pub = datetime.strptime(
                                item.get("pubDate", ""), "%a, %d %b %Y %H:%M:%S %z"
                            ).date().isoformat()
                        except ValueError:
                            pub = date.today().isoformat()
                        events.append(RawEvent(
                            source="news",
                            date=pub,
                            title=self._clean(item.get("title", "")),
                            body=self._clean(item.get("description", "")),
                            url=link,
                        ))
        except httpx.HTTPError as e:
            log.warning("네이버 뉴스 수집 실패: %s", e)
        return events


class FtcConnector(BaseConnector):       source = "ftc";       poll_interval_min = 360
class FssConnector(BaseConnector):       source = "fss";       poll_interval_min = 360
class MolitConnector(BaseConnector):     source = "molit";     poll_interval_min = 720
class RecallConnector(BaseConnector):    source = "recall";    poll_interval_min = 180
class PipcConnector(BaseConnector):      source = "pipc";      poll_interval_min = 720
class CourtConnector(BaseConnector):     source = "court";     poll_interval_min = 1440
class ComplaintConnector(BaseConnector): source = "complaint"; poll_interval_min = 120


ALL_CONNECTORS: list[BaseConnector] = [
    DartConnector(), FtcConnector(), FssConnector(), MolitConnector(),
    RecallConnector(), PipcConnector(), CourtConnector(), NaverNewsConnector(),
    ComplaintConnector(),
]


def ingest_all() -> tuple[list[Signal], list[RawEvent]]:
    """전 커넥터 수집. (구조화 완료 신호, 추출 대기 원시 이벤트)를 반환한다."""
    signals: list[Signal] = []
    raw_events: list[RawEvent] = []
    for c in ALL_CONNECTORS:
        signals.extend(c.fetch())
        raw_events.extend(c.fetch_raw())
    return signals, raw_events
