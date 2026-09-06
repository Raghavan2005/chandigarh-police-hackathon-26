# PS4 — Demo Script

A concrete run-of-show for the Phase 3/4 "run the full demo script end-to-end at least twice" rehearsal requirement (`PS4_MVP_BUILD_PLAN.md` §8). Originally grounded in the Phase 0/1 MVP flow only; **extended** with Part B (all six PS4_USE_CASES.md workflows) and Part C (this session's deepfake-accuracy work and bug fixes) once those were built — updated in place per this file's own rule, not forked.

**Two ways to use this doc:**
- **Judge pitch** (~6–8 min): Part A only (steps 1–8), leaving room for Q&A. Steps 9–10 and Part B/C are optional extensions if time allows.
- **Full internal progress walkthrough** (e.g. "show the team lead everything built so far," ~15–20 min): Part A + Part B + Part C, in order.

## Pre-demo checklist (do this before walking up to present, not during)

- [ ] `ml-service` (`uvicorn main:app`) running and `/health` returns `modelLoaded: true`. **Pre-warm every lazily-loaded model** before recording/presenting — a live cold-load is a real risk mid-demo:
  - Audio: `POST /detect/audio` with any short clip → confirm `audioModelLoaded: true`.
  - Transcription: `POST /transcribe` with any short clip → confirm `transcriberLoaded: true`.
  - Translation: `POST /translate` with one dummy segment → confirm `translatorLoaded: true`.
  - Object detection (CCTV): `POST /detect/objects` with any image/video frame → confirm `objectDetectorLoaded: true`.
  - The general AI-image classifier (`generalAiDetectorLoaded`) loads on the very first `/detect/image` call same as the face-swap one — first image investigate of the session pre-warms both together.
  - Full `/health` once everything is warm should read: `{"status":"ok","modelLoaded":true,"audioModelLoaded":true,"transcriberLoaded":true,"translatorLoaded":true,"objectDetectorLoaded":true,"generalAiDetectorLoaded":true}`.
- [ ] Next.js app running (`npm run build && npm run start` for a real prod build, not `next dev` — dev mode is slower and shows extra dev-only UI chrome).
- [ ] Confirm the machine can run **fully offline** (§7 risk table's explicit requirement) — disconnect Wi-Fi and confirm the app still works, since both model weights should already be cached locally by demo day.
- [ ] Know your login: `raghavan@chandigarhpolice.gov.in` / `investigator123` (investigator) and `admin@chandigarhpolice.gov.in` / `admin123` (admin, for the audit-log beat). **Change these seeded demo passwords before presenting to actual judges/police if this ever leaves a dev machine** — they're printed in `prisma/seed.ts` and are not a real secret.
- [ ] Have `public/evidence/case-image-evidence.jpg` ready to upload live — it's a seeded corpus item (`prisma/seed.ts`), so uploading it live guarantees a **real** cross-case/corpus match during the demo, not a coincidence you have to hope for.
- [ ] Do one full silent run-through immediately before presenting, exactly as scripted below, so you know current timings and that nothing regressed.
- [ ] Delete or ignore any leftover test cases from development (titles containing "temporary, to be deleted" or "UI audit" — harmless if judges see them, but cleaner if the case list doesn't have them visible. Do **not** delete their underlying audit-log rows — see `PS4_BUILD_STATUS.md`'s note on why that would break the hash chain; if it matters for demo polish, create a fresh case list filter/search instead of deleting).
- [ ] For Part B (six use cases): real, pre-downloaded test files for every use case already exist in `~/cph/samples/` and `~/cph/source/` (both have their own `README.md` documenting exact provenance/license of every file — nothing synthetic). Uploading these live and running Investigate on camera is more convincing than showing a pre-existing result, and processing is fast now that every model is pre-warmed.

## Part A — Core MVP flow

### 1. Login (real auth, ~15s)
Open `/login`. Point out: real session auth, no public sign-up — accounts are provisioned by an administrator, matching how a real cell onboards staff (`prisma/seed.ts`'s own design note). Sign in as the investigator.

### 2. Dashboard (~30s)
Land on `/`. This is real data, not mock: Active Alerts, Open Cases, Evidence Analyzed (30d), Avg. Time to Verdict are computed from the actual database, not hardcoded. Point at the "Flagged media volume" chart and Recent alerts table — same story, real weekly verdict counts.

### 3. Create a new case, live (~90s)
Click **New Case**. Fill real particulars (FIR number, police station, your rank/badge — mention these are recorded on the Section 63 BSA certificate as declarant particulars). Pick **Image** as evidence type, upload `case-image-evidence.jpg` from the dropzone. Submit.

Say explicitly: *this just created a real case row and uploaded a real file — SHA-256 computed server-side on the actual bytes, not decorative.*

### 4. Investigate, live (~20-60s depending on classifier speed)
On the case page, click **Investigate**. Narrate while it runs: this is calling a real local ML service (not cloud, not mocked) that does face-crop detection + Grad-CAM, checks for a C2PA manifest, computes a perceptual hash and searches it against every other case and the seeded corpus, then runs all of that through the Evidence Fusion algorithm.

When it completes, walk through the result panel left to right:
- **Analysis pipeline**: each real step with real numbers (raw classifier score, C2PA present/valid, matches found).
- **Verdict**: the fused verdict + confidence.
- **Evidence fusion** section below: the signal-by-signal breakdown (fired/absent/contradicted) and the coverage-based cap math — *this is the answer to "walk me through the exact fusion weights when only the classifier fires"* (§10 Q&A prep) if asked.
- Because this file is a seeded corpus item, **"Matches found" will be > 0** — click into it to show the real cross-case/corpus match, not a hardcoded example.

### 5. Human override (~30s)
Click **Override** on the evidence card. Show the reason field is required (try submitting empty first if you want to demonstrate the validation, then fill it in). Submit a real override. Point out: this writes a real `VerdictOverride` row *and* a hash-chained `OVERRIDDEN` audit entry in the same transaction — not a client-side-only toggle.

### 6. Cross-case & corpus matches page (~20s)
Click **Cross-case & corpus matches** in the header. Real matches ordered by timestamp, not a live OSINT spread scrape (be upfront about that boundary — §10's Q&A prep: *"Is your propagation graph live data? No, seeded corpus by design."*).

### 7. Export the report (~30s)
Click **Report** → **Export PDF**. While it renders, mention this is a real headless-Chrome server-side render of the same authenticated page a human sees — not `window.print()`. When it opens, scroll to the bilingual Section 63 BSA certificate block and the chain-of-custody table. This is the direct answer to "how is this evidence actually usable in court" (§10) — be precise: it's a correctly-structured *draft*, legal validity attaches only once the investigating officer signs it.

### 8. Audit log (~30s)
Log out, log in as **admin**. Open **Audit Log** in the sidebar. Point at the green "Hash chain verified" banner — every entry across every case, independently re-verifiable, cross-checked against an append-only checkpoint file outside the database (`chattr +a` where the filesystem supports it). This is the direct answer to "what stops someone with disk access from rewriting your audit log."

### 9. Optional — NCII handling (~20s, if time allows)
Create or open a case with NCII sensitivity marked. Show the blur-by-default state and that clicking "View sensitive content" is itself a logged, auditable action.

### 10. Optional — audio detector (~20s, only if pre-warmed per the checklist)
Superseded by Part B.2 below (full call-recording workflow) — skip this step if doing the full walkthrough, keep it if doing only the short judge pitch and want one quick audio beat without the transcribe/translate/threat detour.

## Part B — The six PS4 use cases (`PS4_USE_CASES.md`)

Each of these is its own case/evidence upload — real files from `~/cph/samples/` or `~/cph/source/` (see those folders' own `README.md` for exact source/license per file). Target ~2 min each for the full walkthrough; can be trimmed to "upload → investigate → point at the one most interesting result" (~45s each) if time is tight.

### B.1 CCTV — object/vehicle/plate/face detection (~2 min)
Upload `source/license-plate-compressed.mp4` (real traffic-camera footage, clear vehicles/plates) as video evidence. Find the **"CCTV object / plate / face search"** panel on the evidence page and click **"Detect objects, plates & faces"** (a separate action from the generic Investigate button). Point out: real object detection (not a mock bounding box), real EasyOCR plate reads per detected vehicle. **Honest caveat to say out loud**: this specific clip has "Number Plate" text baked into the footage as a demo overlay (from its original source), so the OCR will legitimately read that overlay text rather than a real plate — mention it's reading real pixels correctly, the footage itself just isn't a real plate. For a cleaner plate-read moment, optionally also show `source/face-demographics-walking.mp4` for the face-detection half (real people, clear faces, no baked-in overlay).

### B.2 Call recording — transcribe / translate / threat detection / voice-spoof (~2 min)
Upload `source/call-recording-hindi-real.mp3` (real, clearly spoken Hindi — a trimmed Spoken-Wikipedia recording) as audio evidence. Run: transcription (real Whisper output, not canned text), translation to English, the voice-spoof/synthesis classifier (Investigate), and threat detection. State the honesty framing out loud: the spoof classifier says nothing about whether audio was cut/spliced — that's a separate, real splice-point detector, not this one.

### B.3 Deepfake image — the dual-model accuracy improvement (~2–3 min, the highlight of Part C too)
Upload `source/deepfake-image-real-FAKE.png` (a real StyleGAN-generated face — genuinely no such person exists) as image evidence and click Investigate. Open the pipeline panel and point at **both** rows under "Manipulation detection": **Face-swap classifier score** and **General AI-image classifier score**. Say explicitly: *the original model alone scored this same image close to 0% — it's fine-tuned on face-*swap* seams, so a fully-synthetic image with no seam at all was invisible to it. The second model we added this session scores it correctly high.* This is the concrete, numbers-on-screen version of "we improved deepfake detection accuracy," not a claim without evidence.

### B.4 Deepfake video — per-frame localization + diff (~2 min)
Upload `source/deepfake-video-real-FAKE.mp4` (real FaceForensics++ face-swap sample) as video evidence, Investigate. Show the worst-scoring-frame heatmap and the per-frame timeline (`frameScoresJson`) — point out it flags *which* frames, not a single clip-wide average that would dilute a short manipulated segment. If a second, unmanipulated copy of similar footage is on hand, show the video-diff feature comparing the two.

### B.5 Documents — signature verification / tamper check (~90s)
Upload `source/document-signed-real.pdf` (real, validly-signed PDF, real X.509 cert chain) and `source/document-unsigned-real.pdf` as two exhibits on one case. Show the signed one resolving to its real signer name (**"Test Signing Certificate"** — mention this session's own bug fix: earlier this misread the certificate bundle's root CA as the signer, since PKCS#7 doesn't guarantee cert order; now picks the certificate that isn't anyone else's issuer). Show the unsigned one honestly reporting no signature found, not a fabricated one.

### B.6 Cross-evidence mind map (~90s)
On a case with a few exhibits already uploaded (e.g. combine B.3–B.5's files onto one case instead of separate ones), open the mind map. Show real linked nodes — evidence, matches, people — not a static illustration. This is the direct answer to "how does an investigator see the whole picture instead of files in isolation."

## Part C — This session's specific improvements (talking points, ~2 min narration, no new screens beyond B.3/B.5)

Say these explicitly if the audience is the team/team lead rather than judges — they want to know *what changed*, not just *what works*:

- **Deepfake detection accuracy**: added a second, independent AI-image classifier (`dima806/ai_vs_real_image_detection`) specifically because the original one is blind to fully-synthetic images (measured: a real known-fake scored 0–1% on the old model, 69.75% on the new one). Demonstrated live in B.3. Both scores are stored separately, never silently blended — see `ml-service/README.md` → "General AI-image model" for the full numbers.
- **A real hydration bug fix**: several pages formatted timestamps without a fixed locale, so the server and browser could disagree and crash the page. Fixed across 15+ files.
- **A real PDF signature bug fix**: signer identification assumed the first certificate in a signed PDF's bundle was always the signer — not guaranteed by spec. Demonstrated live in B.5.
- All of the above shipped on branch `feature/deepfake-accuracy-and-fixes`, verified live against the running app before being called done (not just "compiles").

## Closing line (have this ready verbatim)

*"Everything you just saw ran locally, offline, against real files — the only thing seeded ahead of time was the demo corpus, and we say so on screen everywhere it matters. Where we don't have a real capability yet — live web search, face-embedding cross-photo matching — we say that plainly instead of faking it."*

This directly mirrors the plan's own **Execution** and **Innovation** judging-criteria framing (§10) — lead with the fusion engine and the honesty, not "we built a detector."
