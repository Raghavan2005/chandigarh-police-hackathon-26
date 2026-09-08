/**
 * HTTP client for the Python detection microservice (ml-service/) — called
 * over localhost only, per PS4_MVP_BUILD_PLAN.md §2 architecture (never
 * called from the browser directly).
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8008";

/**
 * Thrown when the ML service actually responded with an error (bad input,
 * model failure, etc.) — distinct from a network failure (service down/
 * unreachable), so callers can tell "this specific file can't be
 * processed" from "the service itself is unavailable" instead of
 * collapsing both into one generic 502.
 */
export class MlServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`ML service returned ${status}: ${detail}`);
    this.name = "MlServiceError";
  }
}

export interface DetectionResponse {
  probability: number;
  // Second, separate signal from a general (not face-swap-specific)
  // AI-image classifier (ml-service/general_ai_detector.py) -- added
  // because `probability`'s model is fine-tuned on face-swap seam
  // artifacts specifically and, per this project's own live calibration
  // testing, is effectively blind to full-synthesis content (scored a
  // known-real StyleGAN test image 0%). Never blended server-side; the
  // caller decides how to combine the two.
  generalAiProbability: number;
  // Third, separate signal from a modern-diffusion-focused AI-image
  // classifier (ml-service/sdxl_detector.py) -- added because
  // generalAiProbability's own model card admits ~2-year-old training data
  // and "significant concept drift" since, i.e. it's documented (not
  // assumed) to be stale against modern SDXL/diffusion-era output. Never
  // blended server-side; the caller decides how to combine all three.
  sdxlProbability: number;
  heatmapPngBase64: string;
  faceDetected: boolean;
  // Every detected face, each normalized [x1, y1, x2, y2] fractions (0-1)
  // of the source image's width/height, sorted by detection probability
  // descending -- empty array when no face was detected, never fabricated.
  faceBoxes: [number, number, number, number][];
  // Parallel to faceBoxes -- one crop per detected face. [0] is the literal
  // aligned crop the classifier scored; the rest are plain rectangular
  // crops for display only, never separately classified.
  faceCropsPngBase64: string[];
}

export interface AudioDetectionResponse {
  probability: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResponse {
  language: string;
  segments: TranscriptSegment[];
  truncated: boolean;
}

export interface TranslationResponse {
  segments: TranscriptSegment[];
}

export interface SpeechValidationResponse {
  hasSpeech: boolean;
  speechRatio: number;
  totalSeconds: number;
}

export interface SpliceCandidate {
  timestampSeconds: number;
  magnitude: number;
}

export interface SpliceDetectionResponse {
  candidates: SpliceCandidate[];
  totalSeconds: number;
}

export interface ObjectDetection {
  objectClass: string;
  confidence: number;
  box: [number, number, number, number];
  // Set only on vehicle-class detections where EasyOCR found a plausible
  // plate-shaped read over that box's lower region -- null otherwise,
  // never a guessed string (see ml-service/plate_ocr.py).
  plateText: string | null;
  plateConfidence: number | null;
}

export interface ObjectDetectionResponse {
  objects: ObjectDetection[];
}

export interface FaceEmbeddingEntry {
  box: [number, number, number, number];
  embedding: number[]; // 512-d, L2-normalized
  detectionProbability: number | null;
}

export interface FaceEmbeddingResponse {
  faces: FaceEmbeddingEntry[];
}

async function callDetect<T>(
  endpoint:
    | "/detect/image"
    | "/detect/video-frame"
    | "/detect/audio"
    | "/transcribe"
    | "/validate-speech"
    | "/detect-splices"
    | "/detect/objects"
    | "/embed/face",
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<T> {
  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

  const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new MlServiceError(response.status, body.detail ?? "unknown error");
  }

  return response.json();
}

export function detectImage(buffer: Buffer, mimeType: string): Promise<DetectionResponse> {
  return callDetect<DetectionResponse>("/detect/image", buffer, mimeType, "frame.jpg");
}

export function detectVideoFrame(buffer: Buffer): Promise<DetectionResponse> {
  return callDetect<DetectionResponse>("/detect/video-frame", buffer, "image/jpeg", "frame.jpg");
}

export function detectAudio(buffer: Buffer, mimeType: string): Promise<AudioDetectionResponse> {
  return callDetect<AudioDetectionResponse>("/detect/audio", buffer, mimeType, "audio");
}

// Audio and video evidence both go through this one endpoint — ffmpeg on
// the ml-service side decodes whichever audio stream the container has, so
// there's no separate video code path needed here either.
export function transcribeMedia(buffer: Buffer, mimeType: string): Promise<TranscriptionResponse> {
  return callDetect<TranscriptionResponse>("/transcribe", buffer, mimeType, "media");
}

export async function translateSegments(
  segments: TranscriptSegment[],
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResponse> {
  const response = await fetch(`${ML_SERVICE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segments, sourceLang, targetLang }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new MlServiceError(response.status, body.detail ?? "unknown error");
  }

  return response.json();
}

// Independent of /transcribe — an investigator re-runs this on demand to
// check whether a clip actually contains speech (real Silero VAD, not
// Whisper's own judgment), guarding against Whisper hallucinating text
// over silence/music/noise.
export function validateSpeech(buffer: Buffer, mimeType: string): Promise<SpeechValidationResponse> {
  return callDetect<SpeechValidationResponse>("/validate-speech", buffer, mimeType, "media");
}

// Real spectral-flux-based splice-point detection — audio and video (its
// audio track) both go through here, same as transcribeMedia above.
export function detectSplices(buffer: Buffer, mimeType: string): Promise<SpliceDetectionResponse> {
  return callDetect<SpliceDetectionResponse>("/detect-splices", buffer, mimeType, "media");
}

// CCTV use case #1 — real COCO object detection (person/car/truck/bus/
// motorcycle) plus a real EasyOCR plate-text attempt over each detected
// vehicle's own box. Called once per sampled frame by the detect-cctv
// route, same "one call per frame, sampling happens on the Next.js side"
// shape as detectVideoFrame above.
export function detectObjects(buffer: Buffer): Promise<ObjectDetectionResponse> {
  return callDetect<ObjectDetectionResponse>("/detect/objects", buffer, "image/jpeg", "frame.jpg");
}

// CCTV use case #1 — real 512-d face embeddings for every face MTCNN finds
// in the image (a reference photo, or one sampled CCTV frame). A
// similarity score against a stated threshold, never a certified
// biometric identification — see ml-service/detector.py's embed_faces
// docstring.
export function embedFace(buffer: Buffer, mimeType: string): Promise<FaceEmbeddingResponse> {
  return callDetect<FaceEmbeddingResponse>("/embed/face", buffer, mimeType, "frame.jpg");
}

export async function mlServiceHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return false;
    const body = await response.json();
    return body.status === "ok" && body.modelLoaded === true;
  } catch {
    return false;
  }
}
