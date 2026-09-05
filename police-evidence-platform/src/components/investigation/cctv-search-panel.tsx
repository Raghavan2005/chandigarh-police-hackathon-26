"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Car, Loader2, ScanSearch, Search, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CachedCctvFrameSample {
  id: string;
  frameIndex: number;
  timestampSeconds: number;
  objectDetections: {
    objectClass: string;
    confidence: number;
    boundingBoxJson: string;
    plateText: string | null;
    plateConfidence: number | null;
  }[];
  faces: { boundingBoxJson: string; detectionProbability: number | null }[];
}

export interface CachedReferenceMatchResult {
  id: string;
  matchType: string;
  referenceLabel: string;
  referenceImagePath: string | null;
  frameIndex: number;
  timestampSeconds: number;
  similarity: number;
  boundingBoxJson: string | null;
  ranAt: string;
}

interface Summary {
  frameCount: number;
  personCount: number;
  vehicleCountByClass: Record<string, number>;
  faceCount: number;
  plateCandidates: { text: string; confidence: number; timestampSeconds: number }[];
}

interface MatchEntry {
  frameIndex: number;
  timestampSeconds: number;
  similarity: number;
  box: number[] | null;
}

const VEHICLE_CLASSES = new Set(["car", "truck", "bus", "motorcycle"]);

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function deriveSummary(samples: CachedCctvFrameSample[]): Summary {
  let personCount = 0;
  const vehicleCountByClass: Record<string, number> = {};
  let faceCount = 0;
  const plateCandidates: Summary["plateCandidates"] = [];
  for (const sample of samples) {
    for (const obj of sample.objectDetections) {
      if (obj.objectClass === "person") personCount += 1;
      else if (VEHICLE_CLASSES.has(obj.objectClass)) {
        vehicleCountByClass[obj.objectClass] = (vehicleCountByClass[obj.objectClass] ?? 0) + 1;
      }
      if (obj.plateText) {
        plateCandidates.push({
          text: obj.plateText,
          confidence: obj.plateConfidence ?? 0,
          timestampSeconds: sample.timestampSeconds,
        });
      }
    }
    faceCount += sample.faces.length;
  }
  return { frameCount: samples.length, personCount, vehicleCountByClass, faceCount, plateCandidates };
}

/** One matched frame's real thumbnail with a real bounding-box overlay —
 * same object-contain letterbox math already proven in
 * real-evidence-viewer.tsx for face boxes (the displayed image rarely has
 * the exact aspect ratio of its fixed-height container, so the box has to
 * be positioned against the actual rendered content rect, not raw
 * container percentages), reapplied here against a single static frame
 * image instead of a live video/image element. */
function MatchFrameThumb({
  caseId,
  evidenceId,
  frameIndex,
  timestampSeconds,
  box,
}: {
  caseId: string;
  evidenceId: string;
  frameIndex: number;
  timestampSeconds: number;
  box: number[] | null;
}) {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const CONTAINER_HEIGHT = 110;
  // Tracked via ResizeObserver into state, not read from the ref during
  // render — same rule real-evidence-viewer.tsx's own letterbox math
  // already follows (reading ref.current in the render body isn't
  // safe/reactive in React).
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const boxStyle = (() => {
    if (!box || !naturalSize || !containerWidth) return null;
    const [x1, y1, x2, y2] = box;
    const scale = Math.min(containerWidth / naturalSize.w, CONTAINER_HEIGHT / naturalSize.h);
    const dw = naturalSize.w * scale;
    const dh = naturalSize.h * scale;
    const offsetX = (containerWidth - dw) / 2;
    const offsetY = (CONTAINER_HEIGHT - dh) / 2;
    return {
      left: offsetX + x1 * dw,
      top: offsetY + y1 * dh,
      width: (x2 - x1) * dw,
      height: (y2 - y1) * dh,
    };
  })();

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-md border border-border-subtle bg-black"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/cases/${caseId}/evidence/${evidenceId}/cctv-frame?frame=${frameIndex}`}
          alt={`Sampled frame at ${formatTimestamp(timestampSeconds)}`}
          className="h-full w-full object-contain"
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0) setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
          }}
          onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
        {boxStyle && (
          <div
            className="absolute rounded-sm border-2 border-status-warning"
            style={{ left: boxStyle.left, top: boxStyle.top, width: boxStyle.width, height: boxStyle.height }}
          />
        )}
      </div>
      <p className="text-center text-[10px] text-text-tertiary">{formatTimestamp(timestampSeconds)}</p>
    </div>
  );
}

