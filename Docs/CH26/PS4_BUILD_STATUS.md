# PS4 — Build Status Tracker

Single source of truth for "where are we" on `PS4_MVP_BUILD_PLAN.md`. Updated per the workflow in that plan's §9 — after every phase's human review + push, not before. Check this file before starting the next phase instead of re-deriving status from memory or chat history.

**How to update:** when a phase is reviewed and pushed, fill in its row. `State` is one of `not started` / `in progress` / `in review` / `done` / `blocked` (add a one-line reason in Notes if blocked).

| Phase | State | Commit(s) | Reviewed by | Date | Notes |
|---|---|---|---|---|---|
| Phase 0 — Foundation | in progress | `38dcc3b` (Prisma+SQLite schema) | pushed on direct instruction (2026-09-01), not a separate code review | 2026-09-01 | Schema+migration done and pushed to `origin/master`. Remaining Phase 0 tasks: model bake-off (partially covered by ml-service work below), corpus media sourcing (blocking Phase 2). |
| Phase 1 — Core vertical slice | done | `5f40ffe`, `c72ca49`, `4414107`, `e11206f`, `25048a5` — all pushed | pushed on direct instruction, not a separate code review | 2026-09-01 | Auth, ML service (deps installed + verified in the main tree), case+evidence API, real metadata/EXIF extraction (ffprobe + exifr, tested against real repo media), and frontend wired off mock-data.ts onto the real API — all verified end-to-end. |
| Phase 2 — Fusion, provenance, corpus, video | in progress | `ac5770c` (phash schema), `683c899` (detection+fusion+matching+override) — pushed | pushed on direct instruction, not a separate code review | 2026-09-01 | `/investigate` orchestration endpoint live: real ML detection (image + video via frame sampling), perceptual-hash + corpus/cross-case matching (dHash, independently re-verified), and the exact coverage-aware fusion algorithm from §4 — verified end-to-end on a clean production process, including the specific "classifier fires alone" jury-panel scenario landing at INCONCLUSIVE as designed. Verdict override endpoint done and tested. **C2PA provenance check is a documented temporary stub** (`src/lib/provenance.ts`) — always returns "absent," which is an honest default but not yet reading real files; the real implementation via `@contentauth/c2pa-node` hit a genuine ESM/CJS interop bug that wasn't resolved. Remaining Phase 2: finish real C2PA, bilingual Section 63 BSA report export (§4), seeded-corpus data (still blocked on sourcing real media, §11), propagation graph builder. |
| Phase 3 — Report, polish, rehearsal buffer | not started | | | | |
| Phase 4 — 24-hour build (8 Sep) | not started | | | | |
| Phase 5 — Grand Finale (9 Sep) | not started | | | | |

## Open blockers

- **C2PA provenance check is a stub, not real.** `src/lib/provenance.ts` always returns "no credential present." The real implementation (`@contentauth/c2pa-node`, already installed) hit a genuine `fs-extra` ESM/CJS interop error inside the package's own `assetSize.js` — needs someone to either work around it (e.g. force CJS resolution via `createRequire`) or find the right import shape for this package/Node version.
- **Seeded corpus media still not sourced** (carried from §11 of the plan) — blocks the propagation graph builder and gives cross-case matching nothing real to match against yet.
- **Bilingual Section 63 BSA report export not built yet** — `report-preview.tsx` is still the original mock-only version; the real bilingual 9-part structure from §4 hasn't been implemented for real cases.
