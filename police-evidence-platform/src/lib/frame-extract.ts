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
 * Samples up to `maxFrames` evenly-spaced frames from a video for the
 * detection classifier (PS4_MVP_BUILD_PLAN.md §3 — "reuse the image model
 * via frame sampling," video support isn't a separate model). Returns each
 * frame's real timestamp alongside its bytes — previously discarded after
 * picking the worst-scoring frame, now the basis for the real per-frame
 * timeline surfaced in the investigator UI (DetectionResult.frameScoresJson).
 */
export async function sampleVideoFrames(
  filePath: string,
  durationSeconds: number,
  maxFrames = 6,
): Promise<SampledFrame[]> {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    // No usable duration (ffprobe failed earlier, or a 0-length/corrupt
    // file) — nothing sane to sample. Caller treats an empty array as "no
    // frames available," not an error.
    return [];
  }

  const frameCount = Math.max(1, Math.min(maxFrames, Math.floor(durationSeconds)));
  // Evenly spaced, avoiding the very first/last frame (often black/blank in
  // real footage) by sampling within the middle 90% of the clip.
  const timestamps = Array.from({ length: frameCount }, (_, i) => {
    const fraction = frameCount === 1 ? 0.5 : 0.05 + (0.9 * i) / (frameCount - 1);
    return durationSeconds * fraction;
  });

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
