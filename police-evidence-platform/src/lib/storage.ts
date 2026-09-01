import { createHash } from "crypto";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

// storage/ lives inside police-evidence-platform/ (alongside package.json),
// which is process.cwd() when the Next.js server is running — no ".." here.
const UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");

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
