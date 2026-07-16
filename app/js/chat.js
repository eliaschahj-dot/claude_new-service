// K-Visa Assist — 챗봇 (데모: 시나리오 분기 + 지식베이스(data/visas.js) 기반 추천·견적·체크리스트)
// 프로덕션에서는 LLM 슬롯 인테이크 + 룰엔진 판정으로 대체 (docs/SERVICE_SPEC.md §4)

const log = document.getElementById("chatLog");
const input = document.getElementById("chatText");
const sendBtn = document.getElementById("chatSend");
const DB = window.VISA_DB;

const won = (n) => (n === 0 ? "무료" : n.toLocaleString("ko-KR") + "원");

const scenario = {
  start: {
    bot: "안녕하세요! 👋 K-Visa Assist AI 상담원입니다.\n비자 상담을 시작할게요. 한국에 오시는(계시는) 목적이 무엇인가요?",
    replies: [
      { label: "🎓 유학", next: "study" },
      { label: "💼 취업", next: "work" },
      { label: "🔄 체류 연장", next: "extend" },
      { label: "💍 결혼/기타", next: "handoff" },
    ],
  },
  study: {
    bot: "유학을 준비 중이시군요! 어떤 과정으로 입학하시나요?",
    replies: [
      { label: "대학교 학사/석사/박사", next: "studyD2" },
      { label: "어학연수", next: "recoD4new" },
    ],
  },
  studyD2: {
    bot: "지금 한국에 계신가요, 해외에 계신가요?",
    replies: [
      { label: "한국 (어학연수 D-4 중)", next: "recoD2change" },
      { label: "해외에서 신규 신청", next: "handoff" },
    ],
  },
  work: {
    bot: "취업 비자를 알아볼게요. 아래 중 어디에 해당하시나요?",
    replies: [
      { label: "취업 확정 (회사 있음)", next: "workDegree" },
      { label: "구직 활동 예정", next: "d10check" },
    ],
  },
  workDegree: {
    bot: "전문인력 취업은 보통 E-7(특정활동)에 해당합니다.\n다음 중 하나에 해당하시나요?\n· 석사 이상 학위\n· 학사 학위 + 관련 경력 1년\n· 관련 경력 5년 이상\n· 국내 대학 관련 전공 졸업",
    replies: [
      { label: "네, 해당합니다", next: "e7where" },
      { label: "아니요 / 잘 모르겠어요", next: "handoff" },
    ],
  },
  e7where: {
    bot: "지금 한국에 체류 중이신가요? (예: D-2, D-10 소지)",
    replies: [
      { label: "네, 국내 체류 중", next: "recoE7change" },
      { label: "해외에 있습니다", next: "recoE7new" },
    ],
  },
  d10check: {
    bot: "구직 비자(D-10)를 확인해 볼게요.\n학사 이상 학위(국내 전문학사 포함)를 갖고 계신가요?",
    replies: [
      { label: "네", next: "d10topik" },
      { label: "아니요", next: "handoff" },
    ],
  },
  d10topik: {
    bot: "좋아요! 혹시 TOPIK 4급 이상 성적이나 사회통합프로그램(KIIP) 중간평가 합격이 있으신가요?\n(있으면 점수제 평가가 면제되어 절차가 간단해집니다 ✨)",
    replies: [
      { label: "네, 있어요", next: "recoD10" },
      { label: "없어요 (점수제 평가 필요)", next: "recoD10" },
    ],
  },
  extend: {
    bot: "현재 어떤 비자를 갖고 계신가요?",
    replies: [
      { label: "D-2 (유학)", next: "recoD2ext" },
      { label: "D-4 (어학연수)", next: "recoD4ext" },
      { label: "E-7 (취업)", next: "recoE7ext" },
      { label: "기타", next: "handoff" },
    ],
  },
  // 추천 노드: visa/app 코드만 지정하면 지식베이스에서 카드 생성
  recoD2change: { reco: ["D-2", "change"], next2: "postReco" },
  recoD2ext:    { reco: ["D-2", "extension"], next2: "postReco" },
  recoD4new:    { reco: ["D-4", "new"], next2: "postReco" },
  recoD4ext:    { reco: ["D-4", "extension"], next2: "postReco" },
  recoD10:      { reco: ["D-10", "change"], next2: "postReco" },
  recoE7change: { reco: ["E-7", "change"], next2: "postReco" },
  recoE7new:    { reco: ["E-7", "new"], next2: "postReco" },
  recoE7ext:    { reco: ["E-7", "extension"], next2: "postReco" },
  handoff: {
    bot: "이 사안은 담당 변호사·행정사가 직접 확인하는 것이 정확합니다.\n상담을 연결해 드릴게요 — 영업일 기준 24시간 이내 답변드립니다. 📩",
    replies: [
      { label: "처음으로", next: "start" },
      { label: "진행 상태 보기", href: "status.html" },
    ],
  },
};

