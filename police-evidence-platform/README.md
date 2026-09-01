# AI Forensic Evidence Platform (PS4)

Next.js prototype of an investigator-facing "command console" for detecting AI-generated/manipulated media and tracing its origin — built for **Problem Statement 4 (PS4-AIMD)** of the Chandigarh Police Hackathon'26. Full product context (problem statement, proposed solution, target MVP) is in `../Docs/detailed_project_report.md`; this README covers what's actually built and how to run it.

## What this is (and isn't)

Not a "upload a video, get a deepfake score" tool. It's a chain-of-custody evidence workflow: upload → multi-signal AI analysis → explainable fused verdict → propagation trace → exportable, audit-logged report. Design philosophy ("dark by default, evidence-first", SOC/SIEM-style density, verdicts shown as confidence not binary red/green) is fully specified in `design.md` — read that before touching UI/visual code.

## Status: UI prototype, mock data

This is a **front-end prototype** for the Round-1 demo — there is no real ML backend, C2PA validator, or OSINT search wired up yet. All case data (verdicts, confidence scores, pipeline steps, propagation graphs, face matches, audit log) is seeded from `src/lib/mock-data.ts`. See `DATA_CHECKLIST.md` for exactly what data each page needs and how to swap in a new demo case.

## Implemented screens

- **Dashboard** (`/`) — KPI tiles, anomaly trend chart, recent alerts table
- **Evidence upload** (`/cases/new`) — dropzone with client-side SHA-256 hashing
- **Case investigation** (`/cases/[caseId]`) — media viewer with manipulation-heatmap toggle, animated analysis pipeline, verdict/confidence panel, face-match/OSINT panel, evidence-fusion signal stack
- **Propagation graph** (`/cases/[caseId]/propagation`) — cross-platform spread timeline
- **Report** (`/cases/[caseId]/report`) — exportable evidence report
- **Audit log** (`/audit`) — chain-of-custody trail

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other scripts: `npm run build`, `npm run start`, `npm run lint`.

Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/base-ui components · Framer Motion.

## Where to look next

- `design.md` — color system, layout, and interaction rules for the dark-mode UI
- `DATA_CHECKLIST.md` — per-page data requirements, and how to add a new real case
- `../Docs/incidents/` — the real fact-checked deepfake cases this prototype's demo data is drawn from
- `AGENTS.md` / `CLAUDE.md` — agent/AI-assistant working notes for this subfolder (the `AGENTS.md` block is auto-managed by `next dev`, don't hand-edit it)
