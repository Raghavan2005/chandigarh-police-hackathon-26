# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | awaiting review | 2026-09-01 | Schema+migration done, committed locally, **not yet pushed** — awaiting human review per §9. Remaining Phase 0 tasks: model bake-off, API contract types + auth guard scaffold, service-account/file-permission setup, corpus media sourcing (blocking). |
| Phase 1 — Core vertical slice | in progress | `5f40ffe` (auth), `c72ca49` (ml-service), `4414107` (case+evidence API) | awaiting review | 2026-09-01 | Auth done and verified end-to-end. ML detection service done and verified (model install not yet re-run in the main tree — see prior note). **Case creation + evidence upload done and verified end-to-end**: real server-side SHA-256 (cross-checked against `sha256sum`), content-addressed storage, per-case duplicate rejection while still allowing the same file across different cases, audit entries written atomically with their case/evidence row (a real bug caught and fixed during testing), hash-chain integrity confirmed unbroken, and the audit checkpoint's tamper-hardening fallback (syslog via `logger`) verified actually firing after discovering `chattr +a` silently doesn't work on this filesystem. Remaining Phase 1: `pip install` ml-service deps and confirm it runs from the main tree; metadata/EXIF extraction; wiring frontend off mock-data.ts onto the real API. |
| Phase 2 — Fusion, provenance, corpus, video | not started | | | | |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

None yet — will be populated as phases progress. Carry forward anything from `PS4_MVP_BUILD_PLAN.md` §11 (open questions) that becomes a live blocker.
