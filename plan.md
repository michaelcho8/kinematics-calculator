# [[kinematics-calculator|Kinematics Calculator]] — Implementation Plan

**Goal:** 1D kinematics solver (any 3 of 5 variables) + projectile motion calculator. Pure frontend, same stack as [[fire-calculator|FIRE Calculator]] and [[readcron|ReadCron]].

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | Markup only — two tabs, 5 SUVAT inputs, projectile inputs, results areas |
| `style.css` | All styles — same design language as FIRE Calculator |
| `js/kinematics.js` | `solve1D(known)`, `solveProjectile(v0, angle, g)` — pure functions |
| `js/main.js` | DOM wiring — tab switching, input reading, result rendering |
| `test.js` | Node test suite |
| `package.json` | `{"type": "module"}` only |

---

## Task 1: Scaffold

- [ ] Create `package.json` with `{"type": "module"}`
- [ ] Create empty `index.html`, `style.css`, `js/kinematics.js`, `js/main.js`, `test.js`
- [ ] Confirm `node test.js` runs on empty file

---

## Task 2: Kinematics Logic + Tests

- [ ] Implement `solve1D(known)` — handles all 10 combinations of 3 knowns
- [ ] Implement `solveProjectile(v0, angleDeg, g)` — returns vx, vy, time, height, range
- [ ] Write tests covering all 10 solver cases + free fall + braking + projectile at 45°
- [ ] All tests pass: `node test.js` exits clean

---

## Task 3: UI

- [ ] Tab switching (1D / Projectile) — pure CSS + JS, no library
- [ ] 1D section: 5 labelled inputs, status line, results card, clear button
- [ ] Projectile section: 3 inputs, results table, real-time update
- [ ] Equations reference bar (v=u+at, s=ut+½at², v²=u²+2as)
- [ ] Style: consistent with FIRE Calculator (same CSS variables, card layout)

---

## Task 4: SEO + AdSense

- [ ] Meta tags, Open Graph, JSON-LD
- [ ] AdSense script + new slot ID placeholder

---

## Task 5: Deploy (tomorrow)

- [ ] `git init` + GitHub repo `kinematics-calculator` (public)
- [ ] Connect to Netlify
- [ ] Purchase `.com` domain, point at Netlify
