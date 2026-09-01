"""
FastAPI detection microservice for the PS4 evidence platform.

Called over localhost HTTP by the Next.js backend (never from the browser
directly). Endpoints:
  - GET  /health              liveness check
  - POST /detect/image        image -> { probability, heatmapPngBase64 }
  - POST /detect/video-frame  same contract, same model; the Next.js side
                               samples frames from video and calls this once
                               per sampled frame (frame extraction happens on
                               the Next.js/ffmpeg side, not here).
  - POST /detect/audio        audio -> { probability } (no heatmap — there's
                               no spatial visualization equivalent for a 1D
                               waveform classifier).

See detector.py / audio_detector.py for model choice/rationale and
README.md for how this was verified.
"""

from __future__ import annotations

import io
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from audio_detector import AudioDeepfakeDetector
from detector import DeepfakeDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

app = FastAPI(title="PS4 Detection Microservice", version="0.1.0")

_detector: DeepfakeDetector | None = None
_audio_detector: AudioDeepfakeDetector | None = None


class DetectionResponse(BaseModel):
    probability: float
    heatmapPngBase64: str


class AudioDetectionResponse(BaseModel):
    probability: float


@app.on_event("startup")
def load_model() -> None:
    global _detector
    logger.info("Loading detection model (first run downloads weights, then caches locally)...")
    _detector = DeepfakeDetector()
    logger.info("Model loaded. Service ready.")
    # Audio model is NOT loaded here — it's a ~1.2GB model that a given demo
    # run may never exercise (audio is a stretch-scope evidence type, not
    # the core image/video path), so it's loaded lazily on first
    # /detect/audio call instead of paying that cost on every startup.


def get_detector() -> DeepfakeDetector:
    if _detector is None:
        raise HTTPException(status_code=503, detail="Model is still loading, try again shortly.")
    return _detector


def get_audio_detector() -> AudioDeepfakeDetector:
    global _audio_detector
    if _audio_detector is None:
        logger.info("Loading audio detection model on first use (downloads weights on first run, then cached)...")
        _audio_detector = AudioDeepfakeDetector()
        logger.info("Audio model loaded.")
    return _audio_detector


async def _run_detection(file: UploadFile) -> DetectionResponse:
    if file.content_type is not None and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Expected an image file, got content-type {file.content_type!r}")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Could not decode file as an image.")

    detector = get_detector()
    try:
        result = detector.detect(image)
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Detection failed")
        raise HTTPException(status_code=500, detail=f"Detection failed: {exc}") from exc

    return DetectionResponse(probability=result.probability, heatmapPngBase64=result.heatmap_png_base64)


@app.post("/detect/image", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...)) -> DetectionResponse:
    return await _run_detection(file)


@app.post("/detect/video-frame", response_model=DetectionResponse)
async def detect_video_frame(file: UploadFile = File(...)) -> DetectionResponse:
    # Same underlying model/pipeline as /detect/image. Video support is
    # frame sampling done by the caller (Next.js side); this endpoint just
    # scores one already-extracted frame, per the build plan (§3).
    return await _run_detection(file)


@app.post("/detect/audio", response_model=AudioDetectionResponse)
async def detect_audio(file: UploadFile = File(...)) -> AudioDetectionResponse:
    if file.content_type is not None and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail=f"Expected an audio file, got content-type {file.content_type!r}")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    detector = get_audio_detector()
    try:
        result = detector.detect(raw)
    except ValueError as exc:
        # Decode failure (unsupported/corrupt audio) is a client error, not
        # a server fault.
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Audio detection failed")
        raise HTTPException(status_code=500, detail=f"Audio detection failed: {exc}") from exc

    return AudioDetectionResponse(probability=result.probability)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "modelLoaded": _detector is not None,
        "audioModelLoaded": _audio_detector is not None,
    }
