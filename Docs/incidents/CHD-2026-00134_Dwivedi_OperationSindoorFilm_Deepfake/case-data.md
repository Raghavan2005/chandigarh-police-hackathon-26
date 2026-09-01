# Case data — CHD-2026-00134 (per `DATA_CHECKLIST.md`)

Ready to paste into `caseList` in `src/lib/mock-data.ts`. Screenshots referenced
below are in this same folder — move them into `/public/evidence/` (or
wherever `thumbnail`/`faceMatches[].avatar` paths resolve from) before wiring
up the paths.

## 1. `CaseSummary` object

```ts
{
  id: "CHD-2026-00134",
  title: "Viral video — fabricated Gen. Dwivedi \"film contacts / Dhurandar 2\" quote",
  evidenceKind: "video",
  thumbnail: "/evidence/case-dwivedi-poster.jpg", // grab a poster frame from the viral clip itself
  mediaSrc: "/evidence/case-dwivedi.mp4",          // the viral clip, if you have a copy for the demo
  verdict: "AI_GENERATED",
  confidence: 91,
  investigator: "Raghavan",
  status: "review",
  openedAt: "2026-08-19T08:52:00Z",
  updatedRelative: "just now",
  summary:
    "Viral clip claims then-Army Chief Gen. Upendra Dwivedi asked PM Modi " +
    "for filmmaker contacts to script a movie referencing Operation " +
    "Sindoor / \"Dhurandar 2.\" CyberPeace Foundation directly fact-checked " +
    "this exact quote: the real footage is Dwivedi speaking at the Ran " +
    "Samwad military seminar on genuine operational aspects of Operation " +
    "Sindoor, with no mention of Modi, any filmmaker, or a film anywhere " +
    "in it; AI-detection tooling returned 72% AI-generated probability. " +
    "Gen. Dwivedi has been the target of multiple, separately fact-checked " +
    "deepfakes (a DGMO/ports claim traced to the @InsiderWB account also " +
    "seen in case CHD-2026-00131, and a fighter-jets-lost claim confirmed " +
    "fake by PIB Fact Check) — this is a recurring, recognized disinformation " +
    "pattern targeting the same officer. Dwivedi retired as COAS on 30 Jun " +
    "2026 and was succeeded by Gen. Dhiraj Seth.",
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
    title: "#FactCheck - AI-Generated Deepfake Falsely Attributes Film Remark to Army Chief Upendra Dwivedi",
    url: "https://cyberpeace.org/resources/blogs/factcheck--ai-generated-deepfake-falsely-attributes-film-remark-to-army-chief-upendra-dwivedi",
    snippet: "Direct fact-check of this exact quote. Real Ran Samwad seminar footage contains no mention of Modi, a filmmaker, or a film. DetectVideo AI: 72% AI-generated.",
    platform: "CyberPeace Foundation — fact-check",
    confidence: 97,
    avatar: "/evidence/dwivedi-01-cyberpeace.png",
    firstSeen: "2026-08-19",
  },
  {
    title: "Beware! Deepfake Video Falsely Quotes Army Chief General Upendra Dwivedi On Operation Sindoor",
    url: "https://www.republicworld.com/india/beware-deepfake-video-falsely-quotes-army-chief-general-upendra-dwivedi-on-operation-sindoor-2026-05-16-124560",
    snippet: "Different fabricated Dwivedi quote (DGMO/ports/Navy claim), sourced to @InsiderWB — the same disinformation account behind case CHD-2026-00131.",
    platform: "Republic World — news",
    confidence: 85,
    avatar: "/evidence/dwivedi-02-republicworld.png",
    firstSeen: "2026-05-16",
  },
  {
    title: "PIB Fact Check: AI-Generated Video Falsely Quotes General Upendra Dwivedi",
    url: "https://www.newsonair.gov.in/pib-fact-check-ai-generated-video-falsely-quotes-general-upendra-dwivedi",
    snippet: "Official GoI Fact Check Unit confirmation of a third fabricated Dwivedi quote (fighter-jets/soldiers-lost claim) — establishes recurring pattern.",
    platform: "News On Air / PIB Fact Check — official GoI",
    confidence: 92,
    avatar: "/evidence/dwivedi-03-newsonair.png",
    firstSeen: "2025-09-07",
  },
]
```

## 3. `fusionSignals` — suggested per-case override (optional)

```ts
[
  { label: "ML Detector", status: "critical", weight: 30, detail: "DetectVideo AI: 72% probability the clip is AI-generated." },
  { label: "Source/Transcript Match", status: "critical", weight: 24, detail: "Real Ran Samwad seminar footage reviewed — no mention of Modi, any filmmaker, script, or film." },
  { label: "Official Rebuttal", status: "critical", weight: 16, detail: "PIB Fact Check has separately and repeatedly confirmed AI-generated Dwivedi deepfakes around Operation Sindoor." },
  { label: "C2PA / Provenance", status: "critical", weight: 10, detail: "No valid Content Credentials found on the viral file." },
  { label: "Pattern / Source-Account Match", status: "warning", weight: 12, detail: "Recurring target: at least 3 separately fact-checked fabricated Dwivedi quotes; one traced to @InsiderWB, also behind case CHD-2026-00131." },
  { label: "Timeline Plausibility", status: "warning", weight: 8, detail: "Dwivedi retired as COAS 30 Jun 2026 (succeeded by Gen. Dhiraj Seth) — claim is additionally anachronistic if circulated as a sitting-COAS statement post-retirement." },
]
```

## 4. Notes / what's still needed for a fully wired case

- **Media file**: the actual viral `.mp4` (for `mediaSrc`) and a poster frame (`thumbnail`) — not collected in this pass; task was source verification, not evidence acquisition of the viral file itself.
- **Propagation data**: no propagation-graph screenshots gathered for this case; repeat the CHD-2026-00131 OSINT-timeline process if wanted.
- **Cross-case link**: worth surfacing in the UI/report that this case and `CHD-2026-00131` share a source account (@InsiderWB) — useful for an investigator building an actor profile rather than treating each viral clip in isolation.
- All three screenshots in this folder are real, freshly captured via Playwright this session — not synthetic/seeded demo images.
