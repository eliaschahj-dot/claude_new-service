"""환경 설정 — API 키가 있으면 해당 컴포넌트가 라이브 모드로 전환된다.

발급처:
  DART_API_KEY        → https://opendart.fss.or.kr (무료, 즉시 발급)
  NAVER_CLIENT_ID/SECRET → https://developers.naver.com (검색 API 애플리케이션 등록)
  ANTHROPIC_API_KEY   → https://platform.claude.com (LLM 신호 구조화 추출)
"""
from __future__ import annotations

import os

DART_API_KEY = os.environ.get("DART_API_KEY", "")
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID", "")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# LLM 추출 모델 — 신호 하나하나가 수임 판단의 근거가 되므로 최상위 모델을 기본값으로 둔다.
LLM_MODEL = os.environ.get("WONGO_LLM_MODEL", "claude-opus-4-8")

# 라이브 수집 시 조회 기간(일)
INGEST_LOOKBACK_DAYS = int(os.environ.get("WONGO_LOOKBACK_DAYS", "30"))


def dart_live() -> bool:
    return bool(DART_API_KEY)


def naver_live() -> bool:
    return bool(NAVER_CLIENT_ID and NAVER_CLIENT_SECRET)


def llm_live() -> bool:
    return bool(ANTHROPIC_API_KEY)
