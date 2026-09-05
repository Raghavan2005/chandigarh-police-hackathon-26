"""
General AI-generated-image detector -- a second, complementary signal to
detector.py's face-swap classifier.

Model: dima806/ai_vs_real_image_detection (google/vit-base-patch16-224-in21k
fine-tuned for binary REAL/FAKE classification, Apache-2.0). Loaded via
plain `transformers.AutoModelForImageClassification` -- zero new pip
dependency, since `transformers` is already pinned here for the audio
model. Lazily loaded, matching the audio/transcription/translation models'
own pattern, since a given demo run may never need it.

Why this exists: detector.py's classifier is fine-tuned specifically on
face-swap compositing artifacts (see its own module docstring), and this
project's own live calibration testing (ml-service/README.md) found it is
effectively blind to full-synthesis content -- known-real StyleGAN test
faces from an established GAN dataset scored just 0-1% "manipulated" on
that model, the opposite of what a working AI-image detector should show.
That is a real, severe blind spot: a fully AI-generated image (no face-swap
seam to find) could sail through the original pipeline looking untouched.
This model is trained on a different axis entirely -- real-vs-generated in
general, not face-swap-specific -- to give the pipeline SOME signal for
that content class it previously had none for at all.

Honesty note, verified live before wiring this in (not assumed from the
model card's own claimed 98.25% accuracy, which does not fully hold up
against this project's own out-of-distribution test images): tested
against a known-synthetic StyleGAN face (a312863063/seeprettyface-dataset,
a real, openly-shared GAN-output sample) and two known-real photos. The
known-fake scored correctly on the FAKE side (69.75%) but not strongly so;
one of the two known-real photos was also incorrectly flagged FAKE
(97.77%). General AI-image detection remains a genuinely hard, actively
researched problem -- this model is a real improvement in COVERAGE (it can
now say something non-trivial about full-synthesis content, where the
original model said essentially nothing informative), not a claim that
either classifier's raw score can be trusted alone. That is exactly why
Evidence Fusion (src/lib/fusion.ts, Next.js side) never treats an
uncorroborated classifier score -- from either model -- as a firm verdict:
this addition extends coverage without weakening that existing safety net.
"""

from __future__ import annotations

from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before the transformers import below

import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_REPO = "dima806/ai_vs_real_image_detection"
DEVICE = torch.device("cpu")


@dataclass
class GeneralAiDetection:
    probability: float  # 0-100, estimated probability the image is AI-generated/synthetic


class GeneralAiDetector:
    def __init__(self) -> None:
        self._processor = AutoImageProcessor.from_pretrained(MODEL_REPO)
        self._model = AutoModelForImageClassification.from_pretrained(MODEL_REPO)
        self._model.to(DEVICE)
        self._model.eval()
        # Read the real label mapping from the model's own config rather
        # than assuming index order -- same discipline audio_detector.py
        # already applies to its own real/fake label lookup, for the same
        # reason: a swapped index would otherwise silently invert every
        # score instead of failing loudly.
        fake_indices = [i for i, label in self._model.config.id2label.items() if label.upper() == "FAKE"]
        if len(fake_indices) != 1:
            raise RuntimeError(
                f"Expected exactly one 'FAKE' label in {MODEL_REPO}'s id2label, "
                f"got {self._model.config.id2label!r}"
            )
        self._fake_index = fake_indices[0]

    def detect(self, image: Image.Image) -> GeneralAiDetection:
        inputs = self._processor(images=image.convert("RGB"), return_tensors="pt")
        with torch.no_grad():
            logits = self._model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]
        probability = float(probs[self._fake_index]) * 100
        return GeneralAiDetection(probability=round(probability, 2))
