"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock3, FileDigit, GitCompareArrows, Loader2, ScanSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { RealEvidenceViewer } from "@/components/investigation/real-evidence-viewer";
import { RealFusionSignals } from "@/components/investigation/real-fusion-signals";
import { RealPipelinePanel } from "@/components/investigation/real-pipeline-panel";
import { OverrideDialog } from "@/components/investigation/override-dialog";
import { ForensicExpertDialog } from "@/components/investigation/forensic-expert-dialog";
import { DeclarantDialog } from "@/components/investigation/declarant-dialog";
import { CustodyTransferDialog } from "@/components/investigation/custody-transfer-dialog";
import { ReverseImageSearchPanel } from "@/components/investigation/reverse-image-search-panel";
import { ImageDescriptionPanel } from "@/components/investigation/image-description-panel";
import type { EvidenceKind, Verdict } from "@/lib/types";
import type { getRealCase } from "@/lib/cases-server";
import type { CachedReverseImageSearchResult } from "@/lib/reverse-image-search";
import type { CachedImageDescriptionResult } from "@/lib/image-description";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type Evidence = RealCase["evidence"][number];

interface InvestigateResponse {
  verdict: string;
  confidence: number;
  explanation: string;
  coverageCount: number;
  corpusMatches: number;
  crossCaseMatches: number;
}

const VERDICT_STYLE: Record<string, string> = {
  AUTHENTIC: "border-status-safe/30 bg-status-safe-bg text-status-safe",
  MANIPULATED: "border-status-critical/30 bg-status-critical-bg text-status-critical",
  AI_GENERATED: "border-status-critical/30 bg-status-critical-bg text-status-critical",
  INCONCLUSIVE: "border-status-inconclusive/30 bg-status-inconclusive-bg text-status-inconclusive",
};

/**
 * One evidence item, with the real "Investigate" action wired to
 * POST /api/cases/:caseId/evidence/:evidenceId/investigate — the single
 * "Investigate" action from PS4_ROUND1_STRATEGY_CHAT.md, now actually
 * reachable from the UI instead of only via direct API calls.
 *
 * Client component (not the server-rendered RealCaseView) because it needs
 * to manage its own loading/result/error state while the real pipeline
 * runs — real ML inference + optional video frame sampling, not
 * instantaneous, so this must show a real loading state, not a fake one.
 */
