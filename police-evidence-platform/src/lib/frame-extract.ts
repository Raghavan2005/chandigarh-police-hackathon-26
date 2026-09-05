import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

const execFileAsync = promisify(execFile);

export interface SampledFrame {
  buffer: Buffer;
  timestampSeconds: number;
}

/**
 * Real single-frame extraction at an exact timestamp via ffmpeg — the
 * shared primitive behind both video-classifier sampling below and the
 * investigator-triggered "extract this frame as evidence" action
 * (extract-frame route), so both paths use the identical, real extraction
 * method rather than one being a lighter-weight approximation of the other.
 */
export async function extractFrameAt(filePath: string, timestampSeconds: number): Promise<Buffer> {
  const tempDir = await mkdtemp(path.join(tmpdir(), "pramana-frame-"));
  try {
    const outPath = path.join(tempDir, "frame.jpg");
    await execFileAsync(ffmpegPath, [
      "-y",
      "-ss",
      timestampSeconds.toFixed(2),
      "-i",
      filePath,
      "-vframes",
      "1",
      "-q:v",
      "2",
      outPath,
    ]);
    return await readFile(outPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Samples frames from a video for a detection model — either evenly spaced
 * across the whole clip (default, PS4_MVP_BUILD_PLAN.md §3 — "reuse the
 * image model via frame sampling," used by the deepfake classifier) or, if
 * `intervalSeconds` is given, at a fixed interval up to `maxFrames` — the
 * denser coverage CCTV-style scanning needs (use case #1: a person/
 * vehicle/plate may only be on-screen for a couple of seconds, which a
 * 6-frame whole-clip sample would very likely miss entirely). Returns each
 * frame's real timestamp alongside its bytes — previously discarded after
 * picking the worst-scoring frame in the deepfake path, now also the basis
 * for the real per-frame timeline surfaced in the investigator UI
 * (DetectionResult.frameScoresJson) and, for the interval mode, the CCTV
 * object/face detection pipeline.
 */
export async function sampleVideoFrames(
  filePath: string,
  durationSeconds: number,
  maxFrames = 6,
  intervalSeconds?: number,
): Promise<SampledFrame[]> {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    // No usable duration (ffprobe failed earlier, or a 0-length/corrupt
    // file) — nothing sane to sample. Caller treats an empty array as "no
    // frames available," not an error.
    return [];
  }

  let timestamps: number[];
  if (intervalSeconds && intervalSeconds > 0) {
    // Fixed-interval sampling: starts half an interval in (skips a likely
    // black/blank opening frame, same reasoning as the 5% margin below)
    // and steps every intervalSeconds up to the cap — disclosed sampling
    // strategy for CCTV use case #1, not an attempt to sample every frame.
    const count = Math.max(1, Math.min(maxFrames, Math.floor(durationSeconds / intervalSeconds)));
    timestamps = Array.from({ length: count }, (_, i) =>
      Math.min(durationSeconds - 0.05, intervalSeconds / 2 + i * intervalSeconds),
    );
  } else {
    const frameCount = Math.max(1, Math.min(maxFrames, Math.floor(durationSeconds)));
    // Evenly spaced, avoiding the very first/last frame (often black/blank
    // in real footage) by sampling within the middle 90% of the clip.
    timestamps = Array.from({ length: frameCount }, (_, i) => {
      const fraction = frameCount === 1 ? 0.5 : 0.05 + (0.9 * i) / (frameCount - 1);
      return durationSeconds * fraction;
    });
  }

  const frames: SampledFrame[] = [];
  for (const timestampSeconds of timestamps) {
    try {
      const buffer = await extractFrameAt(filePath, timestampSeconds);
      frames.push({ buffer, timestampSeconds });
    } catch (error) {
      // One bad timestamp (e.g. right at EOF) shouldn't sink the whole
      // sampling pass — skip it and keep the frames that did extract.
      console.warn(`[frame-extract] failed to extract frame at ${timestampSeconds.toFixed(2)}s:`, error);
    }
  }
  return frames;
}
