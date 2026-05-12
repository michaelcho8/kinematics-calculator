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

---

# v2 — Blueprint Redesign + 2D + Graphs

**Date:** 2026-05-12
**Status:** Built (Phases 0–6 complete). Deploy via CF Pages Git-connect pending (Phase 7).
**Build log:** `build-log.md` in this repo (single source of truth for cross-session state)
**Test status:** 35/35 passing (19 v1 + 16 new 2D)
**Repo:** `github.com/michaelcho8/kinematics-calculator` (public, `main` branch)

## Goals (priority order)

1. **AdSense revenue** — passive income ASAP. Education niche $6–15 RPM, exam-period spikes (May/Nov/Jan).
2. **SEO / organic search** — "kinematics calculator", "SUVAT calculator", "2D kinematics", "projectile motion calculator".
3. **Portfolio funnel** — polished math tool with custom graphs for engineering job applications.
4. **Tutoring funnel** — CTA card on every page; conversion target for organic traffic.
5. **Pattern-setting test** — third tool to inherit the readcron `tokens.css` design system.
6. **Learning CF Pages Git-connect** — clean-slate deploy after readcron hit the wrangler/Workers auto-detection issue earlier the same day.

## Scope (locked via grill-me)

| | |
|---|---|
| What ships | Visual refresh + 2D tab + all-tab graph view + shareable URLs + tutoring CTA + new AdSense slot IDs (post-deploy) + SEO meta refresh |
| 2D solver | Simple forward: input `(u_x, u_y, a_x, a_y, t)`, output `(v_x, v_y, s_x, s_y)` + magnitudes + angles. Not the full any-3-of-9. |
| Tutoring CTA | `mailto:choind88@gmail.com?subject=Physics+tutoring+inquiry` |
| Branch | `main` (v1 never deployed; clean linear history) |
| Hero illustration | SVG paper-airplane in clouds (hand-rolled, replacing the Midjourney path from the plan — was faster + matched the brief) |
| Graph library | Hand-rolled inline SVG, no Chart.js |
| Domain | Deferred; ship to `*.pages.dev` first |
| Hosting | Cloudflare Pages (per 2026-05-09 hosting decision) |

## Architecture additions

```
kinematics-calculator/
  index.html
  style.css
  tokens.css          # NEW — port from readcron, blueprint accent
  js/
    kinematics.js     # MODIFIED — add solve2D; v1 functions untouched
    main.js           # REWRITTEN — ES module, 2D wiring, graph wiring, URL hydration
    graph.js          # NEW — inline SVG renderer (4 graph types)
    storage.js        # NEW — URL state codec (encode/decode/buildShareUrl)
  test.js             # MODIFIED — add 16 new 2D tests
  docs/
    redesign-notes.md # NEW — incremental learning doc
  CHANGELOG.md        # NEW — Keep-a-Changelog format
  build-log.md        # NEW — cross-session continuity
  .assetsignore       # NEW — defensive CF Pages config
  wrangler.jsonc      # NEW — defensive CF Pages config
```

### `solve2D` contract

```js
// Pure math, no DOM. Independent x/y kinematics sharing a single time.
// Special case of projectile: ax=0, ay=-g.
solve2D({ ux, uy, ax, ay, t }) → {
  vx, vy,                          // final velocity components
  sx, sy,                          // displacement components
  speed_init, speed_final, s_mag,  // magnitudes
  angle_init, angle_final, s_angle, // degrees (atan2-based)
  error: null | string,
}
```

### `graph.js` contract

```js
drawPositionTime(svg, { u, a, tMax }) → void  // 1D tab
drawVelocityTime(svg, { u, a, tMax }) → void  // 1D tab
draw2DPath(svg, { ux, uy, ax, ay, tMax }) → void  // 2D tab
drawProjectile(svg, { v0, angle, g }) → void  // Projectile tab
```

Each: clears the SVG, computes data points, draws axes + endpoint labels + trace. Optional dotted line style for the trajectory-style graphs (2D + projectile).

### `storage.js` contract

```js
encodeState({ tab, inputs })   → "tab=...&u=..." (no leading "?")
decodeState(searchString)      → { tab, inputs } | null
buildShareUrl({ tab, inputs }) → "https://origin/path?tab=..."
```

Three URL formats — one per tab. The `tab` param disambiguates which variable set applies.

## UI additions

