import type {
  AuditEntry,
  CaseSummary,
  FaceMatch,
  FusionSignal,
  KpiDatum,
  PipelineStepDef,
  PropagationEdge,
  PropagationNode,
} from "@/lib/types";

/**
 * All data on this page is seeded/synthetic for demo purposes.
 * No real case, subject, or evidence data — see design.md §9 (Accessibility)
 * and the legal-safeguards note in CH26/PS4_ROUND1_STRATEGY_CHAT.md.
 */

export const FEATURED_CASE_ID = "CHD-2026-00131";

export const caseList: CaseSummary[] = [
  {
    id: "CHD-2026-00124",
    title: "Viral video — public official statement",
    evidenceKind: "video",
    thumbnail: "/evidence/case-video-poster.jpg",
    verdict: "MANIPULATED",
    confidence: 91,
    investigator: "Raghavan",
    status: "review",
    openedAt: "2026-08-19T06:10:00Z",
    updatedRelative: "12m ago",
  },
  {
    id: "CHD-2026-00119",
    title: "Instagram reel — celebrity endorsement",
    evidenceKind: "image",
    thumbnail: "/evidence/case-image-evidence.jpg",
    verdict: "AUTHENTIC",
    confidence: 96,
    investigator: "N. Kaur",
    status: "closed",
    openedAt: "2026-08-18T11:40:00Z",
    updatedRelative: "1d ago",
  },
  {
    id: "CHD-2026-00121",
    title: "WhatsApp forward — voice note",
    evidenceKind: "audio",
    thumbnail: "/evidence/thumb-1011.jpg",
    verdict: "INCONCLUSIVE",
    confidence: 54,
    investigator: "A. Verma",
    status: "analyzing",
    openedAt: "2026-08-18T15:05:00Z",
    updatedRelative: "6h ago",
  },
  {
    id: "CHD-2026-00117",
    title: "Scanned government order — Sector 45",
    evidenceKind: "document",
    thumbnail: "/evidence/thumb-1027.jpg",
    verdict: "AI_GENERATED",
    confidence: 88,
    investigator: "Raghavan",
    status: "review",
    openedAt: "2026-08-17T09:20:00Z",
    updatedRelative: "2d ago",
  },
  {
    id: "CHD-2026-00113",
    title: "X post — flood footage",
    evidenceKind: "video",
    thumbnail: "/evidence/thumb-342.jpg",
    verdict: "AUTHENTIC",
    confidence: 92,
    investigator: "N. Kaur",
    status: "closed",
    openedAt: "2026-08-15T08:00:00Z",
    updatedRelative: "4d ago",
  },
  {
    id: FEATURED_CASE_ID,
    title: "Viral video — fabricated Modi–Netanyahu warning quote",
    evidenceKind: "video",
    thumbnail: "/evidence/case-modi-netanyahu-poster.jpg",
    mediaSrc: "/evidence/case-modi-netanyahu.mp4",
    verdict: "MANIPULATED",
    confidence: 89,
    investigator: "Raghavan",
    status: "review",
    openedAt: "2026-08-19T13:31:00Z",
    updatedRelative: "10m ago",
    summary:
      "Video circulated with a fabricated quote attributed to PM Modi warning Netanyahu about a Saudi-Turkey-Pakistan alliance. Flagged for manipulation analysis after viral spread from an account (@InsiderWB) with a documented history of fabricated Modi/Netanyahu content — no ministry or credible outlet has recorded the statement.",
    verdictExplanation:
      "No official or credible-outlet record of the statement + source account (@InsiderWB) has a documented history of fabricated Modi/Netanyahu content + contradicts the one real, on-record Modi–Netanyahu exchange from this period (a routine strategic-partnership call).",
  },
  {
    id: "CHD-2026-00134",
    title: "Viral video — fabricated Gen. Dwivedi \"film contacts / Dhurandar 2\" quote",
    evidenceKind: "video",
    thumbnail: "/evidence/case-dwivedi-poster.jpg",
    mediaSrc: "/evidence/case-dwivedi.mp4",
    verdict: "MANIPULATED",
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
  },
];

