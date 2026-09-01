import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

const execFileAsync = promisify(execFile);

/**
 * Samples up to `maxFrames` evenly-spaced frames from a video for the
 * detection classifier (PS4_MVP_BUILD_PLAN.md §3 — "reuse the image model
 * via frame sampling," video support isn't a separate model). Extracts to a
 * temp directory (cleaned up unconditionally) rather than piping through
 * stdout — more reliable for binary JPEG output than juggling execFile's
 * stdout buffering.
 */
export async function sampleVideoFrames(filePath: string, durationSeconds: number, maxFrames = 6): Promise<Buffer[]> {
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

  const tempDir = await mkdtemp(path.join(tmpdir(), "pramana-frames-"));
  try {
    const buffers: Buffer[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const outPath = path.join(tempDir, `frame-${i}.jpg`);
      try {
        await execFileAsync(ffmpegPath, [
          "-y",
          "-ss",
          timestamps[i].toFixed(2),
          "-i",
          filePath,
          "-vframes",
          "1",
          "-q:v",
          "2",
          outPath,
        ]);
        buffers.push(await readFile(outPath));
      } catch (error) {
        // One bad timestamp (e.g. right at EOF) shouldn't sink the whole
        // sampling pass — skip it and keep the frames that did extract.
        console.warn(`[frame-extract] failed to extract frame at ${timestamps[i].toFixed(2)}s:`, error);
      }
    }
    return buffers;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
