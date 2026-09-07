# AI Forensic Evidence Platform (PS4)

Next.js prototype of an investigator-facing "command console" for detecting AI-generated/manipulated media and tracing its origin — built for **Problem Statement 4 (PS4-AIMD)** of the Chandigarh Police Hackathon'26. Full product context (problem statement, proposed solution, target MVP) is in `../Docs/detailed_project_report.md`; this README covers what's actually built and how to run it.

## What this is (and isn't)

Not a "upload a video, get a deepfake score" tool. It's a chain-of-custody evidence workflow: upload → multi-signal AI analysis → explainable fused verdict → propagation trace → exportable, audit-logged report. Design philosophy ("dark by default, evidence-first", SOC/SIEM-style density, verdicts shown as confidence not binary red/green) is fully specified in `design.md` — read that before touching UI/visual code.

## Status: real backend, live ML models

This has grown past the original front-end-only prototype: real authentication, a real Prisma/SQLite database, and a real FastAPI ML microservice (`../ml-service/`) now back every core workflow (evidence upload, deepfake/manipulation detection, provenance/C2PA checks, hash-based cross-case matching, Evidence Fusion, audit logging). `../Docs/Plan/WHAT_IS_REAL.md` is the authoritative, kept-current list of what's real vs. still limited or not built — read that instead of assuming from this file, which isn't updated as often. A handful of old curated demo cases still render through a pre-real, mock-data-driven page for historical reasons (see `WHAT_IS_REAL.md`'s last note) — anything created through the app itself is fully real.

## Recent changes

- **Deepfake detection accuracy improved with a second model.** The original classifier (`not-lain/deepfake`) is fine-tuned on face-*swap* seam artifacts specifically; live calibration testing found it effectively blind to fully-synthetic AI images (a real known-fake StyleGAN face scored 0–1%). Added `dima806/ai_vs_real_image_detection`, a general AI-image classifier, as a second independent signal (`ml-service/general_ai_detector.py`) — the same test image scored 69.75% on it. Both scores are stored separately (`DetectionResult.manipulationProbability` / `.generalAiProbability`, never blended in the DB) and both feed `src/lib/fusion.ts`'s coverage-aware cap, which now also makes the `AI_GENERATED` verdict real (previously unreachable) by picking whichever classifier fired dominant. Full numbers and honest caveats: `../ml-service/README.md` → "General AI-image model."
- **Fixed a hydration bug**: several pages/components called `.toLocaleString()`/`.toLocaleDateString()` without an explicit locale, so server-rendered and client-rendered timestamps could disagree and crash React hydration. Routed through the existing `formatTimestamp`/`formatDateOnly` (`en-IN`/`Asia/Kolkata`, deterministic) helpers in `src/lib/utils.ts` everywhere this occurred.
- **Fixed a PDF signature-verification bug**: signer identification assumed the first certificate in a PKCS#7 bundle was always the signer's own certificate — bundle order isn't guaranteed by spec. `src/lib/pdf-signature.ts` now picks the certificate that isn't anyone else's issuer, verified against a real multi-certificate PDF where the old code misreported the root CA as the signer.

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
