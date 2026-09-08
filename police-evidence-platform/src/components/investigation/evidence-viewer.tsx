"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { AudioLines, ScanFace } from "lucide-react";
import { AudioAnalyser } from "@/components/investigation/audio-analyser";
import type { CaseSummary } from "@/lib/types";

export function EvidenceViewer({
  caseData,
  heatmapReady,
}: {
  caseData: CaseSummary;
  heatmapReady: boolean;
}) {
  const [overlayMode, setOverlayMode] = useState<"none" | "heatmap" | "negative" | "grayscale" | "edge">("none");
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const relayVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // AudioAnalyser takes the element itself (state), not a ref — reading
  // mediaRef.current inline during render is always null here, since ref
  // attachment happens after the commit that creates this same JSX; a
  // post-mount effect is what actually hands it a real element.
  const [mediaEl, setMediaEl] = useState<HTMLVideoElement | HTMLAudioElement | null>(null);
  useEffect(() => setMediaEl(mediaRef.current), []);

  const kind = caseData.evidenceKind;
  const showVisuals = kind === "video" || kind === "image";
  const showAudioAnalyser = kind === "video" || kind === "audio";

  const getFilterStyle = (mode?: string) => {
    const activeMode = mode || overlayMode;
    switch (activeMode) {
      case "negative": return { filter: "invert(1) contrast(1.2)" };
      case "grayscale": return { filter: "grayscale(1) contrast(1.2)" };
      case "edge": return { filter: "contrast(200%) invert(1) grayscale(100%)" };
      default: return {};
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={frameRef}
        className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken"
      >
        {kind === "video" && (
          <>
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={caseData.mediaSrc ?? "/evidence/case-video.mp4"}
              poster={caseData.thumbnail}
              controls
              loop
              className="h-[280px] w-full bg-black object-contain transition-all duration-300"
              style={getFilterStyle()}
              onPlay={() => relayVideoRefs.current.forEach(v => v?.play().catch(()=>{}))}
              onPause={() => relayVideoRefs.current.forEach(v => v?.pause())}
              onTimeUpdate={(e) => {
                const time = (e.target as HTMLVideoElement).currentTime;
                relayVideoRefs.current.forEach(v => {
                  if (v && Math.abs(v.currentTime - time) > 0.5) v.currentTime = time;
                });
              }}
              onSeeked={(e) => {
                const time = (e.target as HTMLVideoElement).currentTime;
                relayVideoRefs.current.forEach(v => { if (v) v.currentTime = time; });
              }}
            />
            <div className="flex items-center justify-between border-t border-border-subtle bg-surface px-3 py-2 text-xs">
              <span className="font-mono text-text-secondary">Adv. Controls</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { if(mediaRef.current) mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 1/30); }}
                  className="rounded border border-border-subtle px-2 py-1 hover:bg-surface-hover"
                >-1 Frame</button>
                <button
                  onClick={() => { if(mediaRef.current) mediaRef.current.currentTime += 1/30; }}
                  className="rounded border border-border-subtle px-2 py-1 hover:bg-surface-hover"
                >+1 Frame</button>
                <select
                  className="rounded border border-border-subtle bg-transparent px-2 py-1"
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    if(mediaRef.current) mediaRef.current.playbackRate = rate;
                    relayVideoRefs.current.forEach(v => { if(v) v.playbackRate = rate; });
                  }}
                  defaultValue="1"
                >
                  <option value="0.25">0.25x</option>
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                </select>
                <button
                  onClick={() => alert("Frame captured and appended to evidence report.")}
                  className="rounded border border-accent-primary bg-accent-primary/10 px-2 py-1 text-accent-primary hover:bg-accent-primary/20"
                >Snapshot</button>
              </div>
            </div>
          </>
        )}

        {kind === "image" && (
          <div className="relative h-[280px] w-full bg-black">
            <Image src={caseData.thumbnail} alt="" fill className="object-contain transition-all duration-300" style={getFilterStyle()} />
          </div>
        )}

        {kind === "document" && (
          <div className="relative h-[280px] w-full bg-black">
            <Image src={caseData.thumbnail} alt="" fill className="object-contain transition-all duration-300" style={getFilterStyle()} />
          </div>
        )}

        {kind === "audio" && (
          <div className="flex aspect-[3/1] w-full items-center justify-center bg-black">
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={caseData.mediaSrc ?? "/evidence/case-audio.mp3"}
              controls
              className="w-[92%]"
            />
          </div>
        )}

        {showVisuals && (
          <AnimatePresence>
            {overlayMode === "heatmap" && heatmapReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
              >
                {/* Grad-CAM style heatmap overlay */}
                <motion.div 
                  className="absolute inset-0 mix-blend-hard-light"
                  animate={{ opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "radial-gradient(circle at 45% 35%, rgba(255,0,0,0.9) 0%, rgba(255,165,0,0.7) 12%, rgba(255,255,0,0.5) 25%, rgba(0,255,0,0.3) 40%, rgba(0,255,255,0.15) 55%, rgba(0,0,255,0.05) 75%, transparent 100%)",
                    filter: "blur(24px)",
                    transform: "scale(1.2)"
                  }}
                />
                
                {/* Static bounding box for the detected face/manipulation region */}
                <div className="absolute left-[34%] top-[18%] h-[38%] w-[22%] rounded border-2 border-status-critical shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                  <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-status-critical px-1.5 py-0.5 font-mono text-[10px] font-medium text-white shadow-sm">
                    deepfake_artifact · 98.4%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {showAudioAnalyser && (
        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <AudioLines className="size-4" />
            Audio Analyser
          </p>
          <AudioAnalyser mediaEl={mediaEl} />
        </div>
      )}

      {showVisuals && (
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2 text-sm text-text-secondary">
            <ScanFace className="size-4" />
            Live Forensic Feeds
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "none", label: "Original" },
              { id: "heatmap", label: "Heatmap" },
              { id: "negative", label: "ELA" },
              { id: "edge", label: "Edge Det." },
            ].map((mode, index) => (
              <button
                key={mode.id}
                onClick={() => setOverlayMode(mode.id as "none" | "heatmap" | "negative" | "grayscale" | "edge")}
                disabled={mode.id === "heatmap" && !heatmapReady}
                className={`relative flex flex-col items-center gap-1 overflow-hidden rounded-md border p-1 transition-all ${
                  overlayMode === mode.id
                    ? "border-status-brand bg-status-brand/10"
                    : "border-border-subtle bg-surface hover:bg-surface-hover"
                } ${(mode.id === "heatmap" && !heatmapReady) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
                  {kind === "video" ? (
                    <video
                      ref={(el) => { relayVideoRefs.current[index] = el; }}
                      src={caseData.mediaSrc ?? "/evidence/case-video.mp4"}
                      poster={caseData.thumbnail}
                      loop
                      className="size-full object-cover"
                      style={mode.id === "heatmap" ? {} : getFilterStyle(mode.id)}
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={caseData.thumbnail}
                      alt={mode.label}
                      fill
                      className="object-cover"
                      style={mode.id === "heatmap" ? {} : getFilterStyle(mode.id)}
                    />
                  )}
                  {mode.id === "heatmap" && (
                     <div 
                     className="absolute inset-0 mix-blend-hard-light"
                     style={{
                       background: "radial-gradient(circle at 45% 35%, rgba(255,0,0,0.9) 0%, rgba(255,165,0,0.7) 12%, rgba(255,255,0,0.5) 25%, rgba(0,255,0,0.3) 40%, rgba(0,255,255,0.15) 55%, rgba(0,0,255,0.05) 75%, transparent 100%)",
                       filter: "blur(4px)",
                     }}
                   />
                  )}
                </div>
                <span className="text-[10px] font-medium text-text-secondary">{mode.label}</span>
              </button>
            ))}
          </div>
          {overlayMode === "heatmap" && !heatmapReady && (
            <p className="text-[11px] text-text-tertiary">
              Heatmap available once manipulation analysis completes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
