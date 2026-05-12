// Browser entry. Wires DOM events to the math layer (kinematics.js,
// exposed on window) and the SVG graph renderer (graph.js, ES module).

import { drawPositionTime, drawVelocityTime, draw2DPath, drawProjectile } from './graph.js';
import { encodeState, decodeState, buildShareUrl } from './storage.js';

const VARS_1D    = ["u", "v", "a", "s", "t"];
const LABELS_1D  = { u: "Initial velocity", v: "Final velocity", a: "Acceleration", s: "Displacement", t: "Time" };
const UNITS_1D   = { u: "m/s", v: "m/s", a: "m/s²", s: "m", t: "s" };

const VARS_2D    = ["ux", "uy", "ax", "ay", "t2"];
const LABELS_2D  = { ux: "Initial vₓ", uy: "Initial vᵧ", ax: "aₓ", ay: "aᵧ", t2: "Time" };
const UNITS_2D   = { ux: "m/s", uy: "m/s", ax: "m/s²", ay: "m/s²", t2: "s" };

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  init1D();
  init2D();
  initProjectile();
  initShareButtons();
  hydrateFromUrl();
});

// ═══════════════ Tabs ═══════════════════════════════════════════════

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(target).classList.remove("hidden");
    });
  });
}

// ═══════════════ 1D Kinematics ═══════════════════════════════════════

function init1D() {
  VARS_1D.forEach(k => {
    document.getElementById("in-" + k).addEventListener("input", tryAutoSolve1D);
  });
  document.getElementById("clear-btn").addEventListener("click", clear1D);
  updateStatus1D("Fill in any 3 values to solve (0/3)", "neutral");
}

function getInputs1D() {
  const vals = {};
  VARS_1D.forEach(k => {
    const raw = document.getElementById("in-" + k).value.trim();
    vals[k] = raw !== "" ? raw : null;
  });
  return vals;
}

function countFilled1D(vals) {
  return VARS_1D.filter(k => vals[k] !== null && vals[k] !== "" && isFinite(parseFloat(vals[k]))).length;
}

function tryAutoSolve1D() {
  const vals = getInputs1D();
  const filled = countFilled1D(vals);

  const card = document.getElementById("result-card");
  const graphWrap = document.getElementById("graph-1d-wrap");

  if (filled < 3) {
    updateStatus1D(`Fill in any 3 values to solve (${filled}/3)`, "neutral");
    card.classList.add("hidden");
    graphWrap.classList.add("hidden");
    return;
  }
  if (filled > 3) {
    updateStatus1D("Too many values — clear one to auto-solve.", "warn");
    card.classList.add("hidden");
    graphWrap.classList.add("hidden");
    return;
  }

  const result = window.solve1D(vals);
  if (result.error) {
    updateStatus1D(result.error, "error");
    card.classList.add("hidden");
    graphWrap.classList.add("hidden");
    return;
  }

  updateStatus1D("Solved.", "ok");
  renderResult1D(vals, result);
  card.classList.remove("hidden");
  renderGraphs1D(result);
  graphWrap.classList.remove("hidden");
}

function renderResult1D(inputs, result) {
  const wrap = document.getElementById("result-body");
  clearChildren(wrap);
  VARS_1D.forEach(k => {
    const isInput = inputs[k] !== null && inputs[k] !== "";
    const value = isInput ? parseFloat(inputs[k]) : result[k];
    if (value === null || (typeof value === "number" && !isFinite(value))) return;
    wrap.appendChild(resultRow(LABELS_1D[k] + " (" + k + ")", fmtNum(value) + " " + UNITS_1D[k], !isInput));
  });
}

function renderGraphs1D(result) {
  // result includes both inputs and solved fields; pull u, a, t
  const u = typeof result.u === "number" ? result.u : parseFloat(result.u);
  const a = typeof result.a === "number" ? result.a : parseFloat(result.a);
  const t = typeof result.t === "number" ? result.t : parseFloat(result.t);

  if (![u, a, t].every(Number.isFinite) || t <= 0) {
    document.getElementById("graph-1d-wrap").classList.add("hidden");
    return;
  }
  drawPositionTime(document.getElementById("graph-1d-pos"), { u, a, tMax: t });
  drawVelocityTime(document.getElementById("graph-1d-vel"), { u, a, tMax: t });
}

function clear1D() {
  VARS_1D.forEach(k => { document.getElementById("in-" + k).value = ""; });
  updateStatus1D("Fill in any 3 values to solve (0/3)", "neutral");
  document.getElementById("result-card").classList.add("hidden");
  document.getElementById("graph-1d-wrap").classList.add("hidden");
}

function updateStatus1D(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status " + type;
}

// ═══════════════ 2D Motion ═══════════════════════════════════════════

