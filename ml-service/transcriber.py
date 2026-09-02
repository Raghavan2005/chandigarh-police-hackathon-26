"""
Speech-to-text transcription for the "live captions" feature — audio and
video evidence both go through here (video's audio track is decoded the
same way audio_detector.py decodes a standalone audio file, via
audio_io.decode_to_waveform; ffmpeg extracts whichever audio stream a video
container has, so no separate video code path is needed).

Model: faster-whisper (CTranslate2 reimplementation of OpenAI's Whisper) —
open source (MIT), pretrained, no training done here (same hard requirement
as detector.py/audio_detector.py). Chosen over the reference openai-whisper
package for CPU inference speed and lower memory, which matters for a
synchronous HTTP request on demo hardware with no GPU assumption.

Honesty note: Whisper's own automatic language detection and word-level
timestamps are not perfectly accurate, especially on short/noisy clips or
code-switched speech (English mixed with Hindi/Punjabi, common in real
evidence audio) -- segment boundaries are Whisper's own sentence/phrase
chunking, not manually verified transcription.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before faster_whisper's model loading

from faster_whisper import WhisperModel

from audio_io import decode_to_waveform, TARGET_SAMPLE_RATE

# "small" balances CPU speed against transcription quality on
# under-resourced/accented/code-switched speech -- overridable per demo
# hardware without a code change.
WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "small")
# Bounds compute for a synchronous HTTP request, same reasoning as
# audio_detector.py's MAX_SECONDS -- unlike that 30s classifier slice,
# transcription needs to cover the clip's actual content, so this is a much
# longer ceiling (10 minutes), with the truncation made explicit in the
# response rather than silently dropped.
MAX_SECONDS = 600
MAX_SAMPLES = TARGET_SAMPLE_RATE * MAX_SECONDS


@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str


@dataclass
class TranscriptionResult:
    language: str  # ISO-639-1 code Whisper detected, e.g. "en", "hi"
    segments: list[TranscriptSegment]
    truncated: bool  # True if the file was longer than MAX_SECONDS and got cut


class Transcriber:
    """Loads the model once, lazily on first /transcribe call — same
    "may never be exercised in a given demo run" reasoning as
    AudioDeepfakeDetector not loading its model at startup."""

    def __init__(self) -> None:
        # int8 compute type: the standard faster-whisper CPU recommendation,
        # meaningfully faster than float32 with negligible quality loss for
        # this use case (real-time-ish captions, not archival transcription).
        self.model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")

    def transcribe(self, raw_media: bytes) -> TranscriptionResult:
        waveform = decode_to_waveform(raw_media, TARGET_SAMPLE_RATE)
        truncated = waveform.size > MAX_SAMPLES
        if truncated:
            waveform = waveform[:MAX_SAMPLES]

        segments_iter, info = self.model.transcribe(waveform, vad_filter=True)
        segments = [
            TranscriptSegment(start=round(s.start, 2), end=round(s.end, 2), text=s.text.strip())
            for s in segments_iter
            if s.text.strip()
        ]
        return TranscriptionResult(language=info.language, segments=segments, truncated=truncated)
