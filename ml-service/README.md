# PS4 Detection Microservice

A small FastAPI service that scores an image (or a sampled video frame) for
AI-generated/deepfake manipulation probability and returns a Grad-CAM heatmap.
Called over `localhost` HTTP by the Next.js backend in `police-evidence-platform/`
— never called from the browser directly. See `../Docs/CH26/PS4_MVP_BUILD_PLAN.md`
(§2, §3) for the architecture this fits into.

## Model

**`not-lain/deepfake`** on Hugging Face — https://huggingface.co/not-lain/deepfake

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

## API

- `GET /health` → `{ "status": "ok", "modelLoaded": true }`
- `POST /detect/image` (multipart form field `file`, an image) →
  `{ "probability": <float 0-100>, "heatmapPngBase64": "<base64 PNG>" }`
  — `probability` is the model's estimated probability the face is
  manipulated/deepfake (sigmoid output × 100, rounded to 2dp).
- `POST /detect/video-frame` — identical contract and identical underlying
  model/pipeline as `/detect/image`. Video support is frame sampling done on
  the Next.js side (per the build plan) — this endpoint just scores one
  already-extracted frame image; no video decoding happens in this service.

Errors: a non-image `content-type` or an undecodable/empty file returns
`400` with a `detail` message; an internal failure during inference returns
`500` with `detail` describing the exception (never a silent/fabricated
score).

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
- Visually inspected the returned heatmap PNG for the face-image test — it
  renders a proper jet-colormap Grad-CAM overlay concentrated around
  face/hair regions, not blank or uniform noise, confirming Grad-CAM is
  actually wired to real gradients rather than a placeholder.

This confirms the pipeline mechanics work end-to-end. Real calibration
against a labeled real/fake validation set (per the build plan's Phase 0/§3
"Calibration, not just wiring" step) is a separate follow-up task, not done
here.

## Notes / deviations from the spec

- The task brief suggested Hugging Face `transformers` as one likely
  dependency; this checkpoint instead loads via `facenet-pytorch` +
  `safetensors` directly (no `transformers`/`timm` import in the final code),
  because the chosen model's native architecture class lives in
  `facenet_pytorch`, not `transformers`. `transformers`/`timm` were
  installed during model evaluation but are not required by `main.py` or
  `detector.py`, so they're left out of `requirements.txt` to keep it
  accurate to what's actually imported.
- `torch`/`torchvision` must come from the same build tag (both `+cpu` here)
  — installing them from different indices caused a real
  `RuntimeError: operator torchvision::nms does not exist` during setup in
  this environment. The `--extra-index-url` flag in the install command above
  avoids this; if you ever see that error, reinstall both from
  `https://download.pytorch.org/whl/cpu` together.