export const pipelineSteps: PipelineStepDef[] = [
  {
    id: "metadata",
    label: "Metadata extracted",
    detail:
      "EXIF, container metadata, and encoder signature read from the uploaded file.",
    durationMs: 14600,
    metrics: [
      { label: "Container", value: "MP4 (ISO BMFF)" },
      { label: "Resolution", value: "1920×1080 @ 29.97fps" },
      { label: "Encoder signature", value: "Adobe Premiere Pro 2026" },
      { label: "SHA-256", value: "9f2a7c…e41b" },
    ],
  },
  {
    id: "manipulation",
    label: "Manipulation analysis",
    detail:
      "Multi-modal detection engine scores frames for facial-region and temporal artifacts.",
    durationMs: 22500,
    metrics: [
      { label: "Frames analyzed", value: "300 / 300" },
      { label: "Facial-region artifact score", value: "91%" },
      { label: "Temporal consistency", value: "62%" },
      { label: "GAN fingerprint match", value: "78%" },
    ],
  },
  {
    id: "provenance",
    label: "Provenance / C2PA check",
    detail: "Checked for valid Content Credentials and signing chain.",
    durationMs: 11800,
    metrics: [
      { label: "C2PA manifest found", value: "No" },
      { label: "Signing chain", value: "Unverified" },
      { label: "Editing tool declared", value: "None" },
    ],
  },
  {
    id: "osint",
    label: "OSINT search running",
    detail:
      "Investigation agent queries reverse-search and evidence-database tools for matches.",
    durationMs: 19200,
    metrics: [
      { label: "Engines queried", value: "6" },
      { label: "Total hits", value: "14" },
      { label: "Candidate matches", value: "4" },
    ],
  },
  {
    id: "propagation",
    label: "Propagation mapping",
    detail: "Matches ordered by first-seen timestamp into a spread graph.",
    durationMs: 16200,
    metrics: [
      { label: "Earliest sighting", value: "Telegram · 05:12 IST" },
      { label: "Platforms matched", value: "4" },
      { label: "Spread window", value: "51 min" },
    ],
  },
  {
    id: "fusion",
    label: "Evidence fusion",
    detail: "All signals weighted into a single explainable verdict.",
    durationMs: 10800,
    metrics: [
      { label: "Signals combined", value: "6" },
      { label: "Final confidence", value: "91%" },
      { label: "Verdict", value: "MANIPULATED" },
    ],
  },
];

export const fusionSignals: FusionSignal[] = [
  {
    id: "ml-detector",
    label: "ML Detector",
    status: "critical",
    weight: 34,
    detail: "91% manipulation probability; facial-region inconsistency flagged.",
  },
  {
    id: "metadata",
    label: "Metadata",
    status: "warning",
    weight: 18,
    detail: "Editing software signature detected (Adobe Premiere Pro 2026).",
  },
  {
    id: "c2pa",
    label: "C2PA / Provenance",
    status: "critical",
    weight: 16,
    detail: "No valid Content Credentials found on the file.",
  },
  {
    id: "hash-matches",
    label: "Hash Matches",
    status: "warning",
    weight: 14,
    detail: "4 near-duplicate matches found in the seeded evidence corpus.",
  },
  {
    id: "osint",
    label: "OSINT / Web Evidence",
    status: "neutral",
    weight: 10,
    detail: "3 supporting mentions found via authorized search tools.",
  },
  {
    id: "propagation",
    label: "Propagation",
    status: "warning",
    weight: 8,
    detail: "Spread across 3 platforms within 46 minutes of earliest sighting.",
  },
];

