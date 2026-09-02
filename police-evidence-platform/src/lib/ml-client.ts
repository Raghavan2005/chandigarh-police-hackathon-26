/**
 * HTTP client for the Python detection microservice (ml-service/) — called
 * over localhost only, per PS4_MVP_BUILD_PLAN.md §2 architecture (never
 * called from the browser directly).
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8008";

export interface DetectionResponse {
  probability: number;
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

async function callDetect<T>(
  endpoint: "/detect/image" | "/detect/video-frame" | "/detect/audio" | "/transcribe" | "/validate-speech",
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
    const detail = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`ML service ${endpoint} returned ${response.status}: ${detail.detail ?? "unknown error"}`);
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
    const detail = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`ML service /translate returned ${response.status}: ${detail.detail ?? "unknown error"}`);
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