export function EvidenceCard({
  caseId,
  sensitivityLevel,
  evidence,
  exhibitNumber,
  derivedFromLabel,
}: {
  caseId: string;
  sensitivityLevel: string;
  evidence: Evidence;
  exhibitNumber: number;
  derivedFromLabel: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "investigating" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<InvestigateResponse | null>(null);

  const canInvestigate =
    evidence.mimeType.startsWith("image/") || evidence.mimeType.startsWith("video/") || evidence.mimeType.startsWith("audio/");
  const isVideo = evidence.mimeType.startsWith("video/");
  const isAudio = evidence.mimeType.startsWith("audio/");
  const isImage = evidence.mimeType.startsWith("image/");
  // A case's evidenceKind is one value for the whole case, but individual
  // evidence items can be a different real mimeType (e.g. a document
  // uploaded onto an "audio" case) — the icon must reflect the actual file,
  // not the case-level label, or a case with mixed evidence shows the wrong
  // icon on every card (caught visually, not by inspection).
  const kindFromMimeType: EvidenceKind = isImage
    ? "image"
    : isVideo
      ? "video"
      : isAudio
        ? "audio"
        : "document";

  async function handleInvestigate() {
    setStatus("investigating");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidence.id}/investigate`, {
      method: "POST",
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Investigation failed — check the ML service is running and try again.");
      return;
    }

    const data: InvestigateResponse = await response.json();
    setResult(data);
    setStatus("idle");
    // Refreshes server-rendered data (metadata/detection/provenance rows,
    // audit trail) so the rest of the page reflects the real DB state, not
    // just this card's local optimistic result.
    router.refresh();
  }

  const Icon = KIND_ICON[kindFromMimeType] ?? FileDigit;
  const verdict = result?.verdict ?? evidence.fusionVerdict?.verdict;
  const confidence = result?.confidence ?? evidence.fusionVerdict?.confidence;
  const explanation = result?.explanation ?? evidence.fusionVerdict?.explanation;
  // Real match records (not just counts) once the server data reflects
  // them — populated on the initial page load if a prior Investigate run
  // already found matches, or after router.refresh() following this run.
  // Falls back to the immediate API response's bare counts for the split
  // second between a fresh match and the refresh completing.
  const hasRealMatches = evidence.matchesFrom.length > 0 || evidence.corpusMatches.length > 0;
  const showFaceMatchSlot = evidence.mimeType.startsWith("image/") || evidence.mimeType.startsWith("video/");
  const meta = evidence.metadataResult;
  const provenance = evidence.provenanceResult;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-sunken">
          <Icon className="size-4 text-text-tertiary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-primary">
            <span className="font-medium">Exhibit {exhibitNumber}</span> — {evidence.mimeType}
          </p>
          <p className="truncate font-mono text-[11px] text-text-tertiary">SHA-256: {evidence.sha256}</p>
          {derivedFromLabel && (
            <p className="truncate text-[11px] text-text-tertiary">Extracted from {derivedFromLabel}</p>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-text-tertiary">
          {evidence.uploadedBy.name} · {new Date(evidence.uploadedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr_280px]">
        <div className="flex min-w-0 flex-col gap-3">
          <RealEvidenceViewer
            caseId={caseId}
            evidenceId={evidence.id}
            mimeType={evidence.mimeType}
            sensitivityLevel={sensitivityLevel}
            hasHeatmap={Boolean(evidence.detectionResult?.heatmapPath)}
            faceBoxes={parseFaceBoxes(evidence.detectionResult?.faceBoxesJson)}
            faceCropCount={parseFaceCropCount(evidence.detectionResult?.faceCropPathsJson)}
            frameScores={parseFrameScores(evidence.detectionResult?.frameScoresJson)}
          />
          {showFaceMatchSlot && (
            <ReverseImageSearchPanel
              caseId={caseId}
              evidenceId={evidence.id}
              cached={parseReverseImageSearchResult(evidence.reverseImageSearchResult)}
            />
          )}
          {showFaceMatchSlot && (
            <ImageDescriptionPanel
              caseId={caseId}
              evidenceId={evidence.id}
              cached={parseImageDescriptionResult(evidence.imageDescriptionResult)}
            />
          )}
          {meta && meta.container === "PDF" && meta.exifJson && <DocumentDetails exifJson={meta.exifJson} />}
        </div>

        <div className="min-w-0 rounded-lg border border-border-subtle bg-surface-sunken p-4">
          {canInvestigate ? (
            <RealPipelinePanel evidence={evidence} />
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Analysis pipeline</p>
              <p className="mt-2 text-xs text-text-tertiary">
                Detection isn&apos;t available for this evidence type yet (image/video/audio only in this build).
              </p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Verdict</p>
            {status === "error" && (
              // Shown in addition to (not instead of) a stale verdict below —
              // a re-investigate call can fail after a prior one already
              // succeeded, and silently leaving the old verdict displayed
              // with no indication the fresh attempt failed would mislead an
              // investigator into treating stale data as current.
              <p className="mb-2 flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-xs text-status-critical">
                <AlertTriangle className="size-3.5 shrink-0" />
                Re-investigation failed: {errorMessage}
              </p>
            )}
            {verdict ? (
              <div className={cn("rounded-md border px-2.5 py-2 text-xs", VERDICT_STYLE[verdict] ?? VERDICT_STYLE.INCONCLUSIVE)}>
                <p className="font-semibold uppercase tracking-wide">
                  {verdict.replace("_", "-")} · {confidence}%
                </p>
                {explanation && <p className="mt-1 text-[11px] opacity-90">{explanation}</p>}
              </div>
            ) : status !== "error" ? (
              <p className="rounded-md border border-status-inconclusive/30 bg-status-inconclusive-bg px-2.5 py-1.5 text-xs text-status-inconclusive">
                {canInvestigate
                  ? "Detection and Evidence Fusion haven't run on this file yet — no verdict to show."
                  : "Not available — no verdict to show."}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Technical provenance
            </p>
            {meta ? (
              <dl className="space-y-1.5 text-xs">
                <ProvenanceRow label="Container" value={meta.container} />
                <ProvenanceRow label="Resolution" value={meta.resolution} />
                <ProvenanceRow label="Duration" value={meta.duration} />
                <ProvenanceRow label="Codec" value={meta.codec} />
                <ProvenanceRow
                  label="C2PA manifest"
                  value={
                    !provenance
                      ? "Not yet checked"
                      : !provenance.c2paPresent
                        ? "Not present (neutral)"
                        : provenance.c2paValid
                          ? "Present, valid"
                          : "Present, INVALID"
                  }
                  warn={Boolean(provenance?.c2paPresent && !provenance.c2paValid)}
                />
                {meta.encoderSignature && (
                  <ProvenanceRow
                    label={meta.container === "PDF" ? "Editing tool signature" : "Encoder signature"}
                    value={meta.encoderSignature}
                    warn
                  />
                )}
                {evidence.deviceIdentifier && (
                  <ProvenanceRow label="Device identifier" value={evidence.deviceIdentifier} />
                )}
                {evidence.casePropertyNumber && (
                  <ProvenanceRow label="Case property no." value={evidence.casePropertyNumber} />
                )}
              </dl>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Clock3 className="size-3.5" />
                Metadata extraction pending.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Actions</p>
            {canInvestigate && (
              <button
                type="button"
                onClick={handleInvestigate}
                disabled={status === "investigating"}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}
              >
                {status === "investigating" ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {isVideo
                      ? "Sampling frames + running detection…"
                      : isAudio
                        ? "Running voice-spoofing detection…"
                        : "Running detection…"}
                  </>
                ) : (
                  <>
                    <ScanSearch className="size-3.5" />
                    {verdict ? "Re-investigate" : "Investigate"}
                  </>
                )}
              </button>
            )}
            {evidence.fusionVerdict && (
              <OverrideDialog
                caseId={caseId}
                evidenceId={evidence.id}
                currentVerdict={evidence.fusionVerdict.verdict as Verdict}
              />
            )}
            <ForensicExpertDialog
              caseId={caseId}
              evidenceId={evidence.id}
              existing={evidence.forensicExpert}
              existingCourtDirectionRef={evidence.courtDirectionRef}
            />
            <DeclarantDialog
              caseId={caseId}
              evidenceId={evidence.id}
              existing={{
                declarantName: evidence.declarantName,
                declarantRole: evidence.declarantRole,
                declarantOrg: evidence.declarantOrg,
              }}
            />
            <CustodyTransferDialog caseId={caseId} evidenceId={evidence.id} />
          </div>
        </div>
      </div>

      {evidence.fusionVerdict && (
        <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Evidence fusion</p>
          <RealFusionSignals
            signalBreakdownJson={evidence.fusionVerdict.signalBreakdownJson}
            coverageCount={evidence.fusionVerdict.coverageCount}
            confidenceCeiling={evidence.fusionVerdict.confidenceCeiling}
            verdict={evidence.fusionVerdict.verdict}
            confidence={evidence.fusionVerdict.confidence}
            explanation={evidence.fusionVerdict.explanation}
          />
        </div>
      )}

      {evidence.overrides.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-[11px] font-medium text-text-secondary">Human override history</p>
          {evidence.overrides.map((o) => (
            <p key={o.id} className="text-[11px] text-text-tertiary">
              {o.previousVerdict.replace("_", "-")} → {o.newVerdict.replace("_", "-")} by {o.overriddenBy.name}
              {" "}({new Date(o.timestamp).toLocaleString()}): {o.reason}
            </p>
          ))}
        </div>
      )}

      {evidence.declarantName && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-[11px] font-medium text-text-secondary">Section 63 BSA Part A — declarant</p>
          <p className="text-[11px] text-text-tertiary">
            {evidence.declarantName}
            {evidence.declarantRole ? `, ${evidence.declarantRole}` : ""}
            {evidence.declarantOrg ? ` (${evidence.declarantOrg})` : ""}
          </p>
        </div>
      )}

      {evidence.custodyTransfers.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-[11px] font-medium text-text-secondary">Physical chain of custody</p>
          {evidence.custodyTransfers.map((t) => (
            <p key={t.id} className="text-[11px] text-text-tertiary">
              {t.fromPerson} → {t.toPerson} ({t.purpose}){t.location ? ` — ${t.location}` : ""} — logged by{" "}
              {t.recordedBy.name} ({new Date(t.occurredAt).toLocaleString()})
              {t.witness1Name && `; witness: ${t.witness1Name}`}
              {t.witness2Name && `, ${t.witness2Name}`}
            </p>
          ))}
        </div>
      )}

      {!evidence.forensicExpert && evidence.courtDirectionRef && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-[11px] font-medium text-text-secondary">Section 63 BSA Part B — forwarding in progress</p>
          <p className="text-[11px] text-text-tertiary">
            Court has directed independent expert examination (ref: {evidence.courtDirectionRef}); expert findings
            not yet received.
          </p>
        </div>
      )}

      {evidence.forensicExpert && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-[11px] font-medium text-text-secondary">Section 63 BSA Part B — forensic expert</p>
          <p className="text-[11px] text-text-tertiary">
            {evidence.forensicExpert.name}, {evidence.forensicExpert.designation} — lab ref{" "}
            {evidence.forensicExpert.labRef}
          </p>
        </div>
      )}

      {hasRealMatches && (
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
            <GitCompareArrows className="size-3.5" />
            Matches found
          </p>
          {evidence.matchesFrom.map((m) => (
            <Link
              key={m.id}
              href={`/cases/${m.matchedCaseId}`}
              className="text-[11px] text-accent-primary hover:underline"
            >
              Same/near-identical file found in case {m.matchedCaseId} — {Math.round(m.similarity * 100)}% similar
              (Hamming distance {m.hammingDistance})
            </Link>
          ))}
          {evidence.corpusMatches.map((m) => (
            <p key={m.id} className="text-[11px] text-text-secondary">
              Matches seeded corpus item from {m.corpusItem.sourcePlatform} (first seen{" "}
              {new Date(m.corpusItem.firstSeenAt).toLocaleDateString()}) — {Math.round(m.similarity * 100)}% similar
            </p>
          ))}
        </div>
      )}
      {!hasRealMatches && result && (result.corpusMatches > 0 || result.crossCaseMatches > 0) && (
        <p className="text-[11px] text-text-tertiary">
          {result.corpusMatches > 0 && `${result.corpusMatches} match(es) in the seeded corpus. `}
          {result.crossCaseMatches > 0 && `${result.crossCaseMatches} match(es) found in other cases.`}{" "}
          Refreshing…
        </p>
      )}
    </div>
  );
}

function ProvenanceRow({ label, value, warn }: { label: string; value: string | null; warn?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={cn("text-right", warn ? "font-medium text-status-warning" : "text-text-primary")}>{value}</dd>
    </div>
  );
}

function parseFaceBoxes(json: string | null | undefined): [number, number, number, number][] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (
      Array.isArray(parsed) &&
      parsed.every((box) => Array.isArray(box) && box.length === 4 && box.every((n) => typeof n === "number"))
    ) {
      return parsed as [number, number, number, number][];
    }
  } catch {
    // fall through
  }
  return [];
}

function parseFaceCropCount(json: string | null | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

interface FrameScore {
  timestampSeconds: number;
  probability: number;
  faceDetected: boolean;
}

function parseReverseImageSearchResult(
  row: Evidence["reverseImageSearchResult"],
): CachedReverseImageSearchResult | null {
  if (!row) return null;
  try {
    return {
      fullMatches: JSON.parse(row.fullMatchesJson),
      partialMatches: JSON.parse(row.partialMatchesJson),
      pagesWithMatches: JSON.parse(row.pagesWithMatchesJson),
      webEntities: JSON.parse(row.webEntitiesJson),
      bestGuessLabels: JSON.parse(row.bestGuessLabelsJson),
      labels: JSON.parse(row.labelsJson),
      ranAt: row.ranAt.toISOString(),
    };
  } catch {
    return null;
  }
}

function parseImageDescriptionResult(
  row: Evidence["imageDescriptionResult"],
): CachedImageDescriptionResult | null {
  if (!row) return null;
  try {
    return {
      description: row.description,
      possibleIdentities: JSON.parse(row.possibleIdentitiesJson),
      ranAt: row.ranAt.toISOString(),
    };
  } catch {
    return null;
  }
}

function parseFrameScores(json: string | null | undefined): FrameScore[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (f) =>
          f &&
          typeof f.timestampSeconds === "number" &&
          typeof f.probability === "number" &&
          typeof f.faceDetected === "boolean",
      )
    ) {
      return parsed as FrameScore[];
    }
  } catch {
    // fall through
  }
  return null;
}

function Field({
  label,
  value,
  className,
  highlight,
}: {
  label: string;
  value: string | null;
  className?: string;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={className}>
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={highlight ? "font-medium text-status-warning" : "text-text-primary"}>{value}</dd>
    </div>
  );
}

interface PdfDocumentInfo {
  producer: string | null;
  creator: string | null;
  creationDate: string | null;
  modDate: string | null;
  modifiedAfterCreation: boolean;
  pageCount: number;
  textPreview: string;
}

/** Real PDF Stage 1 extraction results (src/lib/metadata.ts's
 * extractPdfMetadata) — page count, dates, and an actual text-content
 * preview extracted from the document's real text layer, not OCR'd from a
 * rendered image (that's a further scope cut, not something this build
 * claims to do). */
function DocumentDetails({ exifJson }: { exifJson: string }) {
  let info: PdfDocumentInfo | null = null;
  try {
    info = JSON.parse(exifJson);
  } catch {
    return null;
  }
  if (!info) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-border-subtle pt-3 text-xs">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        <Field label="Pages" value={String(info.pageCount)} />
        {info.creationDate && <Field label="Created" value={new Date(info.creationDate).toLocaleString()} />}
        {info.modDate && <Field label="Modified" value={new Date(info.modDate).toLocaleString()} />}
      </div>
      {info.modifiedAfterCreation && (
        <p className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-2.5 py-1.5 text-status-warning">
          <AlertTriangle className="size-3.5 shrink-0" />
          Modified after creation — not proof of tampering on its own, but worth checking against the claimed
          chain of custody.
        </p>
      )}
      {info.textPreview && (
        <div>
          <p className="text-[11px] font-medium text-text-secondary">Extracted text (preview)</p>
          <p className="mt-1 line-clamp-4 whitespace-pre-line text-text-tertiary">{info.textPreview}</p>
        </div>
      )}
    </div>
  );
}
