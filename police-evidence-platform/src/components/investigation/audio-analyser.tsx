"use client";

import { useEffect, useRef, useState } from "react";

const SAMPLE_COUNT = 160;
const VIEW_W = 640;
const VIEW_H = 56;
const MID = VIEW_H / 2;

const SPECTROGRAM_W = 320;
const SPECTROGRAM_H = 90;
const FFT_SIZE = 2048;

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

/** Low value = quiet (dark blue), high value = loud (red) — a standard
 * heat-style spectrogram color ramp, not an arbitrary choice. */
function intensityToColor(value: number): string {
  const t = value / 255;
  const hue = 240 - t * 240;
  const lightness = 12 + t * 45;
  return `hsl(${hue.toFixed(0)}, 90%, ${lightness.toFixed(0)}%)`;
}

interface AudioGraph {
  ctx: AudioContext;
  // The playback analyser is in the graph's audible path (source ->
  // analyser -> destination) and drives the waveform. The frequency
  // analyser is a second, silent tap directly off `source` (per the Web
  // Audio spec, an AnalyserNode still processes audio from a connected
  // input even with no output connections) — this is what makes the
  // spectrogram possible without doubling playback volume by chaining two
  // analysers in series into destination.
  playbackAnalyser: AnalyserNode;
  freqAnalyser: AnalyserNode;
  refCount: number;
}

// One real audio graph per media element, shared across every mounted
// AudioAnalyser instance for that element — a browser can only ever create
// ONE MediaElementAudioSourceNode per <video>/<audio> element in its whole
// lifetime, so this cannot be recreated per-component the way the old mock
// (and this component's own earlier per-instance-cache version) assumed.
const graphCache = new WeakMap<HTMLMediaElement, AudioGraph>();

function getAudioGraph(el: HTMLMediaElement): AudioGraph {
  const cached = graphCache.get(el);
  if (cached) {
    cached.refCount++;
    return cached;
  }
  const ctx = new AudioContext();
  const source = ctx.createMediaElementSource(el);
  const playbackAnalyser = ctx.createAnalyser();
  playbackAnalyser.fftSize = 1024;
  playbackAnalyser.smoothingTimeConstant = 0.65;
  source.connect(playbackAnalyser);
  playbackAnalyser.connect(ctx.destination);

  const freqAnalyser = ctx.createAnalyser();
  freqAnalyser.fftSize = FFT_SIZE;
  freqAnalyser.smoothingTimeConstant = 0.4;
  source.connect(freqAnalyser);

  const graph: AudioGraph = { ctx, playbackAnalyser, freqAnalyser, refCount: 1 };
  graphCache.set(el, graph);
  return graph;
}

function releaseAudioGraph(el: HTMLMediaElement) {
  const graph = graphCache.get(el);
  if (!graph) return;
  graph.refCount--;
  if (graph.refCount <= 0) {
    void graph.ctx.close();
    graphCache.delete(el);
  }
}

/**
 * Real-time waveform + spectrogram for a playing video/audio element —
 * genuine Web Audio API analysis (time-domain for the waveform, FFT
 * frequency data scrolled into a canvas for the spectrogram), not
 * simulated data. The spectrogram is the kind of view a real forensic
 * audio review actually uses to spot splice points and synthetic-speech
 * artifacts (visible as unnaturally sharp discontinuities or missing
 * harmonic structure) — something neither this platform nor the old mock
 * page ever had.
 */
export function AudioAnalyser({ mediaEl }: { mediaEl: HTMLMediaElement | null }) {
  const [path, setPath] = useState(IDLE_PATH);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = mediaEl;
    if (!el) return;

    let graph: AudioGraph | null = null;
    const freqData = new Uint8Array(FFT_SIZE / 2) as Uint8Array<ArrayBuffer>;
    const waveData = new Uint8Array(1024) as Uint8Array<ArrayBuffer>;

    const drawSpectrogramColumn = () => {
      const canvas = canvasRef.current;
      const ctx2d = canvas?.getContext("2d");
      if (!canvas || !ctx2d || !graph) return;
      graph.freqAnalyser.getByteFrequencyData(freqData);
      // Classic scrolling-spectrogram trick: shift the existing image one
      // pixel left, then paint a fresh column of frequency-bin intensities
      // at the right edge — time flows left to right.
      ctx2d.drawImage(canvas, -1, 0);
      for (let row = 0; row < SPECTROGRAM_H; row++) {
        // Row 0 (top) = highest frequency, last row (bottom) = lowest —
        // matches conventional spectrogram orientation.
        const binIndex = Math.floor(((SPECTROGRAM_H - row) / SPECTROGRAM_H) * freqData.length);
        ctx2d.fillStyle = intensityToColor(freqData[binIndex] ?? 0);
        ctx2d.fillRect(SPECTROGRAM_W - 1, row, 1, 1);
      }
    };

    const tick = () => {
      if (!graph) return;
      graph.playbackAnalyser.getByteTimeDomainData(waveData);
      const step = Math.floor(waveData.length / SAMPLE_COUNT);
      const deviations: number[] = [];
      let maxDeviation = 1;
      for (let i = 0; i < SAMPLE_COUNT; i++) {
        const dev = (waveData[i * step] ?? 128) - 128;
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

      drawSpectrogramColumn();
      rafRef.current = requestAnimationFrame(tick);
    };

    const handlePlay = () => {
      try {
        graph = getAudioGraph(el);
        void graph.ctx.resume();
        cancelAnimationFrame(rafRef.current);
        tick();
      } catch (err) {
        console.error("Audio analyser unavailable", err);
      }
    };

    const handlePause = () => {
      cancelAnimationFrame(rafRef.current);
      setPath(IDLE_PATH);
    };

    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    el.addEventListener("ended", handlePause);

    return () => {
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("ended", handlePause);
      cancelAnimationFrame(rafRef.current);
      if (graph) releaseAudioGraph(el);
    };
  }, [mediaEl]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-14 overflow-hidden rounded-md border border-border-subtle bg-surface-sunken px-3 py-1">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="h-full w-full">
          <line x1={0} y1={MID} x2={VIEW_W} y2={MID} stroke="var(--border-subtle)" strokeWidth={1} />
          <path d={path} fill="none" stroke="var(--accent-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="mb-1 text-[10px] text-text-tertiary">Spectrogram (frequency vs. time)</p>
        <canvas
          ref={canvasRef}
          width={SPECTROGRAM_W}
          height={SPECTROGRAM_H}
          className="h-20 w-full rounded-md border border-border-subtle bg-black"
        />
      </div>
    </div>
  );
}
