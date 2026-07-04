/* 원고레이더 대시보드 */

const CAT_COLORS = {
  // 고정 슬롯 순서로 배정 (다크 팔레트) — 카테고리 식별은 항상 텍스트 라벨 동반
  "건설하자": "#3987e5",
  "금융": "#199e70",
  "제조물": "#c98500",
  "하도급": "#008300",
  "개인정보": "#9085e9",
  "증권": "#e66767",
};

const $ = (sel) => document.querySelector(sel);
const fmt = new Intl.NumberFormat("ko-KR");

function fmtWon(v) {
  if (v >= 1e12) return `${(v / 1e12).toFixed(1)}<small>조 원</small>`;
  if (v >= 1e8) return `${fmt.format(Math.round(v / 1e8))}<small>억 원</small>`;
  if (v >= 1e4) return `${fmt.format(Math.round(v / 1e4))}<small>만 원</small>`;
  return `${fmt.format(v)}<small>원</small>`;
}
function fmtWonText(v) { return fmtWon(v).replace(/<\/?small>/g, ""); }

function statuteStatus(months) {
  if (months <= 6)  return { color: "var(--status-critical)", icon: "⏰", label: "시효 임박" };
  if (months <= 12) return { color: "var(--status-serious)",  icon: "⚠", label: "시효 주의" };
  if (months <= 24) return { color: "var(--status-warning)",  icon: "◔", label: "골든타임" };
  return { color: "var(--status-good)", icon: "✓", label: "여유" };
}

async function api(path, opts) {
  const r = await fetch(`/api${path}`, opts);
  if (!r.ok) throw new Error(`API ${path} 실패`);
  return r.json();
}

/* ── 내비게이션 ─────────────────────────── */
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    $(`#view-${btn.dataset.view}`).classList.add("active");
  });
});

/* ── KPI ────────────────────────────────── */
function renderKpis(s) {
  $("#kpi-row").innerHTML = `
    <div class="kpi">
      <div class="label">활성 코호트</div>
      <div class="value">${s.cohorts_active}<small>건</small></div>
      <div class="delta urgent">즉시 검토 권고 ${s.cohorts_urgent}건</div>
    </div>
    <div class="kpi">
      <div class="label">추정 총 청구 규모</div>
      <div class="value">${fmtWon(s.est_total_claim)}</div>
      <div class="delta">잠재 피해자 ${fmt.format(s.est_total_victims)}명</div>
    </div>
    <div class="kpi">
      <div class="label">이번 주 신규 신호</div>
      <div class="value">${s.signals_this_week}<small>건</small></div>
      <div class="delta">누적 ${s.signals_total}건 수집</div>
    </div>
    <div class="kpi">
      <div class="label">감시 중 데이터 소스</div>
      <div class="value">${s.sources_active}<small>개</small></div>
      <div class="delta">공시·처분·리콜·판결·뉴스·민원</div>
    </div>`;
}

/* ── 스파크라인 (단일 시리즈 + 크로스헤어 툴팁) ── */
function renderSparkline(trend) {
  const svg = $("#sparkline");
  const W = 1000, H = 92, PAD = 8;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const max = Math.max(1, ...trend.map((t) => t.count));
  const x = (i) => PAD + (i / (trend.length - 1)) * (W - PAD * 2);
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2.4);

  const pts = trend.map((t, i) => `${x(i)},${y(t.count)}`).join(" ");
  const area = `${PAD},${H - PAD} ${pts} ${W - PAD},${H - PAD}`;

  svg.innerHTML = `
    <line x1="${PAD}" y1="${H - PAD}" x2="${W - PAD}" y2="${H - PAD}"
          stroke="var(--baseline)" stroke-width="1"/>
    <polygon points="${area}" fill="#3987e5" opacity="0.10"/>
    <polyline points="${pts}" fill="none" stroke="#3987e5" stroke-width="2"
              stroke-linejoin="round" stroke-linecap="round"
              vector-effect="non-scaling-stroke"/>
    <line id="spark-cross" x1="0" y1="${PAD}" x2="0" y2="${H - PAD}"
          stroke="var(--grid)" stroke-width="1" style="display:none"/>
    <circle id="spark-dot" r="4" fill="#3987e5" stroke="var(--surface)"
            stroke-width="2" style="display:none"/>`;

  const tip = $("#spark-tip");
  const cross = svg.querySelector("#spark-cross");
  const dot = svg.querySelector("#spark-dot");

  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const i = Math.max(0, Math.min(trend.length - 1, Math.round(rel * (trend.length - 1))));
    const t = trend[i];
    cross.style.display = dot.style.display = "block";
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i));
    dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(t.count));
    tip.style.display = "block";
    tip.innerHTML = `<span class="tv">${t.count}건</span> <span class="td">${t.date}</span>`;
    const px = (x(i) / W) * rect.width;
    tip.style.left = `${Math.min(rect.width - 130, Math.max(0, px + 12))}px`;
    tip.style.top = "6px";
  });
  svg.addEventListener("mouseleave", () => {
    tip.style.display = cross.style.display = dot.style.display = "none";
  });
}

