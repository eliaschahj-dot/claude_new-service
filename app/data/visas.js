// K-Visa Assist 지식베이스 시드 (P0 비자 4종)
// 원본: docs/VISA_DATA_SHEET.md — [검수] 항목은 대표 확인 후 확정
// updated: 2026-07-16, source: hikorea.go.kr 등 (출처는 데이터 시트 참조)

window.VISA_DB = {
  updated: "2026-07-16",
  commonDocs: [
    { name: "통합신청서 (별지 제34호)", issuer: "사무소에서 작성 지원" },
    { name: "여권 원본 + 사본", issuer: "본인" },
    { name: "외국인등록증", issuer: "본인 (등록자)" },
    { name: "표준규격 사진 1매", issuer: "본인" },
    { name: "체류지 입증 서류 (임대차계약서 등)", issuer: "본인" },
  ],
  visas: {
    "D-2": {
      name: "유학",
      nameEn: "Study Abroad",
      category: "유학·연수",
      summary: "전문대 이상 정규과정(학사·석사·박사, 교환학생 포함) 유학.",
      stay: "과정 기간 부여 (1회 최대 2년 이내)",
      processDays: "2~4주",
      applications: {
        extension: {
          label: "체류기간 연장",
          govFee: 60000, agencyFee: 250000,
          requirements: [
            "정규과정 재학 유지 (성적·출석 정상)",
            "등록금 납부 완료",
            "재정능력 입증 (학교 인증등급·지역별 기준 상이)",
          ],
          documents: [
            { name: "재학증명서", issuer: "학교" },
            { name: "성적증명서 (출석률 포함)", issuer: "학교" },
            { name: "등록금 납입증명서 또는 장학금 수혜 증명", issuer: "학교" },
            { name: "잔고증명서 + 최근 6개월 거래내역", issuer: "국내 은행" },
          ],
        },
        change: {
          label: "체류자격 변경 (D-4→D-2 등)",
          govFee: 100000, agencyFee: 380000,
          requirements: [
            "표준입학허가서 취득 (대학 발급)",
            "최종학력 증명 가능 (아포스티유/영사확인)",
            "재정능력 입증",
            "국내 변경은 요건 충족 시 제한적 허용 — 사전 진단 권장",
          ],
          documents: [
            { name: "표준입학허가서", issuer: "대학" },
            { name: "최종학력 증명서 (아포스티유/영사확인)", issuer: "본국 기관" },
            { name: "잔고증명서 + 거래내역", issuer: "은행" },
            { name: "(해당 시) 어학능력 입증 서류", issuer: "본인" },
          ],
        },
      },
    },
    "D-4": {
      name: "일반연수",
      nameEn: "General Training",
      category: "유학·연수",
      summary: "대학 부설 어학원 한국어 연수 등. 총 체류 2년 상한.",
      stay: "신규 6개월, 연장 가능 (어학연수 총 2년)",
      processDays: "2~4주",
      applications: {
        new: {
          label: "신규 (사증)",
          govFee: 0, agencyFee: 300000,
          requirements: [
            "연수기관 입학허가 (표준입학허가서)",
            "재정능력 입증 (해외 발급 잔고증명은 아포스티유/영사확인)",
          ],
          documents: [
            { name: "표준입학허가서", issuer: "연수기관" },
            { name: "최종학력 증명서", issuer: "본국 기관" },
            { name: "잔고증명서 (부모 명의 시 가족관계 서류 추가)", issuer: "은행" },
            { name: "연수계획서", issuer: "연수기관" },
          ],
        },
        extension: {
          label: "체류기간 연장",
          govFee: 60000, agencyFee: 250000,
          requirements: [
            "출석률 기준 충족 (통상 70% 이상)",
            "수강료 납부 완료",
            "재정능력 입증",
          ],
          documents: [
            { name: "재학(수강)증명서", issuer: "연수기관" },
            { name: "출석률 확인 서류", issuer: "연수기관" },
            { name: "수강료 납입증명서", issuer: "연수기관" },
            { name: "잔고증명서", issuer: "은행" },
          ],
        },
      },
    },
    "D-10": {
      name: "구직",
      nameEn: "Job Seeker",
      category: "취업",
      summary: "E-1~E-7 전문직종 취업 준비. 점수제 60점 이상 (TOPIK 4급/KIIP 특례 면제).",
      stay: "6개월 단위, 총 2년 상한",
      processDays: "약 2주",
      applications: {
        change: {
          label: "체류자격 변경 (점수제 평가 포함)",
          govFee: 100000, agencyFee: 400000,
          requirements: [
            "학사(국내 전문학사 포함) 이상 학위",
            "점수제 60점 이상 + 기본항목 20점 이상",
            "특례: TOPIK 4급 이상 또는 KIIP 중간평가 합격 시 점수제 면제",
            "고위험 국가 일부 자격(B·C·E-9 등)의 변경은 원칙적 제한",
          ],
          documents: [
            { name: "구직활동계획서 (소정 양식)", issuer: "사무소 작성 지원" },
            { name: "최종학력(학위) 증명서", issuer: "학교" },
            { name: "점수제 배점 증빙 (경력증명서·TOPIK·KIIP 등)", issuer: "해당 기관" },
            { name: "체재비 입증 잔고증명서", issuer: "은행" },
          ],
        },
        extension: {
          label: "체류기간 연장",
          govFee: 60000, agencyFee: 300000,
          requirements: ["구직활동 실적 입증", "체재비 입증"],
          documents: [
            { name: "구직활동 실적 입증 자료 (지원 내역 등)", issuer: "본인" },
            { name: "잔고증명서", issuer: "은행" },
          ],
        },
      },
    },
    "E-7": {
      name: "특정활동",
      nameEn: "Specific Activities (Skilled Work)",
      category: "취업",
      summary: "법무부 지정 도입직종(90여 개) 전문인력 취업. 학력·경력·임금 요건 적용.",
      stay: "1회 최대 3년 (통상 1~2년)",
      processDays: "3~4주",
      applications: {
        change: {
          label: "체류자격 변경 (국내)",
          govFee: 100000, agencyFee: 450000,
          requirements: [
            "석사 이상 / 학사+경력 1년 / 경력 5년 중 택1 (도입직종 관련 분야)",
            "국내 대학 졸업자는 관련 전공 학사 이상 시 경력 면제 특례",
            "임금요건: 전문인력 연 3,112만원 이상 (2026년, GNI 연동)",
            "고용업체 요건: 국민고용 비율·매출·납세 정상",
          ],
          documents: [
            { name: "고용계약서", issuer: "회사" },
            { name: "학위증명서 (아포스티유/영사확인)", issuer: "본국 기관/학교" },
            { name: "경력증명서 (해당 시)", issuer: "전 직장" },
            { name: "이력서", issuer: "본인" },
            { name: "고용사유서 (외국인 활용계획서)", issuer: "회사 · 사무소 작성 지원" },
            { name: "사업자등록증", issuer: "회사" },
            { name: "매출 실적 증빙 (재무제표 등)", issuer: "회사" },
            { name: "국세·지방세 납세증명서", issuer: "회사" },
            { name: "고용보험 가입자명부 (국민고용 입증)", issuer: "회사" },
          ],
        },
        new: {
          label: "신규 (사증발급인정서 + 재외공관)",
          govFee: 0, agencyFee: 800000,
          requirements: [
            "자격변경과 동일한 본인·회사 요건",
            "고용업체가 관할 출입국에 사증발급인정서 신청 → 승인 후 재외공관 사증 신청",
          ],
          documents: [
            { name: "사증발급인정신청서 및 회사 서류 일체", issuer: "회사 · 사무소 대행" },
            { name: "학위·경력 증명 (아포스티유/영사확인)", issuer: "본국 기관" },
            { name: "고용계약서", issuer: "회사" },
          ],
        },
        extension: {
          label: "체류기간 연장",
          govFee: 60000, agencyFee: 300000,
          requirements: ["동일 근무처 고용 유지", "소득·납세 정상"],
          documents: [
            { name: "재직증명서", issuer: "회사" },
            { name: "고용계약서 (갱신본)", issuer: "회사" },
            { name: "소득금액증명 또는 근로소득 원천징수영수증", issuer: "세무서/회사" },
            { name: "회사 납세증명서", issuer: "회사" },
          ],
        },
      },
    },
  },
};
