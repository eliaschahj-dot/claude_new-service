// 서류 체크리스트 — 챗봇에서 선택한 케이스(localStorage) 기반 동적 생성
const DB = window.VISA_DB;
const caseData = JSON.parse(localStorage.getItem("kva_case") || '{"code":"E-7","appKey":"change"}');
const visa = DB.visas[caseData.code];
const app = visa.applications[caseData.appKey];

const STATUS = {
  none:     { label: "미제출",   cls: "badge-gray",  action: "업로드" },
  uploaded: { label: "검토 대기", cls: "badge-amber", action: "다시 올리기" },
  approved: { label: "승인 완료", cls: "badge-green", action: "보기" },
};

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
  return d.issuer.includes("회사") ? "🏢" : d.issuer.includes("은행") ? "🏦"
    : /학교|대학|연수/.test(d.issuer) ? "🎓" : "📑";
}

function render() {
  headEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span class="badge badge-blue">${caseData.code} ${visa.name}</span>
      <b style="font-size:.95rem">${app.label} — 서류 체크리스트</b>
    </div>`;

  const done = docs.filter((d) => statuses[d.id]).length;
  progEl.style.width = Math.round((done / docs.length) * 100) + "%";
  cntEl.innerHTML = `<b>${done}</b> / ${docs.length} 제출`;

  listEl.innerHTML = "";
  docs.forEach((d) => {
    const st = STATUS[statuses[d.id] || "none"];
    const row = document.createElement("div");
    row.className = "doc-item";
    row.innerHTML = `
      <span class="ico">${icon(d)}</span>
      <span class="info">
        <b>${d.name}</b>
        <span class="badge ${st.cls}">${st.label}</span><br>
        <span>발급처: ${d.issuer}</span>
      </span>
      <button class="action">${st.action}</button>`;
    row.querySelector(".action").onclick = () => {
      // 데모: 파일 선택을 시뮬레이션 — 실제로는 업로드 API 호출
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

render();
