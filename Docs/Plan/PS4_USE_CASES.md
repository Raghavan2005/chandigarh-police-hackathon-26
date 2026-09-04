# PS4 use-case backlog

Six real-world investigator workflows the platform needs to cover, dictated by the team on 2026-09-04 after the local demo DB was reset to empty. Each is graded honestly against what the codebase actually does today (verified by reading the code, not assumed) — not every use case needs new work; some are already fully real. This doc is the reference for build planning; see "Open decisions" at the end for what's still undecided.

## 1. CCTV footage — detect humans/cars/plates, match against a reference

**Goal**: An investigator uploads long CCTV footage. The system detects every human, car, and license plate visible in it. The investigator can then upload a reference (a face or a plate) and get it matched against what's in the footage.

**Status**: Not built.

**What exists today**: Face detection exists but only for still images/sampled video frames, one face at a time, via MTCNN (`ml-service/detector.py`) — it does not track vehicles or plates at all, and doesn't do the "search a whole video for a reference" workflow. There is no object detector in the codebase: `ml-service/requirements.txt` has no YOLO/ultralytics, no OCR library (easyocr/paddleocr), and `opencv-python-headless` (already installed) isn't used for detection today. There's also no "same person in a different photo" biometric matching anywhere in the app today — the existing face-matching is deliberately hash-based (exact/near-duplicate *files* only), and biometric face-embedding matching is explicitly listed as a non-goal in `Docs/Plan/WHAT_IS_REAL.md`.

**What a full build would need**: A new object-detection model (vehicle + person) in `ml-service/`, a plate-detection/OCR step, a new Prisma table for per-frame/per-object detections (nothing like this exists — the closest today, `DetectionResult.frameScoresJson`, only stores a probability per sampled frame, not boxes), and — for the "match a reference face" half — the platform's *first* real biometric face-embedding comparison (a meaningful step up from today's hash-only matching, worth a deliberate decision, not a silent scope creep). Plate reference-matching is simpler: fuzzy string match against OCR'd plate text.

## 2. Call recording — caption/translate, threat detection, AI-voice check

**Goal**: From a call recording, caption/transcribe the audio, offer translation, analyze the conversation's actual content to flag whether it contains a threat, and check whether the audio itself is AI-generated/voice-spoofed.

**Status**: Built (2026-09-04) — all 4 pieces are now real.

