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

### 환경변수 (`web/.env.local`)

```bash
ANTHROPIC_API_KEY=...        # AI 챗봇 (console.anthropic.com)
AUTH_SECRET=...              # openssl rand -base64 32 로 생성
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=...           # 구글 로그인 (아래 참고)
AUTH_GOOGLE_SECRET=...
DATABASE_URL=...             # PostgreSQL 연결 문자열 (아래 참고). 미설정 시 개발용 파일 저장(.data/db.json)으로 자동 폴백
ADMIN_EMAILS=...             # 관리자(사무소) 이메일 화이트리스트, 쉼표 구분. 등록된 계정으로 로그인하면 /admin 대시보드 접근 가능
SMTP_USER=...                # (선택) 이메일 알림 발신 계정 — Gmail 주소. 미설정 시 알림 발송 건너뜀
SMTP_PASS=...                # (선택) Gmail '앱 비밀번호' (구글 계정 → 보안 → 2단계 인증 → 앱 비밀번호에서 생성)
# SMTP_HOST/SMTP_PORT: 기본 smtp.gmail.com:465 (타 SMTP 사용 시만 지정), MAIL_FROM: 발신 표시 이름
```

새 신청 케이스 생성·서류 업로드 시 `ADMIN_EMAILS`의 모든 주소로 알림 메일이 발송됩니다
(SMTP_USER/SMTP_PASS 설정 시). 관리자 대시보드(`/admin`)는 데스크톱 화면 기준이며
방문자·체류시간·상담 기록 모니터링을 포함합니다. 상담 대화와 방문 통계는 PostgreSQL
연결 시에만 저장됩니다.

### 구글 로그인 설정

1. [console.cloud.google.com](https://console.cloud.google.com) → 프로젝트 생성 → **API 및 서비스 → OAuth 동의 화면** 구성 (External, 앱 이름/이메일 입력)
2. **사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID** → 유형: 웹 애플리케이션
3. **승인된 리디렉션 URI**에 추가:
   - 로컬: `http://localhost:3000/api/auth/callback/google`
   - 배포 시: `https://<도메인>/api/auth/callback/google`
4. 발급된 클라이언트 ID/보안 비밀을 `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`에 입력

### 데이터베이스(PostgreSQL) 연동

신청 케이스(비자·서류 상태)는 `DATABASE_URL`이 설정되면 PostgreSQL에, 미설정이면 로컬
개발용 파일(`.data/db.json`)에 저장됩니다. **Vercel 등 서버리스 배포에서는 파일 저장이
유지되지 않으므로 실서비스에는 DB 연결이 필수**입니다. 스키마(`cases` 테이블)는 앱이
첫 요청 시 자동 생성하므로 별도 마이그레이션 스크립트 실행이 필요 없습니다.

**무료 Postgres 발급 (택1, 5분):**

1. **[Neon](https://neon.tech)** (권장) → 프로젝트 생성 → Connection string 복사
2. **[Supabase](https://supabase.com)** → 프로젝트 생성 → Settings → Database → Connection string (Transaction pooler 권장)
3. **Vercel Postgres / Vercel Storage → Postgres** (Vercel에 배포 중이면 프로젝트 내에서 바로 생성 가능)

발급받은 연결 문자열을 `.env.local`(로컬) 또는 Vercel 프로젝트의 Environment Variables
(배포)에 `DATABASE_URL`로 등록합니다. 예:

```bash
DATABASE_URL=postgresql://user:password@ep-xxxx.region.neon.tech/dbname?sslmode=require
```

케이스 조회·수정 API(`/api/cases`)는 로그인 세션의 이메일과 케이스 소유자가 일치하는
경우에만 접근을 허용합니다(다른 사용자의 케이스는 404로 응답).

- 전 화면(홈/챗봇/비자정보/서류/상태/MY) React 이관 완료, KO/EN/ZH(중국어 간체) 지원
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
