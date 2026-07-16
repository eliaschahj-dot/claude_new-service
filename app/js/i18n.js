// K-Visa Assist i18n — KO/EN 토글 (localStorage 저장, 전 페이지 공통)
// 정적 텍스트: data-i18n / data-i18n-ph(placeholder) 속성 + UI 사전
// 동적 데이터: {ko, en} 객체를 t()로 해석

window.KVA_LANG = localStorage.getItem("kva_lang") || "en";

window.t = function (v) {
  if (v && typeof v === "object" && "ko" in v) return v[window.KVA_LANG] || v.ko;
  return v;
};

window.setLang = function (lang) {
  localStorage.setItem("kva_lang", lang);
  location.reload();
};

const UI = {
  ko: {
    // 공통
    tabHome: "홈", tabChat: "챗봇", tabDocs: "서류", tabStatus: "상태", tabMy: "MY",
    langLabel: "🌐 한국어",
    aiDisclaimer: "AI 상담은 하이코리아 공개 정보를 기반으로 한 참고용 안내입니다. 최종 검토는 담당 변호사·행정사가 진행합니다.",
    // 홈
    heroTitle: "한국 비자, 대화만으로<br>신청부터 접수까지",
    heroDesc: "AI 챗봇과 대화하면 비자 유형 추천부터 서류 준비, 접수 대행까지 — 거절 시 불복 절차까지 변호사·행정사가 직접 처리합니다.",
    heroCta: "💬 AI 상담 시작하기",
    quickMenu: "빠른 메뉴",
    qVisaInfo: "비자 정보", qDocs: "서류 제출", qStatus: "진행 상태", qExpert: "전문가 상담",
    ongoing: "진행 중인 신청",
    caseTitle: "E-7 특정활동 (취업)", caseSub: "서류 검토 중 · 2/6 단계", inProgress: "진행중",
    popular: "자주 찾는 비자", viewAll: "전체 비자 보기", popularBadge: "인기",
    d2Name: "유학 비자", d2Desc: "국내 대학(원) 정규 과정 유학. 입학허가서·재정능력 입증 필요.",
    e7Name: "특정활동 (전문인력 취업)", e7Desc: "전문 분야 취업. 고용계약서·학위/경력 증빙 필요.",
    homeDisclaimer: "본 서비스의 안내는 하이코리아(hikorea.go.kr) 공개 정보를 기반으로 하며, 최종 심사 결과는 출입국·외국인청의 판단에 따릅니다.",
    // 챗봇
    chatTitle: "AI 비자 상담", chatPlaceholder: "메시지를 입력하세요…",
    // 비자 정보
    visasTitle: "비자 정보", searchPh: "비자 코드 또는 키워드 검색 (예: E-7, 유학)",
    catAll: "전체", catStudy: "유학·연수", catWork: "취업",
    askAi: "💬 내게 맞는 비자, AI에게 물어보기",
    visasDisclaimer: "출처: 하이코리아(hikorea.go.kr) 등 공개 정보 · 실제 요건·서류는 국적/학교/직종/관할에 따라 달라질 수 있으며, 최종 확인은 담당 변호사·행정사가 진행합니다.",
    updatedAt: "기준일",
    detailOpen: "업무·서류·비용 보기 ▾", detailClose: "접기 ▴",
    agencyFee: "대행 보수", govFee: "정부 수수료", reqTitle: "요건", docsTitle: "서류 (공통 서류 별도)",
    noResult: "검색 결과가 없습니다. F-2·F-6 등 다른 비자는 AI 상담으로 문의해 주세요.",
    processing: "처리", stayLabel: "체류",
    // 서류
    docsPageTitle: "서류 제출",
    docsAutoNote: "AI 상담 결과로 자동 생성된 목록입니다. 사진 촬영 또는 파일 업로드로 제출하면 담당 변호사·행정사가 검토합니다.",
    askDocs: "💬 서류 질문하기", submitDone: "제출 완료",
    docsDisclaimer: "업로드된 서류는 암호화되어 저장되며, 대행 업무 목적 외에는 사용되지 않습니다.",
    submitted: "제출", checklist: "서류 체크리스트", issuer: "발급처",
    stNone: "미제출", stUploaded: "검토 대기", stApproved: "승인 완료",
    actUpload: "업로드", actReupload: "다시 올리기", actView: "보기",
    // 상태
    statusTitle: "진행 상태", stepsTitle: "처리 단계", applyNo: "접수번호",
    agentName: "담당 변호사·행정사", agentDesc: "출입국 전문 · 거절 시 이의신청·행정쟁송까지 직접 수행",
    msgBtn: "메시지", supplement: "📄 보완 서류 제출하기",
    statusDisclaimer: "심사 소요 기간은 출입국·외국인청 사정에 따라 달라질 수 있습니다.",
    // 마이페이지
    myTitle: "마이페이지",
    mMyCases: "📍 내 신청 내역", mMyDocs: "📄 제출한 서류", mPayments: "💳 결제 내역",
    mLang: "🌐 언어 설정", mNoti: "🔔 알림 설정",
    mPrivacy: "📜 개인정보처리방침", mTerms: "📋 이용약관", mOffice: "👤 사무소 정보 (변호사·행정사)", mLogout: "🚪 로그아웃",
    myDisclaimer: "K-Visa Assist는 변호사·행정사 사무소가 직접 운영하는 출입국 민원 대행 서비스입니다.",
  },
  en: {
    tabHome: "Home", tabChat: "Chat", tabDocs: "Docs", tabStatus: "Status", tabMy: "MY",
    langLabel: "🌐 English",
    aiDisclaimer: "AI answers are for reference, based on public information from HiKorea. Final review is done by your attorney & administrative agent.",
    heroTitle: "Your Korean visa,<br>handled through a chat",
    heroDesc: "Talk to our AI to find the right visa, prepare documents, and let a licensed attorney & administrative agent file it — including appeals if denied.",
    heroCta: "💬 Start AI Consultation",
    quickMenu: "Quick menu",
    qVisaInfo: "Visa Info", qDocs: "Documents", qStatus: "Progress", qExpert: "Expert Help",
    ongoing: "Ongoing application",
    caseTitle: "E-7 Specific Activities (Work)", caseSub: "Document review · Step 2/6", inProgress: "Active",
    popular: "Popular visas", viewAll: "View all visas", popularBadge: "Popular",
    d2Name: "Student Visa", d2Desc: "Degree programs at Korean universities. Admission letter & proof of finances required.",
    e7Name: "Specific Activities (Skilled Work)", e7Desc: "Professional employment. Contract & degree/career proof required.",
    homeDisclaimer: "Guidance is based on public information from HiKorea (hikorea.go.kr). Final decisions rest with the Korea Immigration Service.",
    chatTitle: "AI Visa Consultation", chatPlaceholder: "Type a message…",
    visasTitle: "Visa Information", searchPh: "Search by visa code or keyword (e.g. E-7, study)",
    catAll: "All", catStudy: "Study & Training", catWork: "Work",
    askAi: "💬 Not sure? Ask the AI",
    visasDisclaimer: "Source: HiKorea (hikorea.go.kr) and other public data. Actual requirements vary by nationality, school, job and jurisdiction; final review by your attorney & administrative agent.",
    updatedAt: "Updated",
    detailOpen: "See services, documents & fees ▾", detailClose: "Collapse ▴",
    agencyFee: "Service fee", govFee: "Government fee", reqTitle: "Requirements", docsTitle: "Documents (common docs separate)",
    noResult: "No results. For other visas (F-2, F-6, …), ask the AI consultation.",
    processing: "Processing", stayLabel: "Stay",
    docsPageTitle: "Documents",
    docsAutoNote: "This checklist was generated from your AI consultation. Upload photos or files and your attorney & administrative agent will review them.",
    askDocs: "💬 Ask about documents", submitDone: "Done",
    docsDisclaimer: "Uploaded documents are stored encrypted and used only for your application.",
    submitted: "submitted", checklist: "Document checklist", issuer: "Issued by",
    stNone: "Not submitted", stUploaded: "In review", stApproved: "Approved",
    actUpload: "Upload", actReupload: "Re-upload", actView: "View",
    statusTitle: "Progress", stepsTitle: "Steps", applyNo: "Case No.",
    agentName: "Your Attorney & Agent", agentDesc: "Immigration specialist · handles appeals & litigation if denied",
    msgBtn: "Message", supplement: "📄 Submit requested documents",
    statusDisclaimer: "Processing time depends on the Korea Immigration Service.",
    myTitle: "My Page",
    mMyCases: "📍 My applications", mMyDocs: "📄 My documents", mPayments: "💳 Payments",
    mLang: "🌐 Language", mNoti: "🔔 Notifications",
    mPrivacy: "📜 Privacy policy", mTerms: "📋 Terms of service", mOffice: "👤 About the office (Attorney & Agent)", mLogout: "🚪 Log out",
    myDisclaimer: "K-Visa Assist is operated directly by a licensed attorney & administrative agent office.",
  },
};

window.ui = function (key) {
  return (UI[window.KVA_LANG] || UI.ko)[key] || UI.ko[key] || key;
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerHTML = window.ui(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = window.ui(el.dataset.i18nPh);
  });
  // 언어 토글 버튼
  document.querySelectorAll(".lang").forEach((btn) => {
    btn.innerText = window.ui("langLabel") + " ▾";
    btn.onclick = () => window.setLang(window.KVA_LANG === "ko" ? "en" : "ko");
  });
});
