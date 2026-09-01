# Design.md — AI Forensic Evidence Platform (Dark Mode UI)

Design spec for the police investigator-facing web app (PS4 — AI-Generated Media Detection & Origin Tracing, evidence-workflow build). Covers visual language, layout, screens, and component states needed for the Round-1 UI prototype and demo video.

---

## 1. Design Philosophy

The product is a **command-console for investigators**, not a consumer app. Reference points: SOC/SIEM dashboards (Splunk, Palantir Gotham, CrowdStrike Falcon), airport ops-center displays, and case-management tools (Cellebrite, i2 Analyst's Notebook) — high information density, calm dark background so evidence (images/video/graphs) reads with full color fidelity, status color used sparingly and only to mean something (never decorative).

Principles:
- **Dark by default, evidence-first.** The chrome recedes; uploaded media, charts, and verdicts are the brightest things on screen.
- **Verdicts are never binary-loud.** Confidence and uncertainty are shown visually (meters, gradients), not just red/green pills — this reflects the report's stance that the AI must expose uncertainty, not overclaim.
- **Every AI output is traceable.** Any score or flag on screen must be one click from "why" (evidence source, model, timestamp) — chain-of-custody is a UI value, not just a backend feature.
- **Restraint over decoration.** No gradients-for-fun, no glow effects beyond the ones defined below for status. Judges should read this as "a tool investigators would trust," not "a hackathon demo."

---

## 2. Color System (Dark Mode)

Base surfaces use a near-black steel-grey rather than pure black or navy — pure black on an unlit demo-hall projector crushes shadow detail in evidence thumbnails, and navy-plus-blue-accent reads as generic AI-SaaS chrome rather than investigative tooling.

### Surfaces
| Token | Hex | Use |
|---|---|---|
| `bg-canvas` | `#0B0D10` | App background |
| `bg-surface` | `#14171C` | Cards, panels |
| `bg-surface-raised` | `#1A1E24` | Modals, dropdowns, popovers |
| `bg-surface-sunken` | `#07090B` | Code/log panels, evidence viewer letterbox |
| `border-subtle` | `#262B33` | Card borders, dividers |
| `border-strong` | `#383F4A` | Focused/active borders |

### Text
| Token | Hex | Use |
|---|---|---|
| `text-primary` | `#EDEEF0` | Headings, primary content |
| `text-secondary` | `#9AA1AB` | Body copy, labels |
| `text-tertiary` | `#6B7280` | Timestamps, metadata, placeholders |
| `text-disabled` | `#454B54` | Disabled controls |

### Brand / Accent
| Token | Hex | Use |
|---|---|---|
| `accent-primary` | `#C9A227` (brass/badge gold) | Primary actions, links, active nav, focus rings |
| `accent-primary-hover` | `#DDB646` | Hover state |
| `accent-dim` | `#2E2712` | Selected-row backgrounds, subtle highlights |

Brass/badge gold on steel-grey, deliberately: the earlier blue-on-navy pairing (with a violet "inconclusive" state) read as generic AI-SaaS chrome — the same blue/purple gradient every AI-wrapper dashboard uses. Gold is a real law-enforcement material (badge, insignia, hazard tape) and reads as institutional/forensic rather than startup-demo, without going full ceremonial (it's a muted brass, not a bright trophy gold, and it never appears as a gradient).

### Verdict / Status (semantic — use only for their meaning, never decoratively)
| Token | Hex | Meaning |
|---|---|---|
| `status-critical` | `#F04438` | High-confidence manipulation / fraud flag |
| `status-critical-bg` | `#2A1215` | Background wash for critical rows/badges |
| `status-warning` | `#F59E0B` | Medium confidence / needs review |
| `status-warning-bg` | `#2A2011` | — |
| `status-safe` | `#22C55E` | Low manipulation likelihood / verified authentic |
| `status-safe-bg` | `#12241A` | — |
| `status-inconclusive` | `#6B8CAE` | Inconclusive / insufficient evidence (steel-blue, deliberately distinct from red/amber/green so it isn't misread as "leaning negative" — and deliberately *not* violet, which reads as AI-chrome) |
| `status-inconclusive-bg` | `#161F28` | — |
| `status-neutral` | `#6B7280` | No analysis yet / pending |

**Rule:** the platform's verdict space is `AUTHENTIC / MANIPULATED / AI-GENERATED / INCONCLUSIVE` — the UI must always render four possible states, never collapse `INCONCLUSIVE` into a soft grey that reads as "probably fine." It gets its own color family. Note `status-warning` (`#F59E0B`, bright alert amber) and `accent-primary` (`#C9A227`, muted brass gold) are deliberately different ambers — close enough to feel like one family, distinct enough that a warning badge never gets mistaken for a primary button.

### Data-viz palette (propagation graphs, confidence charts)
`#C9A227` `#6B8CAE` `#22C55E` `#F59E0B` `#F04438` `#3F9C8B` — categorical series, no purple/violet; sequential confidence gradients run `#2E2712 → #C9A227 → #F59E0B → #F04438` (low → high manipulation confidence) so a single color ramp reads intuitively without needing a legend.

### Light-mode note
A light theme is not required for Round 1 (demo is a recorded/projected video, not a live toggle). If added later, keep the same hue relationships: light canvas `#F5F7FA`, surfaces `#FFFFFF`, same accent/status hues darkened ~10% for contrast.

---

## 3. Typography

- **UI font:** Inter (or system-ui fallback stack) — neutral, high legibility at small sizes for dense tables.
- **Monospace:** JetBrains Mono / IBM Plex Mono — for hashes, case IDs, timestamps, metadata dumps (`EXIF`, `SHA-256`), audit log entries. Anything that must look "verified/technical" is set in mono.
- **Scale:** 12 / 13 / 14 / 16 / 20 / 24 / 32px. Body defaults to 14px — this is a data-dense console, not marketing copy.
- **Weight:** 400 body, 500 labels/buttons, 600 headings. Avoid 700+ except for the single verdict headline on a case (e.g. "MANIPULATED — 91% confidence").

---

## 4. Layout Shell

```
┌───────────────────────────────────────────────────────────────────┐
│  TOP BAR: [Force crest + product name]   [Global search]  [Alerts bell]  [Investigator avatar ▾] │
├───────────┬───────────────────────────────────────────────────────┤
│           │  BREADCRUMB: Cases / CHD-2026-00124                    │
│  SIDEBAR  ├───────────────────────────────────────────────────────┤
│           │                                                       │
│  ▸ Dashboard                                                      │
│  ▸ Cases                    MAIN CONTENT AREA                     │
│  ▸ Evidence Vault                                                 │
│  ▸ Investigations                                                 │
│  ▸ Alerts                                                         │
│  ▸ Reports                                                        │
│  ▸ Audit Log                                                      │
│  ▸ Settings                                                       │
│                                                                    │
└───────────┴───────────────────────────────────────────────────────┘
```

- **Sidebar:** fixed 240px, `bg-surface`, collapses to 64px icon rail. Active item gets `accent-dim` background + 2px `accent-primary` left border — not a filled pill (filled pills feel consumer-app; a left-border indicator feels console-app).
- **Top bar:** 56px, `bg-canvas` with 1px `border-subtle` bottom edge. Global search is a command-style input (`⌘K`) for jumping to a case by ID/hash — reinforces "tool for power users."
- **Content max-width:** none — this app should feel like it uses the full display (ops-center context), unlike a marketing site. Grid gutters at 24px, card radius 8px (small, not bubbly — 8px reads "instrument panel," 16px+ reads "consumer app").
- **Elevation:** dark mode uses subtle 1px borders + very light background-lightness steps instead of drop shadows (shadows barely register on dark backgrounds) — see surface tokens above.

---

## 5. Screens

### 5.1 Dashboard (landing)
- KPI row (4 cards): **Active Alerts**, **Open Cases**, **Evidence Analyzed (30d)**, **Avg. Time to Verdict**. Each card: big mono number, small trend sparkline, label in `text-secondary`.
- **Anomaly trend chart** — line/area chart of flagged-media volume over time (`accent-primary` line, `accent-dim` fill).
- **Recent alerts table** — case ID (mono), evidence thumbnail (32×32, rounded 4px), verdict badge, confidence %, submitted-by, time (relative, e.g. "12m ago"), row click → case view.
- **Entity relationship snapshot** — small embedded graph widget teasing the propagation-graph feature (see 5.4), "View full graph →" link.

### 5.2 New Case / Upload Evidence
- Stepper header: `1 Case Details → 2 Upload Evidence → 3 Review & Submit`.
- Evidence type selector as four large tappable tiles (not a dropdown — this is the headline capability, it should be visually obvious): **Image / Video / Audio / Document**, each with an icon + one-line description.
- Upload zone: dashed `border-subtle` drop target, on drag-over switches to `accent-primary` border + `accent-dim` fill.
- Metadata sidebar auto-populates as soon as a file lands (filename, size, hash computed client-side and shown live in mono — "hashing…" spinner then `SHA-256: 9f2a...` ) — this single moment is a good demo beat: the hash appears before the investigator even clicks submit, visually reinforcing "tamper-evident from the second it enters the system."

### 5.3 Investigation View (the core screen)
Three-column layout:

```
┌──────────────┬───────────────────────────────┬──────────────────┐
│ EVIDENCE      │  ANALYSIS PIPELINE (live)     │  CASE METADATA   │
│ VIEWER        │                                │                  │
│               │  ✓ Metadata extracted          │  Case: CHD-2026- │
│ [image/video/ │  ✓ Manipulation analysis        │  00124           │
│  audio/doc    │  ✓ Provenance / C2PA check      │  Investigator:   │
│  preview]     │  ⟳ OSINT search running…        │  R. Sharma       │
│               │  ○ Propagation mapping          │  Status: Review  │
│ [manipulation │  ○ Evidence fusion               │  Opened: 2h ago  │
│  heatmap      │                                │                  │
│  overlay      │  ── VERDICT ──                  │  ── ACTIONS ──   │
│  toggle]      │  MANIPULATED                    │  [Override]      │
│               │  ▓▓▓▓▓▓▓▓░░  91% confidence      │  [Assign]        │
│               │                                │  [Export Report] │
└──────────────┴───────────────────────────────┴──────────────────┘
```

- **Evidence viewer (left):** media player/image viewer with a **heatmap toggle** switch to overlay the manipulation-localization mask (face/region highlighting) in `status-critical` at 40% opacity over the suspect region. For audio: waveform view with suspicious segments shaded `status-warning`. For documents: rendered page with suspicious text/regions boxed.
- **Analysis pipeline (center):** a vertical checklist that animates step-by-step (✓ done, ⟳ running with subtle pulsing dot, ○ pending) — this is the "Investigate" agent pipeline made visible, exactly the demo beat described in the strategy notes. Each completed step is expandable to show its raw finding (metadata table, C2PA status, OSINT hits).
- **Verdict block:** large label in the relevant status color + a horizontal confidence meter (segmented bar, not a smooth gradient — segmented reads more "instrument," smooth gradient reads more "consumer battery icon"). Below it, a **one-line "why"**: "Facial region inconsistency + no Content Credentials + 4 near-duplicate matches found."
- **Case metadata (right):** case ID (mono), assigned investigator, status pill, SLA/age, and the action set: Override verdict (human-in-the-loop), Assign to another investigator, Export Report.

### 5.4 Propagation Graph
- Full-bleed dark canvas, force-directed graph (Cytoscape.js/D3-style). Nodes = platforms/sources (icon per platform), edges = "spread to," edge labels = timestamp. Earliest node visually distinguished (`accent-primary` ring + "Earliest Known" tag). Hover a node → side panel shows source detail, first-seen date, matched hash.
- Timeline scrubber along the bottom lets the investigator "replay" propagation chronologically — strong demo moment (Telegram → X → Facebook lighting up in sequence).

### 5.5 Evidence Fusion Panel
- A horizontal "signal stack" — one row per signal (ML Detector, Metadata, C2PA, Hash Matches, OSINT/Web Evidence, Propagation), each row showing a mini status chip + weight/contribution to final verdict, converging visually into the verdict block (small connecting lines into a single node) — makes literal the "fusion, not just an ML score" pitch.

### 5.6 Reports / Export
- Clean, print-friendly **light-background** document preview even though the app itself is dark (an evidentiary PDF should look like a report, not like a dark-mode dashboard) — the one deliberate exception to the dark-mode rule. Includes case summary, evidence thumbnail, verdict + confidence, signal breakdown, propagation summary, chain-of-custody log, investigator sign-off block.

### 5.7 Audit Log
- Dense mono-font table: timestamp, actor, action (`UPLOADED`, `ANALYZED`, `VIEWED`, `OVERRIDDEN`, `EXPORTED`), evidence hash, IP/device. This screen should look deliberately "boring and complete" — the aesthetic of trustworthiness here is exhaustiveness, not visual flourish.

---

## 6. Components

- **Verdict badge:** pill, 4px radius corners→ actually rectangular with 4px radius (not fully rounded — fully-rounded pills read "tag/label," slightly-rounded rectangles read "system status"), colored per §2 status tokens, uppercase 12px label.
- **Confidence meter:** 10-segment horizontal bar, filled segments in status color, unfilled in `border-subtle`. Always paired with a numeric %.
- **Evidence thumbnail:** 4px radius, 1px `border-subtle`, small status-color dot in top-right corner (critical/warning/safe/inconclusive/neutral) so a table of thumbnails is scannable without reading text.
- **Pipeline step:** icon (✓ / ⟳ / ○) + label + optional expand chevron; connecting vertical line between steps in `border-subtle`.
- **Buttons:** primary = filled `accent-primary`, text `#FFFFFF`; secondary = 1px `border-strong` outline, transparent fill, `text-primary`; destructive (e.g. "Delete Case") = outline in `status-critical`, fills solid only on hover.
- **Empty/pending states:** never blank — always a muted icon + one line of guidance in `text-tertiary` (e.g. Propagation graph before analysis completes: "Propagation mapping will appear once OSINT search finishes").

---

## 7. Iconography & Imagery

- Line icons, 1.5px stroke, 20/24px grid (Phosphor Icons or Lucide — both have a large enough set for forensic/tech concepts: fingerprint, shield-check, git-branch for propagation, waveform, file-search).
- No stock "hacker in hoodie" or generic AI-brain-circuit imagery anywhere — undermines the credible/operational tone this whole system is going for.
- Platform-source icons (Telegram, X, Facebook, WhatsApp) used only inside the propagation graph, monochrome/desaturated to `text-secondary` so they don't compete with status colors.

---

## 8. Motion

Minimal and functional only:
- Pipeline steps animate in sequence (~150ms stagger) when a new analysis starts — this is the single "hero" animation moment for the demo video.
- Confidence meter fills with an ease-out over 400ms when a verdict resolves.
- No page-transition flourishes, no parallax, no bouncing — motion exists to show the system *thinking*, not to entertain.

---

## 9. Accessibility notes

- All status meaning is carried by color **+ text label + icon shape** (✓/⟳/○, and verdict text is always spelled out, never color-only) — critical since red/green color-blindness is common and a real deployment can't rely on hue alone.
- Minimum contrast: `text-primary` on `bg-canvas` ≈ 14:1; `text-secondary` on `bg-surface` ≈ 6:1 — both comfortably pass WCAG AA for body text.
- Focus states use a visible 2px `accent-primary` outline (dark-mode focus rings are easy to lose — this must stay high-contrast even during rapid keyboard nav in the audit log table).

---

## 10. What this design.md is for

This is the **visual/UX spec for the Round-1 UI prototype and demo video** — screens can be built as static/lightly-interactive mockups (Figma or a no-backend React shell) against this spec; no real detection model or live OSINT integration is required to hit every screen above. See `../CH26/PS4_ROUND1_STRATEGY_CHAT.md` for the underlying product/feature strategy this design implements, and `../CH26/AGENT_PS4_DEEPFAKE_REPORT.md` for the feasibility constraints this design deliberately works within (e.g. why propagation is shown against a seeded corpus, why the verdict space has four states, why chain-of-custody is a first-class screen).