- **New tab**: 2D Motion (between existing 1D and Projectile). Five inputs (`u_x, u_y, a_x, a_y, t`). Auto-solves when all 5 present.
- **Graph row per tab**: SVG containers initially hidden; revealed after each solve.
- **Share button per tab**: copies the encoded URL to clipboard.
- **Tutoring CTA card**: blueprint surface, sun-yellow "Book a session" button.
- **Pill-style tab bar**: replaces v1's underline tabs.
- **Hero**: sky gradient + cloud SVGs + dotted paper-airplane trajectory.

## Constraints

- Pure-frontend static. No build pipeline. No runtime dependencies.
- Math layer (`solve1D`, `solveProjectile`) bytes-identical to v1. Tests guard this.
- AdSense `<ins>` block HTML bytes-identical (3 slots). Slot IDs are `SLOT_ID_HERE` placeholders for now.
- SEO meta extended (2D motion keywords) without dropping any v1 keywords.
- Design tokens stay domain-neutral in the `[shared]` layer; only `[tool]` accents differ from readcron.
- All existing input element IDs (`in-u`, `in-v`, etc.) preserved so any future tooling that scrapes the page still finds them.

## Stack additions

- **Plus Jakarta Sans** via Google Fonts (4 weights, `display: swap`, preconnect)
- **CSS background-pattern grid** for blueprint surfaces (no SVG `<pattern>` needed)
- **`Intl.NumberFormat`** not used here (kinematics outputs are plain numbers); display formatting via `parseFloat(n.toPrecision(6))`

## Definition of Done — ship-day

- All 35 tests pass (19 v1 + 16 new 2D)
- All JS files pass `node --check`
- Three tabs render and switch; each tab's solve produces both numeric results and a visual graph
- Share button per tab copies an encoded URL; pasting it in a fresh tab hydrates state
- Tutoring CTA opens `mailto:choind88@gmail.com` with the correct subject
- AdSense `<ins>` block HTML bytes-identical to v1
- Lighthouse Performance ≥ 90 on the deployed `*.pages.dev` URL
- `docs/redesign-notes.md`, `CHANGELOG.md`, `build-log.md`, `README.md`, this section all current

## Definition of Done — 30-day metric

Education-niche traffic is lower volume than finance niche; metrics are directional.

- Search Console: measurable impressions for "kinematics calculator" + "SUVAT calculator" + "2D kinematics" within 30 days
- AdSense RPM measured once real slot IDs are live
- ≥1 tutoring inquiry attributable to the CTA card (any source)
- Returning users > 5 (real-human filter)
- Pattern-setting test: design system tokens ported to FIRE Calculator with `[tool]` swap only — proves the system on tool #4

## Risks guarded against

| # | Risk | Mitigation |
|---|---|---|
| 1 | CF Pages auto-detects Workers, runs wrangler, hits 25 MiB asset limit | `.assetsignore` excludes `node_modules`; `wrangler.jsonc` pins assets dir to root |
| 2 | Math layer regression (breaking `solve1D` or `solveProjectile`) | v1 functions not edited. 35 tests pass; the 19 v1 tests are unchanged. |
| 3 | URL state codec corrupts on edge cases (negative numbers, decimals, special chars) | `URLSearchParams` under the hood handles all encoding. Three URL formats keep each tab's params isolated. |
| 4 | Hero illustration time sink | Skipped the Midjourney path; shipped a hand-rolled SVG that matched the brief. Zero iteration cost. |
| 5 | AdSense slot HTML drift triggers re-review | `<ins>` blocks bytes-identical; only the wrapping `<div class="ad-slot">` changed |
| 6 | Tokens system fails to port cleanly | Tokens pass test: only `[tool]` tokens changed (accent palette + blueprint variants). All `[shared]` tokens unchanged from readcron. |

## Open items

- **AdSense slot ID creation** — Michael creates 3 new ad units in dashboard post-deploy; we swap placeholders (1 commit + auto-redeploys)
- **Domain purchase** — deferred until revenue/impressions justify
- **Wyzant URL** — tutoring CTA can be swapped from `mailto:` to a Wyzant profile URL once that profile is live (Wed conversion task on the schedule)
- **Custom hero illustration** — current SVG is fine for ship; if Michael generates a Midjourney/SDXL asset later, swap the `<svg class="hero-decor">` block in `index.html` for an `<img>` tag
- **Promote to full 2D solver (any-3-of-9)** — only if usage data shows demand
