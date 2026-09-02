"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera, Eye, EyeOff, Loader2, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AudioAnalyser } from "@/components/investigation/audio-analyser";
import { FaceDetailDialog, type FaceAnnotationData } from "@/components/investigation/face-detail-dialog";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance, type VideoMimeType, type AudioMimeType } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout, DefaultAudioLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";

interface FrameScore {
  timestampSeconds: number;
  probability: number;
  faceDetected: boolean;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type OverlayMode = "none" | "heatmap" | "negative" | "edge";

/** Same two CSS filters as the old mock's "ELA"/"Edge Det." tiles
 * (`getFilterStyle`) — plain visual filters for manual inspection, not a
 * forensic ML technique (real "Error Level Analysis" is a JPEG-recompression
 * artifact comparison, not a color invert). Restored at direct user
 * request after an earlier pass deliberately left them out; kept honestly
 * labeled rather than presented as equivalent to the real Grad-CAM heatmap. */
function getFilterStyle(mode: OverlayMode): React.CSSProperties {
  switch (mode) {
    case "negative":
      return { filter: "invert(1) contrast(1.2)" };
    case "edge":
      return { filter: "contrast(200%) invert(1) grayscale(100%)" };
    default:
      return {};
  }
}

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
  faceBoxes,
  faceCropCount,
  faceAnnotations,
  frameScores,
}: {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  sensitivityLevel: string;
  hasHeatmap: boolean;
  faceBoxes: [number, number, number, number][];
  faceCropCount: number;
  faceAnnotations: Map<number, FaceAnnotationData>;
  frameScores: FrameScore[] | null;
}) {
  const router = useRouter();
  const isSensitive = sensitivityLevel !== "standard";
  const [revealed, setRevealed] = useState(!isSensitive);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState("");
  // Single-select overlay mode — matches the old mock's "Live Forensic
  // Feeds" tile grid exactly: Original / Heatmap / ELA / Edge Detection,
  // all 4, restored at direct user request. Heatmap is a real Grad-CAM
  // output; ELA/Edge Detection are the same plain CSS filters as the mock
  // (no real signal-processing technique behind them) — kept, but not
  // mislabeled as ML output. Face-box detection is a separate real toggle
  // below, independent of this grid (it isn't one of the mock's 4 tiles).
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("none");
  const showHeatmap = overlayMode === "heatmap";
  const [showFaceBox, setShowFaceBox] = useState(false);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [extractStatus, setExtractStatus] = useState<"idle" | "extracting" | "error">("idle");
  const [extractError, setExtractError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  // Seeking/reading currentTime goes through this (Vidstack's own real
  // player API), not the raw <video> element below — see the frame-step
  // buttons' comment for why. mediaElRef is still needed for the parts
  // that genuinely require the actual DOM element: natural-size reading
  // and feeding the real Web Audio analyser (createMediaElementSource
  // needs the literal HTMLMediaElement, not a wrapper).
  const playerRef = useRef<MediaPlayerInstance>(null);
  // State, not a ref — AudioAnalyser's effect needs to actually re-run once
  // this becomes available. For video, this is only set later inside
  // `onProviderChange` (Vidstack attaches its provider asynchronously,
  // after this component's own first render/effect pass), so a plain ref
  // left AudioAnalyser's mount effect reading `.current === null` and
  // bailing out for good — the waveform/spectrogram silently never
  // animated even during real playback. Found live, not by inspection:
  // reported as "the graphs aren't moving."
  const [mediaEl, setMediaEl] = useState<HTMLVideoElement | HTMLAudioElement | null>(null);
  // Live-synced tile previews (matches the old mock's `relayVideoRefs`) —
  // each "Live Forensic Feeds" video tile is a separate, real <video> with
  // the same src, kept in lockstep with the main player via native events
  // on `mediaEl` rather than each tile driving its own playback.
  const relayVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (!mediaEl || !(mediaEl instanceof HTMLVideoElement)) return;
    const video = mediaEl;
    const handlePlay = () => relayVideoRefs.current.forEach((v) => v?.play().catch(() => {}));
    const handlePause = () => relayVideoRefs.current.forEach((v) => v?.pause());
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      relayVideoRefs.current.forEach((v) => {
        if (v && Math.abs(v.currentTime - time) > 0.5) v.currentTime = time;
      });
    };
    const handleSeeked = () => {
      const time = video.currentTime;
      relayVideoRefs.current.forEach((v) => {
        if (v) v.currentTime = time;
      });
    };
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [mediaEl]);
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

  async function handleExtractFrame() {
    const timestampSeconds = playerRef.current?.currentTime ?? 0;
    setExtractStatus("extracting");
    setExtractError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/extract-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestampSeconds }),
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setExtractStatus("error");
      setExtractError(body?.error ?? "Could not extract this frame — check your connection and try again.");
      return;
    }
    setExtractStatus("idle");
    router.refresh();
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
  // the container's, so every box lands exactly where MTCNN found that
  // face, not just "roughly in the container." One box per detected face,
  // not just the one the classifier happened to score.
  const boxStyles = (() => {
    if (!showFaceBox || faceBoxes.length === 0 || !naturalSize || !containerWidth) return [];
    const cw = containerWidth;
    const ch = CONTAINER_HEIGHT;
    const scale = Math.min(cw / naturalSize.w, ch / naturalSize.h);
    const dw = naturalSize.w * scale;
    const dh = naturalSize.h * scale;
    const offsetX = (cw - dw) / 2;
    const offsetY = (ch - dh) / 2;
    return faceBoxes.map(([x1, y1, x2, y2]) => ({
      left: offsetX + x1 * dw,
      top: offsetY + y1 * dh,
      width: (x2 - x1) * dw,
      height: (y2 - y1) * dh,
    }));
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
                style={getFilterStyle(overlayMode)}
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
              // Real video player (Vidstack, not a bare native <video>) for
              // richer real controls — settings menu with playback speed,
              // proper fullscreen/PiP, keyboard shortcuts, buffering
              // indicator — on top of the exact same real file stream this
              // viewer always served. We still reach through to the actual
              // native <video> element it renders internally (via
              // `player.el`) for everything that needs direct element
              // access: frame-step, frame extraction, natural-size/duration
              // tracking, and feeding the real Web Audio analyser.
              <MediaPlayer
                ref={playerRef}
                // Explicit { src, type } rather than a bare URL string —
                // our file route (/api/.../file) has no extension for
                // Vidstack to infer a MIME type from, which without this
                // makes it fall back to a slower "fetch response headers
                // to sniff the type" path on every load (a real, visible
                // console warning caught live, not by inspection). We
                // already know the real type from the DB, so just pass it.
                src={{ src: fileUrl, type: mimeType as VideoMimeType }}
                playsInline
                className="h-[280px] w-full bg-black"
                style={getFilterStyle(overlayMode) as React.ComponentProps<typeof MediaPlayer>["style"]}
                onProviderChange={() => {
                  const el = playerRef.current?.el?.querySelector("video") as HTMLVideoElement | null;
                  if (!el) return;
                  setMediaEl(el);
                  const updateFromEl = () => {
                    if (el.videoWidth > 0) {
                      setNaturalSizeIfChanged(el.videoWidth, el.videoHeight);
                      setVideoDuration(el.duration);
                    }
                  };
                  // Same "already loaded before the listener attached" case
                  // documented below the image ref above — a native
                  // loadedmetadata listener attached after the fact misses
                  // an already-available video, which left videoDuration
                  // stuck at null and the frame timeline permanently
                  // hidden. Found live via a real screenshot, not by
                  // inspection.
                  if (el.readyState >= 1) updateFromEl();
                  el.addEventListener("loadedmetadata", updateFromEl);
                }}
              >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            )}
            {isAudio && (
              // Same Vidstack player as the video branch above, not a bare
              // native <audio> — real scrubbing, volume/speed menu, and
              // keyboard shortcuts instead of the browser's minimal default
              // controls. Still exposes the underlying native <audio>
              // element via onProviderChange for the real Web Audio
              // analyser below, same pattern as the video branch.
              <MediaPlayer
                ref={playerRef}
                src={{ src: fileUrl, type: mimeType as AudioMimeType }}
                className="w-full bg-black"
                onProviderChange={() => {
                  const el = playerRef.current?.el?.querySelector("audio") as HTMLAudioElement | null;
                  if (el) setMediaEl(el);
                }}
              >
                <MediaProvider />
                <DefaultAudioLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            )}
            {showHeatmap && (isImage || isVideo) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heatmapUrl}
                alt="Manipulation heatmap"
                className="pointer-events-none absolute inset-0 h-[280px] w-full object-contain opacity-80 mix-blend-hard-light"
              />
            )}
            {boxStyles.map((style, i) => (
              <div
                key={i}
                className="pointer-events-none absolute rounded border-2 border-status-critical shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                style={style}
              >
                <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-status-critical px-1.5 py-0.5 font-mono text-[10px] font-medium text-white shadow-sm">
                  {i === 0 ? "Face 1 (scored)" : `Face ${i + 1}`}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {revealed && isVideo && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-text-tertiary">Frame controls</span>
          <button
            type="button"
            onClick={() => {
              // Set on the player instance itself, not the raw DOM element
              // — Vidstack owns the media element and syncs its internal
              // state store from real events; writing straight to
              // `<video>.currentTime` behind its back didn't reliably
              // stick (found live: currentTime read back as unchanged
              // after the write). `player.currentTime` is Vidstack's own
              // real seek API and behaves correctly.
              const p = playerRef.current;
              if (p) p.currentTime = Math.max(0, p.currentTime - 1 / 30);
            }}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            −1 frame
          </button>
          <button
            type="button"
            onClick={() => {
              const p = playerRef.current;
              if (p) p.currentTime = p.currentTime + 1 / 30;
            }}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            +1 frame
          </button>
          <span className="text-text-tertiary">(playback speed is in the player&apos;s own settings menu)</span>
          <button
            type="button"
            onClick={handleExtractFrame}
            disabled={extractStatus === "extracting"}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            {extractStatus === "extracting" ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            Extract current frame as evidence
          </button>
          {extractStatus === "error" && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {extractError}
            </span>
          )}
        </div>
      )}

      {revealed && isVideo && frameScores && frameScores.length > 0 && videoDuration && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-text-tertiary">
            Sampled frames analyzed ({frameScores.length}) — click to jump the player to that frame
          </p>
          <div className="relative h-8 rounded-md border border-border-subtle bg-surface-sunken">
            {frameScores.map((fs, i) => {
              const leftPct = videoDuration ? (fs.timestampSeconds / videoDuration) * 100 : 0;
              const isWorst = fs.probability === Math.max(...frameScores.map((f) => f.probability));
              return (
                <button
                  key={i}
                  type="button"
                  title={`${formatTimestamp(fs.timestampSeconds)} — ${fs.probability.toFixed(1)}% manipulation probability${fs.faceDetected ? "" : " (no face detected)"}`}
                  onClick={() => {
                    if (playerRef.current) playerRef.current.currentTime = fs.timestampSeconds;
                  }}
                  className={cn(
                    "absolute top-0.5 flex w-3 -translate-x-1/2 flex-col items-center gap-0.5",
                    isWorst && "z-10",
                  )}
                  style={{ left: `${leftPct}%` }}
                >
                  <span
                    className={cn(
                      "block w-1.5 rounded-full",
                      isWorst ? "bg-status-critical" : fs.probability >= 50 ? "bg-status-warning" : "bg-status-safe",
                    )}
                    style={{ height: `${6 + (fs.probability / 100) * 20}px` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {revealed && (isVideo || isAudio) && <AudioAnalyser mediaEl={mediaEl} />}

      {revealed && (isImage || isVideo) && (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <ScanFace className="size-4" />
            Live Forensic Feeds
          </p>
          <div className="grid grid-cols-4 gap-2">
            <OverlayTile
              label="Original"
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[0] = el; }}
              active={overlayMode === "none"}
              onClick={() => setOverlayMode("none")}
            />
            <OverlayTile
              label={hasHeatmap ? "Heatmap" : "Heatmap (pending)"}
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[1] = el; }}
              overlayUrl={hasHeatmap ? heatmapUrl : undefined}
              active={overlayMode === "heatmap"}
              disabled={!hasHeatmap}
              onClick={() => setOverlayMode("heatmap")}
            />
            <OverlayTile
              label="ELA"
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[2] = el; }}
              filterStyle={getFilterStyle("negative")}
              active={overlayMode === "negative"}
              onClick={() => setOverlayMode("negative")}
            />
            <OverlayTile
              label="Edge Det."
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[3] = el; }}
              filterStyle={getFilterStyle("edge")}
              active={overlayMode === "edge"}
              onClick={() => setOverlayMode("edge")}
            />
          </div>
          <p className="text-[10px] text-text-tertiary">
            Heatmap is a real Grad-CAM model output. ELA/Edge Detection are plain visual filters for manual
            inspection, not a forensic ML technique — don&apos;t read them as a model finding.
          </p>
          <button
            type="button"
            onClick={() => setShowFaceBox((v) => !v)}
            disabled={faceBoxes.length === 0}
            className={cn(buttonVariants({ variant: showFaceBox ? "default" : "outline", size: "sm" }), "w-fit")}
          >
            <ScanFace className="size-3.5" />
            {faceBoxes.length === 0
              ? "No face detected"
              : showFaceBox
                ? `Hide face detection (${faceBoxes.length})`
                : `Show face detection (${faceBoxes.length})`}
          </button>
        </div>
      )}

      {revealed && faceCropCount > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-2">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: faceCropCount }, (_, i) => {
              const label = faceAnnotations.get(i)?.label;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedFaceIndex(i)}
                  className="flex flex-col items-center gap-1 rounded-md p-0.5 transition-colors hover:bg-surface-sunken"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${faceCropUrl}?index=${i}`}
                    alt={i === 0 ? "Face 1 — the actual image fed to the classifier" : `Face ${i + 1}`}
                    className="size-16 shrink-0 rounded border border-border-subtle bg-black object-cover"
                  />
                  <span className="max-w-16 truncate text-[9px] text-text-tertiary">
                    {label || (i === 0 ? "Face 1 (scored)" : `Face ${i + 1}`)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-text-tertiary">
            Face 1 is the actual aligned crop the classifier scored. Click any face to label it or run a per-face
            search.
            {faceCropCount > 1 &&
              ` The other ${faceCropCount - 1} face(s) were detected but not separately classified — the model only scores one face per image.`}
          </p>
        </div>
      )}

      {selectedFaceIndex !== null && (
        <FaceDetailDialog
          caseId={caseId}
          evidenceId={evidenceId}
          faceIndex={selectedFaceIndex}
          isScored={selectedFaceIndex === 0}
          open={selectedFaceIndex !== null}
          onOpenChange={(next) => {
            if (!next) setSelectedFaceIndex(null);
          }}
          annotation={
            faceAnnotations.get(selectedFaceIndex) ?? { label: null, reverseSearch: null, description: null }
          }
        />
      )}
    </div>
  );
}

/**
 * One tile in the "Forensic view" grid — visually replaces the old mock's
 * "Live Forensic Feeds" tile grid (Original / Heatmap / ELA / Edge
 * Detection), but every tile here is backed by a real output or shows
 * nothing at all rather than a fabricated preview. The old mock's ELA and
 * Edge Detection tiles had no real technique behind them (plain CSS
 * filters) and aren't reproduced here.
 */
function OverlayTile({
  label,
  baseMediaUrl,
  isVideo,
  videoRef,
  overlayUrl,
  filterStyle,
  active,
  disabled,
  onClick,
}: {
  label: string;
  /** The real underlying evidence file — every tile shows the actual
   * footage/frame, not an isolated derivative floating on black, matching
   * the old mock's visual (each tile was the real scene with a different
   * real effect on top of it). */
  baseMediaUrl: string;
  isVideo: boolean;
  /** Registers this tile's own <video> into the parent's relay array so it
   * plays/pauses/seeks in lockstep with the main player — a live preview,
   * not a static first frame, matching the old mock's `relayVideoRefs`. */
  videoRef?: (el: HTMLVideoElement | null) => void;
  /** Real derivative (Grad-CAM heatmap) composited on top of the base
   * media at reduced opacity — never shown alone. */
  overlayUrl?: string;
  /** Plain CSS filter (ELA/Edge Detection) — mutually exclusive with
   * `overlayUrl` in practice, matching the mock's own `mode.id ===
   * "heatmap" ? {} : getFilterStyle(mode.id)` split. */
  filterStyle?: React.CSSProperties;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center gap-1 overflow-hidden rounded-md border p-1 transition-all",
        active ? "border-accent-primary bg-accent-dim" : "border-border-subtle bg-surface hover:bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded bg-black">
        {isVideo ? (
          <video
            ref={videoRef}
            src={baseMediaUrl}
            muted
            playsInline
            className="size-full object-cover"
            style={filterStyle}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={baseMediaUrl} alt={label} className="size-full object-cover" style={filterStyle} />
        )}
        {overlayUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overlayUrl}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 mix-blend-hard-light"
          />
        )}
      </div>
      <span className="text-[10px] font-medium text-text-secondary">{label}</span>
    </button>
  );
}
