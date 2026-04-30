const VARS   = ["u", "v", "a", "s", "t"];
const LABELS = { u: "Initial velocity", v: "Final velocity", a: "Acceleration", s: "Displacement", t: "Time" };
const UNITS  = { u: "m/s", v: "m/s", a: "m/s²", s: "m", t: "s" };

document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
      btn.classList.add("active");
      document.getElementById(target).classList.remove("hidden");
    });
  });

  // 1D inputs
  VARS.forEach(k => {
    document.getElementById("in-" + k).addEventListener("input", tryAutoSolve1D);
  });
  document.getElementById("clear-btn").addEventListener("click", clear1D);
  updateStatus("Fill in any 3 values to solve (0/3)", "neutral");

  // Projectile inputs
  ["v0", "angle"].forEach(id => {
    document.getElementById("proj-" + id).addEventListener("input", solveProjectileUI);
  });
  document.getElementById("proj-gravity").addEventListener("change", solveProjectileUI);
  solveProjectileUI();
});

// ===== 1D Solver =====

function getVarInputs() {
  const vals = {};
  VARS.forEach(k => {
    const raw = document.getElementById("in-" + k).value.trim();
    vals[k] = raw !== "" ? raw : null;
  });
  return vals;
}

function countFilled(vals) {
  return VARS.filter(k => vals[k] !== null && vals[k] !== "" && isFinite(parseFloat(vals[k]))).length;
}

function tryAutoSolve1D() {
  const vals   = getVarInputs();
  const filled = countFilled(vals);

  if (filled < 3) {
    updateStatus("Fill in any 3 values to solve (" + filled + "/3)", "neutral");
    document.getElementById("result-card").classList.add("hidden");
    return;
  }
  if (filled > 3) {
    updateStatus("Too many values — clear one to auto-solve.", "warn");
    document.getElementById("result-card").classList.add("hidden");
    return;
  }

  const result = solve1D(vals);

  if (result.error) {
    updateStatus(result.error, "error");
    document.getElementById("result-card").classList.add("hidden");
    return;
  }

  updateStatus("Solved.", "ok");
  renderResult1D(vals, result);
  document.getElementById("result-card").classList.remove("hidden");
}

function renderResult1D(inputs, result) {
  const wrap = document.getElementById("result-body");
  clearChildren(wrap);

  VARS.forEach(k => {
    const isInput = inputs[k] !== null && inputs[k] !== "";
    const value   = isInput ? parseFloat(inputs[k]) : result[k];
    if (value === null || (typeof value === "number" && !isFinite(value))) return;

    const row = document.createElement("div");
    row.className = "result-row" + (isInput ? "" : " result-solved");

    const lbl = document.createElement("span");
    lbl.className   = "rlabel";
    lbl.textContent = LABELS[k] + " (" + k + ")";

    const val = document.createElement("span");
    val.className   = "rvalue";
    val.textContent = fmtNum(value) + " " + UNITS[k];

    row.append(lbl, val);
    wrap.appendChild(row);
  });
}

function clear1D() {
  VARS.forEach(k => { document.getElementById("in-" + k).value = ""; });
  updateStatus("Fill in any 3 values to solve (0/3)", "neutral");
  document.getElementById("result-card").classList.add("hidden");
}

function updateStatus(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className   = "status " + type;
}

// ===== Projectile =====

function solveProjectileUI() {
  const v0    = parseFloat(document.getElementById("proj-v0").value);
  const angle = parseFloat(document.getElementById("proj-angle").value);
  const gSel  = document.getElementById("proj-gravity");
  const g     = parseFloat(gSel.value);
  const isImperial = gSel.value === "32.174";
  const unit  = isImperial ? "ft" : "m";

  const wrap = document.getElementById("proj-results");
  clearChildren(wrap);

  if (!isFinite(v0) || v0 <= 0 || !isFinite(angle) || angle < 0 || angle > 90) {
    const p = document.createElement("p");
    p.className   = "hint";
    p.textContent = "Enter a positive speed and an angle between 0° and 90°.";
    wrap.appendChild(p);
    return;
  }

  const r = solveProjectile(v0, angle, g);
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
}

// ===== Helpers =====

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function fmtNum(n) {
  if (!isFinite(n)) return "N/A";
  return parseFloat(n.toPrecision(6)).toString();
}
