import "server-only";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { extractFrameAt } from "@/lib/frame-extract";

export interface VideoDiffResult {
  diffPngBuffer: Buffer;
  diffPercentage: number;
}

// Both frames are forced to this common canvas before diffing — the two
// source videos are very unlikely to share a resolution, and pixelmatch
// requires identical dimensions. This is a best-effort visual diff (no
// frame-registration/alignment correction beyond matching timestamps), not
// a forensically precise pixel-for-pixel comparison — disclosed in the UI,
// not claimed to be more than it is.
const DIFF_WIDTH = 480;
const DIFF_HEIGHT = 270;

/**
 * Real pixel-level diff between this exhibit and a matched cross-case
 * original, both at the same relative timestamp — extracts one real frame
 * from each via the same ffmpeg primitive already used for classifier
 * sampling (frame-extract.ts), normalizes both to an identical canvas with
 * sharp (already a dependency), and diffs the raw pixels with pixelmatch
 * (small, pure-JS, no native binary). Never fabricates a diff when the
 * frames can't actually be extracted — throws, and the caller surfaces
 * that honestly rather than returning a placeholder image.
 */
export async function diffAgainstMatch(
  evidencePath: string,
  matchedEvidencePath: string,
  timestampSeconds: number,
): Promise<VideoDiffResult> {
  const [frameA, frameB] = await Promise.all([
    extractFrameAt(evidencePath, timestampSeconds),
    extractFrameAt(matchedEvidencePath, timestampSeconds),
  ]);

  const [rawA, rawB] = await Promise.all([
    sharp(frameA).resize(DIFF_WIDTH, DIFF_HEIGHT, { fit: "cover" }).ensureAlpha().raw().toBuffer(),
    sharp(frameB).resize(DIFF_WIDTH, DIFF_HEIGHT, { fit: "cover" }).ensureAlpha().raw().toBuffer(),
  ]);

  const diffOutput = new Uint8Array(DIFF_WIDTH * DIFF_HEIGHT * 4);
  const mismatchedPixels = pixelmatch(rawA, rawB, diffOutput, DIFF_WIDTH, DIFF_HEIGHT, { threshold: 0.1 });

  const diffPngBuffer = await sharp(Buffer.from(diffOutput), {
    raw: { width: DIFF_WIDTH, height: DIFF_HEIGHT, channels: 4 },
  })
    .png()
    .toBuffer();

  const diffPercentage = (mismatchedPixels / (DIFF_WIDTH * DIFF_HEIGHT)) * 100;

  return { diffPngBuffer, diffPercentage };
}