function init2D() {
  VARS_2D.forEach(k => {
    document.getElementById("in-" + k).addEventListener("input", tryAutoSolve2D);
  });
  document.getElementById("clear-2d-btn").addEventListener("click", clear2D);
  updateStatus2D("Fill in all 5 values to solve (0/5)", "neutral");
}

function getInputs2D() {
  const vals = {};
  VARS_2D.forEach(k => {
    const raw = document.getElementById("in-" + k).value.trim();
    vals[k] = raw !== "" ? raw : null;
  });
  return vals;
}

function countFilled2D(vals) {
  return VARS_2D.filter(k => vals[k] !== null && isFinite(parseFloat(vals[k]))).length;
}

function tryAutoSolve2D() {
  const vals = getInputs2D();
  const filled = countFilled2D(vals);

  const card = document.getElementById("result-2d-card");
  const graphWrap = document.getElementById("graph-2d-wrap");

  if (filled < 5) {
    updateStatus2D(`Fill in all 5 values to solve (${filled}/5)`, "neutral");
    card.classList.add("hidden");
    graphWrap.classList.add("hidden");
    return;
  }

  const result = window.solve2D({
    ux: vals.ux, uy: vals.uy, ax: vals.ax, ay: vals.ay, t: vals.t2,
  });
  if (result.error) {
    updateStatus2D(result.error, "error");
    card.classList.add("hidden");
    graphWrap.classList.add("hidden");
    return;
  }

  updateStatus2D("Solved.", "ok");
  renderResult2D(result);
  card.classList.remove("hidden");
  renderGraph2D(vals);
  graphWrap.classList.remove("hidden");
}

function renderResult2D(result) {
  const wrap = document.getElementById("result-2d-body");
  clearChildren(wrap);

  const rows = [
    ["Final velocity x (vₓ)",      `${fmtNum(result.vx)} m/s`,    true],
    ["Final velocity y (vᵧ)",      `${fmtNum(result.vy)} m/s`,    true],
    ["Displacement x (sₓ)",        `${fmtNum(result.sx)} m`,      true],
    ["Displacement y (sᵧ)",        `${fmtNum(result.sy)} m`,      true],
    ["Initial speed |u|",          `${fmtNum(result.speed_init)} m/s`,  false],
    ["Final speed |v|",            `${fmtNum(result.speed_final)} m/s`, false],
    ["Initial angle",              `${fmtNum(result.angle_init)}°`,     false],
    ["Final angle",                `${fmtNum(result.angle_final)}°`,    false],
    ["Displacement magnitude |s|", `${fmtNum(result.s_mag)} m`,         false],
    ["Displacement angle",         `${fmtNum(result.s_angle)}°`,        false],
  ];

  rows.forEach(([label, value, solved]) => {
    wrap.appendChild(resultRow(label, value, solved));
  });
}

function renderGraph2D(vals) {
  const ux = parseFloat(vals.ux);
  const uy = parseFloat(vals.uy);
  const ax = parseFloat(vals.ax);
  const ay = parseFloat(vals.ay);
  const tMax = parseFloat(vals.t2);
  if (![ux, uy, ax, ay, tMax].every(Number.isFinite) || tMax <= 0) {
    document.getElementById("graph-2d-wrap").classList.add("hidden");
    return;
  }
  draw2DPath(document.getElementById("graph-2d-path"), { ux, uy, ax, ay, tMax });
}

function clear2D() {
  VARS_2D.forEach(k => { document.getElementById("in-" + k).value = ""; });
  updateStatus2D("Fill in all 5 values to solve (0/5)", "neutral");
  document.getElementById("result-2d-card").classList.add("hidden");
  document.getElementById("graph-2d-wrap").classList.add("hidden");
}

function updateStatus2D(msg, type) {
  const el = document.getElementById("status-2d");
  el.textContent = msg;
  el.className = "status " + type;
}

// ═══════════════ Projectile ══════════════════════════════════════════

function initProjectile() {
  ["v0", "angle"].forEach(id => {
    document.getElementById("proj-" + id).addEventListener("input", solveProjectileUI);
  });
  document.getElementById("proj-gravity").addEventListener("change", solveProjectileUI);
  solveProjectileUI();
}