function addBot(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="avatar">🤖</span><span class="bubble"></span>`;
  div.querySelector(".bubble").innerText = text;
  log.appendChild(div);
}

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.innerHTML = `<span class="bubble"></span>`;
  div.querySelector(".bubble").innerText = text;
  log.appendChild(div);
}

// 지식베이스 기반 추천 + 견적 카드
function addReco(code, appKey) {
  const visa = DB.visas[code];
  const app = visa.applications[appKey];
  const total = app.agencyFee + app.govFee;

  const div = document.createElement("div");
  div.className = "reco-card";
  div.innerHTML = `
    <span class="badge badge-blue">추천 · ${app.label}</span>
    <h3>${code} · ${visa.name}</h3>
    <p class="muted" style="margin-bottom:6px">${visa.summary}</p>
    <p class="muted"><b>주요 요건</b></p>
    <ul>${app.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>
    <div class="fee-box">
      <div class="fee-row"><span>대행 보수</span><b>${won(app.agencyFee)}</b></div>
      <div class="fee-row"><span>정부 수수료 (실비)</span><b>${won(app.govFee)}</b></div>
      <div class="fee-row total"><span>예상 총액 (VAT 별도)</span><b>${won(total)}</b></div>
      <div class="fee-row"><span>예상 처리기간</span><b>${visa.processDays}</b></div>
    </div>
    <p class="muted" style="font-size:.72rem;margin-top:8px">
      기준일 ${DB.updated} · 출처: 하이코리아 등 (참고용, 최종 견적은 담당 변호사·행정사 확인)
    </p>`;
  log.appendChild(div);

  addBot(`신청을 진행하시겠어요? 필요 서류 ${app.documents.length + DB.commonDocs.length}종의 체크리스트를 만들어 드립니다.`);
  const wrap = document.createElement("div");
  wrap.className = "quick-replies";
  const goBtn = document.createElement("button");
  goBtn.innerText = "✅ 신청 시작하기";
  goBtn.onclick = () => {
    localStorage.setItem("kva_case", JSON.stringify({ code, appKey, startedAt: Date.now() }));
    localStorage.removeItem("kva_doc_status");
    location.href = "documents.html";
  };
  const backBtn = document.createElement("button");
  backBtn.innerText = "다른 비자 보기";
  backBtn.onclick = () => { wrap.remove(); addUser("다른 비자 보기"); setTimeout(() => goTo("start"), 350); };
  wrap.append(goBtn, backBtn);
  log.appendChild(wrap);
}

function addReplies(replies) {
  const wrap = document.createElement("div");
  wrap.className = "quick-replies";
  replies.forEach((r) => {
    const b = document.createElement("button");
    b.innerText = r.label;
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
    addBot("입력해 주셔서 감사합니다! 데모 버전에서는 버튼 선택으로 상담이 진행됩니다.\n실제 서비스에서는 AI가 자유 입력을 이해하고 하이코리아 근거와 함께 답변합니다. 😊");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 350);
}

sendBtn.addEventListener("click", sendFree);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFree(); });

goTo("start");