/** Per-case overrides for `fusionSignals` — falls back to the generic array above when absent. */
export const fusionSignalsByCase: Record<string, FusionSignal[]> = {
  "CHD-2026-00131": [
    {
      id: "source-history",
      label: "Source track record",
      status: "critical",
      weight: 30,
      detail:
        "@InsiderWB has a documented history of fabricated Modi/Netanyahu content (BOOM Live fact-check, Feb 2026).",
      evidence: "/evidence/modi-source-boomlive.png",
      evidenceCaption: "BOOM Live — prior fact-check ties fabricated content to @InsiderWB",
    },
    {
      id: "official-corroboration",
      label: "Official corroboration",
      status: "critical",
      weight: 28,
      detail:
        "No MEA, government, or credible outlet has recorded the statement — MEA was actively fact-checking an adjacent claim in this exact news cycle.",
      evidence: "/evidence/modi-source-wionews.png",
      evidenceCaption: "WION News — MEA Fact Check unit activity, same news cycle",
    },
    {
      id: "event-consistency",
      label: "Consistency with real event",
      status: "warning",
      weight: 20,
      detail:
        "Contradicts the one real, on-record Modi–Netanyahu exchange from this period — a routine Strategic Partnership phone call, not a warning.",
      evidence: "/evidence/modi-source-wionews.png",
      evidenceCaption: "WION News — confirms the only real Modi–Netanyahu contact was a routine call",
    },
    {
      id: "evidentiary-weight",
      label: "Post's evidentiary weight",
      status: "warning",
      weight: 12,
      detail:
        "Text quote only, no primary source or transcript; background video is unrelated Red Fort speech footage, not footage of the claimed remarks.",
      evidence: "/evidence/case-modi-netanyahu-poster.jpg",
      evidenceCaption: "The evidence video itself — genuine Red Fort speech footage, no on-screen quote overlay",
    },
    {
      id: "account-authenticity",
      label: "Account authenticity",
      status: "neutral",
      weight: 10,
      detail:
        "Wayback Machine confirms the account is real, crawled 5 times between Aug–Dec 2025 — access-restricted, not a fabricated persona.",
      evidence: "/evidence/modi-source-wayback.png",
      evidenceCaption: "Wayback Machine — InsiderWB crawl history, 13 Aug–21 Dec 2025",
    },
  ],
  "CHD-2026-00134": [
    { id: "ml-detector", label: "ML Detector", status: "critical", weight: 30, detail: "DetectVideo AI: 72% probability the clip is AI-generated." },
    { id: "source-match", label: "Source/Transcript Match", status: "critical", weight: 24, detail: "Real Ran Samwad seminar footage reviewed — no mention of Modi, any filmmaker, script, or film." },
    { id: "official-rebuttal", label: "Official Rebuttal", status: "critical", weight: 16, detail: "PIB Fact Check has separately and repeatedly confirmed AI-generated Dwivedi deepfakes around Operation Sindoor." },
    { id: "c2pa", label: "C2PA / Provenance", status: "critical", weight: 10, detail: "No valid Content Credentials found on the viral file." },
    { id: "pattern-match", label: "Pattern / Source-Account Match", status: "warning", weight: 12, detail: "Recurring target: at least 3 separately fact-checked fabricated Dwivedi quotes; one traced to @InsiderWB, also behind case CHD-2026-00131." },
    { id: "timeline", label: "Timeline Plausibility", status: "warning", weight: 8, detail: "Dwivedi retired as COAS 30 Jun 2026 (succeeded by Gen. Dhiraj Seth) — claim is additionally anachronistic if circulated as a sitting-COAS statement post-retirement." },
  ],
};