function solveProjectileUI() {
  const v0 = parseFloat(document.getElementById("proj-v0").value);
  const angle = parseFloat(document.getElementById("proj-angle").value);
  const gSel = document.getElementById("proj-gravity");
  const g = parseFloat(gSel.value);
  const isImperial = gSel.value === "32.174";
  const unit = isImperial ? "ft" : "m";

  const wrap = document.getElementById("proj-results");
  const graphWrap = document.getElementById("graph-proj-wrap");
  clearChildren(wrap);

  if (!isFinite(v0) || v0 <= 0 || !isFinite(angle) || angle < 0 || angle > 90) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "Enter a positive speed and an angle between 0° and 90°.";
    wrap.appendChild(p);
    graphWrap.classList.add("hidden");
    return;
  }

  const r = window.solveProjectile(v0, angle, g);
  const speedUnit = unit + "/s";

  const rows = [
    ["Horizontal velocity vₓ", r.vx + " " + speedUnit],
    ["Vertical velocity vᵧ",   r.vy + " " + speedUnit],
    ["Time of flight T",        r.T  + " s"],
    ["Maximum height H",        r.H  + " " + unit],
    ["Horizontal range R",      r.R  + " " + unit],
  ];

  const table = document.createElement("table");
  table.className = "proj-table";
  rows.forEach(([label, value]) => {
    const tr  = document.createElement("tr");
    const td1 = document.createElement("td"); td1.textContent = label;
    const td2 = document.createElement("td"); td2.className = "proj-val"; td2.textContent = value;
    tr.append(td1, td2);
    table.appendChild(tr);
  });
  wrap.appendChild(table);

  drawProjectile(document.getElementById("graph-projectile"), { v0, angle, g });
  graphWrap.classList.remove("hidden");
}

// ═══════════════ Share buttons ═══════════════════════════════════════

function initShareButtons() {
  const share = (btn, getState) => btn && btn.addEventListener("click", () => {
    const url = buildShareUrl(getState());
    navigator.clipboard.writeText(url).then(() => flashButton(btn, "URL copied!"));
  });

  share(document.getElementById("share-1d-btn"), () => ({
    tab: "1d",
    inputs: pickValues(VARS_1D, "in-"),
  }));

  share(document.getElementById("share-2d-btn"), () => {
    // 2D inputs use in-t2 but URL uses canonical name `t`
    const raw = pickValues(VARS_2D, "in-");
    return {
      tab: "2d",
      inputs: { ux: raw.ux, uy: raw.uy, ax: raw.ax, ay: raw.ay, t: raw.t2 },
    };
  });

  share(document.getElementById("share-proj-btn"), () => ({
    tab: "proj",
    inputs: {
      v0:    document.getElementById("proj-v0").value.trim(),
      theta: document.getElementById("proj-angle").value.trim(),
      g:     document.getElementById("proj-gravity").value,
    },
  }));
}

function pickValues(keys, prefix) {
  const out = {};
  for (const k of keys) {
    const raw = document.getElementById(prefix + k).value.trim();
    if (raw !== "") out[k] = raw;
  }
  return out;
}

function flashButton(btn, message, durationMs = 1500) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, durationMs);
}

// ═══════════════ URL hydration ═══════════════════════════════════════

function hydrateFromUrl() {
  const state = decodeState(window.location.search);
  if (!state) return;

  // Switch to the requested tab
  const tabId = tabIdFor(state.tab);
  if (!tabId) return;
  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.click();

  // Fill inputs
  if (state.tab === "1d") {
    for (const k of VARS_1D) {
      const v = state.inputs[k];
      if (v !== undefined) document.getElementById("in-" + k).value = v;
    }
    tryAutoSolve1D();
  } else if (state.tab === "2d") {
    // URL uses canonical `t`, internal id is `in-t2`
    const map = { ux: "in-ux", uy: "in-uy", ax: "in-ax", ay: "in-ay", t: "in-t2" };
    for (const [urlKey, elId] of Object.entries(map)) {
      const v = state.inputs[urlKey];
      if (v !== undefined) document.getElementById(elId).value = v;
    }
    tryAutoSolve2D();
  } else if (state.tab === "proj") {
    if (state.inputs.v0    !== undefined) document.getElementById("proj-v0").value = state.inputs.v0;
    if (state.inputs.theta !== undefined) document.getElementById("proj-angle").value = state.inputs.theta;
    if (state.inputs.g     !== undefined) document.getElementById("proj-gravity").value = state.inputs.g;
    solveProjectileUI();
  }
}

function tabIdFor(tab) {
  return { "1d": "tab-1d", "2d": "tab-2d", "proj": "tab-projectile" }[tab] || null;
}

// ═══════════════ Helpers ═════════════════════════════════════════════

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function fmtNum(n) {
  if (!isFinite(n)) return "N/A";
  return parseFloat(n.toPrecision(6)).toString();
}

function resultRow(label, value, solved) {
  const row = document.createElement("div");
  row.className = "result-row" + (solved ? " result-solved" : "");
  const lbl = document.createElement("span");
  lbl.className = "rlabel";
  lbl.textContent = label;
  const val = document.createElement("span");
  val.className = "rvalue";
  val.textContent = value;
  row.append(lbl, val);
  return row;
}
