import { execFile } from "child_process";
import { promisify } from "util";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import { parse as parseExif } from "exifr";
import { PDFParse } from "pdf-parse";

const execFileAsync = promisify(execFile);

export interface ExtractedMetadata {
  container: string | null;
  resolution: string | null;
  duration: string | null;
  codec: string | null;
  encoderSignature: string | null;
  exifJson: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
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
  if (mimeType === "application/pdf") {
    return extractPdfMetadata(buffer);
  }
  // Anything else (unsupported document formats, etc.): no extraction path
  // exists yet — return an honestly-empty result rather than fabricate
  // fields that don't apply.
  return {
    container: null,
    resolution: null,
    duration: null,
    codec: null,
    encoderSignature: null,
    exifJson: null,
    gpsLatitude: null,
    gpsLongitude: null,
  };
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
      gpsLatitude: null,
      gpsLongitude: null,
    };
  } catch (error) {
    console.warn(`[metadata] ffprobe failed for ${filePath}:`, error);
    return {
      container: null,
      resolution: null,
      duration: null,
      codec: null,
      encoderSignature: null,
      exifJson: null,
      gpsLatitude: null,
      gpsLongitude: null,
    };
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
      return {
        container: null,
        resolution: null,
        duration: null,
        codec: null,
        encoderSignature: null,
        exifJson: null,
        gpsLatitude: null,
        gpsLongitude: null,
      };
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

    // exifr computes decimal-degree lat/long from the raw GPS tags when
    // `gps: true` is enabled (which the `true` shorthand above includes) —
    // only present when the camera actually embedded location, which most
    // messaging-app-forwarded or re-saved images won't have. Never inferred.
    const gpsLatitude = typeof exif.latitude === "number" ? exif.latitude : null;
    const gpsLongitude = typeof exif.longitude === "number" ? exif.longitude : null;

    return {
      container: "image",
      resolution,
      duration: null,
      codec: null,
      encoderSignature,
      exifJson: JSON.stringify(exif),
      gpsLatitude,
      gpsLongitude,
    };
  } catch (error) {
    console.warn(`[metadata] EXIF parse failed:`, error);
    return {
      container: null,
      resolution: null,
      duration: null,
      codec: null,
      encoderSignature: null,
      exifJson: null,
      gpsLatitude: null,
      gpsLongitude: null,
    };
  }
}

/**
 * Real PDF Stage 1 extraction (document-modality stretch item from
 * PS4_MVP_BUILD_PLAN.md §1's Phase 3 stretch list — "document OCR/tamper
 * heuristic"). Uses `pdf-parse` (wraps pdf.js) to read the actual PDF Info
 * dictionary and extract the document's real text content — no OCR image
 * rendering for scanned/image-only PDFs, just direct text-layer extraction,
 * which covers the born-digital-document case this platform's evidence is
 * realistically going to be (court filings, screenshots-as-PDF, reports).
 *
 * The tamper heuristic here is deliberately narrow and checkable, not a
 * fabricated verdict: a document's ModDate meaningfully later than its
 * CreationDate is a real, verifiable fact (the file was edited after it
 * was first created) — the same class of signal as the video-encoder/
 * image-Software tag already used elsewhere, just for documents. This
 * result is never fed into Evidence Fusion (fuseEvidence needs a
 * classifierScore, and there's no real document-tamper ML model behind
 * this) — it only surfaces as metadata, same as the honest gap it
 * replaces.
 */
const MODIFIED_AFTER_CREATION_THRESHOLD_MS = 60_000; // >1 minute apart — same-session saves land within seconds

async function extractPdfMetadata(buffer: Buffer): Promise<ExtractedMetadata> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const info = await parser.getInfo();
    const dates = info.getDateNode();
    const text = await parser.getText();

    const producer = typeof info.info?.Producer === "string" ? info.info.Producer : null;
    const creator = typeof info.info?.Creator === "string" ? info.info.Creator : null;
    const toolSignature = [creator, producer].filter((v, i, arr) => v && arr.indexOf(v) === i).join(" / ") || null;

    let modifiedAfterCreation = false;
    if (dates.CreationDate && dates.ModDate) {
      modifiedAfterCreation =
        dates.ModDate.getTime() - dates.CreationDate.getTime() > MODIFIED_AFTER_CREATION_THRESHOLD_MS;
    }

    const encoderSignature = modifiedAfterCreation
      ? `${toolSignature ?? "unknown tool"} — modified after creation`
      : toolSignature;

    return {
      container: "PDF",
      resolution: null,
      duration: null,
      codec: null,
      encoderSignature,
      exifJson: JSON.stringify({
        producer,
        creator,
        creationDate: dates.CreationDate?.toISOString() ?? null,
        modDate: dates.ModDate?.toISOString() ?? null,
        modifiedAfterCreation,
        pageCount: text.total,
        textPreview: text.text.slice(0, 2000),
      }),
      gpsLatitude: null,
      gpsLongitude: null,
    };
  } catch (error) {
    console.warn(`[metadata] PDF parse failed:`, error);
    return {
      container: null,
      resolution: null,
      duration: null,
      codec: null,
      encoderSignature: null,
      exifJson: null,
      gpsLatitude: null,
      gpsLongitude: null,
    };
  } finally {
    await parser?.destroy();
  }
}
