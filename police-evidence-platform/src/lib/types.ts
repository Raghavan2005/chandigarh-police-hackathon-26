export type EvidenceKind = "image" | "video" | "audio" | "document";

export type Verdict = "AUTHENTIC" | "MANIPULATED" | "AI_GENERATED" | "INCONCLUSIVE";

export type CaseStatus = "new" | "analyzing" | "review" | "closed";

export interface CaseSummary {
  id: string;
  title: string;
  evidenceKind: EvidenceKind;
  thumbnail: string;
  mediaSrc?: string; // overrides the default video/audio file for this case
  verdict: Verdict;
  confidence: number; // 0-100
  investigator: string;
  status: CaseStatus;
  openedAt: string; // ISO
  updatedRelative: string; // e.g. "12m ago" for display
  summary?: string;
  verdictExplanation?: string;
}

export interface PipelineStepDef {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
  metrics?: { label: string; value: string }[];
}

export type PipelineStepState = "pending" | "running" | "done";

export interface FusionSignal {
  id: string;
  label: string;
  status: "critical" | "warning" | "safe" | "neutral";
  weight: number; // 0-100, contribution to verdict
  detail: string;
  evidence?: string; // supporting screenshot/image path
  evidenceCaption?: string;
}

export interface PropagationNode {
  id: string;
  label: string;
  platform: "telegram" | "x" | "facebook" | "whatsapp" | "news" | "public-record" | "origin";
  timestamp: string;
  isEarliest?: boolean;
  url: string;
  views: number;
  screenshot: string;
}

export interface PropagationEdge {
  from: string;
  to: string;
  label: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action:
    | "UPLOADED"
    | "ANALYZED"
    | "VIEWED"
    | "OVERRIDDEN"
    | "EXPORTED"
    | "ASSIGNED";
  evidenceHash: string;
  device: string;
}

export interface FaceMatch {
  id: string;
  title: string;
  url: string;
  snippet: string;
  platform: "telegram" | "x" | "facebook" | "whatsapp" | "news" | "public-record";
  confidence: number; // 0-100
  avatar: string;
  firstSeen: string;
}

export interface KpiDatum {
  label: string;
  value: string;
  trend: number[]; // sparkline points
  delta: string;
}
