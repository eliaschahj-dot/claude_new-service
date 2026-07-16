// K-Visa Assist 지식베이스 (P0 비자 4종) — app/data/visas.js 의 TS 이관본
// 원본 데이터 시트: docs/VISA_DATA_SHEET.md (대표 1차 검수 완료 2026-07-16)

export type L = { ko: string; en: string };

export interface VisaDocument {
  name: L;
  issuer: L;
}

export interface VisaApplication {
  label: L;
  govFee: number;
  agencyFee: number;
  requirements: L[];
  documents: VisaDocument[];
}

export interface VisaType {
  name: L;
  nameEn: string;
  catKey: "study" | "work";
  category: L;
  summary: L;
  stay: L;
  processDays: L;
  applications: Record<string, VisaApplication>;
}

export const DB_UPDATED = "2026-07-16";

export const COMMON_DOCS: VisaDocument[] = [
  { name: { ko: "통합신청서 (별지 제34호)", en: "Integrated application form (Form No. 34)" },
    issuer: { ko: "사무소에서 작성 지원", en: "We help you fill this in" } },
  { name: { ko: "여권 원본 + 사본", en: "Passport (original + copy)" },
    issuer: { ko: "본인", en: "You" } },
  { name: { ko: "외국인등록증", en: "Alien Registration Card" },
    issuer: { ko: "본인 (등록자)", en: "You (if registered)" } },
  { name: { ko: "표준규격 사진 1매", en: "1 standard passport photo" },
    issuer: { ko: "본인", en: "You" } },
  { name: { ko: "체류지 입증 서류 (임대차계약서 등)", en: "Proof of residence (lease contract, etc.)" },
    issuer: { ko: "본인", en: "You" } },
];

