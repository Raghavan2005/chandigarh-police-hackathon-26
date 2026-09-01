"use client";

import { useState } from "react";
import { Eye, EyeOff, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Real media viewer for a real case's evidence — actual uploaded file,
 * actual Grad-CAM heatmap when detection has run. Previously there was no
 * way to view the uploaded file in the browser at all, only metadata about
 * it (storage/ isn't in public/, by design — evidence access must go
 * through an auth-gated route, not sit as a static asset).
 *
 * NCII/minor-sensitivity evidence blurs by default and requires an
 * explicit reveal action (PS4_MVP_BUILD_PLAN.md §2) — this is the first
 * place real media actually renders for a real case, so this is where that
 * rule has to be enforced, not an afterthought.
 */
export function RealEvidenceViewer({
  caseId,
  evidenceId,
  mimeType,
  sensitivityLevel,
  hasHeatmap,
}: {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  sensitivityLevel: string;
  hasHeatmap: boolean;
}) {
  const isSensitive = sensitivityLevel !== "standard";
  const [revealed, setRevealed] = useState(!isSensitive);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);

  const fileUrl = `/api/cases/${caseId}/evidence/${evidenceId}/file`;
  const heatmapUrl = `/api/cases/${caseId}/evidence/${evidenceId}/heatmap`;

  async function handleReveal() {
    setRevealing(true);
    setRevealError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reveal`, { method: "POST" }).catch(
      () => null,
    );
    setRevealing(false);
    // Revealing without a confirmed audit entry would defeat the whole
    // point of gating sensitive content behind a logged action — only
    // un-blur once the server confirms the AuditLogEntry was written.
    if (!response || !response.ok) {
      setRevealError("Could not log this access — content stays hidden. Check your connection and try again.");
      return;
    }
    setRevealed(true);
  }

  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  if (!isImage && !isVideo && !isAudio) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border-subtle bg-surface-sunken text-xs text-text-tertiary">
        No inline preview for this file type — download from the evidence record.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken">
        {!revealed ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 bg-black/90 text-center">
            <EyeOff className="size-6 text-status-warning" />
            <p className="max-w-xs text-xs text-text-secondary">
              This evidence is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"}. Viewing it is
              logged to the audit trail.
            </p>
            <button
              type="button"
              onClick={handleReveal}
              disabled={revealing}
              className={cn(buttonVariants({ size: "sm" }), "bg-status-warning text-black hover:bg-status-warning/90")}
            >
              <Eye className="size-4" />
              {revealing ? "Logging access…" : "View sensitive content"}
            </button>
            {revealError && <p className="max-w-xs text-xs text-status-critical">{revealError}</p>}
          </div>
        ) : (
          <>
            {isImage && (
              // Served from an auth-gated API route, not a static asset next/image's optimizer can address.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl} alt="Evidence" className="h-[280px] w-full bg-black object-contain" />
            )}
            {isVideo && <video src={fileUrl} controls className="h-[280px] w-full bg-black object-contain" />}
            {isAudio && (
              <div className="flex h-20 items-center justify-center bg-black">
                <audio src={fileUrl} controls className="w-[92%]" />
              </div>
            )}
            {showHeatmap && (isImage || isVideo) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heatmapUrl}
                alt="Manipulation heatmap"
                className="pointer-events-none absolute inset-0 h-[280px] w-full object-contain opacity-80 mix-blend-hard-light"
              />
            )}
          </>
        )}
      </div>

      {revealed && (isImage || isVideo) && (
        <button
          type="button"
          onClick={() => setShowHeatmap((v) => !v)}
          disabled={!hasHeatmap}
          className={cn(
            buttonVariants({ variant: showHeatmap ? "default" : "outline", size: "sm" }),
            "w-fit",
            showHeatmap && "bg-accent-primary text-white hover:bg-accent-primary-hover",
          )}
        >
          <Flame className="size-3.5" />
          {hasHeatmap ? (showHeatmap ? "Hide heatmap" : "Show manipulation heatmap") : "Heatmap pending analysis"}
        </button>
      )}
    </div>
  );
}
