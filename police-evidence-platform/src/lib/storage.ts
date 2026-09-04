import { createHash } from "crypto";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

// storage/ lives inside police-evidence-platform/ (alongside package.json),
// which is process.cwd() when the Next.js server is running — no ".." here.
const STORAGE_DIR = path.join(process.cwd(), "storage");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const HEATMAPS_DIR = path.join(STORAGE_DIR, "heatmaps");
const FACE_CROPS_DIR = path.join(STORAGE_DIR, "face-crops");
const PENDING_CAPTURES_DIR = path.join(STORAGE_DIR, "pending-captures");
const VIDEO_DIFFS_DIR = path.join(STORAGE_DIR, "video-diffs");

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "application/pdf": "pdf",
};

export function extensionForMime(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? "bin";
}

export function sha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Writes the file to storage/uploads/{sha256}.{ext} — content-addressed, so
 * re-uploading identical bytes (even for a different case, see the schema
 * note on Evidence.sha256) naturally dedupes on disk without extra logic.
 * Returns the path stored on the Evidence row (relative to storage/, not the
 * absolute filesystem path — keeps the DB portable across machines).
 */
export function writeEvidenceFile(sha256: string, mimeType: string, buffer: Buffer): string {
  mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = `${sha256}.${extensionForMime(mimeType)}`;
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (!existsSync(fullPath)) {
    writeFileSync(fullPath, buffer);
  }
  return path.join("uploads", filename);
}

/**
 * Same content-addressed pattern as writeEvidenceFile, separate directory —
 * a PendingCapture isn't evidence yet (no case exists to attach it to), so
 * it lives outside storage/uploads/ until a New Case submit turns it into
 * a real Evidence row via the normal evidence route.
 */
export function writePendingCaptureFile(sha256: string, mimeType: string, buffer: Buffer): string {
  mkdirSync(PENDING_CAPTURES_DIR, { recursive: true });
  const filename = `${sha256}.${extensionForMime(mimeType)}`;
  const fullPath = path.join(PENDING_CAPTURES_DIR, filename);
  if (!existsSync(fullPath)) {
    writeFileSync(fullPath, buffer);
  }
  return path.join("pending-captures", filename);
}

/** Resolves an Evidence.filePath (relative to storage/) back to an absolute
 * path — needed by anything that opens the file directly (ffprobe, exifr). */
export function resolveEvidencePath(relativeFilePath: string): string {
  return path.join(STORAGE_DIR, relativeFilePath);
}

/** Decodes and writes a Grad-CAM heatmap PNG (base64, from the ML service
 * response) to storage/heatmaps/, keyed by evidence ID rather than content
 * hash — unlike the source file, a heatmap is a derived artifact tied to one
 * detection run, not a piece of evidence to dedupe by bytes. */
export function writeHeatmap(evidenceId: string, heatmapPngBase64: string): string {
  mkdirSync(HEATMAPS_DIR, { recursive: true });
  const filename = `${evidenceId}.png`;
  writeFileSync(path.join(HEATMAPS_DIR, filename), Buffer.from(heatmapPngBase64, "base64"));
  return path.join("heatmaps", filename);
}

/** Decodes and writes every real per-frame Grad-CAM heatmap for a video —
 * same keyed-by-evidence-ID pattern as writeHeatmap, distinct filenames so
 * this never collides with the single worst-frame heatmap `writeHeatmap`
 * already writes to `heatmaps/{evidenceId}.png`. Returns the paths in the
 * same order/index as the input array (which must match frameScoresJson's
 * order). */
export function writeFrameHeatmaps(evidenceId: string, heatmapsPngBase64: string[]): string[] {
  mkdirSync(HEATMAPS_DIR, { recursive: true });
  return heatmapsPngBase64.map((base64, i) => {
    const filename = `${evidenceId}-frame${i}.png`;
    writeFileSync(path.join(HEATMAPS_DIR, filename), Buffer.from(base64, "base64"));
    return path.join("heatmaps", filename);
  });
}

/** Writes a real pixel-diff overlay PNG (already-encoded, from
 * video-diff.ts) to storage/video-diffs/ — same keyed-by-evidence-ID
 * pattern as writeHeatmap, a derived artifact tied to one diff run. */
export function writeVideoDiff(evidenceId: string, diffPngBuffer: Buffer): string {
  mkdirSync(VIDEO_DIFFS_DIR, { recursive: true });
  const filename = `${evidenceId}.png`;
  writeFileSync(path.join(VIDEO_DIFFS_DIR, filename), diffPngBuffer);
  return path.join("video-diffs", filename);
}

/** Decodes and writes every real detected face crop (index 0 is MTCNN's
 * actual aligned classifier input, the rest are plain display-only crops)
 * to storage/face-crops/ — same keyed-by-evidence-ID pattern as
 * writeHeatmap, since these are likewise derived artifacts tied to one
 * detection run. Returns the paths in the same order as the input array. */
export function writeFaceCrops(evidenceId: string, faceCropsPngBase64: string[]): string[] {
  mkdirSync(FACE_CROPS_DIR, { recursive: true });
  return faceCropsPngBase64.map((base64, i) => {
    const filename = `${evidenceId}-${i}.png`;
    writeFileSync(path.join(FACE_CROPS_DIR, filename), Buffer.from(base64, "base64"));
    return path.join("face-crops", filename);
  });
}
