"""
FastAPI detection microservice for the PS4 evidence platform.

Called over localhost HTTP by the Next.js backend (never from the browser
directly). Endpoints:
  - GET  /health              liveness check
  - POST /detect/image        image -> { probability, generalAiProbability,
                               sdxlProbability, heatmapPngBase64,
                               faceDetected, faceBoxes, faceCropsPngBase64 }.
                               `probability` is the face-swap classifier's
                               score (detector.py); `generalAiProbability`
                               and `sdxlProbability` are two further,
                               separate signals from general (not face-swap-
                               specific) AI-image classifiers
                               (general_ai_detector.py, sdxl_detector.py) —
                               added because the first model is effectively
                               blind to full-synthesis content, and because
                               general_ai_detector.py's own checkpoint is
                               documented (its own model card) to be stale
                               against modern diffusion output (see each
                               module's docstring for the real calibration
                               numbers behind this). None of the three
                               scores is blended into another here; the
                               Next.js side decides how to combine them for
                               Evidence Fusion. faceBoxes/faceCropsPngBase64
                               are parallel arrays, one entry per detected
                               face (both empty if none);
                               faceCropsPngBase64[0] is the literal input
                               the classifier scored, the rest are plain
                               crops for display only — never a fabricated
                               position or crop.
  - POST /detect/video-frame  same contract, same models; the Next.js side
                               samples frames from video and calls this once
                               per sampled frame (frame extraction happens on
                               the Next.js/ffmpeg side, not here).
  - POST /detect/audio        audio -> { probability } (no heatmap — there's
                               no spatial visualization equivalent for a 1D
                               waveform classifier).
  - POST /transcribe          audio or video -> { language, segments, truncated }
                               real Whisper transcription with per-segment
                               timestamps, for the live-captions feature.
  - POST /translate           { segments, sourceLang, targetLang } ->
                               { segments } — translates an already-
                               transcribed caption track, on demand only.
  - POST /validate-speech     audio or video -> { hasSpeech, speechRatio,
                               totalSeconds } — real Silero VAD check for
                               whether the clip actually contains speech,
                               independent of whatever Whisper transcribed
                               (guards against Whisper hallucinating text
                               over silence/music/noise).
  - POST /detect-splices      audio or video -> { candidates, totalSeconds }
                               real spectral-flux outlier detection —
                               candidate timestamps where the frequency
                               content jumps abruptly, the kind of signature
                               a cut-and-stitched edit produces (also
                               triggered by loud transients in genuine
                               audio — a signal to investigate, not proof).
  - POST /detect/objects      image -> { objects: [{objectClass,
                               confidence, box, plateText, plateConfidence,
                               plateBox}] } real torchvision COCO detector
                               (person/car/truck/bus/motorcycle) — plateText/
                               plateConfidence/plateBox are set only on
                               vehicle detections where EasyOCR found a
                               plausible plate-shaped read over that box's
                               lower
                               region, null otherwise. CCTV use case (PS4
                               use case #1).
  - POST /embed/face          image -> { faces: [{box, embedding,
                               detectionProbability}] } — every face MTCNN
                               finds, each with a real 512-d face embedding
                               (see detector.py's embed_faces docstring for
                               which model actually computes it and why).
                               Used for reference-face matching against
                               CCTV footage; a similarity score against a
                               stated threshold, never a certified
                               biometric identification.

See detector.py / general_ai_detector.py / sdxl_detector.py /
audio_detector.py / transcriber.py / translator.py / speech_validator.py /
splice_detector.py / object_detector.py / plate_ocr.py for model/algorithm
choice and README.md for how this was verified.
"""

from __future__ import annotations

import io
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from audio_detector import AudioDeepfakeDetector
from detector import DeepfakeDetector
from general_ai_detector import GeneralAiDetector
from object_detector import ObjectDetector
from plate_ocr import read_plate
from sdxl_detector import SdxlDetector
from speech_validator import validate_speech
from splice_detector import detect_splices
from transcriber import Transcriber
from translator import Translator, UnsupportedLanguage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

