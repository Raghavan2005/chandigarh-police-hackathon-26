# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a workspace for a student team competing in the **Chandigarh Police Hackathon'26** (organized by Chandigarh Police with UIET Panjab University and PEC Chandigarh). It contains two kinds of content:

- **`Docs/`** — research, decision-support material, and case dossiers. No source code, build system, or test suite here.
- **`police-evidence-platform/`** — the actual application: a Next.js prototype implementing **PS4 (AI-Generated Media Detection & Cross-Platform Origin Tracing)**. It has its own `CLAUDE.md`/`AGENTS.md` governing conventions inside it; treat it as a separate project.

**Current track:** the team is building for **PS4**, evidenced by `Docs/Plan/PS4_MVP_BUILD_PLAN.md` and the `police-evidence-platform/` app. This supersedes the original PS5 recommendation in `Docs/CH26/MASTER_HACKATHON_PS_SELECTION_REPORT.md` (see below) — that report is kept as a historical record of the selection process, not as the live decision.

## File organization rules

- All documentation, research, and case-file content lives under `Docs/` — never save a new `.md`, `.pdf`, screenshot, or report loose at the repository root.
- `Docs/Plan/` holds the live PS4 MVP build plan and its status tracker — see below.
- `Docs/CH26/` holds the PS-selection research phase (brochure, track PDFs, specialist reports, master report). New track/PS research or scoring documents belong here.
- `Docs/incidents/` holds individual incident dossiers (one folder per case, named after the case, containing its `case-data.md`/`INCIDENT_DOCUMENTATION_*.md` plus supporting screenshots/videos). New incident write-ups get their own subfolder here, not a loose folder at root.
- `Docs/detailed_project_report.md` is the top-level project report; keep report-style docs that aren't tied to one case or track directly under `Docs/`.
- `police-evidence-platform/` is out of scope for these rules — it's real app code with its own structure and its own `CLAUDE.md`/`AGENTS.md`.

## `Docs/Plan/` — live PS4 build plan (active, not historical)

- `PS4_MVP_BUILD_PLAN.md` — the master plan: MVP-ready definition, architecture, detection model, data model (incl. the coverage-aware Evidence Fusion algorithm), API surface, team split, risks, phased schedule (Phase 0–5), phase-completion workflow, judging-criteria alignment, and open questions. Update this in place as scope decisions change — don't fork a new version.
- `PS4_BUILD_STATUS.md` — the phase-by-phase status tracker; single source of truth for "where are we." Update per the workflow in the plan's own §9, after each phase's review/push, not before. Check this file before starting new work instead of re-deriving status from git log or chat history — it also documents *why* specific engineering/scope decisions were made (e.g. why the seeded corpus is illustrative demo data, why the propagation graph was rebuilt from real matches instead of curated fake spread data), which is closer to "why this was built this way" than anything else in the repo.

## `Docs/CH26/` — PS-selection research (historical)

- `Chandigarh Police Hackathon Brochure.pdf` — the official event brochure (event calendar, prize structure, team-size rules, six problem statements).
- `Track 1 Documentation.pdf` … `Track 6 Documenation.pdf` (note: file 3 is misspelled "Documenation" — match it exactly, don't rename) — the six official problem-statement briefs, one per track.
- `AGENT_PS1_SRTK_REPORT.md` … `AGENT_PS6_CDR_BANK_SOCIAL_REPORT.md` — six independent specialist evaluation reports, one per problem statement (PS1 SRTK drug spot-test kit, PS2 DNAK bovine DNA kit, PS3 DWID darknet drug intelligence, PS4 AIMD AI-media/deepfake detection, PS5 CFTA crypto flow tracking, PS6 DFAP CDR/bank/social fusion analytics). Each follows the same structure: verbatim source verification against its Track PDF, a tagged evidence legend (**FACT** / **SOURCE-BACKED OBSERVATION** / **INFERENCE** / **PROPOSED SOLUTION**), feasibility analysis, a 1–10 scorecard, reference verification, and a GREEN/YELLOW/RED verdict.
- `MASTER_HACKATHON_PS_SELECTION_REPORT.md` — a cross-track synthesis of all six specialist reports: comparison matrix, weighted scoring, the team's original problem-statement recommendation (PS5, with PS3 as fallback), MVP scope, architecture, roadmap, demo strategy, and simulated judge Q&A. **Note:** the team has since moved forward with PS4 instead — see "Current track" above.

## `Docs/incidents/` — PS4 case dossiers

Each subfolder is a documented incident used as evidence/test material for the PS4 platform (e.g. deepfake or fact-check cases), containing a `case-data.md` or `INCIDENT_DOCUMENTATION_*.md` write-up plus supporting screenshots/video.

## Commit conventions

- Do not add any AI/assistant co-author or attribution line (e.g. `Co-Authored-By: Claude ...`, session links) to commit messages in this repo. Commit messages should read as if written by the team, with no signature indicating an AI made the change.

## Working in `Docs/`

- There are no build/lint/test commands for `Docs/` content — do not invent or guess at any (no `npm`, `pip`, `make`, etc. apply here). For build/lint/test commands, see `police-evidence-platform/CLAUDE.md`.
- When asked to add or extend a `CH26/` report, follow the existing evidence-tagging convention (**FACT** / **SOURCE-BACKED OBSERVATION** / **INFERENCE** / **PROPOSED SOLUTION**) already used consistently across every `AGENT_PS*_REPORT.md` and the master report — don't state a claim as fact unless it's independently verifiable.
- The PDFs are primary sources; the `.md` reports are secondary analysis verified against them. If a report's claim needs re-checking, verify it against the corresponding `Track N Documentation.pdf` or the brochure PDF directly rather than trusting the summary alone.
- Key hard deadlines referenced throughout the reports (verify against the brochure before relying on them, as dates may be updated): Round-1 pitch deck + video submission 20 Aug 2026; results 25 Aug 2026; pre-hack prep 25 Aug–7 Sep 2026; 24-hour offline build 8 Sep 2026; Grand Finale 9 Sep 2026 in Chandigarh.
