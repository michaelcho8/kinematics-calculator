---
title: Kinematics / Physics Calculator
status: active
started: 2026-04-22
---

# Kinematics / Physics Calculator

A web-based kinematics calculator for students and engineers — 1D kinematics equations and projectile motion. Pure frontend JS, same zero-backend architecture as ReadCron.

## Why

Ties directly to the tutoring business (send students to it as a reference tool) and the robotics portfolio (kinematics is core to robot arm work). Steady traffic from students during exam periods. Existing tools are mostly ugly, slow, or cluttered without being genuinely useful.

## Goals

| Goal | Target | Status | Blocked By |
|---|---|---|---|
| Brainstorm and spec complete | 2026-04-22 | Not started | — |
| MVP built | TBD | Not started | Spec |
| Deployed to Netlify | TBD | Not started | MVP |
| Domain purchased | TBD | Not started | — |
| AdSense wired up | TBD | Not started | Deployment |
| First 1,000 monthly visitors | TBD | Not started | Deployment |

## Stack

- Pure HTML/CSS/JavaScript — no framework, no backend
- Hosted on Netlify (free)
- Monetized via Google AdSense (pub ID: ca-pub-2584209104913819, same as ReadCron)

## Scope

### Phase 1 — MVP
- 1D kinematics: solve for any variable in the big three equations (v = u + at, s = ut + ½at², v² = u² + 2as)
- Projectile motion: range, max height, time of flight
- Clean, mobile-first UI with instant results on input
- SEO meta tags + structured schema markup

### Phase 2 — Growth
- Visual trajectory diagram (Chart.js)
- Additional equation sets: circular motion, energy, momentum
- Shareable result URL for tutors to send to students

## Notes

- Promoted from `ideas/kinematics-calculator.md` on 2026-04-22
- Architecture model: `projects/cron-builder/` (ReadCron)
- Next tool in queue after this: FIRE Calculator (`ideas/fire-calculator.md`)