app = FastAPI(title="PS4 Detection Microservice", version="0.1.0")

_detector: DeepfakeDetector | None = None
_audio_detector: AudioDeepfakeDetector | None = None
_transcriber: Transcriber | None = None
_translator: Translator | None = None
_object_detector: ObjectDetector | None = None
_general_ai_detector: GeneralAiDetector | None = None
_sdxl_detector: SdxlDetector | None = None


class DetectionResponse(BaseModel):
    probability: float
    # Second, complementary signal from a general (not face-swap-specific)
    # AI-image classifier -- see general_ai_detector.py for why this exists
    # and its own honestly-disclosed limitations. Never blended into
    # `probability` here; the Next.js side decides how to combine them.
    generalAiProbability: float
    # Third, complementary signal from a modern-diffusion-focused AI-image
    # classifier -- see sdxl_detector.py for why this exists (closes a
    # documented staleness gap in generalAiProbability's own checkpoint)
    # and its own honestly-disclosed limitations. Also never blended into
    # either score above here.
    sdxlProbability: float
    heatmapPngBase64: str
    faceDetected: bool
    # Every detected face, each normalized [x1, y1, x2, y2] fractions (0-1)
    # of the original image's width/height, sorted by detection probability
    # descending — empty list when no face was detected, never a
    # fabricated position. faceBoxes[0] is always the same face as
    # faceCropPngBase64 below.
    faceBoxes: list[list[float]]
    # Parallel to faceBoxes -- one crop per detected face. [0] is the
    # literal aligned crop the classifier scored; the rest are plain
    # rectangular crops for display only.
    faceCropsPngBase64: list[str]


class AudioDetectionResponse(BaseModel):
    probability: float


