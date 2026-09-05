# PS4 Detection Microservice

A small FastAPI service that scores an image (or a sampled video frame) for
AI-generated/deepfake manipulation probability and returns a Grad-CAM heatmap,
plus a separate audio endpoint that scores a voice recording for
spoofing/synthesis probability. Called over `localhost` HTTP by the Next.js
backend in `police-evidence-platform/` — never called from the browser
directly. See `../Docs/Plan/PS4_MVP_BUILD_PLAN.md` (§2, §3) for the
architecture this fits into.

## Models used — source & license summary

Every real model this service loads, pretrained and used as-is (no training/fine-tuning done in this repo), for the hackathon guidelines' model-disclosure requirement:

| Model | Used for | Source | License |
|---|---|---|---|
| `not-lain/deepfake` | Image/video deepfake (face-swap) classification | [Hugging Face](https://huggingface.co/not-lain/deepfake) | Apache-2.0 |
| `dima806/ai_vs_real_image_detection` | General (not face-swap-specific) AI-generated-image classification — second, complementary signal | [Hugging Face](https://huggingface.co/dima806/ai_vs_real_image_detection) | Apache-2.0 |
| `Gustking/wav2vec2-large-xlsr-deepfake-audio-classification` | Audio deepfake/voice-spoofing classification | [Hugging Face](https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification) | Apache-2.0 |
| `facenet_pytorch.MTCNN` | Face detection/alignment (feeds the image/video classifier) | [facenet-pytorch](https://github.com/timesler/facenet-pytorch) | MIT |
| faster-whisper (CTranslate2 reimplementation of OpenAI Whisper) | Live-caption transcription | [GitHub](https://github.com/SYSTRAN/faster-whisper) | MIT |
| `facebook/nllb-200-distilled-600M` ("No Language Left Behind") | Caption translation | [Hugging Face](https://huggingface.co/facebook/nllb-200-distilled-600M) | CC-BY-NC-4.0 (non-commercial) |
| Silero VAD (bundled inside faster-whisper) | Independent speech-presence validation | [GitHub](https://github.com/snakers4/silero-vad) | MIT |

Detail on each below (image/video and audio — the two models behind the actual AUTHENTIC/MANIPULATED/AI_GENERATED verdict — get the fullest writeup since that's the core problem-statement work; the transcription/translation/VAD models are supporting features and get a shorter one).

## Image/video model

**`not-lain/deepfake`** on Hugging Face — https://huggingface.co/not-lain/deepfake — **Apache-2.0**

This is a packaged re-release of the weights from
https://huggingface.co/aaronespasa/deepfake-detection-resnetinceptionv1 (a
well-known face deepfake classifier built on top of `facenet-pytorch`).
Architecture: **`InceptionResnetV1`** (Inception-ResNet-v1), pretrained on
VGGFace2 for face recognition, then fine-tuned as a binary real/fake face
classifier. Config `model_type` on the Hub is literally `"ResNet"`.

Why this checkpoint fits the hard constraints from `PS4_MVP_BUILD_PLAN.md` §3:

- **Pretrained, open source, no training done here.** Weights are downloaded
  as-is from the Hub (`model.safetensors`, ~94 MB) and loaded directly into
  `facenet_pytorch.InceptionResnetV1` — all 716 state-dict keys match exactly
  (verified before committing to this checkpoint).
- **CNN, not ViT.** Inception-ResNet blocks throughout — no attention/patch
  embedding anywhere in the graph — so Grad-CAM on the last conv layer is the
  standard, well-supported case. We target `model.block8.branch1[-1]` (the
  final conv layer of the last Inception-ResNet-C block, before global
  pooling), which is the exact same target layer used in the model's own
  reference pipeline on the Hub (see that repo's `pipeline.py`). We reuse the
  `pytorch_grad_cam` library rather than hand-rolling Grad-CAM.
- **CPU-only, offline after setup.** No `.cuda()` calls anywhere; `DEVICE` is
  hardcoded to `"cpu"` in `detector.py`. The only network calls in the whole
  service happen once, at first run, to download the fine-tuned weights
  (~94 MB from `not-lain/deepfake`) and the VGGFace2 backbone weights
  (~107 MB, fetched by `facenet-pytorch` itself). Both are cached under
  `ml-service/.hf_cache/` and `ml-service/.torch_cache/` respectively
  (redirected there via `HF_HOME`/`TORCH_HOME` env vars set at the top of
  `detector.py`, so nothing lands in the user's home cache and nothing here
  needs installing outside this project directory). After that first run, the
  service starts and serves requests with zero internet access.

**Honesty note on scope** (per the plan's anti-overclaiming framing): this is
specifically a *face* deepfake classifier — it was fine-tuned on face crops.
`facenet_pytorch.MTCNN` is used to detect and align a face before
classification, matching how the model was trained. If no face is found in
the frame (e.g. a non-face AI-generated image, or a low-quality/occluded
frame), the service does **not** hard-fail the request — it falls back to
running the same classifier on the full resized frame and still returns a
score, but that score is generated outside the model's intended input
distribution and should be treated as materially weaker signal.
`DetectionResult.face_detected` (internal, not currently surfaced on the
JSON response since it's outside the locked API contract) records which path
was taken — worth wiring into `signalBreakdownJson` on the Next.js side later
if useful. This is exactly the kind of generalization limit
`AGENT_PS4_DEEPFAKE_REPORT.md` and the build plan are explicit about — don't
let the UI imply this is a general-purpose AI-image detector.

## General AI-image model (second signal)

**`dima806/ai_vs_real_image_detection`** on Hugging Face —
https://huggingface.co/dima806/ai_vs_real_image_detection — **Apache-2.0**

Architecture: ViT-base (`AutoModelForImageClassification`), fine-tuned as a
binary real/AI-generated image classifier — not restricted to faces, unlike
`not-lain/deepfake` above. Runs as a completely separate second pass in
`general_ai_detector.py` over every image `not-lain/deepfake` already scores
(`/detect/image` and `/detect/video-frame` both now return two independent
scores, `probability` and `generalAiProbability`); the two are never blended
inside the ml-service — the caller (`fuseEvidence` in the Next.js app) decides
how to combine them.

**Why this was added — a real, measured gap, not a hypothetical one.** Live
calibration testing of `not-lain/deepfake` alone (see the "How this was
verified" section below) found known-real photos scoring 88–100% "fake" and
known-fake StyleGAN images scoring 0–1% "fake" — the checkpoint is trained
specifically on face-*swap* seam artifacts, so a fully-synthetic image with
no swap seam at all is out-of-distribution and the model is effectively blind
to that entire content class. `dima806/ai_vs_real_image_detection` targets
that exact gap: a general full-synthesis detector rather than a face-swap-
seam detector.

**Tested live, three real images, before wiring this into the app (values
from this session's direct `/detect/image` and standalone-script calls):**

| Test image | `not-lain/deepfake` (face-swap) | `dima806/ai_vs_real_image_detection` (general) | Correct answer |
|---|---|---|---|
| Real StyleGAN-generated face (`a312863063/seeprettyface-dataset`, genuinely synthetic) | 0.0% | 69.75% | Fake |
| Real photo with genuine EXIF/GPS (`ianare/exif-samples`, genuinely a real photo) | — | 31.98% | Real |
| Known-real stock photo that `not-lain/deepfake` scored high | 97.77% | 97.77%\* | Real |

\*This third row is the paired "known-real-face-image-REAL.jpg" test file from
`Arman176001/deepfake-detection` — both models score it high, i.e. the new
model does **not** fix every false positive `not-lain/deepfake` produces; it
adds coverage for a *different* content class (full synthesis), it doesn't
correct the first model's own face-swap-detection errors. Only the first row
is a case where the new model materially improves on the old one alone (0% →
69.75%, correctly flagging a real synthetic image the face-swap model missed
entirely). This is reported plainly rather than oversold: three real test
images is a smoke test confirming the model loads correctly and responds in
roughly the expected direction, not a calibrated accuracy claim — the same
"real calibration against a labeled validation set is a separate follow-up
task" caveat from the section below applies here too.

**How fusion uses the two scores** (`src/lib/fusion.ts`,
`FusionInput.faceSwapScore`/`generalAiScore`): the coverage-aware cap applies
to `Math.max(faceSwapScore, generalAiScore ?? 0)`, so a high score from either
model is still subject to the same "zero corroboration → INCONCLUSIVE
regardless of raw score" rule — adding a second model does not weaken that
safety net. Which model produced the higher score also decides the verdict
between `MANIPULATED` (face-swap classifier dominant) and `AI_GENERATED`
(general classifier dominant) when corroborated and above threshold — the
first real use of the `AI_GENERATED` enum value in this codebase, previously
unreachable because there was no second detector to justify the distinction.

## Audio model

**`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`** on Hugging
Face — https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification — **Apache-2.0**

Architecture: **`Wav2Vec2ForSequenceClassification`**, fine-tuned from
`alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech` for binary
real/fake (spoofed) voice classification. Standard `transformers`
`AutoModelForAudioClassification` interface — no custom wrapper code needed,
unlike the image model above.

- **Pretrained, open source (Apache-2.0), no training done here.** Weights
  loaded as-is via `transformers.AutoModelForAudioClassification.from_pretrained`.
- **Real, checked label mapping** — `id2label` from the model's own
  `config.json` is `{"0": "real", "1": "fake"}`, verified against the Hub
  before wiring this in, not assumed from the model name. `audio_detector.py`
  looks this mapping up at load time rather than hardcoding index `1`, so a
  swapped label order would fail loudly (`RuntimeError`) instead of silently
  inverting every score.
- **CPU-only.** Same `DEVICE = torch.device("cpu")` pattern as the image
  model.
- **Lazily loaded**, unlike the image model (which loads at service
  startup) — this is a large model (~1.2 GB) that a given demo run may never
  exercise, since audio is a stretch-scope evidence type, not the core
  image/video path. It loads on the first `/detect/audio` call instead,
  which means that first call is slow (downloads + loads the model); every
  call after is fast.
- **Real ffmpeg-based decoding**, not a raw-waveform assumption — arbitrary
  input audio (mp3, wav, ogg, ...) is decoded to the 16kHz mono float32
  waveform the model expects via a real `ffmpeg` binary, downloaded and
  cached on first use by `imageio-ffmpeg` (the Python-side equivalent of the
  Next.js side's `@ffmpeg-installer/ffmpeg` — this service doesn't depend on
  a system `ffmpeg` install).
- Audio longer than 30 seconds is trimmed to the first 30s before inference
  — wav2vec2's attention is quadratic in sequence length, so this bounds
  compute/memory for a synchronous HTTP request, the same reasoning behind
  video support using frame sampling instead of processing an entire file.

**Honesty note on scope:** like the image model, this is a narrow classifier
— voice spoofing/TTS/voice-conversion detection on the feature space it was
fine-tuned on. It says nothing about whether audio was edited/spliced, only
whether the voice itself sounds synthetic/spoofed.

## Transcription model (supporting feature, not the core verdict)

**faster-whisper** (a CTranslate2 reimplementation of OpenAI's Whisper) —
https://github.com/SYSTRAN/faster-whisper — **MIT**, pretrained, no training
done here. Chosen over the reference `openai-whisper` package for CPU
inference speed and lower memory (`transcriber.py`). Powers the live-captions
feature (`/transcribe`) for audio and video evidence — has no role in the
manipulation verdict itself.

## Translation model (supporting feature)

**`facebook/nllb-200-distilled-600M`** ("No Language Left Behind") —
https://huggingface.co/facebook/nllb-200-distilled-600M — **CC-BY-NC-4.0
(non-commercial)**, pretrained, no training done here (`translator.py`). A
single multilingual model rather than many per-language-pair models, so it
covers every language this service exposes (including Punjabi) without
English-pivot logic. On-demand caption translation only, never run
automatically.

## Speech-validation model (supporting feature)

**Silero VAD** — https://github.com/snakers4/silero-vad — **MIT**, bundled
inside `faster-whisper` (the same model `vad_filter=True` already runs
internally during transcription — see `transcriber.py`) and reused directly
via `faster_whisper`'s own `get_vad_model()` (`speech_validator.py`), no
separate download. Runs an independent pass over the whole clip to report
what fraction is actually classified as speech, guarding against Whisper's
known failure mode of hallucinating text over silence/music/noise.

## Splice-point detection (algorithm, not a pretrained model)

Real short-time spectral-flux analysis (`splice_detector.py`) — plain
`numpy` FFT math, no pretrained weights and no new dependency. Flags
timestamps where a clip's frequency content jumps abruptly relative to its
own local neighborhood (a local adaptive threshold, not one global
threshold for the whole clip — tested directly and found a global threshold
misses real discontinuities when part of the clip is naturally noisier).
The automated, cached counterpart to the frontend's live waveform/
spectrogram visualizer (`AudioAnalyser.tsx`), which only shows a human
something to look at and computes/stores nothing.

**Honesty note on scope:** verified against synthetic test audio with known
splice points (correctly detected, wide margin) and a real speech clip
(correctly found zero false positives at first, then — once a longer real
video was tested — found ordinary speech consonants also trigger this,
which is exactly why the outlier threshold is tuned against real data, not
assumed). This is a real, checkable heuristic, never a trained splice
classifier, and never proof of editing on its own — the UI presents each
candidate as a lead for the investigator to check by ear.

## API

- `GET /health` → `{ "status": "ok", "modelLoaded": true, "audioModelLoaded": false }`
  (`audioModelLoaded` only flips to `true` after the first `/detect/audio`
  call, per the lazy-loading behavior above.)
- `POST /detect/image` (multipart form field `file`, an image) →
  `{ "probability": <float 0-100>, "heatmapPngBase64": "<base64 PNG>",
  "faceDetected": <bool>, "faceBox": [x1,y1,x2,y2] | null,
  "faceCropPngBase64": "<base64 PNG>" | null }` — `probability` is the
  model's estimated probability the face is manipulated/deepfake (sigmoid
  output × 100, rounded to 2dp). `faceBox` is MTCNN's real detected-face
  bounding box, normalized to 0-1 fractions of the source image's
  width/height — `null` whenever no face was detected, never a fabricated
  position. `faceCropPngBase64` is the actual aligned face crop MTCNN
  produced (the literal input the classifier scored), likewise `null` when
  no face was found.
- `POST /detect/video-frame` — identical contract and identical underlying
  model/pipeline as `/detect/image`. Video support is frame sampling done on
  the Next.js side (per the build plan) — this endpoint just scores one
  already-extracted frame image; no video decoding happens in this service.
- `POST /detect/audio` (multipart form field `file`, an audio file) →
  `{ "probability": <float 0-100> }` — probability the voice is
  fake/spoofed. No heatmap (no spatial visualization equivalent for a 1D
  waveform classifier).

Errors: a non-image/audio `content-type` (matching the endpoint) or an
undecodable/empty file returns `400` with a `detail` message; an internal
failure during inference returns `500` with `detail` describing the
exception (never a silent/fabricated score).

## Setup

Requires internet only for this step (model weights download).

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
```

Note: `facenet-pytorch`'s own declared dependency pins (numpy<2, torch<2.3,
etc.) are stale relative to what's pinned above and get overridden — this is
intentional; the actual installed versions in `requirements.txt` were tested
together and work. `pip` will print a dependency-conflict warning for
`facenet-pytorch`; it is safe to ignore (verified via the test run below).

## Run

```bash
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8008
```

First startup downloads and caches the two weight files (~200 MB combined,
one-time only, needs internet); subsequent startups load instantly from
`.hf_cache/` / `.torch_cache/` with **no** network access. The service is
CPU-only and has no GPU dependency, so it runs on whatever the demo laptop is.

## How this was verified

Ran the service locally on port 8008 and exercised all three endpoints with
`curl`:

- `GET /health` → `{"status":"ok","modelLoaded":true}`
- `POST /detect/image` with a real face photo (the classic "Lena" test image)
  → `{"probability": 0.0, "heatmapPngBase64": "..."}` (94,968 base64 chars,
  decodes to a valid 71,225-byte PNG starting with the correct PNG magic
  bytes). `face_detected` was `True` internally (MTCNN found and aligned the
  face) — the model is highly confident this unmodified photograph is real,
  which is the expected direction.
- `POST /detect/video-frame` with a synthetic random-noise PNG (no face
  present) → `{"probability": 42.49, "heatmapPngBase64": "..."}`, confirming
  the no-face fallback path (full-frame classification) runs without
  crashing and still returns a valid score + heatmap.
- Error handling: an empty file → `400`; a `.txt` file sent with
  `content-type: text/plain` → `400 {"detail":"Expected an image file, got
  content-type 'text/plain'"}`.

**Real face box + crop** (added later, replacing the frontend's old mock
face-highlight overlay — a hardcoded `left-[34%] top-[18%]` box with a
fabricated "98.4%" label on every image regardless of content): verified
standalone by drawing the returned `faceBox` on the actual source image and
confirming visually it lands exactly on the region MTCNN detected — checked
against both a real front-facing portrait (clean, centered box) and a
photo where MTCNN's real detection was a small, low-confidence background
face (the box correctly landed there too, not on the actual visible person
in frame — an honest reflection of a real, if marginal, model output, not
smoothed over). Confirmed `faceBox`/`faceCropPngBase64` are both `null`
together whenever no face is detected (tested with a random-noise image),
never a fabricated fallback position. Full Next.js-side rendering
(letterbox-aware bounding-box overlay positioned via the element's actual
displayed size, not just the container's) verified live for both image and
video evidence — see `PS4_BUILD_STATUS.md`'s Phase 3 log for that pass,
including two real bugs it caught (`onLoad` never firing for an
already-cached image, and an infinite-render loop from an early fix
attempt).

**Calibration finding (§11 of the build plan — "recalibrate the fusion
confidence-cap constants once real classifier score distribution is known"):**
ran the live classifier against 6 known-real photos (genuine photographed
people, `randomuser.me` model-released stock portraits — not from this
repo's case evidence, whose provenance isn't independently confirmed) and 6
known-fake images (`thispersondoesnotexist.com` StyleGAN output — no real
person exists, unambiguously synthetic). Result: the known-real photos
scored **88–100%** "manipulated" and the known-fake StyleGAN photos scored
**0–1%** — nearly inverted from naive expectation. Ruled out two candidate
causes before accepting this as a real classifier limitation, not a bug:
`face_detected` was `True` for all 12 (not an MTCNN-fallback artifact), and
forcibly upscaling a real photo / downscaling-then-upscaling a fake one left
scores unchanged (not a resolution artifact). The actual cause is a known,
documented class of deepfake-detector generalization failure (also flagged
in this file's own honesty note and the build plan's risk table): this
checkpoint is trained on face-*swap* manipulation (blending-seam artifacts
from compositing a fake face onto a real frame), so a fully-synthetic
GAN image with no seam at all is genuinely out-of-distribution and scores
low, while ordinary stock-photo JPEG/compression characteristics apparently
resemble the training set's "fake" class closely enough to score high — this
is dataset-specific shortcut learning, not evidence the raw score is random.
**This is exactly the failure mode the coverage-aware fusion cap exists
for** — confirmed live, not assumed: uploaded the real photo that scored
100% as case evidence and ran it through the actual `/investigate`
pipeline. With no metadata inconsistency, no C2PA, and no hash match
(`coverageCount: 0`), the verdict came back `INCONCLUSIVE` at 60% confidence,
never `MANIPULATED`, exactly per §4's rule that zero corroboration forces
INCONCLUSIVE regardless of raw score. **Conclusion: the numeric constants
(`60 + coverageCount × 13`, the 50/80 verdict thresholds) are not adjusted
by this finding** — tuning them to this test set would be calibrating to a
known-unreliable signal on out-of-distribution images, not improving
anything. The real, actionable takeaway is the opposite of "tune the
numbers": it's confirmation that raw classifier score alone must never be
trusted as a verdict, which is the design the fusion algorithm already
enforces. This should be stated plainly to judges/officers as a real,
checked limitation, not glossed over — a single high classifier score on
an unfamiliar image type is not proof of manipulation.
- Visually inspected the returned heatmap PNG for the face-image test — it
  renders a proper jet-colormap Grad-CAM overlay concentrated around
  face/hair regions, not blank or uniform noise, confirming Grad-CAM is
  actually wired to real gradients rather than a placeholder.

This confirms the pipeline mechanics work end-to-end. Real calibration
against a labeled real/fake validation set (per the build plan's Phase 0/§3
"Calibration, not just wiring" step) is a separate follow-up task, not done
here.

**Audio path**, verified separately after the image/video path above, first
as a standalone script (`AudioDeepfakeDetector().detect(...)` directly)
against a real file already in the repo
(`police-evidence-platform/public/evidence/case-audio.mp3`):
`Model loaded OK, fake_index = 1` then `probability (fake): 10.67`, and the
downloaded weights landed under `ml-service/.hf_cache/` (confirmed via `du
-sh` growing there, not `~/.cache/huggingface`) — this is the test that
caught the cache-directory bug described in `cache_env.py`'s docstring.

Then through the real running service (`uvicorn main:app`, port 8008):

- `GET /health` before any audio call → `{"status":"ok","modelLoaded":true,"audioModelLoaded":false}`
  (confirms the lazy-loading claim above is real, not just intended).
- `POST /detect/audio` with the same `case-audio.mp3` → `{"probability":10.67}`,
  identical to the standalone script (same model, same file, same result —
  confirms the FastAPI wrapper isn't altering the score).
- `GET /health` after that call → `audioModelLoaded` now `true`.
- Error handling: an empty file → `400 {"detail":"Uploaded file is empty."}`;
  a `text/plain` file → `400 {"detail":"Expected an audio file, got
  content-type 'text/plain'"}`.
- Full round trip through the Next.js app (not just this service): logged in
  as a real seeded investigator, created a real case via `POST /api/cases`,
  uploaded `case-audio.mp3` via `POST /api/cases/:id/evidence`, then called
  `POST /api/cases/:id/evidence/:id/investigate` — got back a real
  `FusionVerdict` (`INCONCLUSIVE`, confidence capped to 11% since 0/3 signals
  corroborate), and confirmed `DetectionResult.modelName`/`modelVersion` are
  stored correctly for the audio path and the pipeline-status UI's matching
  step correctly reads "Not applicable to audio" instead of a fabricated
  hash-match claim.

## Notes / deviations from the spec

- The task brief suggested Hugging Face `transformers` as one likely
  dependency for the image/video model; that checkpoint instead loads via
  `facenet-pytorch` + `safetensors` directly (no `transformers`/`timm` import
  in `detector.py`), because the chosen model's native architecture class
  lives in `facenet_pytorch`, not `transformers`. The audio model
  (`audio_detector.py`, added later as a Phase 3 stretch item) does use
  `transformers` (`AutoModelForAudioClassification`) — its checkpoint has no
  `facenet-pytorch`-style equivalent, so `transformers` is a real, required
  dependency now and is pinned in `requirements.txt`.
- `torch`/`torchvision` must come from the same build tag (both `+cpu` here)
  — installing them from different indices caused a real
  `RuntimeError: operator torchvision::nms does not exist` during setup in
  this environment. The `--extra-index-url` flag in the install command above
  avoids this; if you ever see that error, reinstall both from
  `https://download.pytorch.org/whl/cpu` together.
