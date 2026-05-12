# Kinematics Calculator v2 — Build Log

Single source of truth for cross-session state. If you're picking this up cold (new session, new day), read this file first.

---

## Current state

- **Last updated:** 2026-05-12 ~14:35 PT
- **Phase:** 5 complete (URL state codec + Share + hydration). Phase 6 (docs) in progress now; Phase 7 (deploy) is the remaining work.
- **Working tree:** `EA/projects/kinematics-calculator/` (nested git repo inside the EA vault)
- **Git:** `main` tracking `origin/main` at `github.com/michaelcho8/kinematics-calculator` (public). 7 new v2 commits on top of 2 v1 commits.
- **Live URL:** none yet — never deployed. Will go to `*.pages.dev` via CF Pages Git-connect in Phase 7.

## Resume cold — read in this order

1. **This file** — where we are right now.
2. **`~/.claude/plans/1-b-2-everything-jolly-jellyfish.md`** — the approved build plan (context, scope, phases, verification).
3. **`spec.md`** — v1 spec + the appended "v2 — Blueprint Redesign + 2D + Graphs" section (Phase 6 writes it).
4. **`CHANGELOG.md`** — what changed per phase.
5. **`docs/redesign-notes.md`** — the *why* behind each design decision.

## Brief recap

Michael wanted to relaunch the kinematics calculator (built 2026-04-30, never deployed) as **v2** with a "relaxing, casual blueprint" aesthetic (per three reference images: cartoon engineer with blueprints, person at drafting table, paper airplane through clouds with dotted flight trail). Plus a new 2D tab, graph view across all tabs, shareable URLs, tutoring CTA, AdSense slot wiring, and SEO refresh. Deploy goes via CF Pages Git-connect — explicitly a learning vehicle after readcron hit a wrangler/Workers auto-detection issue earlier the same day.

Primary goal: **passive income ASAP** (AdSense education niche $6–15 RPM + SEO + tutoring funnel). Open-ended weekend time budget.

Ran `grill-me` to scope. All locked answers in spec.md v2 section + plan file. Then built in 6 phases.

## Phase plan

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | Scaffold + defensive CF config (`.assetsignore`, `wrangler.jsonc`) | complete | `3a24633`, `da65b33` |
| 1 | `tokens.css` — blueprint accent + cream-sky surface + grid pattern | complete | `d76f0aa` |
| 2 | `solve2D()` + 16 new tests (19 → 35 passing) | complete | `1aafdcc` |
| 3 | Visual refresh: HTML + CSS rewrite, 3 tabs, paper-airplane hero, CTA | complete | `68053da` |
| 4 | `graph.js` SVG renderer + `main.js` wiring for 2D + graphs | complete | `f5149bf` |
| 5 | URL state codec + Share buttons + hydration | complete | `d5dc8c6` |
| 6 | Documentation (this file + CHANGELOG + redesign-notes + README + spec sync) | **in progress** | — |
| 7 | Deploy via CF Pages Git-connect | pending | — |

## Decisions log (for v2)

| Date | Decision | Reason |
|---|---|---|
| 2026-05-12 | Build kinematics v2 as full (d) launch — visual refresh + 2D tab + graphs + shareable URLs + CTA + SEO | Michael wanted passive income ASAP from a fresh launch |
| 2026-05-12 | Visual direction: relaxing/casual blueprint (not industrial) | Reference images leaned soft (paper airplane in clouds); blueprint aesthetic fits both physics + drafting metaphor |
| 2026-05-12 | 2D solver scope: simple forward solver (provide all 5, output 4 derived) | Covers ~70% of 2D textbook problems; 5× less code than full any-3-of-9; ship faster |
| 2026-05-12 | Tutoring CTA target: `mailto:choind88@gmail.com` (Cho Industries) | Separation between business + personal inbox; Wyzant profile not yet live |
| 2026-05-12 | Branch strategy: work on `main` directly | v1 never deployed → no risk of losing live history → clean linear timeline |
| 2026-05-12 | Hero illustration: SVG paper-airplane + clouds + dotted trajectory (no Midjourney) | Plan allowed Midjourney as Michael's offline task; we shipped with a hand-rolled SVG that matched the "casual" brief and skipped the asset iteration overhead |
| 2026-05-12 | Graph library: hand-rolled inline SVG, no Chart.js | Lighter (no 70KB dep), more on-brand with blueprint vibe, design-system-native styling |
| 2026-05-12 | No localStorage for v2 | Save-and-load not needed; the URL IS the shareable artifact |
| 2026-05-12 | Defensive `.assetsignore` + `wrangler.jsonc` at scaffold time | Even though kinematics has no `package.json`, the same files prevented re-running into readcron's CF Pages wrangler issue |

## Known issues

- **Hero illustration**: SVG version shipped (clouds + paper airplane + dotted trajectory) instead of the Midjourney/SDXL asset originally planned. If Michael generates a real 3D illustration later, swap the `<svg class="hero-decor">` block in `index.html` for an `<img>` tag.
- **AdSense slot IDs**: still `SLOT_ID_HERE` placeholders in all 3 `<ins>` blocks. Michael creates new ad units in AdSense dashboard post-deploy, then we swap (1 commit, auto-redeploys).
- **No domain yet**: shipping to `*.pages.dev`. Buy `kinematicsolver.com` / `suvatcalc.com` / `physicsolver.com` (~$10/yr Porkbun) once we see traffic or AdSense activity.
- **Lighthouse**: no baseline measurement against v1 yet (v1 never had live numbers). Run Lighthouse post-deploy and bank the v2 number as the future baseline.
- **Browser smoke test**: I haven't visually verified the rendered page yet — local `python3 -m http.server 8788` step is in the Phase 6/7 verification flow.

## Where the source files came from

The v1 baseline is the existing 2 commits on `main` (`39e2fd9` initial + `879b4f7` README expansion). v2 evolves from that point; we're not starting from a snapshot like readcron was forced to.

Files inventory after Phase 5:

- `index.html` (rewritten Phase 3)
- `style.css` (rewritten Phase 3)
- `tokens.css` (new Phase 1)
- `js/kinematics.js` (Phase 2 added `solve2D`; v1 functions untouched)
- `js/main.js` (rewritten Phase 4, extended Phase 5)
- `js/graph.js` (new Phase 4)
- `js/storage.js` (new Phase 5)
- `test.js` (extended Phase 2 — 35 tests)
- `.assetsignore` (new Phase 0)
- `wrangler.jsonc` (new Phase 0)
- `README.md`, `plan.md`, `spec.md` (v1; spec.md gets a v2 section in Phase 6)

## Next concrete action

Finish Phase 6 docs (this file already in progress, plus CHANGELOG + redesign-notes + README update + spec v2 section). Then Phase 7: smoke-test locally via `python3 -m http.server 8788`, push all commits to `origin/main`, and walk Michael through CF Pages Git-connect setup.