export const propagationNodes: PropagationNode[] = [
  {
    id: "origin",
    label: "Earliest known upload",
    platform: "telegram",
    timestamp: "2026-08-19 05:12 IST",
    isEarliest: true,
    url: "t.me/regionalupdatetv/4821",
    views: 640,
    screenshot: "/evidence/thumb-1011.jpg",
  },
  {
    id: "n2",
    label: "Forwarded — regional group",
    platform: "telegram",
    timestamp: "2026-08-19 05:24 IST",
    url: "t.me/sector45community/1122",
    views: 2100,
    screenshot: "/evidence/thumb-342.jpg",
  },
  {
    id: "n3",
    label: "Reposted with caption",
    platform: "x",
    timestamp: "2026-08-19 05:41 IST",
    url: "x.com/publicfigurearchive/status/1958234017",
    views: 8400,
    screenshot: "/evidence/thumb-1027.jpg",
  },
  {
    id: "n4",
    label: "Quote-posted, 12K views",
    platform: "x",
    timestamp: "2026-08-19 05:53 IST",
    url: "x.com/newsdesklive/status/1958241390",
    views: 12000,
    screenshot: "/evidence/case-image-evidence.jpg",
  },
  {
    id: "n5",
    label: "Shared to public page",
    platform: "facebook",
    timestamp: "2026-08-19 05:58 IST",
    url: "facebook.com/districtpublicupdates/videos/98213",
    views: 24500,
    screenshot: "/evidence/thumb-1011.jpg",
  },
  {
    id: "n6",
    label: "Cross-posted, viral spread",
    platform: "whatsapp",
    timestamp: "2026-08-19 06:03 IST",
    url: "chat.whatsapp.com/forward/9e21c",
    views: 41000,
    screenshot: "/evidence/thumb-342.jpg",
  },
];

export const propagationEdges: PropagationEdge[] = [
  { from: "origin", to: "n2", label: "+12m" },
  { from: "n2", to: "n3", label: "+17m" },
  { from: "n3", to: "n4", label: "+12m" },
  { from: "n4", to: "n5", label: "+5m" },
  { from: "n3", to: "n6", label: "+22m" },
];

/** Per-case overrides for `propagationNodes`/`propagationEdges` — falls back to the generic arrays above when absent. */
export const propagationNodesByCase: Record<string, PropagationNode[]> = {
  "CHD-2026-00131": [
    {
      id: "boom-live",
      label: "Prior fact-check — Modi/Netanyahu deepfake pattern",
      platform: "news",
      timestamp: "2026-02-27",
      isEarliest: true,
      url: "boomlive.in/fact-check/viral-videos-prime-minister-modi-netanyahu-announcing-financial-aid-afghanistan-claim-fact-check-30755",
      views: 0,
      screenshot: "/evidence/modi-source-boomlive.png",
    },
    {
      id: "mea-factcheck",
      label: "MEA Fact Check debunks adjacent claim (same news cycle)",
      platform: "news",
      timestamp: "2026-08-07",
      url: "wionews.com/world/fake-news-mea-rejects-report-claiming-india-sought-defence-pact-with-israel",
      views: 0,
      screenshot: "/evidence/modi-source-wionews.png",
    },
    {
      id: "viral-post",
      label: "Fabricated quote posted by @InsiderWB",
      platform: "x",
      timestamp: "2026-08-15 22:20 IST",
      url: "x.com/InsiderWB",
      views: 2115,
      screenshot: "/evidence/case-modi-netanyahu-poster.jpg",
    },
    {
      id: "wayback-check",
      label: "Wayback Machine confirms account is real (archived 5×)",
      platform: "public-record",
      timestamp: "2026-08-19",
      url: "web.archive.org/web/*/x.com/InsiderWB",
      views: 0,
      screenshot: "/evidence/modi-source-wayback.png",
    },
    {
      id: "x-profile-check",
      label: 'Live profile check — account inaccessible ("doesn\'t exist")',
      platform: "x",
      timestamp: "2026-08-19",
      url: "x.com/InsiderWB",
      views: 0,
      screenshot: "/evidence/modi-source-x-profile.png",
    },
  ],
  "CHD-2026-00134": [
    {
      id: "dwivedi-pib",
      label: "PIB Fact Check — Prior deepfake pattern established",
      platform: "news",
      timestamp: "2025-09-07",
      isEarliest: true,
      url: "newsonair.gov.in/pib-fact-check",
      views: 0,
      screenshot: "/evidence/dwivedi-03-newsonair.png",
    },
    {
      id: "dwivedi-republic",
      label: "Republic World — Second deepfake incident",
      platform: "news",
      timestamp: "2026-05-16",
      url: "republicworld.com/india/beware-deepfake-video",
      views: 0,
      screenshot: "/evidence/dwivedi-02-republicworld.png",
    },
    {
      id: "dwivedi-viral",
      label: "Viral post — Operation Sindoor deepfake",
      platform: "x",
      timestamp: "2026-08-19 08:30 IST",
      url: "x.com/viral-dwivedi-deepfake",
      views: 14500,
      screenshot: "/evidence/case-dwivedi-poster.jpg",
    },
    {
      id: "dwivedi-cyberpeace",
      label: "CyberPeace Foundation — Direct debunk",
      platform: "news",
      timestamp: "2026-08-19 11:15 IST",
      url: "cyberpeace.org/resources/blogs/factcheck",
      views: 0,
      screenshot: "/evidence/dwivedi-01-cyberpeace.png",
    },
  ],
};

