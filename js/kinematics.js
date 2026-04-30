// Pure math — no DOM, testable with Node.js

function solve1D(inputs) {
  const vals = {};
  for (const k of ["u", "v", "a", "s", "t"]) {
    const raw = inputs[k];
    vals[k] = (raw !== null && raw !== undefined && raw !== "") ? parseFloat(raw) : null;
  }

  // Identify which variables are provided (non-null, finite)
  const provided = Object.entries(vals)
    .filter(([, v]) => v !== null && isFinite(v))
    .map(([k]) => k);

  if (provided.length !== 3) {
    return { ...vals, error: `Provide exactly 3 values to solve (got ${provided.length}).` };
  }

  const key = [...provided].sort().join("");
  const result = { ...vals, error: null };
  const r = n => Math.round(n * 1e6) / 1e6;  // 6 decimal places

  const { u, v, a, s, t } = vals;

  switch (key) {
    case "auv": { // u, v, a → t, s
      if (a === 0) { result.error = "Acceleration is 0 but u ≠ v — inconsistent."; break; }
      result.t = r((v - u) / a);
      result.s = r((v * v - u * u) / (2 * a));
      break;
    }
    case "tuv": { // u, v, t → a, s
      result.a = r((v - u) / t);
      result.s = r((u + v) / 2 * t);
      break;
    }
    case "suv": { // u, v, s → a, t
      result.a = r((v * v - u * u) / (2 * s));
      const denom = u + v;
      if (Math.abs(denom) < 1e-10) { result.error = "u + v = 0: time is undefined."; break; }
      result.t = r(2 * s / denom);
      break;
    }
    case "atu": { // u, a, t → v, s
      result.v = r(u + a * t);
      result.s = r(u * t + 0.5 * a * t * t);
      break;
    }
    case "asu": { // u, a, s → v, t
      const disc = u * u + 2 * a * s;
      if (disc < 0) { result.error = "No real solution: u² + 2as < 0."; break; }
      result.v = r(Math.sqrt(disc));
      result.t = a !== 0 ? r((result.v - u) / a) : null;
      break;
    }
    case "stu": { // u, s, t → a, v
      result.a = r(2 * (s - u * t) / (t * t));
      result.v = r(u + result.a * t);
      break;
    }
    case "atv": { // v, a, t → u, s
      result.u = r(v - a * t);
      result.s = r(v * t - 0.5 * a * t * t);
      break;
    }
    case "asv": { // v, a, s → u, t
      const disc = v * v - 2 * a * s;
      if (disc < 0) { result.error = "No real solution: v² − 2as < 0."; break; }
      result.u = r(Math.sqrt(disc));
      result.t = a !== 0 ? r((v - result.u) / a) : null;
      break;
    }
    case "stv": { // v, s, t → a, u
      result.a = r(2 * (v * t - s) / (t * t));
      result.u = r(v - result.a * t);
      break;
    }
    case "ast": { // a, s, t → u, v
      result.u = r((s - 0.5 * a * t * t) / t);
      result.v = r(result.u + a * t);
      break;
    }
    default:
      result.error = "Unrecognized variable combination.";
  }

  return result;
}

function solveProjectile(v0, angleDeg, g) {
  const theta = angleDeg * Math.PI / 180;
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  const T  = g > 0 ? 2 * vy / g : 0;
  const H  = g > 0 ? (vy * vy) / (2 * g) : 0;
  const R  = vx * T;
  const r3 = n => Math.round(n * 1000) / 1000;
  return { vx: r3(vx), vy: r3(vy), T: r3(T), H: r3(H), R: r3(R) };
}

if (typeof module !== "undefined") {
  module.exports = { solve1D, solveProjectile };
}
