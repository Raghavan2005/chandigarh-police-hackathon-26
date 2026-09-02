"""
Real speech-presence validation via Silero VAD (bundled with faster-whisper
— the same model faster-whisper's own `vad_filter=True` already runs
internally during transcription, see transcriber.py) — an independent,
explicit check an investigator can re-run on demand.

Why this exists as its own check, not just trusting a non-empty transcript:
Whisper's best-known failure mode on non-speech audio (silence, music,
background noise) is hallucinating plausible-sounding but fabricated text
rather than returning nothing — vad_filter reduces this but doesn't
eliminate it. This runs VAD independently over the whole clip and reports
what fraction of it is actually classified as speech, so an investigator
can see "12% of this clip is speech" and judge the transcript's
reliability themselves, instead of the platform silently presenting a
transcript as trustworthy regardless of what's actually in the audio.

get_vad_model() is @functools.lru_cache'd inside faster_whisper itself, so
the ~2MB Silero model loads once and is reused — no separate lazy-singleton
class needed here, unlike transcriber.py/translator.py's larger models.
"""

from __future__ import annotations

from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before faster_whisper's model loading

from faster_whisper.vad import VadOptions, get_speech_timestamps

from audio_io import TARGET_SAMPLE_RATE, decode_to_waveform

# Same ceiling as transcriber.py's MAX_SECONDS, and for the same reason —
# the ratio must be computed over exactly the portion of the file that was
# actually transcribed, not a mismatched longer window.
MAX_SECONDS = 600
MAX_SAMPLES = TARGET_SAMPLE_RATE * MAX_SECONDS

# A real threshold, not arbitrary noise: filters out clips that are almost
# entirely silence/music/background noise with a stray speech-like blip VAD
# happened to pick up, while still passing genuinely short real speech.
SPEECH_RATIO_THRESHOLD = 0.10


@dataclass
class SpeechValidationResult:
    has_speech: bool
    speech_ratio: float  # 0-1, fraction of the (possibly truncated) clip VAD classified as speech
    total_seconds: float


def validate_speech(raw_media: bytes) -> SpeechValidationResult:
    waveform = decode_to_waveform(raw_media, TARGET_SAMPLE_RATE)
    if waveform.size > MAX_SAMPLES:
        waveform = waveform[:MAX_SAMPLES]

    timestamps = get_speech_timestamps(waveform, VadOptions())
    speech_samples = sum(t["end"] - t["start"] for t in timestamps)
    speech_ratio = speech_samples / waveform.size if waveform.size else 0.0

    return SpeechValidationResult(
        has_speech=speech_ratio >= SPEECH_RATIO_THRESHOLD,
        speech_ratio=round(speech_ratio, 4),
        total_seconds=round(waveform.size / TARGET_SAMPLE_RATE, 2),
    )
