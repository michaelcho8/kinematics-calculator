# [[kinematics-calculator|Kinematics Calculator]] — Design Spec

**Date:** 2026-04-27
**Status:** Approved

---

## Overview

A single-page, pure-frontend physics calculator for students and engineers. Solves 1D kinematics (any 3 of 5 variables) and projectile motion. Same zero-backend architecture as ReadCron and the FIRE Calculator. Targets the education/STEM AdSense niche and serves as a direct resource for Michael's tutoring students.

---

## Architecture

```
kinematics-calculator/
  index.html           # markup only — no inline JS
  style.css            # all styles
  js/
    kinematics.js      # pure functions: solve1D(), solveProjectile()
    main.js            # DOM wiring — reads inputs, calls kinematics.js, updates results
  test.js              # Node test suite
  package.json         # {"type": "module"} only
```

---

## Section 1 — 1D Kinematics Solver

The big-three kinematic equations use five variables:

| Symbol | Variable | Unit |
|---|---|---|
| u | Initial velocity | m/s |
| v | Final velocity | m/s |
| a | Acceleration | m/s² |
| s | Displacement | m |
| t | Time | s |

User provides any **3** of the 5 variables. The tool solves for the remaining 2.

### Solver Logic (10 cases — all combinations of 3 knowns)

| Known | Solve for | Equations used |
|---|---|---|
| u, v, a | t, s | t=(v−u)/a; s=(v²−u²)/(2a) |
| u, v, t | a, s | a=(v−u)/t; s=(u+v)/2·t |
| u, v, s | a, t | a=(v²−u²)/(2s); t=2s/(u+v) |
| u, a, t | v, s | v=u+at; s=ut+½at² |
| u, a, s | v, t | v=√(u²+2as); t=(v−u)/a |
| u, t, s | a, v | a=2(s−ut)/t²; v=u+at |
| v, a, t | u, s | u=v−at; s=vt−½at² |
| v, a, s | u, t | u=√(v²−2as); t=(v−u)/a |
| v, t, s | a, u | a=2(vt−s)/t²; u=v−at |
| a, t, s | u, v | u=(s−½at²)/t; v=u+at |

### UI Behaviour

- 5 input boxes (u, v, a, s, t) — all editable, labelled with symbol and unit
- Status line below inputs: "Fill in any 3 values" / "Ready — solving…" / error message
- When exactly 3 inputs have values → auto-solve, display results in a highlighted output card
- Solved values shown as formatted numbers with units, not injected back into inputs
- "Clear" button resets all inputs

---

## Section 2 — Projectile Motion

Inputs:
- Initial speed v₀ (m/s)
- Launch angle θ (degrees, 0–90)
- Gravity g (dropdown: 9.8 m/s² standard / 9.81 m/s² precise / 32.2 ft/s²)

Outputs:

| Output | Formula |
|---|---|
| Horizontal component vₓ | v₀ cos θ |
| Vertical component v_y | v₀ sin θ |
| Time of flight T | 2v_y / g |
| Max height H | v_y² / (2g) |
| Range R | vₓ · T |

Real-time update on any input change.

---

## UI Layout

```
[Header: Kinematics Calculator]

[Tab: 1D Kinematics] [Tab: Projectile Motion]

--- 1D TAB ---
[Equations reference: v=u+at  s=ut+½at²  v²=u²+2as]

[u input] [v input] [a input] [s input] [t input]

[Status: "Fill in any 3 values to solve"]

[Results card — shown when 3 inputs filled]
  Solved: v = 15.0 m/s    s = 75.0 m

[Clear button]

--- PROJECTILE TAB ---
[v₀ input] [Angle input] [Gravity dropdown]

[Results table: vₓ, v_y, Time of flight, Max height, Range]

--- SHARED (bottom) ---
[AdSense unit]
[SEO explainer: kinematic equations + SUVAT reference]
```

---

## SEO

**Meta title:** "Kinematics Calculator — Solve for Velocity, Acceleration, Displacement & Time"
**Meta description:** "Free kinematics calculator. Enter any 3 SUVAT variables and instantly solve for the other 2. Also includes projectile motion calculator."
**Keywords:** kinematics calculator, SUVAT calculator, projectile motion calculator, solve for acceleration, kinematic equations solver, physics calculator

**JSON-LD:** `WebApplication` with `applicationCategory: "EducationApplication"`.

---

## Monetization

- AdSense pub ID: `ca-pub-2584209104913819` (same as ReadCron + FIRE Calculator)
- New ad slot ID needed before launch
- Education niche CPM: $6–15 RPM
- Secondary angle: Michael can share the URL directly with tutoring students — builds traffic organically

---

## Non-Goals (Phase 1)

- No vector/2D motion beyond projectile
- No unit conversion (metric only for Phase 1)
- No trajectory chart (Phase 2 — Chart.js)
- No circular motion, energy, or momentum
