# Task — Phase 3 UI state audit

**Assigned to:** pfgctrl07
**Status:** done — see `PS4_BUILD_STATUS.md`'s Phase 3 row for the full findings/fixes list
**Source:** `PS4_MVP_BUILD_PLAN.md` §1 Phase 3 — "Loading/empty/error/success state audit across all screens (per `CLAUDE.md` UI rules)."

## What to do

Go through every screen in `police-evidence-platform/` and verify it correctly handles all four states below, per the UI rules in `police-evidence-platform/CLAUDE.md` §7:

- **Loading** — while data is being fetched/computed (e.g. Investigate running, PDF rendering).
- **Empty** — no data yet (e.g. a new case with no evidence, a case with no audit entries, no cross-case matches).
- **Error** — a request failed (e.g. investigate fails because the ML service is down, override fails validation, PDF export fails because Chrome isn't found).
- **Success** — the normal case with real data.

For each screen, note what's already handled correctly and what's missing. Don't guess — click through it live against the running dev server (`npm run dev` in `police-evidence-platform/`) and actually trigger each state (e.g. stop the ML service to see the real error state, not just assume the code looks right).

## Screens to check

- `/` — dashboard (KPIs, flagged-media chart, relationship snapshot, recent alerts)
- `/cases` — case list
- `/cases/new` — case creation + evidence upload flow
- `/cases/[caseId]` — case detail (evidence cards, Investigate button, override dialog)
- `/cases/[caseId]/report` — bilingual report (JSON export, PDF export)
- `/cases/[caseId]/propagation` — cross-case & corpus matches
- `/audit` — global audit log (admin-only — also check the non-admin "access required" state)
- `/login`

## Ground rules (per root `CLAUDE.md` and `police-evidence-platform/CLAUDE.md`)

- Never fake data — if a state is genuinely hard to trigger for real, say so rather than mocking it.
- Test against the real running server, not just by reading the code.
- Keep changes focused — this is a state-handling audit, not a redesign.
- Update `PS4_BUILD_STATUS.md` with what you find/fix, following its existing per-phase format.
- Commit with a clear message, no AI co-author line (see root `CLAUDE.md` → Commit conventions).

## Reference

- `Docs/Plan/PS4_MVP_BUILD_PLAN.md` — full build plan
- `Docs/Plan/PS4_BUILD_STATUS.md` — current status, phase by phase