export const propagationEdgesByCase: Record<string, PropagationEdge[]> = {
  "CHD-2026-00131": [
    { from: "boom-live", to: "mea-factcheck", label: "+161d" },
    { from: "mea-factcheck", to: "viral-post", label: "+8d" },
    { from: "viral-post", to: "wayback-check", label: "+4d" },
    { from: "wayback-check", to: "x-profile-check", label: "same session" },
  ],
  "CHD-2026-00134": [
    { from: "dwivedi-pib", to: "dwivedi-republic", label: "+251d" },
    { from: "dwivedi-republic", to: "dwivedi-viral", label: "+95d" },
    { from: "dwivedi-viral", to: "dwivedi-cyberpeace", label: "+2h 45m" },
  ],
};

export const faceMatches: FaceMatch[] = [
  {
    id: "fm1",
    title: "Regional Update TV — Telegram channel post",
    url: "t.me/regionalupdatetv/4821",
    snippet:
      "Video shared in a regional news channel with a caption alleging the statement was made \"live\" during a press briefing. Frame-matched against the uploaded evidence.",
    platform: "telegram",
    confidence: 88,
    avatar: "/evidence/thumb-1011.jpg",
    firstSeen: "2026-08-19 05:14 IST",
  },
  {
    id: "fm2",
    title: "@PublicFigureArchive — quote post",
    url: "x.com/publicfigurearchive/status/1958234017",
    snippet:
      "Reposted with a caption disputing authenticity. Account has a prior history of sharing unverified political clips.",
    platform: "x",
    confidence: 74,
    avatar: "/evidence/thumb-342.jpg",
    firstSeen: "2026-08-19 05:46 IST",
  },
  {
    id: "fm3",
    title: "District Public Updates — Facebook page",
    url: "facebook.com/districtpublicupdates/videos/98213",
    snippet:
      "Cross-posted to a public Facebook page with 12K shares. No source attribution included in the original post.",
    platform: "facebook",
    confidence: 52,
    avatar: "/evidence/case-image-evidence.jpg",
    firstSeen: "2026-08-19 06:01 IST",
  },
  {
    id: "fm4",
    title: "National Wire Photo Desk — archive entry",
    url: "wireservice.example/archive/2026/08/18/photo-desk",
    snippet:
      "Matched still frame found in a stock photo archive dated prior to the claimed event, suggesting possible recontextualization.",
    platform: "news",
    confidence: 61,
    avatar: "/evidence/thumb-1027.jpg",
    firstSeen: "2026-08-18 22:03 IST",
  },
];

