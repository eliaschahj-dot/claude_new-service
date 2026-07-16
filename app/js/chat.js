// K-Visa Assist — 챗봇 (데모: 시나리오 분기 + 지식베이스 기반 추천·견적·체크리스트, KO/EN)
// 프로덕션에서는 LLM 슬롯 인테이크 + 룰엔진 판정으로 대체 (docs/SERVICE_SPEC.md §4)

const log = document.getElementById("chatLog");
const input = document.getElementById("chatText");
const sendBtn = document.getElementById("chatSend");
const DB = window.VISA_DB;

const won = (n) => {
  if (n === 0) return t({ ko: "무료", en: "Free" });
  return KVA_LANG === "ko" ? n.toLocaleString("ko-KR") + "원" : "₩" + n.toLocaleString("en-US");
};

const scenario = {
  start: {
    bot: { ko: "안녕하세요! 👋 K-Visa Assist AI 상담원입니다.\n비자 상담을 시작할게요. 한국에 오시는(계시는) 목적이 무엇인가요?",
           en: "Hello! 👋 I'm the K-Visa Assist AI consultant.\nLet's find your visa. What brings you to Korea?" },
    replies: [
      { label: { ko: "🎓 유학", en: "🎓 Study" }, next: "study" },
      { label: { ko: "💼 취업", en: "💼 Work" }, next: "work" },
      { label: { ko: "🔄 체류 연장", en: "🔄 Extend my stay" }, next: "extend" },
      { label: { ko: "💍 결혼/기타", en: "💍 Marriage / Other" }, next: "handoff" },
    ],
  },
  study: {
    bot: { ko: "유학을 준비 중이시군요! 어떤 과정으로 입학하시나요?",
           en: "Planning to study in Korea! Which program will you enroll in?" },
    replies: [
      { label: { ko: "대학교 학사/석사/박사", en: "University degree (BA/MA/PhD)" }, next: "studyD2" },
      { label: { ko: "어학연수", en: "Korean language course" }, next: "recoD4new" },
    ],
  },
  studyD2: {
    bot: { ko: "지금 한국에 계신가요, 해외에 계신가요?",
           en: "Are you currently in Korea or abroad?" },
    replies: [
      { label: { ko: "한국 (어학연수 D-4 중)", en: "In Korea (on D-4)" }, next: "recoD2change" },
      { label: { ko: "해외에서 신규 신청", en: "Abroad (new application)" }, next: "handoff" },
    ],
  },
  work: {
    bot: { ko: "취업 비자를 알아볼게요. 아래 중 어디에 해당하시나요?",
           en: "Let's look at work visas. Which describes you?" },
    replies: [
      { label: { ko: "취업 확정 (회사 있음)", en: "I have a job offer" }, next: "workDegree" },
      { label: { ko: "구직 활동 예정", en: "I'm looking for a job" }, next: "d10check" },
    ],
  },
  workDegree: {
    bot: { ko: "전문인력 취업은 보통 E-7(특정활동)에 해당합니다.\n다음 중 하나에 해당하시나요?\n· 석사 이상 학위\n· 학사 학위 + 관련 경력 1년\n· 관련 경력 5년 이상\n· 국내 대학 관련 전공 졸업",
           en: "Professional employment usually falls under E-7 (Specific Activities).\nDo any of these apply to you?\n· Master's degree or higher\n· Bachelor's + 1 year of related career\n· 5+ years of related career\n· Korean university graduate in a related major" },
    replies: [
      { label: { ko: "네, 해당합니다", en: "Yes, that's me" }, next: "e7where" },
      { label: { ko: "아니요 / 잘 모르겠어요", en: "No / Not sure" }, next: "handoff" },
    ],
  },
  e7where: {
    bot: { ko: "지금 한국에 체류 중이신가요? (예: D-2, D-10 소지)",
           en: "Are you currently staying in Korea? (e.g. on D-2 or D-10)" },
    replies: [
      { label: { ko: "네, 국내 체류 중", en: "Yes, I'm in Korea" }, next: "recoE7change" },
      { label: { ko: "해외에 있습니다", en: "I'm abroad" }, next: "recoE7new" },
    ],
  },
  d10check: {
    bot: { ko: "구직 비자(D-10)를 확인해 볼게요.\n학사 이상 학위(국내 전문학사 포함)를 갖고 계신가요?",
           en: "Let's check the D-10 job seeker visa.\nDo you have a Bachelor's degree or higher (Korean associate degree counts)?" },
    replies: [
      { label: { ko: "네", en: "Yes" }, next: "d10topik" },
      { label: { ko: "아니요", en: "No" }, next: "handoff" },
    ],
  },
  d10topik: {
    bot: { ko: "좋아요! 혹시 TOPIK 4급 이상 성적이나 사회통합프로그램(KIIP) 중간평가 합격이 있으신가요?\n(있으면 점수제 평가가 면제되어 절차가 간단해집니다 ✨)",
           en: "Great! Do you have TOPIK level 4+ or a KIIP mid-term pass?\n(Either one waives the points assessment and simplifies things ✨)" },
    replies: [
      { label: { ko: "네, 있어요", en: "Yes, I do" }, next: "recoD10" },
      { label: { ko: "없어요 (점수제 평가 필요)", en: "No (points assessment needed)" }, next: "recoD10" },
    ],
  },
  extend: {
    bot: { ko: "현재 어떤 비자를 갖고 계신가요?", en: "Which visa do you currently hold?" },
    replies: [
      { label: { ko: "D-2 (유학)", en: "D-2 (Study)" }, next: "recoD2ext" },
      { label: { ko: "D-4 (어학연수)", en: "D-4 (Language)" }, next: "recoD4ext" },
      { label: { ko: "E-7 (취업)", en: "E-7 (Work)" }, next: "recoE7ext" },
      { label: { ko: "기타", en: "Other" }, next: "handoff" },
    ],
  },
  recoD2change: { reco: ["D-2", "change"] },
  recoD2ext:    { reco: ["D-2", "extension"] },
  recoD4new:    { reco: ["D-4", "new"] },
  recoD4ext:    { reco: ["D-4", "extension"] },
  recoD10:      { reco: ["D-10", "change"] },
  recoE7change: { reco: ["E-7", "change"] },
  recoE7new:    { reco: ["E-7", "new"] },
  recoE7ext:    { reco: ["E-7", "extension"] },
  handoff: {
    bot: { ko: "이 사안은 담당 변호사·행정사가 직접 확인하는 것이 정확합니다.\n상담을 연결해 드릴게요 — 영업일 기준 24시간 이내 답변드립니다. 📩",
           en: "For this case, a direct review by our attorney & administrative agent is best.\nWe'll connect you — you'll hear back within 1 business day. 📩" },
    replies: [
      { label: { ko: "처음으로", en: "Start over" }, next: "start" },
      { label: { ko: "진행 상태 보기", en: "View my progress" }, href: "status.html" },
    ],
  },
};

