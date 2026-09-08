export type EvidenceKind = "image" | "video" | "audio" | "document";

/** Coarse, display-level classification from a file's own MIME type — used
 * to auto-detect each dropped file's kind in a multi-file upload (case
 * creation, add-evidence) instead of requiring the investigator to
 * pre-select one kind for the whole batch. Real per-file behavior always
 * goes by the actual stored mimeType (see evidence-ingest.ts), never this
 * bucket — null for a type this platform doesn't accept. */
export function inferEvidenceKind(mimeType: string): EvidenceKind | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  // metadata.ts already extracts real metadata for both of these
  // (extractPdfMetadata / extractTextMetadata) and every downstream
  // document-analysis route works off extracted text generically, not a
  // PDF-only assumption — this was the only layer still rejecting .txt.
  if (mimeType === "application/pdf" || mimeType === "text/plain") return "document";
  return null;
}

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
