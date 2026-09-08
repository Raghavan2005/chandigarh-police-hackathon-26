"""
Shared "decode arbitrary media bytes to a mono float32 waveform" helper —
extracted out of audio_detector.py (where it originated) so transcriber.py
can reuse the exact same verified ffmpeg pipeline instead of duplicating it.
Works for audio files AND the audio track of a video file: ffmpeg picks the
default audio stream out of any container it's given, so no separate
video-specific code path is needed here.
"""

from __future__ import annotations

import os
import subprocess
import tempfile

import imageio_ffmpeg
import numpy as np

TARGET_SAMPLE_RATE = 16000


def decode_to_waveform(raw_media: bytes, sample_rate: int = TARGET_SAMPLE_RATE) -> np.ndarray:
    """Decodes arbitrary audio/video bytes to mono float32 PCM at
    `sample_rate` via a real ffmpeg binary (imageio-ffmpeg downloads and
    caches one on first use — the Python-side equivalent of the Next.js
    side's @ffmpeg-installer/ffmpeg). Raises ValueError on decode failure
    (corrupt/unsupported file, or a video with no audio track) — a client
    error, not a server fault.

    Writes `raw_media` to a real temp file rather than piping it to ffmpeg
    via stdin: MP4/3GP files recorded by phones very often place the `moov`
    atom (container metadata) at the end rather than the start ("faststart"
    off), which requires ffmpeg to seek back into the input to demux at
    all. A stdin pipe can't seek — confirmed live, this silently produces 0
    bytes of output (ffmpeg logs "partial file" / "Invalid data found") for
    exactly this kind of file, which then reads as a false "no audio track"
    rather than the real cause.
    """
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    with tempfile.NamedTemporaryFile(suffix=".bin", delete=False) as tmp:
        tmp.write(raw_media)
        tmp_path = tmp.name
    try:
        proc = subprocess.run(
            [
                ffmpeg_exe, "-v", "error", "-i", tmp_path,
                "-f", "f32le", "-ac", "1", "-ar", str(sample_rate), "pipe:1",
            ],
            capture_output=True,
        )
    finally:
        os.unlink(tmp_path)
    if proc.returncode != 0:
        raise ValueError(f"ffmpeg could not decode this file's audio: {proc.stderr.decode(errors='replace')[:500]}")
    waveform = np.frombuffer(proc.stdout, dtype=np.float32)
    if waveform.size == 0:
        raise ValueError("Decoded audio is empty (file may have no audio track).")
    return waveform
