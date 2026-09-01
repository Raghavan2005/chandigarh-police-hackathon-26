# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | awaiting review | 2026-09-01 | Schema+migration done, committed locally, **not yet pushed** — awaiting human review per §9. Remaining Phase 0 tasks: model bake-off, API contract types + auth guard scaffold, service-account/file-permission setup, corpus media sourcing (blocking). |
| Phase 1 — Core vertical slice | in progress | `5f40ffe` (auth), `c72ca49` (ml-service) | awaiting review | 2026-09-01 | Auth done and verified end-to-end (login/logout/session/route-guard/sign-out). ML detection service done and verified end-to-end (`ml-service/`, FastAPI + `not-lain/deepfake` InceptionResnetV1 + Grad-CAM, CPU-only, offline after first weight download) — model install/verification not yet re-run against the fresh copy in the main tree (dependencies not yet installed here; the worktree that verified it was torn down after extracting its code). Remaining Phase 1: `pip install` the ml-service deps in a fresh venv and confirm it still runs from the main tree; case creation + evidence upload API routes (server-side SHA-256); metadata/EXIF extraction; wiring frontend off mock-data.ts. |
| Phase 2 — Fusion, provenance, corpus, video | not started | | | | |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

None yet — will be populated as phases progress. Carry forward anything from `PS4_MVP_BUILD_PLAN.md` §11 (open questions) that becomes a live blocker.
