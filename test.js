#!/usr/bin/env node
"use strict";

const { solve1D, solveProjectile } = require("./js/kinematics.js");

let failures = 0;
function run(name, cond) {
  const status = cond ? "PASS" : "FAIL";
  console.log(`  [${status}] ${name}`);
  if (!cond) failures++;
}

// ===== 1D: case atu — u, a, t → v, s =====
const r1 = solve1D({ u: 0, a: 2, t: 5, v: null, s: null });
run("u=0, a=2, t=5 → v=10",   r1.v === 10);
run("u=0, a=2, t=5 → s=25",   r1.s === 25);
run("no error",                r1.error === null);

// ===== 1D: case tuv — u, v, t → a, s =====
const r2 = solve1D({ u: 0, v: 20, t: 4, a: null, s: null });
run("u=0, v=20, t=4 → a=5",   r2.a === 5);
run("u=0, v=20, t=4 → s=40",  r2.s === 40);

// ===== 1D: case auv — u, v, a → t, s =====
const r3 = solve1D({ u: 0, v: 10, a: 5, t: null, s: null });
run("u=0, v=10, a=5 → t=2",   r3.t === 2);
run("u=0, v=10, a=5 → s=10",  r3.s === 10);

// ===== 1D: case atv — v, a, t → u, s =====
const r4 = solve1D({ v: 10, a: 2, t: 3, u: null, s: null });
run("v=10, a=2, t=3 → u=4",   r4.u === 4);
run("v=10, a=2, t=3 → s=21",  r4.s === 21);

// ===== 1D: case ast — a, s, t → u, v =====
const r5 = solve1D({ a: 2, s: 25, t: 5, u: null, v: null });
run("a=2, s=25, t=5 → u=0",   r5.u === 0);
run("a=2, s=25, t=5 → v=10",  r5.v === 10);

// ===== Error case: fewer than 3 inputs =====
const rErr = solve1D({ u: 5, v: null, a: null, s: null, t: null });
run("only 1 input → error",   rErr.error !== null);

// ===== Projectile: 45° at 20 m/s (g=9.8) =====
const p1 = solveProjectile(20, 45, 9.8);
run("45° vx ≈ vy",             Math.abs(p1.vx - p1.vy) < 0.01);
run("45° range > 0",           p1.R > 0);
run("45° max height > 0",      p1.H > 0);
run("45° time of flight > 0",  p1.T > 0);

// ===== Projectile: 0° launch =====
const p2 = solveProjectile(10, 0, 9.8);
run("0° launch → vy = 0",     p2.vy === 0);
run("0° launch → H = 0",      p2.H === 0);

// ===== Projectile: 90° (straight up) =====
const p3 = solveProjectile(10, 90, 9.8);
run("90° launch → vx = 0",    p3.vx === 0);
run("90° launch → H > 0",     p3.H > 0);

const total = 19;
const passed = total - failures;
console.log(`\n${passed}/${total} tests passed` + (failures === 0 ? " — all good." : ` — ${failures} FAILED.`));
process.exit(failures === 0 ? 0 : 1);
