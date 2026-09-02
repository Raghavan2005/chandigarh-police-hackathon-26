"""
Caption translation — on-demand, only when an investigator actually asks
for a language (never run automatically alongside transcription: avoids
unnecessary compute for the common case where the original-language
captions are all anyone needs).

Model: facebook/nllb-200-distilled-600M ("No Language Left Behind") — open
source (CC-BY-NC-4.0), pretrained, no training done here. A single
multilingual model rather than many per-language-pair models: it covers
every language this service exposes (including Punjabi, which several
smaller per-pair translation models on the Hub either don't cover or gate
behind a license click-through) without needing English-pivot logic for
pairs that don't have a direct model.

Honesty note: this is one general-purpose MT model's output, not a
certified legal translation -- same "investigative lead, not verified fact"
framing already used for image-description.ts's Gemini output.
"""

from __future__ import annotations

from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before the transformers imports below

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

TRANSLATION_MODEL_REPO = "facebook/nllb-200-distilled-600M"

# Every language this service can transcribe->translate between. Keyed by
# the ISO-639-1-ish code faster-whisper's language detection returns (also
# what the frontend's language picker sends as targetLang) -> FLORES-200
# code NLLB actually expects. Deliberately a fixed, verified allowlist
# rather than accepting arbitrary codes -- an unsupported code should fail
# honestly (422), not silently mistranslate or crash deep in the model.
SUPPORTED_LANGUAGES: dict[str, tuple[str, str]] = {
    "en": ("English", "eng_Latn"),
    "hi": ("Hindi", "hin_Deva"),
    "pa": ("Punjabi", "pan_Guru"),
    "ur": ("Urdu", "urd_Arab"),
    "bn": ("Bengali", "ben_Beng"),
    "ta": ("Tamil", "tam_Taml"),
    "te": ("Telugu", "tel_Telu"),
    "mr": ("Marathi", "mar_Deva"),
    "gu": ("Gujarati", "guj_Gujr"),
    "ar": ("Arabic", "arb_Arab"),
    "fr": ("French", "fra_Latn"),
    "es": ("Spanish", "spa_Latn"),
}

# Bounds a single translate call -- batching every segment of a long clip
# through the model in one generate() call is fine at typical caption-track
# lengths, but an unbounded batch on CPU is an unbounded-latency synchronous
# HTTP request. Matches the "bound compute for a sync request" reasoning
# used throughout this service.
MAX_SEGMENTS = 400


@dataclass
class TranslatedSegment:
    start: float
    end: float
    text: str


class UnsupportedLanguage(ValueError):
    pass


class Translator:
    """Loads the model once, lazily on first /translate call -- translation
    may never be exercised in a given demo run (an investigator may never
    ask for it), same reasoning as the other lazily-loaded models here."""

    def __init__(self) -> None:
        self.tokenizer = AutoTokenizer.from_pretrained(TRANSLATION_MODEL_REPO)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(TRANSLATION_MODEL_REPO)
        self.model.eval()

    def translate(
        self,
        segments: list[tuple[float, float, str]],
        source_lang: str,
        target_lang: str,
    ) -> list[TranslatedSegment]:
        if source_lang not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguage(f"Source language {source_lang!r} isn't supported for translation.")
        if target_lang not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguage(f"Target language {target_lang!r} isn't supported for translation.")
        if len(segments) > MAX_SEGMENTS:
            segments = segments[:MAX_SEGMENTS]
        if not segments:
            return []

        _, src_flores = SUPPORTED_LANGUAGES[source_lang]
        _, tgt_flores = SUPPORTED_LANGUAGES[target_lang]

        self.tokenizer.src_lang = src_flores
        texts = [text for _, _, text in segments]
        inputs = self.tokenizer(texts, return_tensors="pt", padding=True, truncation=True)

        with torch.no_grad():
            generated = self.model.generate(
                **inputs,
                forced_bos_token_id=self.tokenizer.convert_tokens_to_ids(tgt_flores),
                max_new_tokens=256,
            )
        translated_texts = self.tokenizer.batch_decode(generated, skip_special_tokens=True)

        return [
            TranslatedSegment(start=start, end=end, text=text.strip())
            for (start, end, _), text in zip(segments, translated_texts)
        ]
