// K-Visa Assist — scripted chatbot demo.
// In production this is replaced by an LLM + RAG backend fed by hikorea.go.kr data.

const log = document.getElementById("chatLog");
const input = document.getElementById("chatText");
const sendBtn = document.getElementById("chatSend");

const scenario = {
  start: {
    bot: "안녕하세요! 👋 K-Visa Assist AI 상담원입니다.\n비자 상담을 시작할게요. 한국에 오시는(계시는) 목적이 무엇인가요?",
    replies: [
      { label: "🎓 유학", next: "study" },
      { label: "💼 취업", next: "work" },
      { label: "💍 결혼/가족", next: "family" },
      { label: "🔄 체류 연장/변경", next: "extend" },
    ],
  },
  study: {
    bot: "유학을 준비 중이시군요! 어떤 과정으로 입학하시나요?",
    replies: [
      { label: "대학교 학사/석사/박사", next: "recoD2" },
      { label: "어학연수", next: "recoD4" },
    ],
  },
  work: {
    bot: "취업 비자를 알아볼게요. 아래 중 어디에 해당하시나요?",
    replies: [
      { label: "전문 분야 취업 (사무·기술직)", next: "workDegree" },
      { label: "구직 활동 예정", next: "recoD10" },
    ],
  },
  workDegree: {
    bot: "전문인력 취업은 보통 E-7(특정활동)에 해당합니다.\n관련 분야 학사 학위 또는 5년 이상 경력이 있으신가요?",
    replies: [
      { label: "네, 있습니다", next: "recoE7" },
      { label: "아니요 / 잘 모르겠어요", next: "handoff" },
    ],
  },
  family: {
    bot: "한국 국민과의 결혼이신가요, 가족 동반이신가요?",
    replies: [
      { label: "한국인 배우자와 결혼", next: "recoF6" },
      { label: "가족 동반 체류", next: "handoff" },
    ],
  },
  extend: {
    bot: "현재 체류자격의 연장 또는 변경이시군요. 지금 어떤 비자를 가지고 계신가요? (예: D-2, E-9)\n아래 입력창에 적어주시면 담당 행정사 검토와 함께 안내해 드릴게요.",
    replies: [{ label: "행정사에게 바로 문의", next: "handoff" }],
  },
  recoD2: {
    reco: {
      code: "D-2", name: "유학 비자",
      points: ["입학허가서 (표준입학허가서)", "재정능력 입증 서류 (잔고증명 등)", "최종학력 증명서", "여권·사진·수수료"],
    },
    bot: "신청을 진행하시겠어요? 지금까지의 답변으로 신청서 초안과 서류 체크리스트를 만들어 드립니다.",
    replies: [
      { label: "✅ 신청 시작하기", href: "documents.html" },
      { label: "다른 비자 보기", next: "start" },
    ],
  },
  recoD4: {
    reco: {
      code: "D-4", name: "일반연수 (어학연수)",
      points: ["연수기관 입학허가서", "재정능력 입증 서류", "여권·사진·수수료"],
    },
    bot: "신청을 진행하시겠어요?",
    replies: [
      { label: "✅ 신청 시작하기", href: "documents.html" },
      { label: "다른 비자 보기", next: "start" },
    ],
  },
  recoD10: {
    reco: {
      code: "D-10", name: "구직 비자",
      points: ["구직활동계획서", "최종학력 증명서", "점수제 요건 확인 필요"],
    },
    bot: "신청을 진행하시겠어요?",
    replies: [
      { label: "✅ 신청 시작하기", href: "documents.html" },
      { label: "다른 비자 보기", next: "start" },
    ],
  },
  recoE7: {
    reco: {
      code: "E-7", name: "특정활동 (전문인력 취업)",
      points: ["고용계약서", "학위증 또는 경력증명서", "고용업체 사업자등록증 등 회사 서류", "직종별 추가 요건 확인 필요"],
    },
    bot: "신청을 진행하시겠어요? 지금까지의 답변으로 신청서 초안과 서류 체크리스트를 만들어 드립니다.",
    replies: [
      { label: "✅ 신청 시작하기", href: "documents.html" },
      { label: "다른 비자 보기", next: "start" },
    ],
  },
  recoF6: {
    reco: {
      code: "F-6", name: "결혼이민 비자",
      points: ["혼인관계증명서", "배우자 소득·주거 요건 증빙", "국제결혼 안내프로그램 이수(해당 시)"],
    },
    bot: "F-6는 요건 검토가 중요한 비자입니다. 행정사 검토와 함께 진행하시는 것을 권장드려요.",
    replies: [
      { label: "✅ 신청 시작하기", href: "documents.html" },
      { label: "👤 행정사 상담 연결", next: "handoff" },
    ],
  },
  handoff: {
    bot: "알겠습니다. 담당 행정사에게 상담을 연결해 드릴게요.\n영업일 기준 24시간 이내에 답변을 받으실 수 있습니다. 📩",
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

function addReco(reco) {
  const div = document.createElement("div");
  div.className = "reco-card";
  div.innerHTML = `
    <span class="badge badge-blue">추천 비자</span>
    <h3>${reco.code} · ${reco.name}</h3>
    <p class="muted">주요 요건 / 서류</p>
    <ul>${reco.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    <a class="btn btn-ghost" href="visas.html" style="padding:10px;font-size:.84rem">상세 정보 보기</a>`;
  log.appendChild(div);
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
  if (step.reco) addReco(step.reco);
  if (step.bot) addBot(step.bot);
  if (step.replies) addReplies(step.replies);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function sendFree() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addUser(text);
  setTimeout(() => {
    addBot("입력해 주셔서 감사합니다! 데모 버전에서는 버튼 선택으로 상담이 진행됩니다.\n실제 서비스에서는 AI가 자유 입력을 이해하고 답변합니다. 😊");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 350);
}

sendBtn.addEventListener("click", sendFree);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFree(); });

goTo("start");
