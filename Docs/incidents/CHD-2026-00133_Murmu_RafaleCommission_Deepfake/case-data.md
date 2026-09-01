# Case data — CHD-2026-00133 (per `DATA_CHECKLIST.md`)

Ready to paste into `caseList` in `src/lib/mock-data.ts`. Screenshots referenced
below are in this same folder — move them into `/public/evidence/` (or
wherever `thumbnail`/`faceMatches[].avatar` paths resolve from) before wiring
up the paths.

## 1. `CaseSummary` object

```ts
{
  id: "CHD-2026-00133",
  title: "Viral video — fabricated Murmu \"Rafale losses commission\" quote",
  evidenceKind: "video",
  thumbnail: "/evidence/case-murmu-rafale-poster.jpg", // grab a poster frame from the viral clip itself
  mediaSrc: "/evidence/case-murmu-rafale.mp4",          // the viral clip, if you have a copy for the demo
  verdict: "AI_GENERATED",
  confidence: 93,
  investigator: "Raghavan",
  status: "review",
  openedAt: "2026-08-19T08:35:00Z",
  updatedRelative: "just now",
  summary:
    "Viral post attributes to President Droupadi Murmu a call to create " +
    "\"an independent commission to find out why did India lose Rafales.\" " +
    "Newschecker published a direct fact-check of this exact clip on 17 " +
    "Aug 2026, finding no such remarks anywhere in Murmu's actual speech " +
    "or transcript, with AI-detection tools flagging synthetic lip-sync " +
    "and audio artifacts. This follows a documented pattern: PIB Fact " +
    "Check (Government of India) has separately flagged a related Murmu/" +
    "Rafale deepfake (~90% AI-generated) traced to Pakistani propaganda " +
    "accounts, and Alt News previously debunked a similarly fabricated " +
    "\"India lost Rafales\" video attributed to EAM S. Jaishankar.",
}
```

## 2. Suggested `faceMatches` entries (real, for this case)

Per the checklist, `faceMatches` is currently a global/shared array. If
forked per case, these are the three real sources gathered for this
incident (`title`, `url`, `snippet`, `platform`, `confidence`, `avatar`,
`firstSeen`):

```ts
[
  {
    title: "Viral Video Of President Murmu Calling For 'Independent Inquiry Into Rafale Jet Losses' Is Doctored",
    url: "https://newschecker.in/fact-check/viral-video-of-president-murmu-calling-for-independent-inquiry-into-rafale-jet-losses-is-doctored",
    snippet: "Direct fact-check of this exact clip. Full transcript review found no mention of Rafale or any inquiry call; AI-detector flagged unnatural jaw movement.",
    platform: "Newschecker — fact-check",
    confidence: 97,
    avatar: "/evidence/murmu-01-newschecker.png",
    firstSeen: "2026-08-17",
  },
  {
    title: "Deepfake Video Alert — President Murmu / Rafale PR claim",
    url: "https://x.com/PIBFactCheck/status/1983366320482857042",
    snippet: "Government of India's official fact-check unit: related Murmu/Rafale deepfake traced to a genuine Feb 2025 clip, ~90% AI-generated, linked to Pakistani propaganda accounts.",
    platform: "PIB Fact Check — X (official GoI)",
    confidence: 95,
    avatar: "/evidence/murmu-02-pibfactcheck.png",
    firstSeen: "2025-10-29",
  },
  {
    title: "Viral video of Jaishankar 'admitting' that India lost 3 Rafales in clash with Pakistan is digitally manipulated",
    url: "https://www.altnews.in/viral-video-of-jaishankar-admitting-that-india-lost-3-rafales-in-clash-with-pakistan-is-digitally-manipulated/",
    snippet: "Same 'India lost Rafales' fabrication theme, earlier run against EAM Jaishankar with a doctored video and fake quote-tweet overlay.",
    platform: "Alt News — fact-check",
    confidence: 90,
    avatar: "/evidence/murmu-03-altnews-jaishankar.png",
    firstSeen: "2025-07-15",
  },
]
```

## 3. `fusionSignals` — suggested per-case override (optional)

```ts
[
  { label: "ML Detector", status: "critical", weight: 30, detail: "AI-detection tooling flagged unnatural lower-jaw movement / synthetic lip-sync in the viral clip." },
  { label: "Source/Transcript Match", status: "critical", weight: 26, detail: "Full review of Murmu's original speech/transcript: no mention of Rafale or any inquiry call." },
  { label: "Official Rebuttal", status: "critical", weight: 18, detail: "PIB Fact Check (Government of India) has flagged a related Murmu/Rafale deepfake as ~90% AI-generated, tied to Pakistani propaganda accounts." },
  { label: "C2PA / Provenance", status: "critical", weight: 10, detail: "No valid Content Credentials found on the viral file." },
  { label: "Pattern Match", status: "warning", weight: 10, detail: "Matches a recurring 'India lost Rafales' fabrication theme previously run against EAM Jaishankar (Alt News, Jul 2025)." },
  { label: "Protocol Plausibility", status: "warning", weight: 6, detail: "Statement would be a significant break from the President's ceremonial role; no independent corroboration of any such break." },
]
```

## 4. Notes / what's still needed for a fully wired case

- **Media file**: the actual viral `.mp4` (for `mediaSrc`) and a poster frame (`thumbnail`) — not collected in this pass; task was source verification, not evidence acquisition of the viral file itself.
- **Propagation data**: no propagation-graph screenshots gathered for this case; repeat the CHD-2026-00131 OSINT-timeline process if that's wanted.
- All three screenshots in this folder (`01_newschecker_murmu_rafale_factcheck.png`, `02_pibfactcheck_x_post.png`, `03_altnews_jaishankar_rafale_pattern.png`) are real, freshly captured via Playwright this session — not synthetic/seeded demo images.
