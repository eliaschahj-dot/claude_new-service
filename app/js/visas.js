// 비자 정보 화면 — 지식베이스 기반 동적 렌더링 (KO/EN)
const DB = window.VISA_DB;
const listEl = document.getElementById("visaList");
const searchEl = document.getElementById("visaSearch");
const chipsEl = document.getElementById("visaChips");

const won = (n) => {
  if (n === 0) return t({ ko: "무료", en: "Free" });
  return KVA_LANG === "ko" ? n.toLocaleString("ko-KR") + "원" : "₩" + n.toLocaleString("en-US");
};

let filter = "all";
let query = "";

const badgeClass = { study: "badge-blue", work: "badge-green" };

function render() {
  listEl.innerHTML = "";
  Object.entries(DB.visas).forEach(([code, v]) => {
    if (filter !== "all" && v.catKey !== filter) return;
    const q = query.toLowerCase();
    if (q && !(code.toLowerCase().includes(q) || t(v.name).toLowerCase().includes(q) || v.nameEn.toLowerCase().includes(q))) return;

    const card = document.createElement("div");
    card.className = "card visa-card";
    card.innerHTML = `
      <div class="head">
        <span class="code">${code}</span>
        <b>${t(v.name)}</b>
        <span class="badge ${badgeClass[v.catKey] || "badge-gray"}" style="margin-left:auto">${t(v.category)}</span>
      </div>
      <p class="muted">${t(v.summary)}</p>
      <div class="meta"><span>⏱ ${ui("processing")} ${t(v.processDays)}</span><span>🗓 ${t(v.stay)}</span></div>
      <div class="visa-detail" hidden></div>
      <button class="btn btn-ghost toggle" style="padding:9px;font-size:.82rem">${ui("detailOpen")}</button>`;

    const detail = card.querySelector(".visa-detail");
    detail.innerHTML = Object.values(v.applications).map((app) => `
      <div class="app-block">
        <b>${t(app.label)}</b>
        <div class="fee-box">
          <div class="fee-row"><span>${ui("agencyFee")}</span><b>${won(app.agencyFee)}</b></div>
          <div class="fee-row"><span>${ui("govFee")}</span><b>${won(app.govFee)}</b></div>
        </div>
        <p class="muted" style="margin:6px 0 2px"><b>${ui("reqTitle")}</b></p>
        <ul class="mini-list">${app.requirements.map((r) => `<li>${t(r)}</li>`).join("")}</ul>
        <p class="muted" style="margin:6px 0 2px"><b>${ui("docsTitle")}</b></p>
        <ul class="mini-list">${app.documents.map((d) => `<li>${t(d.name)}</li>`).join("")}</ul>
      </div>`).join("");

    const toggle = card.querySelector(".toggle");
    toggle.onclick = () => {
      detail.hidden = !detail.hidden;
      toggle.innerText = detail.hidden ? ui("detailOpen") : ui("detailClose");
    };
    listEl.appendChild(card);
  });

  if (!listEl.children.length) {
    listEl.innerHTML = `<p class="muted" style="text-align:center;padding:20px">${ui("noResult")}</p>`;
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dbUpdated").innerText = DB.updated;
  render();
});