class TranscriptSegmentModel(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResponse(BaseModel):
    language: str
    segments: list[TranscriptSegmentModel]
    truncated: bool


class TranslateRequest(BaseModel):
    segments: list[TranscriptSegmentModel]
    sourceLang: str
    targetLang: str


class TranslationResponse(BaseModel):
    segments: list[TranscriptSegmentModel]


class SpeechValidationResponse(BaseModel):
    hasSpeech: bool
    speechRatio: float
    totalSeconds: float


class SpliceCandidateModel(BaseModel):
    timestampSeconds: float
    magnitude: float


class SpliceDetectionResponse(BaseModel):
    candidates: list[SpliceCandidateModel]
    totalSeconds: float


class ObjectDetectionModel(BaseModel):
    objectClass: str
    confidence: float
    box: list[float]  # normalized [x1, y1, x2, y2], 0-1 fractions of the frame
    # Set only on vehicle-class detections where EasyOCR found a plausible
    # plate-shaped read over that box's lower region -- null otherwise
    # (no vehicle present, or OCR found nothing plausible), never fabricated.
    plateText: str | None = None
    plateConfidence: float | None = None
    # Normalized [x1,y1,x2,y2], 0-1 fractions of the frame -- the plate
    # text's OWN box (from EasyOCR's per-read polygon), not the vehicle's.
    # Null whenever plateText is null.
    plateBox: list[float] | None = None


class ObjectDetectionResponse(BaseModel):
    objects: list[ObjectDetectionModel]


class FaceEmbeddingModel(BaseModel):
    box: list[float]  # normalized [x1, y1, x2, y2], 0-1 fractions of the frame
    embedding: list[float]  # 512-d, L2-normalized
    detectionProbability: float | None = None


class FaceEmbeddingResponse(BaseModel):
    faces: list[FaceEmbeddingModel]


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


def get_transcriber() -> Transcriber:
    global _transcriber
    if _transcriber is None:
        logger.info("Loading transcription model on first use (downloads weights on first run, then cached)...")
        _transcriber = Transcriber()
        logger.info("Transcription model loaded.")
    return _transcriber


def get_translator() -> Translator:
    global _translator
    if _translator is None:
        logger.info("Loading translation model on first use (downloads weights on first run, then cached)...")
        _translator = Translator()
        logger.info("Translation model loaded.")
    return _translator


def get_object_detector() -> ObjectDetector:
    global _object_detector
    if _object_detector is None:
        logger.info("Loading object detection model on first use (downloads weights on first run, then cached)...")
        _object_detector = ObjectDetector()
        logger.info("Object detection model loaded.")
    return _object_detector


def get_general_ai_detector() -> GeneralAiDetector:
    global _general_ai_detector
    if _general_ai_detector is None:
        logger.info("Loading general AI-image detection model on first use (downloads weights on first run, then cached)...")
        _general_ai_detector = GeneralAiDetector()
        logger.info("General AI-image detection model loaded.")
    return _general_ai_detector


def get_sdxl_detector() -> SdxlDetector:
    global _sdxl_detector
    if _sdxl_detector is None:
        logger.info("Loading SDXL/modern-diffusion detection model on first use (downloads weights on first run, then cached)...")
        _sdxl_detector = SdxlDetector()
        logger.info("SDXL/modern-diffusion detection model loaded.")
    return _sdxl_detector


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

    general_ai_detector = get_general_ai_detector()
    try:
        general_result = general_ai_detector.detect(image)
    except Exception as exc:  # noqa: BLE001 - same "surface, don't crash" rule as the primary classifier above
        logger.exception("General AI-image detection failed")
        raise HTTPException(status_code=500, detail=f"General AI-image detection failed: {exc}") from exc

    sdxl_detector = get_sdxl_detector()
    try:
        sdxl_result = sdxl_detector.detect(image)
    except Exception as exc:  # noqa: BLE001 - same "surface, don't crash" rule as the other two classifiers above
        logger.exception("SDXL/modern-diffusion detection failed")
        raise HTTPException(status_code=500, detail=f"SDXL/modern-diffusion detection failed: {exc}") from exc

    return DetectionResponse(
        probability=result.probability,
        generalAiProbability=general_result.probability,
        sdxlProbability=sdxl_result.probability,
        heatmapPngBase64=result.heatmap_png_base64,
        faceDetected=result.face_detected,
        faceBoxes=result.face_boxes,
        faceCropsPngBase64=result.face_crops_png_base64,
    )


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


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile = File(...)) -> TranscriptionResponse:
    if file.content_type is not None and not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(status_code=400, detail=f"Expected an audio or video file, got content-type {file.content_type!r}")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    transcriber = get_transcriber()
    try:
        result = transcriber.transcribe(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}") from exc

    return TranscriptionResponse(
        language=result.language,
        segments=[TranscriptSegmentModel(start=s.start, end=s.end, text=s.text) for s in result.segments],
        truncated=result.truncated,
    )


@app.post("/translate", response_model=TranslationResponse)
async def translate(body: TranslateRequest) -> TranslationResponse:
    if not body.segments:
        return TranslationResponse(segments=[])

    translator = get_translator()
    try:
        result = translator.translate(
            [(s.start, s.end, s.text) for s in body.segments],
            body.sourceLang,
            body.targetLang,
        )
    except UnsupportedLanguage as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Translation failed")
        raise HTTPException(status_code=500, detail=f"Translation failed: {exc}") from exc

    return TranslationResponse(
        segments=[TranscriptSegmentModel(start=s.start, end=s.end, text=s.text) for s in result]
    )


