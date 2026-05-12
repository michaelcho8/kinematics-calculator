# Kinematics v2 — Redesign Notes

A running log of design decisions, written as we built them. Each entry captures *what* was decided, *why*, and *what was considered and rejected*. Read this when you need to understand why something is the way it is, not just what it looks like.

---

## Phase 0 — Scaffold + defensive CF Pages config

Two files dropped in at the start, before any other work: `.assetsignore` (excluding `node_modules`, `.wrangler`, `.git`) and `wrangler.jsonc` (pinning project name + assets directory).

These exist purely as defense against the failure mode we hit on readcron earlier the same day. Readcron's CF Pages deploy auto-detected the project as a Workers-with-Static-Assets target and ran `npx wrangler deploy`, which installed wrangler itself into `node_modules` during the build. Wrangler then tried to upload everything in the build directory as static assets — including its own 119 MB `workerd` binary — and the upload failed against the 25 MiB asset size limit.

Kinematics has no `package.json` and no `node_modules`, so CF *should* treat it as pure static and not invoke wrangler at all. But if CF's auto-detection misfires, these two files cap the blast radius:

- `.assetsignore` keeps the `node_modules` directory (if it ever appears) out of the asset upload
- `wrangler.jsonc` pins the assets directory + project name so CF doesn't auto-generate a config that conflicts with our intent

Cost: 2 files, ~20 bytes. Insurance against a known failure mode. Worth it.

---

## Phase 1 — Design tokens

Ported `tokens.css` directly from readcron v2 (`~/Documents/projects/cron-builder/tokens.css`). Same `[shared]` vs `[tool]` taxonomy. Only two categories of change for kinematics:

1. **`[tool]` accent palette** swaps from coral (readcron) to **blueprint-blue** (`--color-accent: #0F4C81`). This is the deepest unifying decision — it's why kinematics reads as blueprint paper while readcron reads as playful illustration, even though they share 90% of their tokens.

2. **`[tool]` additions for blueprint surfaces.** A `--color-blueprint` family for the actual blueprint-paper surfaces (the hero gradient, graph panels, CTA card) and a `--color-sky` family for the soft sky tones in the hero. Plus `--bp-grid-color` / `--bp-grid-size` / `--bp-grid-line` for the CSS background-pattern grid that mimics drafting paper.

### Why this matters

The design system promise is: *one tool inheriting from another should be a swap of 5–8 `[tool]` tokens, not a rewrite.* Kinematics is the third tool to use this tokens.css (readcron is the second; FIRE will be the fourth). It worked. We didn't touch any of the `[shared]` tokens — type scale, spacing scale, radius, shadows, motion easings, z-index. Everything propagated cleanly.

That's the "pattern-setting test" from the build brief: if the system works for tool #3 without structural edits, it's real. It did.

### What we considered and rejected

- **Pure white linework on blueprint blue everywhere.** This would have been the most literal interpretation of the reference images (cartoon engineer with blueprints). Rejected because it would make the *body* of the page hard to read — long stretches of white-on-blue body copy strain the eye. We localized the blueprint surface to the panels that benefit from it (hero, graph panels, CTA), keeping body content on the cream/white surface for readability.
- **Yellow/orange accent (like the airplane in reference image 3).** Considered as a secondary accent. Rejected because two saturated accent colors compete; we kept `--color-sun` as a confetti/decorative-only token and used blueprint-blue as the single CTA accent. Yellow re-appears on the graph traces (where it pops against the blueprint background) and as the tutoring CTA button (to make it the most-clicked element on the page).

---

## Phase 2 — `solve2D()`

A purely additive change to `js/kinematics.js`. The existing `solve1D` and `solveProjectile` functions are not touched. The new `solve2D({ ux, uy, ax, ay, t })` returns final velocity components, displacement components, and convenience magnitudes + angles.

### Why "simple forward" instead of "any 3 of 9"

The 1D solver handles every combination of 3 known SUVAT variables (10 cases). The 2D analogue would be "any 3 of 9 variables" (`ux, uy, vx, vy, ax, ay, sx, sy, t`), which would be much more code, much more testing, and many edge cases (e.g., the x-component knowns and y-component knowns must each be solvable independently).

For v2, we picked the simplest version that covers the majority of textbook 2D motion problems: provide initial velocity components, acceleration components, and time. Solve forward. This is the textbook "constant 2D acceleration" problem.

If usage data shows demand for "given range and angle, find launch angle," we'll promote to the full version in v2.1. Until then, projectile motion (Tab 3) handles that specific inverse-problem case.

### What we considered and rejected