/* ── 코호트 리스트 ──────────────────────── */
function renderCohorts(cohorts) {
  $("#cohort-count").textContent = `${cohorts.length}건`;
  $("#cohort-list").innerHTML = cohorts.map((c) => {
    const st = statuteStatus(c.months_to_deadline);
    const cat = CAT_COLORS[c.category] || "#898781";
    return `
    <div class="cohort-card" data-id="${c.id}">
      <div>
        <div class="top">
          <span class="chip cat"><span class="dot" style="background:${cat}"></span>${c.category}</span>
          <span class="chip status" style="color:${st.color}">${st.icon} ${st.label} · ${c.months_to_deadline}개월</span>
          <span class="chip status">${c.status}</span>
        </div>
        <h3>${c.name}</h3>
        <div class="defendant">피고(예정) — ${c.defendant}</div>
        <div class="meta-row">
          <span>추정 피해자 <b>${fmt.format(c.est_victims)}명</b></span>
          <span>추정 청구액 <b>${fmtWonText(c.est_total_claim)}</b></span>
          <span>근거 신호 <b>${c.signal_count}건 · ${c.source_count}개 소스</b></span>
        </div>
      </div>
      <div class="score-block">
        <div class="score-num">${c.score}<small> / 100</small></div>
        <div class="score-meter"><div class="fill" style="width:${c.score}%"></div></div>
        <div class="score-label">수임 우선순위 점수</div>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll(".cohort-card").forEach((el) =>
    el.addEventListener("click", () => openDetail(el.dataset.id)));
}

/* ── 코호트 상세 패널 ───────────────────── */
async function openDetail(id) {
  const c = await api(`/cohorts/${id}`);
  const st = statuteStatus(c.months_to_deadline);
  const cat = CAT_COLORS[c.category] || "#898781";

  const parts = Object.entries(c.score_parts).map(([k, p]) => `
    <div class="part-row">
      <span class="pl">${k}</span>
      <div class="part-bar"><div class="fill" style="width:${(p.value / p.max) * 100}%"></div></div>
      <span class="pv">${p.value} / ${p.max}</span>
    </div>`).join("");

  const timeline = c.signals.map((s) => `
    <div class="tl-item ${s.evidence_weight >= 10 ? "w-heavy" : ""}">
      <div class="tl-date">${s.date}</div>
      <div class="tl-title">${s.title}</div>
      <div class="tl-summary">${s.summary}</div>
      <span class="tl-src">${s.source_label} · ${s.source_org}</span>
    </div>`).join("");

  $("#detail-panel").innerHTML = `
    <button class="close-btn" onclick="closeDetail()">✕</button>
    <span class="chip cat"><span class="dot" style="background:${cat}"></span>${c.category}</span>
    <h2>${c.name}</h2>
    <div class="d-defendant">피고(예정) — ${c.defendant} · 상태: ${c.status}</div>
    <div class="d-desc">${c.description}</div>

    <div class="d-section">
      <div class="d-grid">
        <div class="d-stat"><div class="l">추정 피해자</div><div class="v">${fmt.format(c.est_victims)}<small> 명</small></div></div>
        <div class="d-stat"><div class="l">추정 총 청구액</div><div class="v">${fmtWon(c.est_total_claim)}</div></div>
        <div class="d-stat"><div class="l">1인당 추정 청구액</div><div class="v">${fmtWon(c.claim_per_victim)}</div></div>
        <div class="d-stat"><div class="l">우선순위 점수</div><div class="v">${c.score}<small> / 100</small></div></div>
      </div>
    </div>

    <div class="d-section">
      <h4>점수 구성</h4>
      ${parts}
    </div>

    <div class="d-section">
      <h4>소멸시효 · 제척기간</h4>
      <div class="statute-banner">
        <span class="s-ico" style="color:${st.color}">${st.icon}</span>
        <div>
          <b style="color:${st.color}">${st.label} — 잔여 약 ${c.months_to_deadline}개월 (기준일 ${c.statute_deadline})</b>
          <span class="s-note">${c.statute_note}</span>
        </div>
      </div>
    </div>

    <div class="d-section">
      <h4>법적 근거 (엔진 제안 — 변호사 검토 필요)</h4>
      <div class="basis-tags">${c.legal_basis.map((b) => `<span class="basis-tag">${b}</span>`).join("")}</div>
      ${c.precedent_note ? `<p style="font-size:12px;color:var(--ink-2);margin-top:10px;">📎 유사 판례: ${c.precedent_note}</p>` : ""}
    </div>

    <div class="d-section">
      <h4>근거 신호 타임라인 (${c.signals.length}건)</h4>
      <div class="timeline">${timeline}</div>
    </div>

    <div class="d-section" style="display:flex;gap:10px;">
      <button class="btn primary" onclick="createCampaign('${c.id}')">수임 캠페인 초안 생성</button>
      <button class="btn ghost" onclick="closeDetail()">닫기</button>
    </div>`;

  $("#overlay").classList.add("open");
  $("#detail-panel").classList.add("open");
}

function closeDetail() {
  $("#overlay").classList.remove("open");
  $("#detail-panel").classList.remove("open");
}
$("#overlay").addEventListener("click", closeDetail);

/* ── 캠페인 생성 ────────────────────────── */
async function createCampaign(id) {
  const cmp = await api(`/cohorts/${id}/campaign`, { method: "POST" });
  $("#campaign-modal").innerHTML = `
    <div class="modal-box">
      <h3>수임 캠페인 초안 — ${cmp.cohort_name}</h3>
      <div class="m-sub">⚠ 상태: ${cmp.status} — 게시 전 대한변협 광고규정 심사가 필요합니다</div>
      <div class="draft">${cmp.draft_notice}</div>
      <p style="font-size:12px;color:var(--ink-muted);margin-bottom:14px;">
        배포 채널(안): ${cmp.channels.join(" · ")}<br>
        피해자 확인 랜딩: <code>${cmp.landing_url}</code>
      </p>
      <div class="modal-actions">
        <button class="btn ghost" onclick="document.querySelector('#campaign-modal').classList.remove('open')">닫기</button>
      </div>
    </div>`;
  $("#campaign-modal").classList.add("open");
  loadAll(); // 코호트 상태 갱신
}

/* ── 신호 피드 ──────────────────────────── */
function renderFeed(signals) {
  $("#feed-list").innerHTML = signals.map((s) => `
    <div class="feed-item">
      <span class="f-dot" style="background:${CAT_COLORS[s.category] || "#898781"}"></span>
      <div>
        <div class="f-title">${s.title}</div>
        <div class="f-summary">${s.summary}</div>
        <div class="f-meta">
          <span>${s.date}</span>
          <span>${s.source_label}</span>
          <span>${s.category} · ${s.defendant}</span>
        </div>
      </div>
    </div>`).join("");
}

/* ── 데이터 소스 ────────────────────────── */
function renderSources(sources) {
  $("#sources-body").innerHTML = sources.map((s) => `
    <tr>
      <td><b>${s.label}</b></td>
      <td>${s.org}</td>
      <td class="num">${s.poll_interval_min >= 60 ? `${Math.round(s.poll_interval_min / 60)}시간` : `${s.poll_interval_min}분`} 주기</td>
      <td><span class="mode-chip">${s.mode}</span></td>
    </tr>`).join("");
}

/* ── 초기 로드 ──────────────────────────── */
async function loadAll() {
  const [stats, cohorts, signals, sources] = await Promise.all([
    api("/stats"), api("/cohorts"), api("/signals"), api("/sources"),
  ]);
  renderKpis(stats);
  renderSparkline(stats.signal_trend);
  renderCohorts(cohorts);
  renderFeed(signals);
  renderSources(sources);
}
loadAll();
