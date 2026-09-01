import { execFile } from "child_process";
import { promisify } from "util";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import { parse as parseExif } from "exifr";

const execFileAsync = promisify(execFile);

export interface ExtractedMetadata {
  container: string | null;
  resolution: string | null;
  duration: string | null;
  codec: string | null;
  encoderSignature: string | null;
  exifJson: string | null;
}

/**
 * Real Stage 1 extraction (PS4_ANALYSIS_PIPELINE.md §3, Stage 1) — reads
 * whatever the container/format actually exposes, before any AI runs.
 * Per the plan's own framing: the encoder signature doesn't prove
 * manipulation, but professional editing software in the metadata of file
 * presented as "raw" footage is exactly the kind of inconsistency the
 * fusion engine (§4's coverage-aware algorithm) checks for later.
 */
export async function extractMetadata(
  filePath: string,
  mimeType: string,
  buffer: Buffer,
): Promise<ExtractedMetadata> {
  if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
    return extractViaFfprobe(filePath);
  }
  if (mimeType.startsWith("image/")) {
    return extractImageExif(buffer);
  }
  // Documents and anything else: no container/EXIF concept — a real system
  // would OCR/inspect PDF structure here (per the plan's document-modality
  // scope, deprioritized below image/video); return an honestly-empty result
  // rather than fabricate fields that don't apply to this file type.
  return { container: null, resolution: null, duration: null, codec: null, encoderSignature: null, exifJson: null };
}

async function extractViaFfprobe(filePath: string): Promise<ExtractedMetadata> {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);
    const probe = JSON.parse(stdout);
    const format = probe.format ?? {};
    const videoStream = (probe.streams ?? []).find((s: { codec_type?: string }) => s.codec_type === "video");
    const audioStream = (probe.streams ?? []).find((s: { codec_type?: string }) => s.codec_type === "audio");
    const primaryStream = videoStream ?? audioStream;

    const durationSeconds = Number(format.duration);
    const duration = Number.isFinite(durationSeconds) ? `${durationSeconds.toFixed(2)}s` : null;

    const resolution =
      videoStream?.width && videoStream?.height ? `${videoStream.width}x${videoStream.height}` : null;

    // The "encoder" tag is exactly the signal the plan calls out — editing
    // software (Premiere, Final Cut, etc.) leaves this behind; a phone
    // camera's native encoder does not.
    const encoderSignature = format.tags?.encoder ?? format.tags?.Encoder ?? null;

    return {
      container: format.format_long_name ?? format.format_name ?? null,
      resolution,
      duration,
      codec: primaryStream?.codec_name ?? null,
      encoderSignature,
      exifJson: null,
    };
  } catch (error) {
    console.warn(`[metadata] ffprobe failed for ${filePath}:`, error);
    return { container: null, resolution: null, duration: null, codec: null, encoderSignature: null, exifJson: null };
  }
}

/**
 * Takes the buffer directly (already in memory from the upload) rather than
 * re-reading the file from disk by path — exifr's internal Node `fs` usage
 * doesn't survive Next.js/Turbopack's bundling of route handlers intact
 * (confirmed: passing a path threw "Cannot read properties of undefined
 * (reading 'open')" here, even though the identical call works fine outside
 * the Next.js build). Passing the buffer sidesteps that whole class of
 * bundler-interop issue rather than working around it.
 */
async function extractImageExif(buffer: Buffer): Promise<ExtractedMetadata> {
  try {
    const exif = await parseExif(buffer, true);
    if (!exif) {
      return { container: null, resolution: null, duration: null, codec: null, encoderSignature: null, exifJson: null };
    }

    const resolution =
      exif.ExifImageWidth && exif.ExifImageHeight
        ? `${exif.ExifImageWidth}x${exif.ExifImageHeight}`
        : exif.ImageWidth && exif.ImageHeight
          ? `${exif.ImageWidth}x${exif.ImageHeight}`
          : null;

    // Software tag is the image-EXIF equivalent of the video encoder tag —
    // "Adobe Photoshop" on a photo claimed to be an unedited camera original
    // is the same kind of inconsistency signal.
    const encoderSignature = typeof exif.Software === "string" ? exif.Software : null;

    return {
      container: "image",
      resolution,
      duration: null,
      codec: null,
      encoderSignature,
      exifJson: JSON.stringify(exif),
    };
  } catch (error) {
    console.warn(`[metadata] EXIF parse failed:`, error);
    return { container: null, resolution: null, duration: null, codec: null, encoderSignature: null, exifJson: null };
  }
}
