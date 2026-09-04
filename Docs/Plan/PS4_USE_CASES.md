# PS4 use-case backlog

Six real-world investigator workflows the platform needs to cover, dictated by the team on 2026-09-04 after the local demo DB was reset to empty. Each is graded honestly against what the codebase actually does today (verified by reading the code, not assumed) — not every use case needs new work; some are already fully real. This doc is the reference for build planning; see "Open decisions" at the end for what's still undecided.

## 1. CCTV footage — detect humans/cars/plates, match against a reference

**Goal**: An investigator uploads long CCTV footage. The system detects every human, car, and license plate visible in it. The investigator can then upload a reference (a face or a plate) and get it matched against what's in the footage.

**Status**: Not built.

**What exists today**: Face detection exists but only for still images/sampled video frames, one face at a time, via MTCNN (`ml-service/detector.py`) — it does not track vehicles or plates at all, and doesn't do the "search a whole video for a reference" workflow. There is no object detector in the codebase: `ml-service/requirements.txt` has no YOLO/ultralytics, no OCR library (easyocr/paddleocr), and `opencv-python-headless` (already installed) isn't used for detection today. There's also no "same person in a different photo" biometric matching anywhere in the app today — the existing face-matching is deliberately hash-based (exact/near-duplicate *files* only), and biometric face-embedding matching is explicitly listed as a non-goal in `Docs/Plan/WHAT_IS_REAL.md`.

**What a full build would need**: A new object-detection model (vehicle + person) in `ml-service/`, a plate-detection/OCR step, a new Prisma table for per-frame/per-object detections (nothing like this exists — the closest today, `DetectionResult.frameScoresJson`, only stores a probability per sampled frame, not boxes), and — for the "match a reference face" half — the platform's *first* real biometric face-embedding comparison (a meaningful step up from today's hash-only matching, worth a deliberate decision, not a silent scope creep). Plate reference-matching is simpler: fuzzy string match against OCR'd plate text.

## 2. Call recording — caption/translate, threat detection, AI-voice check

**Goal**: From a call recording, caption/transcribe the audio, offer translation, analyze the conversation's actual content to flag whether it contains a threat, and check whether the audio itself is AI-generated/voice-spoofed.

**Status**: Partially built — 3 of 4 pieces are already real.

**What exists today**: Real Whisper transcription (`TranscriptResult`), real translation (`TranscriptTranslation`), and real audio deepfake/voice-spoofing detection (`ml-service/audio_detector.py`, wav2vec2) are all shipped and live. The one missing piece — threat detection from the transcript's actual content — doesn't exist.

