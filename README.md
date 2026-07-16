# K-Visa Assist

행정사 사무소가 운영하는 **AI 챗봇 기반 외국인 한국 비자 발급 대행 서비스**의 초안 프로젝트입니다.

외국인이 AI 챗봇과 대화하며 적합한 비자 유형을 추천받고, 필요 서류를 업로드하면
행정사가 검토·접수를 대행합니다. AI 지식 베이스는 하이코리아(hikorea.go.kr)의
공개 정보를 기반으로 구축할 계획입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `docs/PLANNING.md` | 서비스 기획서 (문제 정의, 기능, 플로우, 기술 스택, 로드맵) |
| `docs/SERVICE_SPEC.md` | 상세 기능 명세 (챗봇 설계, 데이터 모델, 아키텍처, 개발 계획) |
| `docs/GROWTH_STRATEGY.md` | 3단계 성장 전략 |
| `docs/LEGAL_REVIEW.md` | 행정사 중개 플랫폼 확장 법적 검토 |
| `docs/VISA_DATA_SHEET.md` | P0 비자 4종(D-2·D-4·D-10·E-7) 요건·서류 데이터 시트 |
| `docs/FEES.md` | 정부 수수료·대행 보수 요율표 |
| `forms/` | 위임장·개인정보 동의 전자 서식 초안 |
| `app/` | 모바일 웹앱 프로토타입 (정적 HTML/CSS/JS, KO/EN) — 기획 검토용 |
| `web/` | **Next.js 프로덕션 앱 (S1 진행 중)** — 전 화면 이관 + 케이스 API |

## Next.js 앱 실행 (web/)

```bash
cd web
npm install
npm run dev    # http://localhost:3000
```

- 전 화면(홈/챗봇/비자정보/서류/상태/MY) React 이관 완료, KO/EN 지원
- API: `POST /api/cases` (케이스 생성), `GET/PATCH /api/cases/:id` (조회/서류 상태 갱신)
- 저장소는 개발용 파일 스토어(`.data/db.json`) — PostgreSQL 교체 예정

## 초안 화면

- `app/index.html` — 홈 / 온보딩 (서비스 소개, 빠른 메뉴, 진행중 사건)
- `app/chat.html` — AI 비자 상담 챗봇 (선택형 대화 데모)
- `app/visas.html` — 비자 정보 탐색 (유형별 카드, 검색/필터)
- `app/documents.html` — 서류 체크리스트 & 업로드
- `app/status.html` — 신청 진행 상태 타임라인
- `app/profile.html` — 마이페이지

## 로컬에서 보기

```bash
cd app
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속 (모바일 뷰 권장)
```

> ⚠️ 현재는 백엔드 없는 화면 초안입니다. 챗봇은 시나리오 기반 데모이며,
> 실제 서비스에서는 LLM + RAG(하이코리아 데이터)로 대체됩니다.
> 하이코리아 데이터 수집 전 콘텐츠 이용 정책 확인이 필요합니다 (`docs/PLANNING.md` 참고).