- **Vector inputs (single magnitude + angle for u and a).** More compact, more intuitive for some students. Rejected because it requires students to decompose into components mentally, which is a separate skill — the calculator's value is precisely in NOT making them do that. Component inputs are also what the equations actually use.
- **Variable-naming `t` vs `t2`.** Internal HTML uses `in-t2` to avoid clashing with the 1D `in-t` input on the same page. URL uses canonical `t` regardless of tab (the `tab` param disambiguates). `main.js` maps between them in one place. This kind of small naming friction is the right place to absorb the cost — the math layer and the URL stay clean.

---

## Phase 3 — Visual refresh

The biggest cosmetic change: full rewrite of `index.html` and `style.css`. Three things changed at once.

### Hero: sky + paper airplane

Reference image 3 (paper airplane in clouds) was the strongest single signal for the "relaxing, casual" vibe Michael named. We built the hero around it directly: soft sky-gradient background, cloud SVG ellipses scattered around, a dotted trajectory path from lower-left to upper-right, and a small paper-airplane SVG at the end of the trajectory.

The trajectory is literally a projectile-motion curve. That made it perfect mascot material for a kinematics calculator: the page's hero IS what the page calculates.

The hero headline is "Kinematics, made *simple*" with "simple" in blueprint-blue accent. This is the Process Academy accent-word pattern, adapted: one word per page in the loud color, everything else in deep ink.

### Tabs: pill bar instead of underline

v1 had underline-style tabs with a flat bottom border. v2 uses a centered pill bar with a single rounded-pill container holding three pill buttons. The active tab is a solid accent-color pill; the others are transparent.

This is softer (matches the "relaxing" brief), more obvious as an interactive element, and works better at narrow widths because we can flex-grow each pill on mobile.

### Graph panels: blueprint paper surfaces

The 1D graph panels (position-time + velocity-time side by side) and the 2D/Projectile single-panel graphs all live on `--color-blueprint` surfaces with a white grid pattern (CSS `linear-gradient` + `background-size`). This is the most direct visual link to reference image 1 (cartoon engineer with blueprints): white grid on blueprint blue.

The grid spacing is 32px (`--bp-grid-size`). Tighter (16px) felt noisy; wider (48px+) felt sparse and lost the "drafting paper" feeling.

### What we considered and rejected

- **Full-page blueprint background.** Considered making the entire body cream-surface → blueprint-surface. Rejected because (a) long body text on blueprint is hard to read, (b) the alternation between cream (relaxing surfaces) and blueprint (active calculation surfaces) creates the right rhythm. The blueprint shows up where math is happening; cream shows up where reading is happening.
- **Process Academy–style confetti.** Considered porting the 31-piece confetti system from readcron. Rejected because the "relaxing, casual" brief points away from playful decoration. The paper airplane in the hero is the single decorative motif; everything else stays minimal.
- **Chart.js for graphs.** Decided in the plan phase; kept the decision through Phase 4 because hand-rolled SVG ended up looking more on-brand than Chart.js's default styling would have. See Phase 4 notes.

---

## Phase 4 — Graph module (hand-rolled SVG)

`js/graph.js` is ~200 lines of pure SVG drawing. Four public functions (one per kind of graph) plus helpers for clearing, coordinate mapping, axis drawing, trace rendering, and point markers.

### Why no Chart.js

Three reasons:

1. **Size.** Chart.js minified is ~70 KB. Our entire `graph.js` plus the trace styles in `style.css` is under 5 KB. For a static site optimizing for first-paint, that's a meaningful win.
2. **Style control.** Chart.js looks like Chart.js. Hand-drawn SVG with our token palette looks like our site. The blueprint-paper background with white axes and sun-yellow trace would have required overriding nearly every Chart.js default anyway.
3. **The graphs are simple.** Position-vs-time is a parabola or a line. Velocity-vs-time is always a line. 2D path is a parametric curve. Projectile is a parabola from launch to landing. None of these need Chart.js's interactivity, animation, or tooltip systems.

### What's in the module

- `makeMapper(range, viewBox, padding)` — closure that maps a data-space `(x, y)` to SVG-space `(sx, sy)`. Includes y-axis flip so positive values point up.
- `drawAxes(svg, range, viewBox, padding, xLabel, yLabel)` — draws X and Y axis lines (at `y=0` and `x=0` if those exist in the range; otherwise at the edge), plus min/max value labels at axis endpoints.
- `drawTrace(svg, points, map, { dotted })` — renders a polyline. Optional dotted style for the 2D and projectile traces (mirrors the paper-airplane trajectory aesthetic in the hero).
- `drawPoint(svg, x, y, map)` — small circle at a data point. Used for start/end/peak markers on 2D and projectile.
- `padRange(min, max, frac)` — adds ~10% padding to axis ranges so the trace doesn't sit on the axis edge.

