"""
Deepfake / AI-generated image detector.

Model: facenet-pytorch's InceptionResnetV1 (CNN, Inception-ResNet-v1 architecture,
pretrained on VGGFace2), fine-tuned for real-vs-fake face classification.
Weights: https://huggingface.co/not-lain/deepfake (a packaged re-release of
https://huggingface.co/aaronespasa/deepfake-detection-resnetinceptionv1).

Why this model:
- Pretrained + open source, no training done here (hard requirement).
- Pure CNN (Inception-ResNet blocks), not a Vision Transformer, so a
  gradient-based class activation map (Grad-CAM) on the last conv layer
  (`block8.branch1`, the final Inception-ResNet-C block before pooling) is
  straightforward and well precedented -- the model's own reference pipeline
  on the Hub uses exactly this target layer with the `pytorch_grad_cam`
  library, which we reuse here.
- Runs on CPU, no GPU assumption.
- Once weights are cached locally (first run only), no further internet
  access is required for inference.

Honesty note: this is a face-manipulation ("deepfake") classifier trained on
VGGFace2-derived face crops. It is not a general AI-generated-image detector
for non-face content (e.g. a Midjourney landscape). When MTCNN finds no face
in the frame we still return a score (computed on the resized full frame) so
the endpoint never hard-fails, but that score is a lower-confidence fallback,
not the model's intended input distribution -- see README for how this should
be framed to the rest of the pipeline.
"""

from __future__ import annotations

import base64
import io
from dataclasses import dataclass

import cache_env  # noqa: F401 - import for its env-var side effect, must run before the huggingface_hub/torch imports below

import numpy as np
import torch
import torch.nn.functional as F
from facenet_pytorch import InceptionResnetV1, MTCNN
from huggingface_hub import hf_hub_download
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from safetensors.torch import load_file

MODEL_REPO = "not-lain/deepfake"
MODEL_WEIGHTS_FILE = "model.safetensors"
INPUT_SIZE = 256

DEVICE = torch.device("cpu")


@dataclass
class DetectionResult:
    probability: float  # 0-100, probability the image is AI-generated/manipulated
    heatmap_png_base64: str
    face_detected: bool
    # Real MTCNN detection box, normalized [x1, y1, x2, y2] fractions of the
    # original image's width/height (0-1) -- None when no face was detected
    # (never a fabricated/placeholder box). Frontend converts back to pixels
    # against the actual displayed image size.
    face_box: list[float] | None
    # The actual aligned face crop MTCNN produced -- the literal input the
    # classifier scores, before it's resized to the model's fixed input
    # size. None when no face was detected.
    face_crop_png_base64: str | None


class DeepfakeDetector:
    """Loads the model once and serves inference + Grad-CAM."""

    def __init__(self) -> None:
        self.mtcnn = MTCNN(select_largest=False, post_process=False, device=DEVICE)
        self.model = InceptionResnetV1(
            pretrained="vggface2",
            classify=True,
            num_classes=1,
            device=DEVICE,
        )
        weights_path = hf_hub_download(MODEL_REPO, MODEL_WEIGHTS_FILE)
        state_dict = load_file(weights_path)
        # Weights are namespaced under "model." in the HF repo's wrapper class.
        state_dict = {
            (k[len("model."):] if k.startswith("model.") else k): v
            for k, v in state_dict.items()
        }
        self.model.load_state_dict(state_dict, strict=True)
        self.model.eval()
        self.model.to(DEVICE)

        # Grad-CAM on the last conv layer of the final Inception-ResNet-C
        # block, matching the model's own reference pipeline on the Hub.
        target_layers = [self.model.block8.branch1[-1]]
        self.cam = GradCAM(model=self.model, target_layers=target_layers)

    def _prepare_input(
        self, image: Image.Image
    ) -> tuple[torch.Tensor, np.ndarray, bool, list[float] | None, np.ndarray | None]:
        """Returns (input_tensor[1,3,H,W] in 0-1 range, display_image uint8 HWC,
        face_detected, face_box normalized [x1,y1,x2,y2] or None, face_crop
        uint8 HWC or None)."""
        face_tensor = self.mtcnn(image)
        face_detected = face_tensor is not None
        face_box: list[float] | None = None
        face_crop_uint8: np.ndarray | None = None

        if face_tensor is None:
            # Fallback: no face found (e.g. non-face AI-generated content, or
            # MTCNN failed to align a face in a low-quality frame). Use the
            # full resized frame instead of hard-failing the request.
            resized = image.convert("RGB").resize((INPUT_SIZE, INPUT_SIZE))
            arr = np.array(resized).astype("float32")  # HWC, 0-255
            face_tensor = torch.from_numpy(arr).permute(2, 0, 1)  # CHW, 0-255
        else:
            # The actual aligned face crop MTCNN produced -- the literal
            # input the classifier scores, saved before it's resized to the
            # model's fixed input size.
            face_crop_uint8 = face_tensor.clamp(0, 255).byte().permute(1, 2, 0).cpu().numpy()

            # A real bounding box, only computed (and only ever set) when a
            # face was actually detected and used -- never a fabricated
            # position. detect() re-runs the MTCNN cascade to get pixel
            # coordinates in the original image's frame, since the crop call
            # above doesn't expose them.
            img_w, img_h = image.size
            boxes, _ = self.mtcnn.detect(image)
            if boxes is not None and len(boxes) > 0:
                x1, y1, x2, y2 = boxes[0]
                x1, y1 = max(0.0, float(x1)), max(0.0, float(y1))
                x2, y2 = min(float(img_w), float(x2)), min(float(img_h), float(y2))
                face_box = [x1 / img_w, y1 / img_h, x2 / img_w, y2 / img_h]

        face_tensor = face_tensor.unsqueeze(0).float()
        face_tensor = F.interpolate(
            face_tensor, size=(INPUT_SIZE, INPUT_SIZE), mode="bilinear", align_corners=False
        )

        display = (
            face_tensor.squeeze(0).permute(1, 2, 0).clamp(0, 255).byte().cpu().numpy()
        )

        input_tensor = (face_tensor / 255.0).to(DEVICE)
        return input_tensor, display, face_detected, face_box, face_crop_uint8

    def detect(self, image: Image.Image) -> DetectionResult:
        image = image.convert("RGB")
        input_tensor, display_uint8, face_detected, face_box, face_crop_uint8 = self._prepare_input(image)

        targets = [ClassifierOutputTarget(0)]
        grayscale_cam = self.cam(input_tensor=input_tensor, targets=targets)[0, :]

        display_float = display_uint8.astype("float32") / 255.0
        overlay = show_cam_on_image(display_float, grayscale_cam, use_rgb=True)

        with torch.no_grad():
            logit = self.model(input_tensor).squeeze(0)
            prob_fake = torch.sigmoid(logit).item()

        probability = round(prob_fake * 100, 2)

        heatmap_img = Image.fromarray(overlay)
        buf = io.BytesIO()
        heatmap_img.save(buf, format="PNG")
        heatmap_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        face_crop_b64: str | None = None
        if face_crop_uint8 is not None:
            crop_buf = io.BytesIO()
            Image.fromarray(face_crop_uint8).save(crop_buf, format="PNG")
            face_crop_b64 = base64.b64encode(crop_buf.getvalue()).decode("ascii")

        return DetectionResult(
            probability=probability,
            heatmap_png_base64=heatmap_b64,
            face_detected=face_detected,
            face_box=face_box,
            face_crop_png_base64=face_crop_b64,
        )
