# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | pushed on direct instruction (2026-09-01), not a separate code review | 2026-09-01 | Schema+migration done and pushed to `origin/master`. Remaining Phase 0 tasks: model bake-off (partially covered by ml-service work below), corpus media sourcing (blocking Phase 2). |
| Phase 1 — Core vertical slice | in progress | `5f40ffe` (auth), `c72ca49` (ml-service), `4414107` (case+evidence API), `4672e06` — all pushed to `origin/master` | pushed on direct instruction (2026-09-01), not a separate code review | 2026-09-01 | Auth done and verified end-to-end. ML detection service done and verified (model install not yet re-run in the main tree — see prior note). Case creation + evidence upload done and verified end-to-end (SHA-256 cross-checked, content-addressed storage, per-case duplicate rejection, atomic audit writes, hash-chain integrity confirmed, syslog checkpoint fallback verified firing after `chattr +a` was found to silently no-op on this filesystem). Remaining Phase 1: `pip install` ml-service deps and confirm it runs from the main tree; metadata/EXIF extraction; wiring frontend off mock-data.ts onto the real API. |
| Phase 2 — Fusion, provenance, corpus, video | not started | | | | |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

None yet — will be populated as phases progress. Carry forward anything from `PS4_MVP_BUILD_PLAN.md` §11 (open questions) that becomes a live blocker.
