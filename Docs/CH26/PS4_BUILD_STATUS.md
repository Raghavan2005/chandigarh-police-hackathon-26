# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | pushed on direct instruction (2026-09-01), not a separate code review | 2026-09-01 | Schema+migration done and pushed to `origin/master`. Remaining Phase 0 tasks: model bake-off (partially covered by ml-service work below), corpus media sourcing (blocking Phase 2). |
| Phase 1 — Core vertical slice | done | `5f40ffe`, `c72ca49`, `4414107`, `e11206f`, `25048a5` — all pushed | pushed on direct instruction, not a separate code review | 2026-09-01 | Auth, ML service (deps installed + verified in the main tree), case+evidence API, real metadata/EXIF extraction (ffprobe + exifr, tested against real repo media), and frontend wired off mock-data.ts onto the real API — all verified end-to-end. |
| Phase 2 — Fusion, provenance, corpus, video | in progress | `ac5770c`, `683c899`, C2PA fix (pending commit) — pushed/pushing | pushed on direct instruction, not a separate code review | 2026-09-01 | `/investigate` orchestration endpoint live: real ML detection (image + video via frame sampling), perceptual-hash + corpus/cross-case matching (dHash, independently re-verified), and the exact coverage-aware fusion algorithm from §4 — verified end-to-end, including the specific "classifier fires alone" jury-panel scenario landing at INCONCLUSIVE as designed. Verdict override endpoint done and tested. **C2PA is now real, not a stub** — found and fixed the actual bug (buffer-based asset instead of path-based, sidesteps a bug in the official package), verified against real files. Remaining Phase 2: bilingual Section 63 BSA report export (§4), seeded-corpus data (still blocked on sourcing real media, §11), propagation graph builder. |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

- **Seeded corpus media still not sourced** (carried from §11 of the plan) — blocks the propagation graph builder and gives cross-case matching nothing real to match against yet.
- **Bilingual Section 63 BSA report export not built yet** — `report-preview.tsx` is still the original mock-only version; the real bilingual 9-part structure from §4 hasn't been implemented for real cases.