/** Per-case overrides for `faceMatches` — falls back to the generic array above when absent. */
export const faceMatchesByCase: Record<string, FaceMatch[]> = {
  "CHD-2026-00131": [
    {
      id: "modi-1",
      title: '@InsiderWB — live profile check returns "account doesn\'t exist"',
      url: "x.com/InsiderWB",
      snippet:
        'Direct load from a non-VPN network path returned "This account doesn\'t exist." Confirmed inaccessible from India without a VPN — an access/geo restriction, not proof the account never existed.',
      platform: "x",
      confidence: 100,
      avatar: "/evidence/modi-source-x-profile.png",
      firstSeen: "2026-08-19",
    },
    {
      id: "modi-2",
      title: "Wayback Machine — InsiderWB crawled 5 times (Aug–Dec 2025)",
      url: "web.archive.org/web/*/x.com/InsiderWB",
      snippet:
        'Confirms the account is/was real — archived 5 times between 13 Aug 2025 and 21 Dec 2025. Rules out "account doesn\'t exist" as evidence the persona is fake or never posted.',
      platform: "public-record",
      confidence: 100,
      avatar: "/evidence/modi-source-wayback.png",
      firstSeen: "2025-08-13",
    },
    {
      id: "modi-3",
      title: "WION News — MEA rejects related fake India–Israel defence pact claim",
      url: "wionews.com/world/fake-news-mea-rejects-report-claiming-india-sought-defence-pact-with-israel",
      snippet:
        'On 7 Aug 2026, in the same news cycle, the MEA Fact Check unit debunked a related claim and confirmed the only real Modi–Netanyahu contact: a routine phone call — no "warning," no alliance prediction.',
      platform: "news",
      confidence: 95,
      avatar: "/evidence/modi-source-wionews.png",
      firstSeen: "2026-08-07",
    },
    {
      id: "modi-4",
      title: "BOOM Live — Modi/Netanyahu Afghanistan-aid videos are deepfakes",
      url: "boomlive.in/fact-check/viral-videos-prime-minister-modi-netanyahu-announcing-financial-aid-afghanistan-claim-fact-check-30755",
      snippet:
        "Prior fact-check ties fabricated Modi/Netanyahu content on X back to @InsiderWB specifically — documented history of circulating false and manipulated content about Indian and Israeli political figures.",
      platform: "news",
      confidence: 92,
      avatar: "/evidence/modi-source-boomlive.png",
      firstSeen: "2026-02-27",
    },
  ],
  "CHD-2026-00134": [
    {
      id: "dwivedi-1",
      title: "#FactCheck - AI-Generated Deepfake Falsely Attributes Film Remark to Army Chief Upendra Dwivedi",
      url: "https://cyberpeace.org/resources/blogs/factcheck--ai-generated-deepfake-falsely-attributes-film-remark-to-army-chief-upendra-dwivedi",
      snippet: "Direct fact-check of this exact quote. Real Ran Samwad seminar footage contains no mention of Modi, a filmmaker, or a film. DetectVideo AI: 72% AI-generated.",
      platform: "news",
      confidence: 97,
      avatar: "/evidence/dwivedi-01-cyberpeace.png",
      firstSeen: "2026-08-19",
    },
    {
      id: "dwivedi-2",
      title: "Beware! Deepfake Video Falsely Quotes Army Chief General Upendra Dwivedi On Operation Sindoor",
      url: "https://www.republicworld.com/india/beware-deepfake-video-falsely-quotes-army-chief-general-upendra-dwivedi-on-operation-sindoor-2026-05-16-124560",
      snippet: "Different fabricated Dwivedi quote (DGMO/ports/Navy claim), sourced to @InsiderWB — the same disinformation account behind case CHD-2026-00131.",
      platform: "news",
      confidence: 85,
      avatar: "/evidence/dwivedi-02-republicworld.png",
      firstSeen: "2026-05-16",
    },
    {
      id: "dwivedi-3",
      title: "PIB Fact Check: AI-Generated Video Falsely Quotes General Upendra Dwivedi",
      url: "https://www.newsonair.gov.in/pib-fact-check-ai-generated-video-falsely-quotes-general-upendra-dwivedi",
      snippet: "Official GoI Fact Check Unit confirmation of a third fabricated Dwivedi quote (fighter-jets/soldiers-lost claim) — establishes recurring pattern.",
      platform: "news",
      confidence: 92,
      avatar: "/evidence/dwivedi-03-newsonair.png",
      firstSeen: "2025-09-07",
    },
  ],
};

