# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | pushed on direct instruction (2026-09-01), not a separate code review | 2026-09-01 | Schema+migration done and pushed to `origin/master`. Remaining Phase 0 tasks: model bake-off (partially covered by ml-service work below), corpus media sourcing (blocking Phase 2). |
| Phase 1 — Core vertical slice | done | `5f40ffe`, `c72ca49`, `4414107`, `e11206f`, `25048a5` — all pushed | pushed on direct instruction, not a separate code review | 2026-09-01 | Auth, ML service (deps installed + verified in the main tree), case+evidence API, real metadata/EXIF extraction (ffprobe + exifr, tested against real repo media), and frontend wired off mock-data.ts onto the real API — all verified end-to-end. |
| Phase 2 — Fusion, provenance, corpus, video | in progress | `ac5770c` .. `67a2662` (see log) — all pushed | pushed on direct instruction, not a separate code review | 2026-09-01 | Backend pipeline complete and verified: `/investigate` orchestration (real ML detection incl. video frame sampling, perceptual-hash + corpus/cross-case matching, real C2PA — bug found and fixed, not just stubbed), the exact coverage-aware fusion algorithm from §4, and verdict override. **UI now wired to all of it, not just the API:** real Investigate button with genuine loading state, real media viewer (image/video/audio) with the actual Grad-CAM heatmap overlay, NCII/minor blur-by-default with an audited reveal action (unrevealed HTML never even contains the file URL), cross-case/corpus matches rendered as real clickable links (not just counts), and the report page/sidebar bug that was showing the wrong hardcoded case is fixed. Remaining Phase 2: bilingual Section 63 BSA report export (§4 — report shows real data but not the full legal certificate format yet), seeded-corpus data (still blocked on sourcing real media, §11), propagation graph + face-match/OSINT panel (both depend on corpus data), reusing the polished PipelinePanel/FusionPanel components with real data instead of the current plain-text pipeline/fusion display. |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

- **Seeded corpus media still not sourced** (carried from §11 of the plan) — blocks the propagation graph builder and gives cross-case matching nothing real to match against yet.
- **Bilingual Section 63 BSA report export not built yet** — `RealReportPreview` now shows real case/evidence/audit data (replacing the old mock-only report for real cases), but not yet the full bilingual 9-part legal certificate structure from §4.
- **Audit log page (`/audit`) still hardcoded to one old mock case ID** — doesn't show real cases' audit trails. Real chain-of-custody data exists and works (verified repeatedly this session); it's just not surfaced on that page yet.
- **Pipeline/fusion visuals not reused yet** — `PipelinePanel`/`FusionPanel` are real, working, presentational components already built for the mock demo; real cases currently show plain text instead of the animated pipeline / signal-stack visualization. Confirmed reusable in principle (see conversation) — just needs real data wired into their existing prop shapes, not a rebuild.
