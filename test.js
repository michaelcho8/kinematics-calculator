#!/usr/bin/env node
"use strict";

const { solve1D, solveProjectile, solve2D } = require("./js/kinematics.js");

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

// ===== 2D: zero acceleration (constant velocity) =====
const d1 = solve2D({ ux: 10, uy: 0, ax: 0, ay: 0, t: 5 });
run("2D no-accel: vx=10",       d1.vx === 10);
run("2D no-accel: vy=0",        d1.vy === 0);
run("2D no-accel: sx=50",       d1.sx === 50);
run("2D no-accel: sy=0",        d1.sy === 0);

// ===== 2D: free fall (drop) =====
const d2 = solve2D({ ux: 0, uy: 0, ax: 0, ay: -9.8, t: 2 });
run("2D free-fall: vy=-19.6",   Math.abs(d2.vy - (-19.6)) < 1e-6);
run("2D free-fall: sy=-19.6",   Math.abs(d2.sy - (-19.6)) < 1e-6);

// ===== 2D: 45° launch — should mirror projectile at the same instant =====
const d3 = solve2D({ ux: 14.142, uy: 14.142, ax: 0, ay: -9.8, t: 1 });
run("2D 45° t=1 vx≈14.142",     Math.abs(d3.vx - 14.142) < 0.01);
run("2D 45° t=1 vy≈4.342",      Math.abs(d3.vy - 4.342) < 0.01);

// ===== 2D: equivalence with solveProjectile at peak (vy = 0) =====
const v0 = 20, angle = 45, g = 9.8;
const proj = solveProjectile(v0, angle, g);
const t_peak = proj.vy / g;
const d4 = solve2D({ ux: proj.vx, uy: proj.vy, ax: 0, ay: -g, t: t_peak });
run("2D at peak: vy ≈ 0",       Math.abs(d4.vy) < 0.01);
run("2D at peak: vx unchanged", Math.abs(d4.vx - proj.vx) < 0.01);

// ===== 2D: angle + magnitude convenience outputs (3-4-5 triangle) =====
const d5 = solve2D({ ux: 3, uy: 4, ax: 0, ay: 0, t: 1 });
run("2D 3-4 init speed = 5",    d5.speed_init === 5);
run("2D 3-4 angle ≈ 53.13°",    Math.abs(d5.angle_init - 53.13) < 0.01);

// ===== 2D: time = 0 edge case (no motion yet) =====
const d6 = solve2D({ ux: 5, uy: 5, ax: 2, ay: 3, t: 0 });
run("2D t=0 vx=ux",             d6.vx === 5);
run("2D t=0 vy=uy",             d6.vy === 5);
run("2D t=0 sx=0",              d6.sx === 0);

// ===== 2D: error cases =====
const dErr1 = solve2D({ ux: 1, uy: 2, ax: 3, ay: null, t: 1 });
run("2D missing input → error", dErr1.error !== null);

const dErr2 = solve2D({ ux: 1, uy: 2, ax: 3, ay: 4, t: -1 });
run("2D negative t → error",    dErr2.error !== null);

const total = 19 + 16;
const passed = total - failures;
console.log(`\n${passed}/${total} tests passed` + (failures === 0 ? " — all good." : ` — ${failures} FAILED.`));
process.exit(failures === 0 ? 0 : 1);