**What exists today**: Real Whisper transcription (`TranscriptResult`), real translation (`TranscriptTranslation`), real audio deepfake/voice-spoofing detection (`ml-service/audio_detector.py`, wav2vec2), and now real threat detection: a Gemini structured-JSON-schema call (`src/lib/threat-detection.ts`, mirrors `news-summary.ts`'s pattern) judges the transcript's actual content for a genuine threat — never inferred from keywords, honestly returns `containsThreat: false` for ordinary conversation. Cached per-transcript (`ThreatAssessment`), gated behind the same NCII/minor sensitivity check as every other external-AI-call route (transcript content still leaves the platform on this call), triggered via a "Detect threat" button next to Captions/Translate/Validate-speech in `real-evidence-viewer.tsx`. Verified live: a real Gemini call on a real transcript, and the NCII gate confirmed blocking it on a sensitivity-flagged case.

## 3. Deepfake image — AI check, face count/search, describe, geolocate

**Goal**: For an image, determine AI-generated or not, count the faces present, search info about each face, describe the image, and figure out where it was taken.

**Status**: Already built, essentially all of it.

**What exists today**: Real image deepfake detection, real MTCNN face detection/counting/cropping, real per-face reverse-image search + AI identify (`face-detail-dialog.tsx`), real whole-image AI description (`image-description.ts`), and a real geographic sighting map (EXIF GPS with IP-geolocation fallback, `sighting-map.tsx`). This use case doesn't need new code — it needs a real seed case to demonstrate it end-to-end.

## 4. Deepfake video — localize modified area, diff against the original

**Goal**: For a deepfake video, flag the specific modified/manipulated region, and compare it against the original video (if one can be found) to pinpoint exactly what changed.

**Status**: Built (2026-09-04), with a real, disclosed structural limitation.

**What exists today**: Grad-CAM heatmap generation is real (`ml-service/detector.py`) — every sampled frame already gets a full heatmap computed, and now **all of them are persisted** (`DetectionResult.frameHeatmapPathsJson`, `writeFrameHeatmaps` in `storage.ts`), not just the worst-scoring one; the investigator can click any sampled-frame tick in the timeline to browse that frame's own heatmap (`?frame=N` on the heatmap route). For "diff against the original": real frame extraction + pixel comparison (`src/lib/video-diff.ts`, `sharp` + `pixelmatch`, no new Python dependency) only ever runs when a real **cross-case match** exists with an actual file on disk — verified live with two cases sharing the same video (0% diff, correctly proving no false positives). The seeded **corpus** (`CorpusItem`) still only stores a thumbnail, so corpus-only matches honestly 422 with "no full original available to diff" rather than faking one — confirmed live.

## 5. Documents — verify signature, detect edits after signing

**Goal**: For a document, check whether it's digitally signed, and whether it's been edited after signing.

**Status**: Built (2026-09-04), scoped deliberately to what's robust rather than a fragile full crypto-verify.

**What exists today**: Real PDF metadata extraction and the existing tamper heuristic, plus a real, structural digital-signature check (`src/lib/pdf-signature.ts`, using `node-forge`): detects a signature via the standard `/ByteRange` + `/Contents` pattern, extracts the signer's Common Name from the embedded X.509 certificate, and — the actual "detect edits after signing" signal — checks whether the signed byte range still covers the entire current file (`signatureCoversWholeFile`). If the file has grown past what the signature covers, that's the well-known PDF "incremental update" tampering pattern. Deliberately does **not** attempt full CMS/PKCS#7 cryptographic signature verification (RSA-verifying the digest against the certificate's public key) — node-forge's PKCS#7 support makes that fragile to hand-roll correctly across every real signing tool's ASN.1 encoding choices, and a subtly-wrong "cryptographically valid" claim would be worse than not making it. Verified live end-to-end with three real PDFs generated for this test (via `pyhanko` + a self-signed cert): an unsigned PDF (`signaturePresent: false`, no crash — confirmed the existing unsigned-PDF path is unaffected), a freshly signed PDF (`signaturePresent: true, coversWholeFile: true, signerName: "Test Investigator"`), and the same PDF with bytes appended after signing (`coversWholeFile: false`, correctly flagged). Rendered in the existing `DocumentDetails` panel (`evidence-card.tsx`) as a green/red/neutral status banner.

## 6. Cross-evidence relationship mind map + case summary

**Goal**: When an investigator dumps a mix of evidence into one case (WhatsApp screenshots, call recordings, PDFs, text), the system should understand and map the relationships between people across ALL of it (e.g. "A spoke to B at this time/date") and produce a final case-level summary with a full mind map — not just per-exhibit analysis.

**Status**: Not built — but the raw material for it already exists.

**What exists today**: Every exhibit's real per-item analysis is already loaded in one place by `getRealCase()` (`src/lib/cases-server.ts`) — transcripts, translations, AI image descriptions (which already name recognizable people), per-face labels, document text previews, cross-case/corpus matches. Nothing today synthesizes across exhibits into one relationship graph or narrative. The established pattern for a self-contained SVG graph view already exists (`src/components/propagation/sighting-tree-graph.tsx`, `sighting-map.tsx` — plain typed props in, hand-rolled `<svg>` out, no charting library) and a `*-server.ts` data-aggregation function feeding it (`propagation-server.ts`) — a mind-map feature would follow the same two-piece shape.

**What a full build would need**: A new aggregation function gathering all real per-exhibit text for a case, one Gemini structured-JSON-schema call extracting entities + relationships + a narrative summary from that real text, a caching table (keyed by case, re-run on demand — same "cache + manual re-run" philosophy as every other AI feature here), and a new case-level view (`/cases/[id]/mindmap`, alongside the existing History/Propagation/Report links) rendering it as an SVG node-link graph plus a summary card. This is the largest of the 5 gaps.

## Open decisions

- **Remaining gaps**: only #1 (CCTV vehicle/plate/face detection) and #6 (cross-evidence mind map) are still unbuilt — #2, #4, and #5 shipped 2026-09-04. #1 and #6 are also the two largest/most novel; no build order decided between them yet.
- **CCTV reference-face-matching (#1)**: turns a documented non-goal (biometric face matching) into a real capability — flagging this explicitly for a deliberate go/no-go rather than assuming yes.
- **Seed cases**: still paused per the original request — will resume once (a subset of) the remaining gaps are built, so seed cases can actually demonstrate real capability rather than being built against features that don't exist yet.