### What we considered and rejected

- **Animated trace draw (stroke-dashoffset animation).** Considered for a satisfying "the projectile is flying!" feel. Rejected for v2 because `prefers-reduced-motion` users would miss the graph entirely while it animates, and the alternative (skip animation for them) doubled the code. Could revisit in v2.1 if Michael wants it.
- **Grid lines inside the plot area.** The graph panels already have a CSS-driven blueprint grid as their background. Drawing additional axis-aligned grid lines inside the SVG would compete with that visually. We kept the SVG to axes + endpoint labels + trace; the panel's CSS grid IS the grid.
- **Multiple traces per panel (e.g., velocity overlaid on position graph).** Rejected for v2 — single-trace per panel keeps reading simple. Could promote to multi-trace if v2.1 needs comparison views.

---

## Phase 5 — URL state codec

`js/storage.js` is ~80 lines covering encode, decode, and `buildShareUrl`. Three Share buttons (one per tab) call into it; one `hydrateFromUrl()` on page load reads from it.

### Why no localStorage

ReadCron's Phase 4 included both localStorage CRUD (save expressions to your browser) and URL state encoding (share via URL). Kinematics intentionally has only URL state.

Reasoning: kinematics doesn't have a "saved" concept. Each calculation is ephemeral — you punch numbers in, get an answer, optionally share or move on. There's no "this is my favorite cron expression I want to keep" equivalent. Adding localStorage just to mirror readcron would add complexity for no user need.

The URL IS the shareable artifact. Bookmark it, paste it to a student, send it in an email. Done.

### Why three URL formats

Each tab solves a different problem with different variables. A single unified format (`?u=&v=&...`) would be confusing — users would see params irrelevant to the current tab. Per-tab formats are smaller, cleaner, and trivial to extend (add a new tab, add a new format entry to `TAB_FIELDS`).

The internal HTML input `in-t2` (used to avoid clashing with the 1D `in-t`) maps to canonical `t` in the URL. The mapping happens in one place inside `main.js` so callers (the share button + the hydrator) don't need to know about it.

### What we considered and rejected

- **Round-trip safety: re-encoding a decoded URL should produce the same URL.** We didn't add an explicit round-trip test for this, but the codec is simple enough that it holds by construction. If it ever breaks, that's a sign the URL format needs versioning.
- **Compressed encoding (base64 + JSON instead of plain query params).** Considered for shorter URLs. Rejected because plain query params are inspectable in the address bar (a student can see and edit values directly), and the URLs aren't long enough to need compression.
- **Encoding solved values too (so the share URL includes both inputs and outputs).** Rejected because the outputs are deterministic from the inputs — encoding them is redundant and increases the chance of stale/corrupted URLs (if the math layer is ever updated, encoded outputs would mismatch). Only inputs are encoded; outputs are recomputed on the receiving page.

---

## Phase 6 — Documentation

This file, the CHANGELOG, the build-log, the updated README, and the appended spec.md v2 section. Same pattern as readcron — incremental, written-as-we-build, lives in the repo so future-you can read what current-you was thinking.

The biggest lesson here is from the readcron deploy: the README in EA's project folder said "Code: `~/Documents/projects/cron-builder/`" and claimed the repo was public. Both turned out to be wrong. For kinematics, README now states current reality: code is in `EA/projects/kinematics-calculator/` (nested git repo), repo IS at `github.com/michaelcho8/kinematics-calculator` (verified public), v1 history preserved as the first 2 commits on `main`.

---

## Phase 7 — Deploy (the learning step)

Open at the time of writing this. The deploy is supposed to be a clean walk-through of CF Pages Git-connect after readcron's wrangler stumble. We have:

- The repo public on GitHub
- All v2 commits on `main`
- A clean, no-package.json, no-Node project that CF should treat as pure static
- The defensive `.assetsignore` + `wrangler.jsonc` already in place if CF misbehaves

Verification at deploy time:
- Local smoke test via `python3 -m http.server 8788`
- All 3 tabs render and switch
- 1D solve → results + 2 graphs visible
- 2D solve → results + 2D trajectory graph visible
- Projectile solve → results + parabola visible
- Share button on each tab → URL copies to clipboard → pasting in fresh tab hydrates state
- Tutoring CTA → opens mailto: with correct subject
- Mobile responsive at 880 / 560 / 380 px breakpoints
- All 35 Node tests still pass

If CF Pages deploys cleanly, that's the win — both for kinematics specifically and for the design system / deploy flow more broadly.
