"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Flame, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Real media viewer for a real case's evidence — actual uploaded file,
 * actual Grad-CAM heatmap when detection has run, and now a real face
 * detection box + crop (MTCNN's actual output, not the old mock's
 * hardcoded `left-[34%] top-[18%]` box with a fabricated "98.4%" label).
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
  faceBox,
  hasFaceCrop,
}: {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  sensitivityLevel: string;
  hasHeatmap: boolean;
  faceBox: [number, number, number, number] | null;
  hasFaceCrop: boolean;
}) {
  const isSensitive = sensitivityLevel !== "standard";
  const [revealed, setRevealed] = useState(!isSensitive);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFaceBox, setShowFaceBox] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const CONTAINER_HEIGHT = 280; // matches the fixed h-[280px] on the media element below

  // Guards against an infinite render loop: the ref callback below runs on
  // every render (inline function = new identity each time), so it must
  // never call setState with a genuinely new object when the values are
  // unchanged -- returning the same `prev` reference makes React bail out
  // of that particular update instead of re-rendering forever. Found live
  // via "Maximum update depth exceeded" after the first version of this
  // fix, which called setNaturalSize unconditionally.
  const setNaturalSizeIfChanged = (w: number, h: number) => {
    setNaturalSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
  };

  // Tracks the container's actual rendered width (it's w-full, so this
  // varies with layout) via ResizeObserver, kept in state rather than read
  // from the ref during render -- reading ref.current in the render body
  // isn't safe/reactive in React.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? null);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const fileUrl = `/api/cases/${caseId}/evidence/${evidenceId}/file`;
  const heatmapUrl = `/api/cases/${caseId}/evidence/${evidenceId}/heatmap`;
  const faceCropUrl = `/api/cases/${caseId}/evidence/${evidenceId}/face-crop`;

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

  // Real object-contain math: the media element fills the fixed-height
  // container while preserving aspect ratio, which usually means
  // letterboxing on one axis. A face box positioned with raw percentages
  // of the container would be wrong whenever that happens — this computes
  // the actual displayed content rect from the element's natural size vs
  // the container's, so the box lands exactly where MTCNN found the face,
  // not just "roughly in the container."
  const boxStyle = (() => {
    if (!showFaceBox || !faceBox || !naturalSize || !containerWidth) return null;
    const cw = containerWidth;
    const ch = CONTAINER_HEIGHT;
    const scale = Math.min(cw / naturalSize.w, ch / naturalSize.h);
    const dw = naturalSize.w * scale;
    const dh = naturalSize.h * scale;
    const offsetX = (cw - dw) / 2;
    const offsetY = (ch - dh) / 2;
    const [x1, y1, x2, y2] = faceBox;
    return {
      left: offsetX + x1 * dw,
      top: offsetY + y1 * dh,
      width: (x2 - x1) * dw,
      height: (y2 - y1) * dh,
    };
  })();

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken"
      >
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
              <img
                src={fileUrl}
                alt="Evidence"
                className="h-[280px] w-full bg-black object-contain"
                // A ref callback fires on mount even if the image is
                // already `complete` (served from cache) by then — onLoad
                // alone misses that case, since the load event has already
                // fired before React attaches the listener. Found live: the
                // face box silently never appeared because naturalSize
                // stayed null whenever the image loaded from cache.
                ref={(el) => {
                  if (el && el.complete && el.naturalWidth > 0) {
                    setNaturalSizeIfChanged(el.naturalWidth, el.naturalHeight);
                  }
                }}
                onLoad={(e) => setNaturalSizeIfChanged(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
              />
            )}
            {isVideo && (
              <video
                src={fileUrl}
                controls
                className="h-[280px] w-full bg-black object-contain"
                ref={(el) => {
                  if (el && el.readyState >= 1 && el.videoWidth > 0) {
                    setNaturalSizeIfChanged(el.videoWidth, el.videoHeight);
                  }
                }}
                onLoadedMetadata={(e) =>
                  setNaturalSizeIfChanged(e.currentTarget.videoWidth, e.currentTarget.videoHeight)
                }
              />
            )}
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
            {boxStyle && (
              <div
                className="pointer-events-none absolute rounded border-2 border-status-critical shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                style={boxStyle}
              >
                <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-status-critical px-1.5 py-0.5 font-mono text-[10px] font-medium text-white shadow-sm">
                  Detected face
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {revealed && (isImage || isVideo) && (
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            type="button"
            onClick={() => setShowFaceBox((v) => !v)}
            disabled={!faceBox}
            className={cn(
              buttonVariants({ variant: showFaceBox ? "default" : "outline", size: "sm" }),
              "w-fit",
              showFaceBox && "bg-accent-primary text-white hover:bg-accent-primary-hover",
            )}
          >
            <ScanFace className="size-3.5" />
            {faceBox
              ? showFaceBox
                ? "Hide face detection"
                : "Show face detection"
              : "No face detected"}
          </button>
        </div>
      )}

      {revealed && hasFaceCrop && (
        <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faceCropUrl}
            alt="Detected face crop — the actual image fed to the classifier"
            className="size-16 shrink-0 rounded border border-border-subtle bg-black object-cover"
          />
          <p className="text-[11px] text-text-tertiary">
            The actual aligned face crop the classifier scored — not the full frame.
          </p>
        </div>
      )}
    </div>
  );
}
