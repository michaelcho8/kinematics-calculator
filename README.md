# [[kinematics-calculator|Kinematics Calculator]] — Web Tool

**Status: v2 built (2026-05-12). Awaiting deploy via Cloudflare Pages Git-connect.**

Tests: 35/35 passing (19 v1 + 16 new 2D).
Code: `EA/projects/kinematics-calculator/` (nested git repo inside the EA vault).
Repo: [github.com/michaelcho8/kinematics-calculator](https://github.com/michaelcho8/kinematics-calculator) (public).

A free physics calculator for students and engineers. Three tabs:

- **1D Kinematics** — solve for any 2 of 5 SUVAT variables given 3
- **2D Motion** — provide initial velocity vector, acceleration vector, and time; get final vector + displacement + magnitudes + angles
- **Projectile Motion** — initial speed, launch angle, gravity → flight path and key metrics

All three tabs include visual graphs (inline SVG). Position-vs-time and velocity-vs-time for 1D; 2D trajectory; parabolic flight path for projectile.

Shareable URLs encode the current tab + inputs (`?tab=1d&u=0&v=10&a=2`). Tutoring CTA card links to `mailto:choind88@gmail.com` (Cho Industries).

Education-niche AdSense CPM: **$6–15 RPM**. Drives direct tutoring inquiries.

---

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure, three-tab layout, hero SVG, SEO tags, AdSense `<ins>` blocks, JSON-LD |
| `style.css` | Visual design — consumes `tokens.css`. Blueprint surfaces, sky hero, mobile responsive |
| `tokens.css` | Design tokens. Shared with readcron + (planned) FIRE Calculator. `[shared]` vs `[tool]` portability markers. |
| `js/kinematics.js` | Pure math: `solve1D()` (10 SUVAT combinations), `solveProjectile()`, `solve2D()` |
| `js/main.js` | DOM wiring — ES module. Tab switching, auto-solve, result rendering, graph rendering, share buttons, URL hydration |
| `js/graph.js` | Inline-SVG graph renderer — 4 graph types (position-time, velocity-time, 2D path, projectile parabola) |
| `js/storage.js` | URL state codec (no localStorage). Encode + decode + buildShareUrl |
| `test.js` | Node test suite — 35 tests across 1D + projectile + 2D |
| `.assetsignore` | CF Pages: exclude `node_modules`, `.wrangler`, `.git` from asset uploads (defensive) |
| `wrangler.jsonc` | CF Pages: pin project name + assets directory (defensive) |
| `build-log.md` | Cross-session continuity tracker |
| `docs/redesign-notes.md` | Incremental learning doc — why behind each design decision |
| `CHANGELOG.md` | Keep-a-Changelog format |

---

## Run locally

No install needed:

```bash
python3 -m http.server 8788
```

Open: <http://localhost:8788>

Run tests:

```bash
node test.js
```

---

## Deploy — Cloudflare Pages via Git-connect

Replaces the v1 Netlify path. Aligns with the 2026-05-09 hosting decision that moved all the web tools to CF Pages.

### 1 — Sign in to Cloudflare

1. dash.cloudflare.com — sign in or create account (`michael.sm.cho@gmail.com`, phone verification required)
2. Left sidebar → **Workers & Pages** → **Create application** → **Pages** tab → **Connect to Git**

### 2 — Connect the repo

1. Pick **michaelcho8/kinematics-calculator**
2. **Project name:** `kinematics-calculator` (or `kinematics` — your call)
3. **Production branch:** `main`
4. **Framework preset:** **None** ← critical
5. **Build command:** leave empty
6. **Build output directory:** leave empty
7. **Save and Deploy**

Why "None" framework + empty build: kinematics has no `package.json` and no build step. CF should treat the repo as pure static and serve files directly. If CF's auto-detection tries to run wrangler anyway, the `.assetsignore` and `wrangler.jsonc` in the repo cap the blast radius.

### 3 — Verify

After ~30–60 seconds CF gives you a `*.pages.dev` URL. Hit it:

- All 3 tabs render and switch
- Each tab's solve produces a result + a graph
- Share button copies a URL with state; opening it in a fresh tab hydrates inputs
- Tutoring CTA opens `mailto:choind88@gmail.com`
- View source: AdSense `<ins>` blocks present with placeholder slot IDs

### 4 — Create AdSense slots

1. adsense.google.com → Ads → By ad unit → create 3 Display units
2. Copy each slot ID, swap the three `SLOT_ID_HERE` placeholders in `index.html`
3. Commit + push → CF Pages auto-redeploys

### 5 — Custom domain (later)

Buy a `.com` (~$10/yr on Porkbun) once revenue or impressions justify the spend. Suggested names:

- `kinematicsolver.com`
- `suvatcalc.com`
- `physicsolver.com`

In CF Pages project: Settings → Custom domains → Add → follow the DNS instructions (or hand DNS to Cloudflare for the cleanest flow).

### 6 — Submit to Google Search Console

1. search.google.com/search-console → Add property
2. Verify (DNS record is cleanest with the domain on CF)
3. Request indexing on homepage URL

---

## Monetization roadmap

### Immediate (at launch)

- **Google AdSense** — 3 display units. Education niche has lower CPM than finance, but the audience has high dwell time (students work through problems) and exam-period traffic spikes in May, November, January.
- **Tutoring CTA** — card below the calculator: "Stuck on a physics problem? I tutor STEM 1-on-1. First session is free." Direct conversion from the exact target audience. No ads needed — one booking pays more than 2,000 ad impressions.
- **Cross-link to other tools** — once the FIRE Calculator deploys, add a footer link. Kinematics students may be college-age and curious about money.

### Short-term (100–500 users)

- **Amazon Associates** — affiliate links in the SEO explainer section for textbooks (Serway & Jewett, Halliday/Resnick, AP Physics prep books). 4–8% per sale. Low effort once set up.
- **Share-link distribution** — every Wyzant tutoring student gets the URL as a free resource. Compounds backlinks if other tutors share it.

### Phase 3 (500+ users, validated demand)

- **Saved expressions / problem sets** (localStorage layer) — students return to revisit specific problems
- **Circular motion + energy + momentum tabs** — extends keyword coverage and tutoring relevance
- **MathJax / equation rendering** — full Greek + sub/superscript rendering in the explainer section

---

## SEO targets

Primary: "kinematics calculator", "SUVAT calculator", "2D kinematics calculator"
Secondary: "projectile motion calculator", "position time graph calculator", "velocity time graph", "solve for acceleration", "kinematic equations solver"

The full reference section (SUVAT + 2D component equations + projectile decomposition) targets long-tail queries.

---

## Tutoring integration

This tool is the entry point for tutoring inquiries from search traffic. When deployed:

1. Send the URL to every physics or pre-calc tutoring student as a free resource
2. Every student who uses it during a session is a potential referral
3. The tool's Google traffic brings in students who don't know me yet, and the tutoring CTA converts them

CTA card content (currently in `index.html`):

> **Stuck on a physics problem?** I tutor STEM 1-on-1 — SAT, AP Physics, intro college mechanics. First session is free. → [Book a session](mailto:choind88@gmail.com?subject=Physics%20tutoring%20inquiry)
