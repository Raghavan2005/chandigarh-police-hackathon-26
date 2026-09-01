"""
Keeps all downloaded model weights inside this project directory (gitignored)
rather than the user's home cache, so setup/teardown is self-contained and
obviously not part of the git history.

Must be imported — and its env vars set — before ANY huggingface_hub/torch.hub
import anywhere in this service, since those libraries read HF_HOME/TORCH_HOME
at import/first-use time, not per-call. Originally this was inlined at the top
of detector.py; extracted here after a real bug: audio_detector.py imports
transformers (which pulls in huggingface_hub) independently of detector.py,
and importing audio_detector.py on its own (e.g. for a standalone test, or if
main.py's import order ever changed) silently downloaded ~100+MB into
~/.cache/huggingface instead of ml-service/.hf_cache — caught by watching the
actual download target directory during manual testing, not by inspection.
Both detector modules now import this shared module first instead of each
inlining (and having to keep in sync) the same three lines.
"""

import os
from pathlib import Path

_SERVICE_DIR = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(_SERVICE_DIR / ".hf_cache"))
os.environ.setdefault("TORCH_HOME", str(_SERVICE_DIR / ".torch_cache"))