@app.post("/validate-speech", response_model=SpeechValidationResponse)
async def validate_speech_endpoint(file: UploadFile = File(...)) -> SpeechValidationResponse:
    if file.content_type is not None and not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(status_code=400, detail=f"Expected an audio or video file, got content-type {file.content_type!r}")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = validate_speech(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Speech validation failed")
        raise HTTPException(status_code=500, detail=f"Speech validation failed: {exc}") from exc

    return SpeechValidationResponse(
        hasSpeech=result.has_speech, speechRatio=result.speech_ratio, totalSeconds=result.total_seconds
    )


@app.post("/detect-splices", response_model=SpliceDetectionResponse)
async def detect_splices_endpoint(file: UploadFile = File(...)) -> SpliceDetectionResponse:
    if file.content_type is not None and not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(status_code=400, detail=f"Expected an audio or video file, got content-type {file.content_type!r}")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = detect_splices(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Splice detection failed")
        raise HTTPException(status_code=500, detail=f"Splice detection failed: {exc}") from exc

    return SpliceDetectionResponse(
        candidates=[
            SpliceCandidateModel(timestampSeconds=c.timestamp_seconds, magnitude=c.magnitude)
            for c in result.candidates
        ],
        totalSeconds=result.total_seconds,
    )


@app.post("/detect/objects", response_model=ObjectDetectionResponse)
async def detect_objects(file: UploadFile = File(...)) -> ObjectDetectionResponse:
    """Real COCO object detection (person/car/truck/bus/motorcycle) plus a
    real EasyOCR plate-text attempt over each detected vehicle's own box —
    CCTV use case #1 (PS4_USE_CASES.md). Never fabricates a detection or a
    plate read: an empty `objects` list is an honest "nothing above
    threshold found," and plateText stays null on a vehicle whenever OCR
    found nothing plausible, not a guessed string.
    """
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

    object_detector = get_object_detector()
    try:
        detections = object_detector.detect(image)
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Object detection failed")
        raise HTTPException(status_code=500, detail=f"Object detection failed: {exc}") from exc

    VEHICLE_CLASSES = {"car", "truck", "bus", "motorcycle"}
    objects: list[ObjectDetectionModel] = []
    for detection in detections:
        plate_text: str | None = None
        plate_confidence: float | None = None
        plate_box: list[float] | None = None
        if detection.object_class in VEHICLE_CLASSES:
            try:
                plate = read_plate(image, detection.box)
            except Exception:  # noqa: BLE001 - a single vehicle's OCR failing (e.g. a degenerate crop) shouldn't sink the whole detection response
                logger.exception("Plate OCR failed for one vehicle box")
                plate = None
            if plate is not None:
                plate_text = plate.text
                plate_confidence = plate.confidence
                plate_box = plate.box
        objects.append(
            ObjectDetectionModel(
                objectClass=detection.object_class,
                confidence=detection.confidence,
                box=detection.box,
                plateText=plate_text,
                plateConfidence=plate_confidence,
                plateBox=plate_box,
            )
        )

    return ObjectDetectionResponse(objects=objects)


@app.post("/embed/face", response_model=FaceEmbeddingResponse)
async def embed_face(file: UploadFile = File(...)) -> FaceEmbeddingResponse:
    """Real 512-d face embeddings for every face MTCNN finds in the image —
    reference-face matching against CCTV footage (PS4 use case #1). See
    detector.py's embed_faces docstring for exactly which model computes
    the embedding and the real discrimination numbers that were verified
    before this shipped. Empty `faces` list is an honest "no face found,"
    never a fabricated entry.
    """
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
        faces = detector.embed_faces(image)
    except Exception as exc:  # noqa: BLE001 - surface as a 500 with context, don't crash the service
        logger.exception("Face embedding failed")
        raise HTTPException(status_code=500, detail=f"Face embedding failed: {exc}") from exc

    return FaceEmbeddingResponse(
        faces=[
            FaceEmbeddingModel(box=f.box, embedding=f.embedding, detectionProbability=f.detectionProbability)
            for f in faces
        ]
    )


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "modelLoaded": _detector is not None,
        "audioModelLoaded": _audio_detector is not None,
        "transcriberLoaded": _transcriber is not None,
        "translatorLoaded": _translator is not None,
        "objectDetectorLoaded": _object_detector is not None,
        "generalAiDetectorLoaded": _general_ai_detector is not None,
        "sdxlDetectorLoaded": _sdxl_detector is not None,
    }
