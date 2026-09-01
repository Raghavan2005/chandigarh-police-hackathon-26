"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const SAMPLE_COUNT = 160;
const VIEW_W = 640;
const VIEW_H = 56;
const MID = VIEW_H / 2;

function idlePath() {
  const pts: string[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const x = (i / (SAMPLE_COUNT - 1)) * VIEW_W;
    const noise =
      Math.sin(i * 0.9) * 1.4 + Math.sin(i * 2.3) * 0.6 + Math.sin(i * 0.17) * 2;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(MID + noise).toFixed(1)}`);
  }
  return pts.join(" ");
}

const IDLE_PATH = idlePath();

const audioGraphCache = new WeakMap<
  HTMLMediaElement,
  { ctx: AudioContext; analyser: AnalyserNode }
>();

export function AudioWaveform({
  mediaRef,
}: {
  mediaRef: RefObject<HTMLMediaElement | null>;
}) {
  const [path, setPath] = useState(IDLE_PATH);
  const rafRef = useRef(0);

  useEffect(() => {
    const video = mediaRef.current;
    if (!video) return;

    const getGraph = () => {
      const cached = audioGraphCache.get(video);
      if (cached) return cached;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.65;
      const source = ctx.createMediaElementSource(video);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      const graph = { ctx, analyser };
      audioGraphCache.set(video, graph);
      return graph;
    };

    const tick = (analyser: AnalyserNode, data: Uint8Array<ArrayBuffer>) => {
      analyser.getByteTimeDomainData(data);
      const step = Math.floor(data.length / SAMPLE_COUNT);

      const deviations: number[] = [];
      let maxDeviation = 1;
      for (let i = 0; i < SAMPLE_COUNT; i++) {
        const dev = (data[i * step] ?? 128) - 128;
        deviations.push(dev);
        maxDeviation = Math.max(maxDeviation, Math.abs(dev));
      }
      // Auto-gain so quiet source audio still reads as a visible waveform.
      const gain = Math.min(8, (MID - 3) / maxDeviation);

      const pts = deviations.map((dev, i) => {
        const x = (i / (SAMPLE_COUNT - 1)) * VIEW_W;
        const y = MID - dev * gain;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      });
      setPath(pts.join(" "));
      rafRef.current = requestAnimationFrame(() => tick(analyser, data));
    };

    const handlePlay = () => {
      try {
        const { ctx, analyser } = getGraph();
        void ctx.resume();
        const data = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;
        cancelAnimationFrame(rafRef.current);
        tick(analyser, data);
      } catch (err) {
        console.error("Audio analyser unavailable", err);
      }
    };

    const handlePause = () => {
      cancelAnimationFrame(rafRef.current);
      setPath(IDLE_PATH);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handlePause);
      cancelAnimationFrame(rafRef.current);
      const graph = audioGraphCache.get(video);
      if (graph) {
        void graph.ctx.close();
        audioGraphCache.delete(video);
      }
    };
  }, [mediaRef]);

  return (
    <div className="h-14 overflow-hidden rounded-md border border-border-subtle bg-surface-sunken px-3 py-1">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <line
          x1={0}
          y1={MID}
          x2={VIEW_W}
          y2={MID}
          stroke="var(--border-subtle)"
          strokeWidth={1}
        />
        <path
          d={path}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
