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
  // faceBoxes[0] is always the same face as faceCropPngBase64.
  faceBoxes: [number, number, number, number][];
  faceCropPngBase64: string | null;
}

export interface AudioDetectionResponse {
  probability: number;
}

async function callDetect<T>(
  endpoint: "/detect/image" | "/detect/video-frame" | "/detect/audio",
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