const STR = {
  recoBadge: { ko: "추천", en: "Recommended" },
  reqTitle: { ko: "주요 요건", en: "Key requirements" },
  agencyFee: { ko: "대행 보수", en: "Service fee" },
  govFee: { ko: "정부 수수료 (실비)", en: "Government fee (at cost)" },
  total: { ko: "예상 총액 (VAT 별도)", en: "Estimated total (excl. VAT)" },
  duration: { ko: "예상 처리기간", en: "Est. processing time" },
  basis: { ko: "기준일", en: "As of" },
  basisNote: { ko: "출처: 하이코리아 등 (참고용, 최종 견적은 담당 변호사·행정사 확인)",
               en: "Source: HiKorea etc. For reference — final quote confirmed by your attorney & agent." },
  proceed: (n) => t({ ko: `신청을 진행하시겠어요? 필요 서류 ${n}종의 체크리스트를 만들어 드립니다.`,
                      en: `Ready to apply? I'll generate your checklist of ${n} documents.` }),
  startBtn: { ko: "✅ 신청 시작하기", en: "✅ Start my application" },
  otherBtn: { ko: "다른 비자 보기", en: "See other visas" },
  freeReply: { ko: "입력해 주셔서 감사합니다! 데모 버전에서는 버튼 선택으로 상담이 진행됩니다.\n실제 서비스에서는 AI가 자유 입력을 이해하고 하이코리아 근거와 함께 답변합니다. 😊",
               en: "Thanks for your message! In this demo, the consultation proceeds via the buttons.\nIn the full service, the AI understands free text and answers with HiKorea sources. 😊" },
};