export const VISAS: Record<string, VisaType> = {
  "D-2": {
    name: { ko: "유학", en: "Study Abroad" },
    nameEn: "Study Abroad",
    catKey: "study",
    category: { ko: "유학·연수", en: "Study & Training" },
    summary: { ko: "전문대 이상 정규과정(학사·석사·박사, 교환학생 포함) 유학.",
               en: "Degree programs (associate to PhD, incl. exchange) at Korean universities." },
    stay: { ko: "과정 기간 부여 (1회 최대 2년 이내)", en: "Granted per program (max 2 years per grant)" },
    processDays: { ko: "2~4주", en: "2–4 weeks" },
    applications: {
      extension: {
        label: { ko: "체류기간 연장", en: "Extension of stay" },
        govFee: 60000, agencyFee: 250000,
        requirements: [
          { ko: "정규과정 재학 유지 (성적·출석 정상)", en: "Enrolled in a degree program (normal grades & attendance)" },
          { ko: "등록금 납부 완료", en: "Tuition paid" },
          { ko: "재정능력 입증 (학교 인증등급·지역별 기준 상이)", en: "Proof of finances (threshold varies by school grade & region)" },
        ],
        documents: [
          { name: { ko: "재학증명서", en: "Certificate of enrollment" }, issuer: { ko: "학교", en: "University" } },
          { name: { ko: "성적증명서 (출석률 포함)", en: "Transcript (incl. attendance)" }, issuer: { ko: "학교", en: "University" } },
          { name: { ko: "등록금 납입증명서 또는 장학금 수혜 증명", en: "Tuition payment receipt or scholarship certificate" }, issuer: { ko: "학교", en: "University" } },
          { name: { ko: "잔고증명서 + 최근 6개월 거래내역", en: "Bank balance certificate + 6-month transaction history" }, issuer: { ko: "국내 은행", en: "Korean bank" } },
        ],
      },
      change: {
        label: { ko: "체류자격 변경 (D-4→D-2 등)", en: "Change of status (e.g. D-4→D-2)" },
        govFee: 100000, agencyFee: 380000,
        requirements: [
          { ko: "표준입학허가서 취득 (대학 발급)", en: "Standard admission letter from the university" },
          { ko: "최종학력 증명 가능 (아포스티유/영사확인)", en: "Proof of final education (apostille/consular legalization)" },
          { ko: "재정능력 입증", en: "Proof of finances" },
          { ko: "국내 변경은 요건 충족 시 제한적 허용 — 사전 진단 권장", en: "In-Korea change is allowed restrictively — pre-assessment recommended" },
        ],
        documents: [
          { name: { ko: "표준입학허가서", en: "Standard admission letter" }, issuer: { ko: "대학", en: "University" } },
          { name: { ko: "최종학력 증명서 (아포스티유/영사확인)", en: "Final education certificate (apostille/consular)" }, issuer: { ko: "본국 기관", en: "Home-country institution" } },
          { name: { ko: "잔고증명서 + 거래내역", en: "Bank balance certificate + transactions" }, issuer: { ko: "은행", en: "Bank" } },
          { name: { ko: "(해당 시) 어학능력 입증 서류", en: "Language proficiency proof (if applicable)" }, issuer: { ko: "본인", en: "You" } },
        ],
      },
    },
  },
  "D-4": {
    name: { ko: "일반연수", en: "General Training" },
    nameEn: "General Training",
    catKey: "study",
    category: { ko: "유학·연수", en: "Study & Training" },
    summary: { ko: "대학 부설 어학원 한국어 연수 등. 총 체류 2년 상한.",
               en: "Korean language programs at university institutes. Max 2 years total." },
    stay: { ko: "신규 6개월, 연장 가능 (어학연수 총 2년)", en: "6 months initially, extendable (2 years total)" },
    processDays: { ko: "2~4주", en: "2–4 weeks" },
    applications: {
      new: {
        label: { ko: "신규 (사증)", en: "New (visa issuance)" },
        govFee: 0, agencyFee: 300000,
        requirements: [
          { ko: "연수기관 입학허가 (표준입학허가서)", en: "Admission from the training institute (standard admission letter)" },
          { ko: "재정능력 입증 (해외 발급 잔고증명은 아포스티유/영사확인)", en: "Proof of finances (overseas bank statements need apostille/consular)" },
        ],
        documents: [
          { name: { ko: "표준입학허가서", en: "Standard admission letter" }, issuer: { ko: "연수기관", en: "Institute" } },
          { name: { ko: "최종학력 증명서", en: "Final education certificate" }, issuer: { ko: "본국 기관", en: "Home-country institution" } },
          { name: { ko: "잔고증명서 (부모 명의 시 가족관계 서류 추가)", en: "Bank balance certificate (family-relation proof if parent's account)" }, issuer: { ko: "은행", en: "Bank" } },
          { name: { ko: "연수계획서", en: "Training plan" }, issuer: { ko: "연수기관", en: "Institute" } },
        ],
      },
      extension: {
        label: { ko: "체류기간 연장", en: "Extension of stay" },
        govFee: 60000, agencyFee: 250000,
        requirements: [
          { ko: "출석률 기준 충족 (통상 70% 이상)", en: "Attendance requirement met (typically 70%+)" },
          { ko: "수강료 납부 완료", en: "Tuition paid" },
          { ko: "재정능력 입증", en: "Proof of finances" },
        ],
        documents: [
          { name: { ko: "재학(수강)증명서", en: "Certificate of enrollment" }, issuer: { ko: "연수기관", en: "Institute" } },
          { name: { ko: "출석률 확인 서류", en: "Attendance record" }, issuer: { ko: "연수기관", en: "Institute" } },
          { name: { ko: "수강료 납입증명서", en: "Tuition payment receipt" }, issuer: { ko: "연수기관", en: "Institute" } },
          { name: { ko: "잔고증명서", en: "Bank balance certificate" }, issuer: { ko: "은행", en: "Bank" } },
        ],
      },
    },
  },
  "D-10": {
    name: { ko: "구직", en: "Job Seeker" },
    nameEn: "Job Seeker",
    catKey: "work",
    category: { ko: "취업", en: "Work" },
    summary: { ko: "E-1~E-7 전문직종 취업 준비. 점수제 60점 이상 (TOPIK 4급/KIIP 특례 면제).",
               en: "Job search for professional (E-1~E-7) roles. Points system 60+ (waived with TOPIK 4+ / KIIP)." },
    stay: { ko: "6개월 단위, 총 2년 상한", en: "6-month increments, max 2 years" },
    processDays: { ko: "약 2주", en: "~2 weeks" },
    applications: {
      change: {
        label: { ko: "체류자격 변경 (점수제 평가 포함)", en: "Change of status (incl. points assessment)" },
        govFee: 100000, agencyFee: 400000,
        requirements: [
          { ko: "학사(국내 전문학사 포함) 이상 학위", en: "Bachelor's degree or higher (incl. Korean associate degree)" },
          { ko: "점수제 60점 이상 + 기본항목 20점 이상", en: "60+ points on the points table (20+ on basic items)" },
          { ko: "특례: TOPIK 4급 이상 또는 KIIP 중간평가 합격 시 점수제 면제", en: "Waiver: TOPIK level 4+ or KIIP mid-term pass exempts the points test" },
          { ko: "고위험 국가 일부 자격(B·C·E-9 등)의 변경은 원칙적 제한", en: "Change from some statuses (B, C, E-9…) restricted for designated countries" },
        ],
        documents: [
          { name: { ko: "구직활동계획서 (소정 양식)", en: "Job-seeking plan (official form)" }, issuer: { ko: "사무소 작성 지원", en: "We help you write this" } },
          { name: { ko: "최종학력(학위) 증명서", en: "Degree certificate" }, issuer: { ko: "학교", en: "University" } },
          { name: { ko: "점수제 배점 증빙 (경력증명서·TOPIK·KIIP 등)", en: "Points evidence (career certificates, TOPIK, KIIP…)" }, issuer: { ko: "해당 기관", en: "Relevant institutions" } },
          { name: { ko: "체재비 입증 잔고증명서", en: "Bank balance certificate (living costs)" }, issuer: { ko: "은행", en: "Bank" } },
        ],
      },
      extension: {
        label: { ko: "체류기간 연장", en: "Extension of stay" },
        govFee: 60000, agencyFee: 300000,
        requirements: [
          { ko: "구직활동 실적 입증", en: "Proof of job-seeking activity" },
          { ko: "체재비 입증", en: "Proof of living costs" },
        ],
        documents: [
          { name: { ko: "구직활동 실적 입증 자료 (지원 내역 등)", en: "Job-seeking activity records (applications, etc.)" }, issuer: { ko: "본인", en: "You" } },
          { name: { ko: "잔고증명서", en: "Bank balance certificate" }, issuer: { ko: "은행", en: "Bank" } },
        ],
      },
    },
  },
  "E-7": {
    name: { ko: "특정활동", en: "Specific Activities" },
    nameEn: "Specific Activities (Skilled Work)",
    catKey: "work",
    category: { ko: "취업", en: "Work" },
    summary: { ko: "법무부 지정 도입직종(90여 개) 전문인력 취업. 학력·경력·임금 요건 적용.",
               en: "Professional employment in ~90 designated occupations. Education, career and salary requirements apply." },
    stay: { ko: "1회 최대 3년 (통상 1~2년)", en: "Max 3 years per grant (typically 1–2)" },
    processDays: { ko: "3~4주", en: "3–4 weeks" },
    applications: {
      change: {
        label: { ko: "체류자격 변경 (국내)", en: "Change of status (in Korea)" },
        govFee: 100000, agencyFee: 450000,
        requirements: [
          { ko: "석사 이상 / 학사+경력 1년 / 경력 5년 중 택1 (도입직종 관련 분야)", en: "One of: Master's+, Bachelor's + 1yr career, or 5yrs career (in the relevant field)" },
          { ko: "국내 대학 졸업자는 관련 전공 학사 이상 시 경력 면제 특례", en: "Korean-university graduates: career requirement waived with a relevant Bachelor's+" },
          { ko: "임금요건: 전문인력 연 3,112만원 이상 (2026년, GNI 연동)", en: "Salary: KRW 31.12M+/yr for professionals (2026, GNI-linked)" },
          { ko: "고용업체 요건: 국민고용 비율·매출·납세 정상", en: "Employer: Korean-hire ratio, revenue and tax compliance" },
        ],
        documents: [
          { name: { ko: "고용계약서", en: "Employment contract" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "학위증명서 (아포스티유/영사확인)", en: "Degree certificate (apostille/consular)" }, issuer: { ko: "본국 기관/학교", en: "Home institution/university" } },
          { name: { ko: "경력증명서 (해당 시)", en: "Career certificate (if applicable)" }, issuer: { ko: "전 직장", en: "Previous employer" } },
          { name: { ko: "이력서", en: "Résumé" }, issuer: { ko: "본인", en: "You" } },
          { name: { ko: "고용사유서 (외국인 활용계획서)", en: "Statement of employment reason (utilization plan)" }, issuer: { ko: "회사 · 사무소 작성 지원", en: "Employer · we help draft it" } },
          { name: { ko: "사업자등록증", en: "Business registration certificate" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "매출 실적 증빙 (재무제표 등)", en: "Revenue proof (financial statements)" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "국세·지방세 납세증명서", en: "National & local tax payment certificates" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "고용보험 가입자명부 (국민고용 입증)", en: "Employment-insurance roster (Korean-hire proof)" }, issuer: { ko: "회사", en: "Employer" } },
        ],
      },
      new: {
        label: { ko: "신규 (사증발급인정서 + 재외공관)", en: "New (visa issuance confirmation + embassy)" },
        govFee: 0, agencyFee: 800000,
        requirements: [
          { ko: "자격변경과 동일한 본인·회사 요건", en: "Same personal & employer requirements as change of status" },
          { ko: "고용업체가 관할 출입국에 사증발급인정서 신청 → 승인 후 재외공관 사증 신청", en: "Employer applies for visa issuance confirmation, then you apply at the Korean embassy" },
        ],
        documents: [
          { name: { ko: "사증발급인정신청서 및 회사 서류 일체", en: "Visa issuance confirmation application + all employer documents" }, issuer: { ko: "회사 · 사무소 대행", en: "Employer · we file it" } },
          { name: { ko: "학위·경력 증명 (아포스티유/영사확인)", en: "Degree & career proof (apostille/consular)" }, issuer: { ko: "본국 기관", en: "Home-country institutions" } },
          { name: { ko: "고용계약서", en: "Employment contract" }, issuer: { ko: "회사", en: "Employer" } },
        ],
      },
      extension: {
        label: { ko: "체류기간 연장", en: "Extension of stay" },
        govFee: 60000, agencyFee: 300000,
        requirements: [
          { ko: "동일 근무처 고용 유지", en: "Continued employment at the same workplace" },
          { ko: "소득·납세 정상", en: "Income and tax compliance" },
        ],
        documents: [
          { name: { ko: "재직증명서", en: "Certificate of employment" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "고용계약서 (갱신본)", en: "Employment contract (renewed)" }, issuer: { ko: "회사", en: "Employer" } },
          { name: { ko: "소득금액증명 또는 근로소득 원천징수영수증", en: "Income certificate or withholding tax receipt" }, issuer: { ko: "세무서/회사", en: "Tax office/Employer" } },
          { name: { ko: "회사 납세증명서", en: "Employer tax payment certificate" }, issuer: { ko: "회사", en: "Employer" } },
        ],
      },
    },
  },
};
