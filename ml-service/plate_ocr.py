"""
License-plate text extraction over a detected vehicle's bounding box.

Model: EasyOCR (CRAFT text detector + CRNN recognizer), English-only reader.
Chosen because it's a single pip-installable, pretrained, CPU-capable OCR
library with no extra system dependency (no Tesseract binary to install) --
the smallest real addition that gets genuine text recognition, per the
build decision for this feature.

Design choice (disclosed, not the only valid one): runs over the BOTTOM 55%
of each detected vehicle's own bounding box, not the whole frame. A plate is
physically mounted on the lower front/rear of a vehicle, and restricting the
OCR pass to that region cuts out windshields/number-irrelevant background
text (shopfronts, other signage) that would otherwise produce false-positive
"plate" reads from unrelated text elsewhere in the frame. The crop is still
the vehicle's own detected box -- no plate-specific detector exists here (a
real plate localizer is a materially bigger model to add; out of scope for
this build).

Honesty note: a low-resolution, angled, or motion-blurred CCTV frame very
often has no legible plate at all -- this returns None in that case (or
after every OCR candidate fails the plausibility filter below), never a
fabricated or guessed string. Every returned candidate carries EasyOCR's own
real per-read confidence score, unmodified.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import numpy as np
from PIL import Image

_reader = None

# Loose plausibility filter for an OCR read to be worth surfacing as a
# "candidate plate" at all -- real plates are short alphanumeric strings,
# not sentences. This does NOT validate against any specific national plate
# format (India's own format varies by state/series) -- it only rejects
# reads that are obviously not plate-shaped (too short, too long, or pure
# punctuation), so a stray "EXIT" sign crop still gets a chance to be
# scored honestly rather than silently dropped by an overly strict format
# check.
_PLATE_CANDIDATE_RE = re.compile(r"^[A-Z0-9]{4,12}$")

# Below this, EasyOCR's own reads on real low-quality CCTV crops are
# dominated by noise -- a threshold, not an invented calibration.
MIN_OCR_CONFIDENCE = 0.3


@dataclass
class PlateReadResult:
    text: str
    confidence: float


def _get_reader():
    global _reader
    if _reader is None:
        import easyocr  # deferred: EasyOCR's own imports (scikit-image, etc.) are only needed if a vehicle is ever detected

        from cache_env import _SERVICE_DIR  # reuse the same project-local cache philosophy as torch/HF

        _reader = easyocr.Reader(
            ["en"],
            gpu=False,
            verbose=False,
            model_storage_directory=str(_SERVICE_DIR / ".easyocr_cache" / "model"),
            user_network_directory=str(_SERVICE_DIR / ".easyocr_cache" / "network"),
        )
    return _reader


def read_plate(image: Image.Image, vehicle_box: list[float]) -> PlateReadResult | None:
    """vehicle_box is normalized [x1,y1,x2,y2] (0-1 fractions of `image`),
    the same shape ObjectDetector.detect returns. Crops the bottom 55% of
    that box and runs EasyOCR over it. Returns the single highest-confidence
    plausible read, or None if OCR found nothing plate-shaped."""
    img_w, img_h = image.size
    x1, y1, x2, y2 = vehicle_box
    box_h = (y2 - y1) * img_h
    crop_top = y1 * img_h + box_h * 0.45  # skip the top 45% (windshield/roof)
    crop = image.convert("RGB").crop((int(x1 * img_w), int(crop_top), int(x2 * img_w), int(y2 * img_h)))
    if crop.width < 4 or crop.height < 4:
        return None

    reader = _get_reader()
    raw_results = reader.readtext(np.array(crop))

    best: PlateReadResult | None = None
    for _bbox, text, confidence in raw_results:
        normalized = re.sub(r"[^A-Z0-9]", "", text.upper())
        if not _PLATE_CANDIDATE_RE.match(normalized):
            continue
        if confidence < MIN_OCR_CONFIDENCE:
            continue
        if best is None or confidence > best.confidence:
            best = PlateReadResult(text=normalized, confidence=round(float(confidence), 4))
    return best
