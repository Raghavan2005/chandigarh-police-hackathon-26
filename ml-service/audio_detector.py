"""
Audio deepfake / voice-spoofing detector.

Model: Gustking/wav2vec2-large-xlsr-deepfake-audio-classification
(Wav2Vec2ForSequenceClassification, binary real/fake, fine-tuned from
alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech).
https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification

Why this model:
- Pretrained + open source (Apache-2.0), no training done here (same hard
  requirement as detector.py's image model).
- Standard `transformers` AutoModelForAudioClassification interface — no
  custom wrapper/weight-renaming needed, unlike the image model.
- Runs on CPU. 17k+ downloads on the Hub at time of writing.
- Real, checked id2label mapping ({"0": "real", "1": "fake"}) — verified
  against the model's actual config.json before wiring this in, not
  assumed from the model name.

Honesty note: like the image detector, this is a narrow classifier — voice
spoofing/TTS/voice-conversion detection on the wav2vec2-XLSR feature space
it was fine-tuned on. It is not a general "this audio recording is fake in
any sense" oracle (e.g. it says nothing about whether audio was edited/
spliced, only whether the voice itself sounds synthetic/spoofed).
"""

from __future__ import annotations

from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before the transformers/huggingface_hub imports below

import torch
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

from audio_io import decode_to_waveform

AUDIO_MODEL_REPO = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"
TARGET_SAMPLE_RATE = 16000
# Bounds compute/memory for a synchronous HTTP request — wav2vec2's
# attention is quadratic in sequence length. Same reasoning as video
# support using frame sampling instead of processing an entire file: score
# a representative slice, not unboundedly more compute for a longer file.
MAX_SECONDS = 30
MAX_SAMPLES = TARGET_SAMPLE_RATE * MAX_SECONDS
DEVICE = torch.device("cpu")


@dataclass
class AudioDetectionResult:
    probability: float  # 0-100, probability the voice audio is fake/spoofed


class AudioDeepfakeDetector:
    """Loads the model once (lazily, on first /detect/audio call — this is
    a ~1.2GB model and audio may never be exercised in a given demo run, so
    unlike the image detector this isn't loaded unconditionally at
    startup) and serves inference."""

    def __init__(self) -> None:
        self.feature_extractor = AutoFeatureExtractor.from_pretrained(AUDIO_MODEL_REPO)
        self.model = AutoModelForAudioClassification.from_pretrained(AUDIO_MODEL_REPO)
        self.model.eval()
        self.model.to(DEVICE)

        id2label = {int(k): v for k, v in self.model.config.id2label.items()}
        fake_ids = [i for i, label in id2label.items() if label.lower() == "fake"]
        if len(fake_ids) != 1:
            raise RuntimeError(f"Expected exactly one 'fake' label in model config, got {id2label}")
        self._fake_index = fake_ids[0]

    def detect(self, raw_audio: bytes) -> AudioDetectionResult:
        waveform = decode_to_waveform(raw_audio, TARGET_SAMPLE_RATE)
        if waveform.size > MAX_SAMPLES:
            waveform = waveform[:MAX_SAMPLES]

        inputs = self.feature_extractor(
            waveform, sampling_rate=TARGET_SAMPLE_RATE, return_tensors="pt", padding=True
        )
        with torch.no_grad():
            logits = self.model(**inputs).logits
            probs = torch.softmax(logits, dim=-1).squeeze(0)

        probability = round(probs[self._fake_index].item() * 100, 2)
        return AudioDetectionResult(probability=probability)
