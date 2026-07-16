"use client";
// KO/EN i18n — LangProvider + useLang 훅. localStorage에 저장, SSR 미스매치 방지 위해 마운트 후 적용.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { L } from "./visa-db";

export type Lang = "ko" | "en";

const UI_DICT = {
  ko: {
    tabHome: "홈", tabChat: "챗봇", tabDocs: "서류", tabStatus: "상태", tabMy: "MY",
    langLabel: "🌐 한국어",
    aiDisclaimer: "AI 상담은 하이코리아 공개 정보를 기반으로 한 참고용 안내입니다. 최종 검토는 담당 변호사·행정사가 진행합니다.",
    heroTitle: "한국 비자, 대화만으로\n신청부터 접수까지",
    heroDesc: "AI 챗봇과 대화하면 비자 유형 추천부터 서류 준비, 접수 대행까지 — 거절 시 불복 절차까지 변호사·행정사가 직접 처리합니다.",
    heroCta: "💬 AI 상담 시작하기",
    quickMenu: "빠른 메뉴",
    qVisaInfo: "비자 정보", qDocs: "서류 제출", qStatus: "진행 상태", qExpert: "전문가 상담",
    ongoing: "진행 중인 신청", inProgress: "진행중", noCase: "진행 중인 신청이 없습니다. AI 상담으로 시작해 보세요!",
    popular: "자주 찾는 비자", viewAll: "전체 비자 보기",
    homeDisclaimer: "본 서비스의 안내는 하이코리아(hikorea.go.kr) 공개 정보를 기반으로 하며, 최종 심사 결과는 출입국·외국인청의 판단에 따릅니다.",
    chatTitle: "AI 비자 상담", chatPlaceholder: "메시지를 입력하세요…",
    visasTitle: "비자 정보", searchPh: "비자 코드 또는 키워드 검색 (예: E-7, 유학)",
    catAll: "전체", catStudy: "유학·연수", catWork: "취업",
    askAi: "💬 내게 맞는 비자, AI에게 물어보기",
    visasDisclaimer: "출처: 하이코리아(hikorea.go.kr) 등 공개 정보 · 실제 요건·서류는 국적/학교/직종/관할에 따라 달라질 수 있으며, 최종 확인은 담당 변호사·행정사가 진행합니다.",
    updatedAt: "기준일", detailOpen: "업무·서류·비용 보기 ▾", detailClose: "접기 ▴",
    agencyFee: "대행 보수", govFee: "정부 수수료", govFeeAtCost: "정부 수수료 (실비)",
    total: "예상 총액 (VAT 별도)", duration: "예상 처리기간",
    reqTitle: "요건", reqTitleKey: "주요 요건", docsTitle: "서류 (공통 서류 별도)",
    noResult: "검색 결과가 없습니다. F-2·F-6 등 다른 비자는 AI 상담으로 문의해 주세요.",
    processing: "처리",
    docsPageTitle: "서류 제출",
    docsAutoNote: "AI 상담 결과로 자동 생성된 목록입니다. 사진 촬영 또는 파일 업로드로 제출하면 담당 변호사·행정사가 검토합니다.",
    askDocs: "💬 서류 질문하기", submitDone: "제출 완료",
    docsDisclaimer: "업로드된 서류는 암호화되어 저장되며, 대행 업무 목적 외에는 사용되지 않습니다.",
    submitted: "제출", checklist: "서류 체크리스트", issuer: "발급처",
    stNone: "미제출", stUploaded: "검토 대기", stApproved: "승인 완료",
    actUpload: "업로드", actReupload: "다시 올리기", actView: "보기",
    statusTitle: "진행 상태", stepsTitle: "처리 단계", applyNo: "접수번호",
    agentName: "담당 변호사·행정사", agentDesc: "출입국 전문 · 거절 시 이의신청·행정쟁송까지 직접 수행",
    msgBtn: "메시지", supplement: "📄 보완 서류 제출하기",
    statusDisclaimer: "심사 소요 기간은 출입국·외국인청 사정에 따라 달라질 수 있습니다.",
    myTitle: "마이페이지",
    mMyCases: "📍 내 신청 내역", mMyDocs: "📄 제출한 서류", mPayments: "💳 결제 내역",
    mLang: "🌐 언어 설정", mNoti: "🔔 알림 설정",
    mPrivacy: "📜 개인정보처리방침", mTerms: "📋 이용약관", mOffice: "👤 사무소 정보 (변호사·행정사)", mLogout: "🚪 로그아웃",
    myDisclaimer: "K-Visa Assist는 변호사·행정사 사무소가 직접 운영하는 출입국 민원 대행 서비스입니다.",
    recoBadge: "추천", basis: "기준일",
    basisNote: "출처: 하이코리아 등 (참고용, 최종 견적은 담당 변호사·행정사 확인)",
    startBtn: "✅ 신청 시작하기", otherBtn: "다른 비자 보기", free: "무료",
    freeReply: "입력해 주셔서 감사합니다! 데모 버전에서는 버튼 선택으로 상담이 진행됩니다.\n실제 서비스에서는 AI가 자유 입력을 이해하고 하이코리아 근거와 함께 답변합니다. 😊",
  },
  en: {
    tabHome: "Home", tabChat: "Chat", tabDocs: "Docs", tabStatus: "Status", tabMy: "MY",
    langLabel: "🌐 English",
    aiDisclaimer: "AI answers are for reference, based on public information from HiKorea. Final review is done by your attorney & administrative agent.",
    heroTitle: "Your Korean visa,\nhandled through a chat",
    heroDesc: "Talk to our AI to find the right visa, prepare documents, and let a licensed attorney & administrative agent file it — including appeals if denied.",
    heroCta: "💬 Start AI Consultation",
    quickMenu: "Quick menu",
    qVisaInfo: "Visa Info", qDocs: "Documents", qStatus: "Progress", qExpert: "Expert Help",
    ongoing: "Ongoing application", inProgress: "Active", noCase: "No ongoing application yet. Start with an AI consultation!",
    popular: "Popular visas", viewAll: "View all visas",
    homeDisclaimer: "Guidance is based on public information from HiKorea (hikorea.go.kr). Final decisions rest with the Korea Immigration Service.",
    chatTitle: "AI Visa Consultation", chatPlaceholder: "Type a message…",
    visasTitle: "Visa Information", searchPh: "Search by visa code or keyword (e.g. E-7, study)",
    catAll: "All", catStudy: "Study & Training", catWork: "Work",
    askAi: "💬 Not sure? Ask the AI",
    visasDisclaimer: "Source: HiKorea (hikorea.go.kr) and other public data. Actual requirements vary by nationality, school, job and jurisdiction; final review by your attorney & administrative agent.",
    updatedAt: "Updated", detailOpen: "See services, documents & fees ▾", detailClose: "Collapse ▴",
    agencyFee: "Service fee", govFee: "Government fee", govFeeAtCost: "Government fee (at cost)",
    total: "Estimated total (excl. VAT)", duration: "Est. processing time",
    reqTitle: "Requirements", reqTitleKey: "Key requirements", docsTitle: "Documents (common docs separate)",
    noResult: "No results. For other visas (F-2, F-6, …), ask the AI consultation.",
    processing: "Processing",
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
    recoBadge: "Recommended", basis: "As of",
    basisNote: "Source: HiKorea etc. For reference — final quote confirmed by your attorney & agent.",
    startBtn: "✅ Start my application", otherBtn: "See other visas", free: "Free",
    freeReply: "Thanks for your message! In this demo, the consultation proceeds via the buttons.\nIn the full service, the AI understands free text and answers with HiKorea sources. 😊",
  },
} as const;

export type UIKey = keyof typeof UI_DICT.ko;

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  ui: (key: UIKey) => string;
  t: (v: L) => string;
  won: (n: number) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kva_lang") as Lang | null;
    if (saved === "ko" || saved === "en") setLangState(saved);
    setReady(true);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem("kva_lang", l);
    setLangState(l);
  };

  const value: I18n = {
    lang,
    setLang,
    ui: (key) => UI_DICT[lang][key] ?? UI_DICT.ko[key] ?? key,
    t: (v) => v[lang] ?? v.ko,
    won: (n) => (n === 0 ? UI_DICT[lang].free : lang === "ko" ? n.toLocaleString("ko-KR") + "원" : "₩" + n.toLocaleString("en-US")),
  };

  // 언어 확정 전 렌더 방지 (hydration mismatch 예방)
  if (!ready) return null;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LangProvider");
  return ctx;
}