function addBot(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="avatar">🤖</span><span class="bubble"></span>`;
  div.querySelector(".bubble").innerText = t(text);
  log.appendChild(div);
}

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.innerHTML = `<span class="bubble"></span>`;
  div.querySelector(".bubble").innerText = t(text);
  log.appendChild(div);
}

function addReco(code, appKey) {
  const visa = DB.visas[code];
  const app = visa.applications[appKey];
  const total = app.agencyFee + app.govFee;

  const div = document.createElement("div");
  div.className = "reco-card";
  div.innerHTML = `
    <span class="badge badge-blue">${t(STR.recoBadge)} · ${t(app.label)}</span>
    <h3>${code} · ${t(visa.name)}</h3>
    <p class="muted" style="margin-bottom:6px">${t(visa.summary)}</p>
    <p class="muted"><b>${t(STR.reqTitle)}</b></p>
    <ul>${app.requirements.map((r) => `<li>${t(r)}</li>`).join("")}</ul>
    <div class="fee-box">
      <div class="fee-row"><span>${t(STR.agencyFee)}</span><b>${won(app.agencyFee)}</b></div>
      <div class="fee-row"><span>${t(STR.govFee)}</span><b>${won(app.govFee)}</b></div>
      <div class="fee-row total"><span>${t(STR.total)}</span><b>${won(total)}</b></div>
      <div class="fee-row"><span>${t(STR.duration)}</span><b>${t(visa.processDays)}</b></div>
    </div>
    <p class="muted" style="font-size:.72rem;margin-top:8px">
      ${t(STR.basis)} ${DB.updated} · ${t(STR.basisNote)}
    </p>`;
  log.appendChild(div);

  addBot(STR.proceed(app.documents.length + DB.commonDocs.length));
  const wrap = document.createElement("div");
  wrap.className = "quick-replies";
  const goBtn = document.createElement("button");
  goBtn.innerText = t(STR.startBtn);
  goBtn.onclick = () => {
    localStorage.setItem("kva_case", JSON.stringify({ code, appKey, startedAt: Date.now() }));
    localStorage.removeItem("kva_doc_status");
    location.href = "documents.html";
  };
  const backBtn = document.createElement("button");
  backBtn.innerText = t(STR.otherBtn);
  backBtn.onclick = () => { wrap.remove(); addUser(STR.otherBtn); setTimeout(() => goTo("start"), 350); };
  wrap.append(goBtn, backBtn);
  log.appendChild(wrap);
}

function addReplies(replies) {
  const wrap = document.createElement("div");
  wrap.className = "quick-replies";
  replies.forEach((r) => {
    const b = document.createElement("button");
    b.innerText = t(r.label);
    b.onclick = () => {
      if (r.href) { location.href = r.href; return; }
      wrap.remove();
      addUser(r.label);
      setTimeout(() => goTo(r.next), 350);
    };
    wrap.appendChild(b);
  });
  log.appendChild(wrap);
}

function goTo(key) {
  const step = scenario[key];
  if (!step) return;
  if (step.reco) { addReco(step.reco[0], step.reco[1]); }
  else {
    if (step.bot) addBot(step.bot);
    if (step.replies) addReplies(step.replies);
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function sendFree() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addUser(text);
  setTimeout(() => {
    addBot(STR.freeReply);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 350);
}

sendBtn.addEventListener("click", sendFree);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFree(); });

goTo("start");
