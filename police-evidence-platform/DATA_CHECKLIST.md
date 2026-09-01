# Data checklist — what each page needs

All content in this prototype is seeded from `src/lib/mock-data.ts`. There
are two kinds of data:

- **Per-case** — lives on a `CaseSummary` object in `caseList`. Swap this in
  freely per case (title, media file, verdict, etc.).
- **Global/shared** — one array reused by *every* case's investigation page
  (`pipelineSteps`, `fusionSignals`, `propagationNodes`/`propagationEdges`,
  `faceMatches`, `auditLog`, `kpis`). Only the hero case
  (`CHD-2026-00124`) and the Modi–Netanyahu case (`CHD-2026-00131`) were
  written with these in mind — every other case reuses the same shared
  pipeline/fusion/propagation/face-match content. If you want a case to
  tell its own story end-to-end, either edit these shared arrays per demo
  run, or (bigger change) make them per-case.

---

## 1. Case object (`CaseSummary`, per case)

Every case needs these fields — this is the one truly per-case data shape.

| Field | Type | Example | Used on |
|---|---|---|---|
| `id` | string | `"CHD-2026-00131"` | everywhere |
| `title` | string | `"Viral video — fabricated Modi–Netanyahu warning quote"` | everywhere |
| `evidenceKind` | `image \| video \| audio \| document` | `"video"` | drives which media viewer renders |
| `thumbnail` | image path | `/evidence/case-modi-netanyahu-poster.jpg` | case list, dashboard, reports, face-match "extracted" crop |
| `mediaSrc` | video/audio path (optional) | `/evidence/case-modi-netanyahu.mp4` | falls back to the hero's file if omitted |
| `verdict` | `AUTHENTIC \| MANIPULATED \| AI_GENERATED \| INCONCLUSIVE` | `"MANIPULATED"` | verdict badge, panel, report |
| `confidence` | number 0–100 | `89` | verdict panel, report |
| `investigator` | string | `"Raghavan"` | case meta, audit trail text |
| `status` | `new \| analyzing \| review \| closed` | `"review"` | case meta, list |
| `openedAt` | ISO date string | `"2026-08-19T13:31:00Z"` | not currently displayed directly |
| `updatedRelative` | string | `"10m ago"` | case list, "Opened" row |
| `summary` | string (optional) | one-paragraph case narrative | shown under the title on the investigation page |

**Screenshot/text needed to fill this in for a new real case:** the media
file itself (image/video/audio/PDF), a title, a one-paragraph summary of
what's being investigated, and a verdict you're prepared to defend on
camera.

---

## 2. Dashboard (`/`)

| Section | Data | File |
|---|---|---|
| KPI row (4 tiles) | label, value, 12-point trend array, delta text | `kpis` in mock-data.ts |
| Anomaly trend chart | 16-point line array + week labels | hardcoded in `anomaly-trend-chart.tsx` (`DATA`, `LABELS`) |
| Relationship snapshot (mini graph) | 6 fixed nodes/edges, links to hero case's propagation page | hardcoded in `relationship-snapshot.tsx` |
| Recent alerts table | case list (currently filtered to just the hero case) | `RecentAlertsTable`, reads `caseList` |

**To change:** KPI numbers/trend are pure text edits. The anomaly chart and
relationship snapshot are decorative/static — no screenshots needed, just
plausible numbers if you want them to match a story.

---

## 3. Cases list (`/cases`)

Same `RecentAlertsTable` as the dashboard — same data, same filter (one
case shown). No page-specific data.

---

## 4. New Case / Upload (`/cases/new`)

| Element | Data | Notes |
|---|---|---|
| Evidence type tiles | static (image/video/audio/document labels) | no per-case data |
| Upload dropzone | `fileName`, `fileMeta` props (defaults: `viral_clip.mp4`, `MP4 · 24.6 MB · 00:42`), fake SHA-256 | cosmetic only — nothing is actually uploaded/stored |
| Confirmation step | shows `Raghavan (you)` as investigator | hardcoded text in `src/app/cases/new/page.tsx` |

**Nothing required here** unless you want the placeholder filename to match
whatever you're about to "upload" on camera.

---

## 5. Investigation page (`/cases/[caseId]`)

### 5a. Evidence viewer (per case)
- Video: `mediaSrc` (or default) + `thumbnail` as poster
- Image/Document: `thumbnail` only
- Audio: fixed file (`/evidence/case-audio.mp3`) — not yet per-case
- Heatmap overlay box text ("facial region · 0.91") is **hardcoded**, same
  for every case — only makes sense for MANIPULATED/AI_GENERATED verdicts

### 5b. Analysis pipeline panel (global, shared by all cases)
6 steps, each with: label, one-line detail, duration (ms), and a metrics
list (label/value pairs). Lives in `pipelineSteps` in mock-data.ts.
Example — the "Metadata extracted" step's metrics: Container, Resolution,
Encoder signature, SHA-256.

**To make a case's pipeline tell its own story** (e.g. show this specific
video's real resolution/hash, or a different manipulation score), you'd
edit these metric values per demo take, or fork the array per case.

### 5c. Face match — OSINT search panel (global, shown for video/image cases)
`faceMatches` array — 4 entries, each: `title`, `url`, `snippet`,
`platform`, `confidence`, `avatar` (image path), `firstSeen`. Uses the
case's own `thumbnail` as the "extracted face" crop, but the 4 match
results themselves are the same for every case.

**Real screenshots that would slot in here well:** the actual source posts
you found (e.g. the `@InsiderWB` X profile, BOOM Live fact-check, WION News
article) — each becomes one `faceMatches` entry with a real thumbnail.

### 5d. Verdict panel (per case)
Just reads `caseData.verdict` + `caseData.confidence`. No extra data
needed.

### 5e. Case metadata panel (per case)
Reads `id`, `investigator`, `status`, `updatedRelative`, `evidenceKind`
directly off the case object — nothing extra.

### 5f. Evidence Fusion tab (global, shared)
`fusionSignals` — 6 entries, each: `label`, `status`
(critical/warning/safe/neutral), `weight` (0–100), `detail` text. Same
signals shown for every case regardless of verdict.

---

## 6. Propagation graph (`/cases/[caseId]/propagation`)

Global, shared by all cases: `propagationNodes` (6 entries — `label`,
`platform`, `timestamp`, `url`, `views`, `screenshot` image path,
`isEarliest`) and `propagationEdges` (`from`/`to`/time-delta `label`).

**Real data that fits well here:** for each place the content actually
surfaced (Telegram channel, X repost, Facebook share, etc.) — a URL, a
screenshot, a view/engagement count, and a timestamp, in chronological
order.

---

## 7. Report / Export (`/cases/[caseId]/report`)

Pulls together `caseData` + `fusionSignals` + `propagationNodes` +
`auditLog` into a printable letterhead document. No new data beyond what's
already listed above, except:

`auditLog` (global, shared) — 6 entries, each: `timestamp`, `actor`,
`action` (UPLOADED/ANALYZED/VIEWED/OVERRIDDEN/EXPORTED/ASSIGNED),
`evidenceHash`, `device`. Currently the same chain-of-custody trail is
shown on every case's report.

---

## Quick summary — what to gather per new real case

1. The media file itself (video/image/audio/PDF) + a good poster frame if video.
2. Title + one-paragraph summary.
3. Verdict + confidence you can justify.
4. (Optional, for a fully bespoke case) real source screenshots for: OSINT
   face-match results, propagation timeline, and pipeline metric values —
   otherwise it'll reuse the same shared mock content every other case uses.