**What a full build would need**: A new Gemini structured-JSON-schema call (the exact pattern already used in `src/lib/news-summary.ts`'s `summarizeArticle` — reuse `buildClient()` from `src/lib/image-description.ts`) that takes a transcript's text and returns `{ containsThreat, severity, reasoning, quote }` or similar, a small Prisma cache table (mirrors `ImageDescriptionResult`/`PageSummary`), a route following the existing cached-AI-analysis pattern (`.../describe-image/route.ts` is the template), and a "Detect threat" button slotted next to the existing Captions/Translate/Validate-speech actions in `real-evidence-viewer.tsx`. This is the cheapest of the 5 gaps to build — it's almost entirely reuse of an established pattern.

## 3. Deepfake image — AI check, face count/search, describe, geolocate

**Goal**: For an image, determine AI-generated or not, count the faces present, search info about each face, describe the image, and figure out where it was taken.

**Status**: Already built, essentially all of it.

**What exists today**: Real image deepfake detection, real MTCNN face detection/counting/cropping, real per-face reverse-image search + AI identify (`face-detail-dialog.tsx`), real whole-image AI description (`image-description.ts`), and a real geographic sighting map (EXIF GPS with IP-geolocation fallback, `sighting-map.tsx`). This use case doesn't need new code — it needs a real seed case to demonstrate it end-to-end.

## 4. Deepfake video — localize modified area, diff against the original

**Goal**: For a deepfake video, flag the specific modified/manipulated region, and compare it against the original video (if one can be found) to pinpoint exactly what changed.

**Status**: Partially built, with a real structural limitation worth disclosing up front.

**What exists today**: Grad-CAM heatmap generation is real (`ml-service/detector.py`), but for video it currently keeps only the single worst-scoring frame's heatmap, not one per sampled frame. Per-frame probability scores exist (`DetectionResult.frameScoresJson`). Perceptual-hash matching (`src/lib/matching.ts`) can surface a near-duplicate "original" — but only for **cross-case matches** (`EvidenceMatch`, which link to a real file on disk); the seeded **corpus** (`CorpusItem`) only stores a thumbnail, not a full source file, so corpus matches can never be diffed against. No pixel/frame-diff capability (SSIM or similar) exists anywhere in the codebase today.

**What a full build would need**: (a) keep Grad-CAM heatmaps for every sampled frame instead of just the worst one, giving a real "where across the clip" view; (b) a new frame-alignment + pixel-diff step (e.g. SSIM via a new Python dependency) that only activates when a real cross-case match exists — corpus matches would honestly show "no full original available to diff," not a fake diff.

## 5. Documents — verify signature, detect edits after signing

**Goal**: For a document, check whether it's digitally signed, and whether it's been edited after signing.

**Status**: Partially built — the existing check is a heuristic, not a real signature verification.

**What exists today**: Real PDF metadata extraction and a narrow tamper heuristic (`src/lib/metadata.ts::extractPdfMetadata` — flags `ModDate - CreationDate > 60s`), deliberately excluded from the fusion verdict since it isn't a real forgery-detection model. No cryptographic signature library is installed (`package.json` has no `node-forge`, `pdf-lib`, `@signpdf/*`, or any PKCS#7/CMS/X.509 tooling) — C2PA (`@contentauth/c2pa-node`) exists but is a different scheme (content-provenance manifests for media) and isn't wired up for PDFs today.

**What a full build would need**: A new dependency capable of reading a PDF's embedded `/Sig` dictionary and its `ByteRange` — the standard, well-defined technique for detecting whether bytes were appended/modified after signing (real, verifiable, doesn't require trusting a certificate authority chain to still be useful). New fields on `MetadataResult` (or a new model, following the `ProvenanceResult` pattern), and a new section in the existing `DocumentDetails` panel (`evidence-card.tsx`).

## 6. Cross-evidence relationship mind map + case summary

**Goal**: When an investigator dumps a mix of evidence into one case (WhatsApp screenshots, call recordings, PDFs, text), the system should understand and map the relationships between people across ALL of it (e.g. "A spoke to B at this time/date") and produce a final case-level summary with a full mind map — not just per-exhibit analysis.

**Status**: Not built — but the raw material for it already exists.

**What exists today**: Every exhibit's real per-item analysis is already loaded in one place by `getRealCase()` (`src/lib/cases-server.ts`) — transcripts, translations, AI image descriptions (which already name recognizable people), per-face labels, document text previews, cross-case/corpus matches. Nothing today synthesizes across exhibits into one relationship graph or narrative. The established pattern for a self-contained SVG graph view already exists (`src/components/propagation/sighting-tree-graph.tsx`, `sighting-map.tsx` — plain typed props in, hand-rolled `<svg>` out, no charting library) and a `*-server.ts` data-aggregation function feeding it (`propagation-server.ts`) — a mind-map feature would follow the same two-piece shape.

**What a full build would need**: A new aggregation function gathering all real per-exhibit text for a case, one Gemini structured-JSON-schema call extracting entities + relationships + a narrative summary from that real text, a caching table (keyed by case, re-run on demand — same "cache + manual re-run" philosophy as every other AI feature here), and a new case-level view (`/cases/[id]/mindmap`, alongside the existing History/Propagation/Report links) rendering it as an SVG node-link graph plus a summary card. This is the largest of the 5 gaps.

## Open decisions

- **Build order / who picks up what**: not yet decided. The 5 gaps (everything but #3) are largely independent and could be split across team members; #2 and #5 are the cheapest/most self-contained, #1 and #6 are the largest.
- **CCTV reference-face-matching (#1)**: turns a documented non-goal (biometric face matching) into a real capability — flagging this explicitly for a deliberate go/no-go rather than assuming yes.
- **Seed cases**: still paused per the original request — will resume once (a subset of) these gaps are built, so seed cases can actually demonstrate real capability rather than being built against features that don't exist yet.
