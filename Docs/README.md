# Docs/

Documentation and case evidence for the Chandigarh Police Hackathon'26 PS4 project. No source code lives here — see `../police-evidence-platform/` for the app.

## `CH26/` — problem-statement selection phase (historical)

The research the team did before picking a track: the official brochure, all six Track PDFs, six independent specialist evaluation reports (one per problem statement, each with a FACT/SOURCE-BACKED/INFERENCE/PROPOSED-SOLUTION evidence legend and a 1–10 scorecard), and a master report synthesizing all six into a final recommendation.

The master report's recommendation was **PS5**; the team's actual, current track is **PS4** (see root `README.md` and `CLAUDE.md` for why). Read `CH26/` for context on how every track was scored, not as the live plan.

## `incidents/` — PS4 case dossiers

Real-world deepfake/misinformation incidents documented as demo evidence for the PS4 platform. Each subfolder is one case: a write-up (`case-data.md` or `INCIDENT_DOCUMENTATION_*.md`) plus the source screenshots/video that back up the fact-check. These feed the `police-evidence-platform/` prototype's seeded case data (see `police-evidence-platform/DATA_CHECKLIST.md`).

Current cases:
- `CHD-2026-00133_Murmu_RafaleCommission_Deepfake/`
- `CHD-2026-00134_Dwivedi_OperationSindoorFilm_Deepfake/`
- `INCIDENT_DOCUMENTATION_ModiNetanyahu_FakeQuote/` (also has `VIDEO_SCRIPT_PS4.md` — the demo video script built around this case)

## `Shortlisted Teams - Chandigarh Police Hackathon.md`

Official Round-1 results across all six tracks. Confirms the team (`PS4-AIMD-43`, "EmptyRoad", Rajalakshmi Engineering College) is shortlisted under PS4.

## `detailed_project_report.md`

The full PS4 solution writeup: problem statement, proposed solution, current prototype features, and target MVP deliverables. This is the source of truth for "what are we building and why" — read it before `police-evidence-platform/`'s own docs for product context.
