"""
Shared "decode arbitrary media bytes to a mono float32 waveform" helper —
extracted out of audio_detector.py (where it originated) so transcriber.py
can reuse the exact same verified ffmpeg pipeline instead of duplicating it.
Works for audio files AND the audio track of a video file: ffmpeg picks the
default audio stream out of any container it's given, so no separate
video-specific code path is needed here.
"""

from __future__ import annotations

import subprocess

import imageio_ffmpeg
import numpy as np

TARGET_SAMPLE_RATE = 16000


def decode_to_waveform(raw_media: bytes, sample_rate: int = TARGET_SAMPLE_RATE) -> np.ndarray:
    """Decodes arbitrary audio/video bytes to mono float32 PCM at
    `sample_rate` via a real ffmpeg binary (imageio-ffmpeg downloads and
    caches one on first use — the Python-side equivalent of the Next.js
    side's @ffmpeg-installer/ffmpeg). Raises ValueError on decode failure
    (corrupt/unsupported file, or a video with no audio track) — a client
    error, not a server fault."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    proc = subprocess.run(
        [
            ffmpeg_exe, "-v", "error", "-i", "pipe:0",
            "-f", "f32le", "-ac", "1", "-ar", str(sample_rate), "pipe:1",
        ],
        input=raw_media,
        capture_output=True,
    )
    if proc.returncode != 0:
        raise ValueError(f"ffmpeg could not decode this file's audio: {proc.stderr.decode(errors='replace')[:500]}")
    waveform = np.frombuffer(proc.stdout, dtype=np.float32)
    if waveform.size == 0:
        raise ValueError("Decoded audio is empty (file may have no audio track).")
    return waveform
