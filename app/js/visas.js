// 비자 정보 화면 — 지식베이스(data/visas.js) 기반 동적 렌더링
const DB = window.VISA_DB;
const listEl = document.getElementById("visaList");
const searchEl = document.getElementById("visaSearch");
const chipsEl = document.getElementById("visaChips");
const won = (n) => (n === 0 ? "무료" : n.toLocaleString("ko-KR") + "원");

let filter = "전체";
let query = "";

const badgeClass = { "유학·연수": "badge-blue", "취업": "badge-green" };

function render() {
  listEl.innerHTML = "";
  Object.entries(DB.visas).forEach(([code, v]) => {
    if (filter !== "전체" && v.category !== filter) return;
    const q = query.toLowerCase();
    if (q && !(code.toLowerCase().includes(q) || v.name.includes(q) || v.nameEn.toLowerCase().includes(q))) return;

    const card = document.createElement("div");
    card.className = "card visa-card";
    card.innerHTML = `
      <div class="head">
        <span class="code">${code}</span>
        <b>${v.name} <span class="muted" style="font-weight:400;font-size:.75rem">${v.nameEn}</span></b>
        <span class="badge ${badgeClass[v.category] || "badge-gray"}" style="margin-left:auto">${v.category}</span>
      </div>
      <p class="muted">${v.summary}</p>
      <div class="meta"><span>⏱ 처리 ${v.processDays}</span><span>🗓 ${v.stay}</span></div>
      <div class="visa-detail" hidden></div>
      <button class="btn btn-ghost toggle" style="padding:9px;font-size:.82rem">업무·서류·비용 보기 ▾</button>`;

    const detail = card.querySelector(".visa-detail");
    detail.innerHTML = Object.values(v.applications).map((app) => `
      <div class="app-block">
        <b>${app.label}</b>
        <div class="fee-box">
          <div class="fee-row"><span>대행 보수</span><b>${won(app.agencyFee)}</b></div>
          <div class="fee-row"><span>정부 수수료</span><b>${won(app.govFee)}</b></div>
        </div>
        <p class="muted" style="margin:6px 0 2px"><b>요건</b></p>
        <ul class="mini-list">${app.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>
        <p class="muted" style="margin:6px 0 2px"><b>서류 (공통 서류 별도)</b></p>
        <ul class="mini-list">${app.documents.map((d) => `<li>${d.name}</li>`).join("")}</ul>
      </div>`).join("");

    const toggle = card.querySelector(".toggle");
    toggle.onclick = () => {
      detail.hidden = !detail.hidden;
      toggle.innerText = detail.hidden ? "업무·서류·비용 보기 ▾" : "접기 ▴";
    };
    listEl.appendChild(card);
  });

  if (!listEl.children.length) {
    listEl.innerHTML = `<p class="muted" style="text-align:center;padding:20px">검색 결과가 없습니다.
      F-2·F-6 등 다른 비자는 AI 상담으로 문의해 주세요.</p>`;
  }
}

chipsEl.querySelectorAll("button").forEach((b) => {
  b.onclick = () => {
    chipsEl.querySelector(".on")?.classList.remove("on");
    b.classList.add("on");
    filter = b.dataset.cat;
    render();
  };
});
searchEl.addEventListener("input", () => { query = searchEl.value.trim(); render(); });

document.getElementById("dbUpdated").innerText = DB.updated;
render();
