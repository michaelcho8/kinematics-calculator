# Changelog

All notable changes to the Kinematics Calculator. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — v2 Blueprint Redesign + 2D + Graphs

Built 2026-05-12 across six phases. Visual identity pivot, new 2D motion tab, graph view across all three tabs, shareable URLs, tutoring CTA card, SEO refresh. Deploy via Cloudflare Pages Git-connect (replacing the v1 plan to deploy on Netlify).

### Visual (Phase 1, 3)

- New hero: soft sky-gradient background with cloud SVGs and a dotted paper-airplane trajectory (matches "relaxing, casual blueprint" brief)
- Accent-word headline: "Kinematics, made *simple*" with blueprint-blue accent
- Three-tab pill bar (1D / 2D / Projectile) replacing v1's underline tabs
- New `tokens.css` design tokens layer ported from readcron v2 with `[shared]` vs `[tool]` portability markers
- `[tool]` accent palette: blueprint-blue family (`#0F4C81` / pale sky tint / deep blueprint)
- `[tool]` blueprint paper surface variant for graph panels and CTA card (white grid pattern on mid-blueprint)
- Sky palette for graph trace accents and the hero gradient
- Plus Jakarta Sans typography via Google Fonts (4 weights), `font-display: swap` + preconnect
- Mobile responsive: 880px breakpoint (3-col grid, single-col graphs); 560px (2-col, stacked CTA); 380px (single-col)
- `prefers-reduced-motion` guard

### Features

#### 2D Motion tab (Phase 2)

- New `solve2D({ ux, uy, ax, ay, t })` function in `js/kinematics.js`
- Simple forward solver: provide all 5 inputs, get final velocity components, displacement components, and convenience magnitudes + angles in degrees
- Independent x/y axes share a single time `t` (projectile is a special case with `ax=0, ay=-g`)
- 16 new test cases covering zero acceleration, free fall, 45° launch, equivalence with `solveProjectile` at peak, 3-4-5 triangle for magnitudes, t=0 edge case, error cases

#### Graph view across all tabs (Phase 4)

- `js/graph.js` — inline SVG graph renderer, no Chart.js dependency
- Four graph types:
  - `drawPositionTime` — parabolic s(t) curve on 1D tab
  - `drawVelocityTime` — linear v(t) line on 1D tab
  - `draw2DPath` — parametric (x(t), y(t)) trajectory on 2D tab
  - `drawProjectile` — parabolic flight path with peak marker on Projectile tab
- Helpers: data-to-SVG coordinate mapper, axis drawer with end-value labels, trace + point rendering, range padding
- Graph panels use the blueprint surface with white grid pattern; traces are sun-yellow for high contrast

#### Shareable URLs (Phase 5)

- `js/storage.js` — URL state codec (no localStorage)
- Three URL formats:
  - `?tab=1d&u=…&v=…&a=…&s=…&t=…`
  - `?tab=2d&ux=…&uy=…&ax=…&ay=…&t=…`
  - `?tab=proj&v0=…&theta=…&g=…`
- Share button on each tab copies the encoded URL to clipboard
- Page-load hydration: if a valid `tab` URL param is present, switch to that tab, fill inputs, and trigger auto-solve

#### Tutoring CTA (Phase 3)

- New blueprint-surface card on the page below the tool: "Stuck on a physics problem? I tutor STEM 1-on-1 — first session is free." Sun-yellow "Book a session" button linking to `mailto:choind88@gmail.com` (Cho Industries business email)

### Testing (Phase 2)

- 35/35 tests passing (19 v1 + 16 new 2D)
- All JS files (`kinematics.js`, `main.js`, `graph.js`, `storage.js`) pass `node --check` syntax validation

### Documentation (Phase 6)

- `build-log.md` (new) — cross-session continuity tracker
- `CHANGELOG.md` (this file) — Keep-a-Changelog format
- `docs/redesign-notes.md` (new) — incremental rationale doc, one section per phase
- `README.md` updated — Status now reflects v2 build; deploy instructions replaced Netlify path with CF Pages Git-connect
- `spec.md` extended with v2 section

### Deploy infrastructure (Phase 0)

- `.assetsignore` — defensive: excludes `node_modules`, `.wrangler`, `.git` from CF Pages asset upload in case wrangler auto-detection triggers
- `wrangler.jsonc` — defensive: pins project name + assets directory so CF Pages doesn't auto-generate a config mid-build

### Preserved from v1

- AdSense pub ID `ca-pub-2584209104913819` and all 3 `<ins>` block HTML kept bytes-identical (only the wrapping section/container element changed)
- SEO meta + Open Graph + JSON-LD structured data updated to include 2D motion keywords; `EducationApplication` schema type preserved
- v1 math layer (`solve1D`, `solveProjectile`) and 19 v1 tests untouched
- v1 input IDs in HTML (`in-u`, `in-v`, `in-a`, `in-s`, `in-t`, `proj-v0`, `proj-angle`, `proj-gravity`) preserved for backward compatibility with the v1 JS wiring path

---

## [v1] — 2026-04-30

Initial build. Two-tab calculator (1D Kinematics SUVAT solver + Projectile Motion). 19/19 tests passing. Never deployed.

### Features
- Real-time auto-solve when 3 of 5 SUVAT variables are filled
- 10 SUVAT solver cases (every combination of 3 known variables)
- Projectile motion: initial speed, launch angle, gravity selection (metric or imperial) → horizontal/vertical velocity, time of flight, max height, range
- Equations reference bar
- AdSense pub ID wired, slot IDs as placeholders

### Stack
- Pure-frontend static site
- No build step, no dependencies at runtime
- Node-based test runner (`test.js`)
- `style.css` shared design language with the FIRE Calculator
