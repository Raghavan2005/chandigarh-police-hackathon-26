# Chandigarh Police Hackathon'26 — Team EmptyRoad

Workspace for **Team EmptyRoad** (Rajalakshmi Engineering College, Tamil Nadu — Team ID `PS4-AIMD-43`), competing in the Chandigarh Police Hackathon'26 (organized by Chandigarh Police with UIET Panjab University and PEC Chandigarh).

Read `CLAUDE.md` first — it's the authoritative guide for how this repo is organized and how to work in it. This README is a human-facing summary of the same thing.

## Current status

The team evaluated all six problem statements during the research phase (`Docs/CH26/`) and the resulting master report recommended **PS5 (crypto flow tracking)**. The team then **pivoted to PS4** (AI-generated media detection & origin tracing) and has been building against PS4 since — the team is officially registered and shortlisted under **PS4-AIMD** (see `Docs/Shortlisted Teams - Chandigarh Police Hackathon.md`). Treat PS4 as the live track; the PS5 recommendation is kept only as a historical record of the selection process.

## What's in here

```
Docs/                        research, decision docs, and case evidence (no code)
├── CH26/                     PS-selection phase: brochure, all 6 track PDFs, 6 specialist
│                             evaluation reports, and the master selection report
├── incidents/                real-world deepfake/misinformation cases used as PS4 demo
│                             evidence (each is a dossier: write-up + source screenshots + video)
├── Shortlisted Teams - ...md official PS4-AIMD shortlist (confirms our team + track)
└── detailed_project_report.md   full PS4 solution writeup (problem, solution, features, deliverables)

police-evidence-platform/    the actual product: a Next.js prototype of the PS4 investigator
                             console. Has its own README/CLAUDE.md/AGENTS.md — see those for
                             how to run and work on it.
```

## PS4 in one paragraph

We're building an **AI Forensic Evidence Platform** — a dark-mode, SOC/SIEM-style command console for police investigators, not a consumer deepfake checker. It fuses multiple weak signals (AI-artifact classifiers, EXIF/C2PA provenance, perceptual-hash/OSINT reverse search) into an explainable verdict (Authentic / Manipulated / AI-Generated / Inconclusive), with manipulation-localization heatmaps, a cross-platform propagation graph, and a chain-of-custody audit log that exports as a court-ready report. Full detail in `Docs/detailed_project_report.md`; the Next.js prototype implementing this lives in `police-evidence-platform/`.

## Key dates (verify against `Docs/CH26/Chandigarh Police Hackathon Brochure.pdf` before relying on them)

Round-1 pitch deck + video submission 20 Aug 2026 · results 25 Aug 2026 · pre-hack prep 25 Aug–7 Sep 2026 · 24-hour offline build 8 Sep 2026 (PS4 teams build at UIET, Panjab University, Sector-25, Chandigarh) · Grand Finale 9 Sep 2026 in Chandigarh.

## Working here

- No repo-wide build/lint/test — `Docs/` is pure documentation. For build/lint/test commands, go into `police-evidence-platform/` and see its own README.
- New docs go under `Docs/` (see `CLAUDE.md` → File organization rules) — never loose at the repo root.
- Commits in this repo should **not** include an AI co-author/attribution line — see `CLAUDE.md` → Commit conventions.
