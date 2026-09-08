# AI Forensic Evidence Platform (PS4)

Next.js prototype of an investigator-facing "command console" for detecting AI-generated/manipulated media and tracing its origin — built for **Problem Statement 4 (PS4-AIMD)** of the Chandigarh Police Hackathon'26. Full product context (problem statement, proposed solution, target MVP) is in `../Docs/detailed_project_report.md`; this README covers what's actually built and how to run it.

## What this is (and isn't)

Not a "upload a video, get a deepfake score" tool. It's a chain-of-custody evidence workflow: upload → multi-signal AI analysis → explainable fused verdict → propagation trace → exportable, audit-logged report. Design philosophy ("dark by default, evidence-first", SOC/SIEM-style density, verdicts shown as confidence not binary red/green) is fully specified in `design.md` — read that before touching UI/visual code.

## Status: real backend, live ML models

This has grown past the original front-end-only prototype: real authentication, a real Prisma/SQLite database, and a real FastAPI ML microservice (`../ml-service/`) now back every core workflow (evidence upload, deepfake/manipulation detection, provenance/C2PA checks, hash-based cross-case matching, Evidence Fusion, audit logging). `../Docs/Plan/WHAT_IS_REAL.md` is the authoritative, kept-current list of what's real vs. still limited or not built — read that instead of assuming from this file, which isn't updated as often. A handful of old curated demo cases still render through a pre-real, mock-data-driven page for historical reasons (see `WHAT_IS_REAL.md`'s last note) — anything created through the app itself is fully real.

## Recent changes

- **Deepfake detection accuracy improved with a second model.** The original classifier (`not-lain/deepfake`) is fine-tuned on face-*swap* seam artifacts specifically; live calibration testing found it effectively blind to fully-synthetic AI images (a real known-fake StyleGAN face scored 0–1%). Added `dima806/ai_vs_real_image_detection`, a general AI-image classifier, as a second independent signal (`ml-service/general_ai_detector.py`) — the same test image scored 69.75% on it. Both scores are stored separately (`DetectionResult.manipulationProbability` / `.generalAiProbability`, never blended in the DB) and both feed `src/lib/fusion.ts`'s coverage-aware cap, which now also makes the `AI_GENERATED` verdict real (previously unreachable) by picking whichever classifier fired dominant. Full numbers and honest caveats: `../ml-service/README.md` → "General AI-image model."
- **Added a third, modern-diffusion-focused model.** `dima806/ai_vs_real_image_detection`'s own model card admits ~2-year-old training data and "significant concept drift" in AI image generation since — a real, disclosed staleness gap, not a hypothetical one. Added `Organika/sdxl-detector` (Swin Transformer, fine-tuned on SDXL-era output; **CC-BY-NC-3.0, non-commercial** — the one non-Apache/MIT model in this service) as a third independent signal (`ml-service/sdxl_detector.py`). Live smoke test: a genuine camera photo scored 96.48% human, the official SDXL showcase image from Stability AI's own model card scored 99.98% artificial. Stored as `DetectionResult.sdxlProbability` (nullable, never blended with the other two), feeds `fusion.ts`'s `Math.max()` cap and the `MANIPULATED`/`AI_GENERATED` dominant-model decision (which now names the specific model — general or SDXL — that fired), and renders as its own row in the investigation page's "Manipulation detection" signal panel. Full numbers and honest caveats: `../ml-service/README.md` → "Modern-diffusion (SDXL) AI-image model."
- **Ran a real video-detection calibration test and fixed what it found.** Video has no dedicated model — it scores per-frame with the same three image classifiers above. Tested against two independently-sourced, provenance-checked clips (a genuine CC-licensed interview vs. an official academic face-reenactment demo): both scored ~100% raw and landed on `INCONCLUSIVE` at the same confidence, exposing that fusion's `max()` across frames/models can mask a correct signal from one model with a wrong spike from another. Also found frame sampling was a flat 6 frames regardless of clip length — fixed to scale with duration (`investigate/route.ts`'s `deepfakeSampleFrameCount`, ~1 frame per 3s, capped at 20); verified live on a real 60s video (6→20 frames, +9.4s latency, still demo-acceptable). A frame-to-frame face-embedding consistency check was built and tested as a possible second video-specific signal, then explicitly not shipped: it isn't just under-calibrated, the pipeline has no face-tracking across frames, so on any multi-person clip it can silently compare two different people's faces — reverted rather than left half-wired. Full numbers: `../ml-service/README.md` → "Video path — real calibration finding and what changed."
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