/**
 * CCTV object/vehicle/plate/face detection + reference matching
 * (PS4_USE_CASES.md item #1) — video evidence only. Two stages:
 *
 * 1. "Detect objects, plates & faces" densely samples the video (see
 *    detect-cctv route) and shows real counts — never fabricated, an
 *    empty count for a class is an honest "none found above threshold."
 * 2. Once detected, an investigator can match a reference plate string or
 *    upload a reference face photo against what was found — real fuzzy
 *    plate matching and real cosine-similarity face matching (see
 *    reference-match route), each result carrying its real similarity
 *    score against a disclosed threshold.
 *
 * Face matching is explicitly NOT presented as certified biometric
 * identification anywhere in this panel's copy — a similarity score an
 * investigator judges themselves, same honesty standard as every other
 * model in this codebase.
 */
export function CctvSearchPanel({
  caseId,
  evidenceId,
  cachedFrameSamples,
  cachedMatches,
}: {
  caseId: string;
  evidenceId: string;
  cachedFrameSamples: CachedCctvFrameSample[];
  cachedMatches: CachedReferenceMatchResult[];
}) {
  const [summary, setSummary] = useState<Summary | null>(
    cachedFrameSamples.length > 0 ? deriveSummary(cachedFrameSamples) : null,
  );
  const [detectStatus, setDetectStatus] = useState<"idle" | "running" | "error">("idle");
  const [detectError, setDetectError] = useState("");

  const [plateText, setPlateText] = useState("");
  const [plateMatches, setPlateMatches] = useState<MatchEntry[]>(
    cachedMatches.filter((m) => m.matchType === "plate").map(toMatchEntry),
  );
  const [plateReferenceLabel, setPlateReferenceLabel] = useState<string | null>(
    cachedMatches.find((m) => m.matchType === "plate")?.referenceLabel ?? null,
  );
  const [plateStatus, setPlateStatus] = useState<"idle" | "running" | "error">("idle");
  const [plateError, setPlateError] = useState("");

  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [faceMatches, setFaceMatches] = useState<MatchEntry[]>(
    cachedMatches.filter((m) => m.matchType === "face").map(toMatchEntry),
  );
  const [faceReferenceLabel, setFaceReferenceLabel] = useState<string | null>(
    cachedMatches.find((m) => m.matchType === "face")?.referenceLabel ?? null,
  );
  const [faceStatus, setFaceStatus] = useState<"idle" | "running" | "error">("idle");
  const [faceError, setFaceError] = useState("");

  function toMatchEntry(m: CachedReferenceMatchResult): MatchEntry {
    return {
      frameIndex: m.frameIndex,
      timestampSeconds: m.timestampSeconds,
      similarity: m.similarity,
      box: m.boundingBoxJson ? (JSON.parse(m.boundingBoxJson) as number[]) : null,
    };
  }

  async function handleDetect() {
    setDetectStatus("running");
    setDetectError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/detect-cctv`, {
      method: "POST",
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setDetectStatus("error");
      setDetectError(body?.error ?? "Detection failed — check the ML service is running and try again.");
      return;
    }
    const data: Summary = await response.json();
    setSummary(data);
    setDetectStatus("idle");
    // A fresh run replaces the underlying sampled frames server-side —
    // any previously shown match results would now point at stale frame
    // images/boxes, so clear them rather than leave a misleading display.
    setPlateMatches([]);
    setFaceMatches([]);
  }

  async function handlePlateMatch() {
    if (!plateText.trim()) return;
    setPlateStatus("running");
    setPlateError("");
    const formData = new FormData();
    formData.append("matchType", "plate");
    formData.append("plateText", plateText.trim());
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reference-match`, {
      method: "POST",
      body: formData,
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setPlateStatus("error");
      setPlateError(body?.error ?? "Plate match failed.");
      return;
    }
    const data = await response.json();
    setPlateMatches(data.matches);
    setPlateReferenceLabel(data.referenceLabel);
    setPlateStatus("idle");
  }

  async function handleFaceMatch() {
    if (!faceFile) return;
    setFaceStatus("running");
    setFaceError("");
    const formData = new FormData();
    formData.append("matchType", "face");
    formData.append("file", faceFile);
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reference-match`, {
      method: "POST",
      body: formData,
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setFaceStatus("error");
      setFaceError(body?.error ?? "Face match failed.");
      return;
    }
    const data = await response.json();
    setFaceMatches(data.matches);
    setFaceReferenceLabel(data.referenceLabel);
    setFaceStatus("idle");
  }

  const dedupedPlates = summary
    ? Array.from(
        summary.plateCandidates
          .reduce((map, p) => {
            const existing = map.get(p.text);
            if (!existing || p.confidence > existing.confidence) map.set(p.text, p);
            return map;
          }, new Map<string, Summary["plateCandidates"][number]>())
          .values(),
      )
    : [];

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-medium text-text-secondary">
          <ScanSearch className="size-3.5" />
          CCTV object / plate / face search
        </p>
        <button
          type="button"
          onClick={handleDetect}
          disabled={detectStatus === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
        >
          {detectStatus === "running" && <Loader2 className="size-3 animate-spin" />}
          {summary ? "Re-run detection" : "Detect objects, plates & faces"}
        </button>
      </div>

      {detectStatus === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {detectError}
        </p>
      )}

      {!summary ? (
        <p className="text-[10px] text-text-tertiary">
          Samples this video every 2 seconds (up to 40 frames) and runs a real COCO object detector
          (person/car/truck/bus/motorcycle) plus EasyOCR plate reading and real face detection on each frame — not
          run yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile icon={<UserRound className="size-3.5" />} label="People" value={summary.personCount} />
            <SummaryTile
              icon={<Car className="size-3.5" />}
              label="Vehicles"
              value={Object.values(summary.vehicleCountByClass).reduce((a, b) => a + b, 0)}
            />
            <SummaryTile icon={<Search className="size-3.5" />} label="Plate reads" value={dedupedPlates.length} />
            <SummaryTile icon={<UserRound className="size-3.5" />} label="Faces" value={summary.faceCount} />
          </div>
          <p className="text-[10px] text-text-tertiary">
            {summary.frameCount} frame{summary.frameCount === 1 ? "" : "s"} sampled (every 2s, up to 40).
            {Object.entries(summary.vehicleCountByClass).length > 0 && (
              <>
                {" "}
                Vehicles by class:{" "}
                {Object.entries(summary.vehicleCountByClass)
                  .map(([cls, count]) => `${count} ${cls}`)
                  .join(", ")}
                .
              </>
            )}
          </p>
          {dedupedPlates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dedupedPlates.map((p) => (
                <span
                  key={p.text}
                  className="rounded border border-border-subtle bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                  title={`OCR confidence ${(p.confidence * 100).toFixed(0)}% at ${formatTimestamp(p.timestampSeconds)}`}
                >
                  {p.text}
                </span>
              ))}
            </div>
          )}

          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Plate reference match */}
            <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-sunken p-2.5">
              <p className="font-medium text-text-secondary">Match a reference plate</p>
              <div className="flex gap-1.5">
                <Input
                  value={plateText}
                  onChange={(e) => setPlateText(e.target.value)}
                  placeholder="e.g. CH01AB1234"
                  className="h-7 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handlePlateMatch}
                  disabled={plateStatus === "running" || !plateText.trim()}
                  className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
                >
                  {plateStatus === "running" ? <Loader2 className="size-3 animate-spin" /> : <Search className="size-3" />}
                </button>
              </div>
              {plateStatus === "error" && <p className="text-status-critical">{plateError}</p>}
              {plateReferenceLabel && (
                <p className="text-[10px] text-text-tertiary">
                  Fuzzy-matched against &quot;{plateReferenceLabel}&quot; — {plateMatches.length} frame
                  {plateMatches.length === 1 ? "" : "s"} above threshold.
                </p>
              )}
              {plateMatches.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {plateMatches.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <MatchFrameThumb
                        caseId={caseId}
                        evidenceId={evidenceId}
                        frameIndex={m.frameIndex}
                        timestampSeconds={m.timestampSeconds}
                        box={m.box}
                      />
                      <p className="text-[10px] text-text-tertiary">{(m.similarity * 100).toFixed(0)}% match</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Face reference match */}
            <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-sunken p-2.5">
              <p className="font-medium text-text-secondary">Match a reference face</p>
              <div className="flex gap-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFaceFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-[10px] text-text-tertiary file:mr-2 file:rounded file:border-0 file:bg-surface file:px-2 file:py-1 file:text-[10px] file:text-text-secondary"
                />
                <button
                  type="button"
                  onClick={handleFaceMatch}
                  disabled={faceStatus === "running" || !faceFile}
                  className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
                >
                  {faceStatus === "running" ? <Loader2 className="size-3 animate-spin" /> : <Search className="size-3" />}
                </button>
              </div>
              {faceStatus === "error" && <p className="text-status-critical">{faceError}</p>}
              {faceReferenceLabel && (
                <p className="text-[10px] text-text-tertiary">
                  Cosine-similarity face match against &quot;{faceReferenceLabel}&quot; (≥90% similarity) —{" "}
                  {faceMatches.length} frame{faceMatches.length === 1 ? "" : "s"} above threshold. A similarity score,
                  not a certified biometric identification.
                </p>
              )}
              {faceMatches.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {faceMatches.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <MatchFrameThumb
                        caseId={caseId}
                        evidenceId={evidenceId}
                        frameIndex={m.frameIndex}
                        timestampSeconds={m.timestampSeconds}
                        box={m.box}
                      />
                      <p className="text-[10px] text-text-tertiary">{(m.similarity * 100).toFixed(0)}% sim.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border border-border-subtle bg-surface-sunken py-2">
      <div className="flex items-center gap-1 text-text-tertiary">{icon}</div>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-tertiary">{label}</p>
    </div>
  );
}
