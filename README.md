# [[kinematics-calculator|Kinematics Calculator]] — Web Tool

**Status: Built and tested. Ready to deploy.**
Tests: 19/19 passing. Git repo initialized.

A free physics calculator for students and engineers. Two tabs: 1D kinematics (solve for any 2 of 5 SUVAT variables given 3) and projectile motion. Auto-solves on input — no submit button needed. Clean, mobile-friendly UI.

Education-niche AdSense CPM: **$6–15 RPM**. Secondary engine: drives tutoring inquiries directly.

---

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure, two-tab layout, SEO tags, AdSense script |
| `style.css` | Visual design — same design system as ETF rebalancer and FIRE calculator |
| `js/kinematics.js` | Pure math: `solve1D()` (10 variable combinations), `solveProjectile()` |
| `js/main.js` | DOM wiring — tab switching, auto-solve on 3 inputs, projectile live updates |
| `test.js` | 19 tests across 1D solver cases and projectile — run with `node test.js` |

---

## Run locally

No install needed:

```bash
python3 -m http.server 8788
```

Open: <http://localhost:8788>

---

## Deploy checklist

### 1 — Push to GitHub

```bash
git remote add origin https://github.com/YOURUSERNAME/kinematics-calculator.git
git push -u origin main
```

Create the repo first at github.com (public, no README — one already exists).

### 2 — Deploy on Netlify

1. netlify.com → Add new site → Import from GitHub → pick repo
2. Leave build settings empty (static site, no build command)
3. Click Deploy — live in ~60 seconds

### 3 — Buy a domain (~$10/yr on Porkbun)

Suggested names (check availability at porkbun.com):

- `kinematicsolver.com`
- `suvat.io`
- `suvatcalc.com`
- `physicsolver.com`

After buying: Netlify → Site settings → Domain management → Add custom domain → follow DNS instructions.

### 4 — Swap the placeholders in index.html

| Placeholder | Replace with | Where to get it |
| --- | --- | --- |
| `YOURDOMAIN.com` | your actual domain | After step 3 |
| `SLOT_ID_HERE` (×3) | AdSense slot IDs | adsense.google.com → Ads → By ad unit → create 3 Display units |

The AdSense publisher ID (`ca-pub-2584209104913819`) is already wired.

### 5 — Submit to Google Search Console

1. search.google.com/search-console → Add property
2. Verify via DNS record
3. Request indexing on homepage URL

---

## Monetization roadmap

### Immediate (at launch)

- **Google AdSense** — 3 display units. Education niche has lower CPM than finance, but the audience has high dwell time (students work through problems) and exam-period traffic spikes in May, November, January.
- **Tutoring CTA** — add a card below the calculator: "Stuck on physics? Book a 1-on-1 session → $75/hr, first session free." Direct conversion from the tool's exact target audience into tutoring revenue. No ads needed — one booking pays more than 2,000 ad impressions.
- **Cross-link to [[fire-calculator|FIRE Calculator]]** — add a footer link. Kinematics students may be college-age and curious about money; FIRE calculator is a natural next tool.

### Short-term (100–500 users)

- **Amazon Associates** — add contextual affiliate links in the SEO explainer section to relevant textbooks:
  - Serway & Jewett "Physics for Scientists and Engineers"
  - Halliday/Resnick "Fundamentals of Physics"
  - AP Physics prep books

  These earn 4–8% per sale. Low effort once set up; converts well for a tool students are already using for homework.
- **Share link for tutors** — "Send this tool to your students." If other tutors share it, organic backlinks compound the SEO value.

### Phase 2 (500+ users, validated demand)

- **Trajectory visualization** — Chart.js parabola diagram for projectile motion. High SEO value ("projectile motion graph calculator") and increases time-on-page, which improves AdSense RPM.
- **Shareable result URLs** — encode the inputs in the URL so students can share solved problems (e.g., `?u=0&a=9.8&t=3`). Drives return visits and backlinks.
- **Circular motion + energy + momentum** — extends the tool's keyword coverage and tutoring relevance.

---

## Tutoring integration

This tool is a natural entry point for tutoring inquiries. When deployed:

1. Send the URL to every physics or pre-calc tutoring student as a free resource
2. Every student who uses it during a session is a potential referral — they share it with classmates
3. The tool's organic Google traffic brings in students who don't know you yet, and the tutoring CTA converts them

Suggested CTA card text for `index.html` (add after the calculator, before the SEO explainer):
> **Need help with physics?** I'm a physics and math tutor with 13+ years of experience. First session free. → [Book a session]

---

## SEO targets

Primary: "kinematics calculator", "SUVAT calculator"
Secondary: "projectile motion calculator", "solve for acceleration", "kinematic equations solver"

The SUVAT reference table in the explainer section captures long-tail queries like "how to solve kinematics equations" and "what is SUVAT" that students search during exam prep.