export const auditLog: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "2026-08-19 06:10:03 IST",
    actor: "Raghavan",
    action: "UPLOADED",
    evidenceHash: "9f2a7c…e41b",
    device: "WEB / 10.24.6.12",
  },
  {
    id: "a2",
    timestamp: "2026-08-19 06:10:05 IST",
    actor: "system",
    action: "ANALYZED",
    evidenceHash: "9f2a7c…e41b",
    device: "pramana-engine-01",
  },
  {
    id: "a3",
    timestamp: "2026-08-19 06:14:22 IST",
    actor: "Raghavan",
    action: "VIEWED",
    evidenceHash: "9f2a7c…e41b",
    device: "WEB / 10.24.6.12",
  },
  {
    id: "a4",
    timestamp: "2026-08-19 06:19:47 IST",
    actor: "N. Kaur",
    action: "VIEWED",
    evidenceHash: "9f2a7c…e41b",
    device: "WEB / 10.24.6.31",
  },
  {
    id: "a5",
    timestamp: "2026-08-19 06:22:10 IST",
    actor: "N. Kaur",
    action: "ASSIGNED",
    evidenceHash: "9f2a7c…e41b",
    device: "WEB / 10.24.6.31",
  },
  {
    id: "a6",
    timestamp: "2026-08-19 06:31:58 IST",
    actor: "Raghavan",
    action: "EXPORTED",
    evidenceHash: "9f2a7c…e41b",
    device: "WEB / 10.24.6.12",
  },
];

/** Per-case overrides for `auditLog` — falls back to the generic array above when absent. */
export const auditLogByCase: Record<string, AuditEntry[]> = {
  "CHD-2026-00131": [
    {
      id: "m1",
      timestamp: "2026-08-19 13:31:02 IST",
      actor: "Raghavan",
      action: "UPLOADED",
      evidenceHash: "9f2a7c…e41b",
      device: "WEB / 10.24.6.12",
    },
    {
      id: "m2",
      timestamp: "2026-08-19 13:31:04 IST",
      actor: "system",
      action: "ANALYZED",
      evidenceHash: "9f2a7c…e41b",
      device: "pramana-engine-01",
    },
    {
      id: "m3",
      timestamp: "2026-08-19 13:33:41 IST",
      actor: "Raghavan",
      action: "VIEWED",
      evidenceHash: "9f2a7c…e41b",
      device: "WEB / 10.24.6.12",
    },
    {
      id: "m4",
      timestamp: "2026-08-19 13:38:15 IST",
      actor: "Raghavan",
      action: "EXPORTED",
      evidenceHash: "9f2a7c…e41b",
      device: "WEB / 10.24.6.12",
    },
  ],
};

export const kpis: KpiDatum[] = [
  { label: "Active Alerts", value: "17", trend: [4, 6, 5, 8, 7, 9, 8, 11, 9, 12, 10, 17], delta: "+5 today" },
  { label: "Open Cases", value: "43", trend: [30, 32, 31, 35, 34, 38, 36, 40, 39, 41, 42, 43], delta: "+3 today" },
  { label: "Evidence Analyzed (30d)", value: "1,284", trend: [60, 72, 68, 90, 85, 100, 96, 110, 105, 120, 118, 130], delta: "+130 this week" },
  { label: "Avg. Time to Verdict", value: "4m 12s", trend: [9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 4], delta: "-38% vs baseline" },
];

export const caseById = (id: string) => caseList.find((c) => c.id === id);
