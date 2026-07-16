// 서류 체크리스트 — 선택 케이스(localStorage) 기반 동적 생성 (KO/EN)
const DB = window.VISA_DB;
const caseData = JSON.parse(localStorage.getItem("kva_case") || '{"code":"E-7","appKey":"change"}');
const visa = DB.visas[caseData.code];
const app = visa.applications[caseData.appKey];

const docs = [
  ...DB.commonDocs.map((d, i) => ({ id: "c" + i, ...d, common: true })),
  ...app.documents.map((d, i) => ({ id: "d" + i, ...d, common: false })),
];

let statuses = JSON.parse(localStorage.getItem("kva_doc_status") || "{}");

const headEl = document.getElementById("docHead");
const listEl = document.getElementById("docList");
const progEl = document.getElementById("docProgress");
const cntEl = document.getElementById("docCount");

function save() { localStorage.setItem("kva_doc_status", JSON.stringify(statuses)); }

function icon(d) {
  if (d.common) return "🛂";
  const issuer = d.issuer.ko || "";
  return issuer.includes("회사") ? "🏢" : issuer.includes("은행") ? "🏦"
    : /학교|대학|연수/.test(issuer) ? "🎓" : "📑";
}

function statusOf(d) {
  const key = statuses[d.id] || "none";
  return {
    none:     { label: ui("stNone"),     cls: "badge-gray",  action: ui("actUpload") },
    uploaded: { label: ui("stUploaded"), cls: "badge-amber", action: ui("actReupload") },
    approved: { label: ui("stApproved"), cls: "badge-green", action: ui("actView") },
  }[key];
}

function render() {
  headEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span class="badge badge-blue">${caseData.code} ${t(visa.name)}</span>
      <b style="font-size:.95rem">${t(app.label)} — ${ui("checklist")}</b>
    </div>`;

  const done = docs.filter((d) => statuses[d.id]).length;
  progEl.style.width = Math.round((done / docs.length) * 100) + "%";
  cntEl.innerHTML = `<b>${done}</b> / ${docs.length} ${ui("submitted")}`;

  listEl.innerHTML = "";
  docs.forEach((d) => {
    const st = statusOf(d);
    const row = document.createElement("div");
    row.className = "doc-item";
    row.innerHTML = `
      <span class="ico">${icon(d)}</span>
      <span class="info">
        <b>${t(d.name)}</b>
        <span class="badge ${st.cls}">${st.label}</span><br>
        <span>${ui("issuer")}: ${t(d.issuer)}</span>
      </span>
      <button class="action">${st.action}</button>`;
    row.querySelector(".action").onclick = () => {
      // 데모: 파일 선택 시뮬레이션 — 실제로는 업로드 API 호출
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = "image/*,.pdf";
      picker.onchange = () => {
        if (picker.files.length) { statuses[d.id] = "uploaded"; save(); render(); }
      };
      picker.click();
    };
    listEl.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", render);
