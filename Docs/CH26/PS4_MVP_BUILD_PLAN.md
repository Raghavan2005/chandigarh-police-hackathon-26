# PS4 — MVP Build Plan

**Track:** PS4, AI-Generated Media Detection & Cross-Platform Origin Tracing
**Purpose:** the actionable engineering plan to take `police-evidence-platform/` from a **Round-1 UI prototype (mock data only)** to a **real, working MVP** for the 24-hour offline build (8 Sep 2026) and Grand Finale (9 Sep 2026).
**Status:** PROPOSED SOLUTION — nothing in this document is built yet. It is the build order, not a record of completed work.
**Scope decisions locked in for this plan** (confirmed with the team before writing this):
- Full real pipeline — real DB, real file storage + server-side hashing, a real pretrained (not custom-trained) detection model, real C2PA/EXIF parsing, real seeded-corpus perceptual-hash matching, real auth.
- Detection model: pretrained open-source model, run locally — no training, no third-party paid API dependency.
- Team: 4–5 people, no fixed stack preference — role split proposed below.
- Timeline: split into pre-hack prep (now–7 Sep) vs the 24-hour build (8 Sep).

Sources this plan builds on: `PS4_ANALYSIS_PIPELINE.md` (the 7-stage architecture), `PS4_ROUND1_STRATEGY_CHAT.md` (scope/priority decisions), `AGENT_PS4_DEEPFAKE_REPORT.md` (feasibility limits), `PS4_CYBER_CRIME_OFFICER_REVIEW.md` (field-review gaps against real Indian law-enforcement workflow — its "must exist before this touches a real case" tier is folded into Phases 1–2 below), `PS4_SIMULATED_JURY_PANEL.md` (simulated multi-judge panel reaction to this plan — its consensus findings on fusion-engine coverage, audit-log tamper-hardening, and cross-case search are folded into §2/§4/§8 below), `../../police-evidence-platform/design.md`, `../../police-evidence-platform/DATA_CHECKLIST.md`, `../../police-evidence-platform/CLAUDE.md` (engineering rules — this plan must not violate them).

---

## 1. What "MVP-ready" means here

Not the full 10-feature brochure list. Per the strategy doc's own recommendation, the credible novelty is the **evidence workflow**, not a state-of-the-art detector. MVP-ready means:

1. A real investigator can log in, create a case, upload real media, and get a **real** (not scripted) pipeline run.
2. At least **image and video** get a real manipulation-probability score + heatmap from an actual model — not the current hardcoded 91%.
3. Metadata/EXIF, C2PA presence, and perceptual-hash corpus matching are **real** computations against the uploaded file.
4. Propagation graph is real, built from a **seeded corpus** (not live social scraping — that stays an explicit non-goal, per the feasibility report).
5. Evidence Fusion is a real deterministic rule engine (per §5 of `PS4_ANALYSIS_PIPELINE.md`), not a mock verdict field.
6. Chain-of-custody audit log, human override, and PDF/JSON report export are real and wired to actual actions.
7. **Runs fully offline** — no required internet call at demo time (the venue's connectivity on 8–9 Sep cannot be assumed).

**Added after the Cyber Crime officer field review (`PS4_CYBER_CRIME_OFFICER_REVIEW.md`)** — these are now MVP-blocking, not nice-to-haves, because they're what makes the difference between a detection demo and a tool an actual investigator could touch a real (especially NCII) case with:

8. Every case captures a **FIR/CCTNS number** at creation — no case exists in the system without a link to a real FIR.
9. Verdict override is **persisted to the database and the audit trail** — not shown only in local dialog state, as it currently is.
10. The audit log is **append-only and hash-chained** — each entry cryptographically tied to the previous one, so "the log wasn't altered" is a claim the system can back up.
11. **Real login/session auth gates every case route**, with the role-based access from §2 actually enforced, and any case flagged NCII/minors-related content is **blurred by default** in thumbnails/list views until an authorized investigator explicitly opens it (that open action itself logged).
12. The exported report includes a **bilingual (English + Hindi), two-part evidentiary certificate** modeled on the real Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA) format — officer identity/rank, device/system identification, extraction process, hash, Part A + Part B as researched and specified in §4's "Report format" subsection — not just a formatted summary with a plain-text sign-off line.

Audio and document/PDF modalities are explicitly **lower priority** — see §7 risk section for the fallback plan if time runs out on them. Note: `Track 4 Documenation.pdf` Figure 2's signal taxonomy lists audio-visual lip-sync mismatch as an expected video signal — deprioritizing audio is a deliberate scope cut against that taxonomy, not an oversight, and should be named as such if a judge asks.

See §10 for how this scope maps onto the actual Grand Finale judging criteria.

---

## 2. Architecture

```
┌────────────────────────┐        ┌──────────────────────────┐
│  Next.js app (existing) │ HTTP   │  Python detection service │
│  App Router + API routes│───────▶│  FastAPI, local inference  │
│  Prisma + SQLite         │        │  (pretrained model + CAM) │
└───────────┬─────────────┘        └──────────────────────────┘
            │
            ▼
     local filesystem
   (uploads/, corpus/, reports/)
```

- **Frontend:** keep the existing Next.js 16 / React 19 / Tailwind v4 / shadcn-base-ui stack as-is. This is the biggest existing asset — six fully designed screens already exist. Do not rewrite UI; swap its data source.
- **Backend orchestration:** Next.js Route Handlers (`src/app/api/**`) — case CRUD, upload, auth, audit log, the fusion engine, report export. Keeps one runtime/deploy for everything except the model.
- **Detection microservice:** a small Python FastAPI service, because pretrained deepfake/AI-image detectors are overwhelmingly PyTorch/HF-ecosystem. Called over `localhost` HTTP from the Next.js backend — never from the browser directly.
- **Database:** **SQLite via Prisma**, not a hosted Postgres. Reason: the 24-hour round is an *offline* build — a file-based DB has zero network dependency and zero "the demo laptop can't reach the DB" risk. Prisma gives real schema/migrations without ops overhead.
- **File storage:** local filesystem under `police-evidence-platform/storage/` (gitignored), not S3 — same offline-first reasoning.
- **Auth:** simple credentials-based session auth (e.g. NextAuth Credentials provider or a hand-rolled signed cookie + bcrypt) — enough to satisfy "Security & Access Control" (official feature #9) without an external identity provider.
- **Authorization, not just authentication:** feature #9 in the Track 4 brief asks for access control, not merely a login screen. `User.role` (§4) must actually be enforced — a route-handler middleware/guard that checks role on every `/api/**` case/evidence/audit route (e.g. `investigator` can create/override cases they're assigned; only `admin` can view the global audit log) — not left as an unread schema column.
- **No unauthenticated path to any case data.** The current prototype has zero login routes at all — every case, including anything that would be NCII/minors-related, is reachable by anyone who loads the URL. Per the officer review, this is treated as a hard blocker, not a hardening task: real session auth ships in Phase 1, before any other case-data feature is considered "done" for that phase (§1 item 11).
- **Sensitivity-aware rendering:** any component that renders an evidence thumbnail (dashboard alerts table, case list, evidence viewer) must check `Case.sensitivityLevel` and render a blurred placeholder instead of the real image/video poster when it's `ncii` or `minor`, revealed only via an explicit "view sensitive content" action that itself writes an `AuditLogEntry` (§1 item 11).
- **Audit-log tamper-hardening beyond in-DB hash-chaining** (per the simulated jury panel, `PS4_SIMULATED_JURY_PANEL.md` — the technical judge's point that hash-chaining inside SQLite alone doesn't stop someone with disk access from rewriting a row and recomputing the chain, since the whole chain lives in the one file that was tampered with): the app runs as a dedicated, low-privilege OS service account that exclusively owns `storage/app.db` (mode `600`, no other user/process has write access); every time a new `AuditLogEntry` is written, its `entryHash` is *also* appended as a single line to a separate file, `storage/audit-checkpoints.log`. **`chattr +a` is attempted but verified, not trusted** — §11's open question turned out to matter in practice: on the dev machine, `chattr +a` exits `0` without error but the attribute doesn't actually take (confirmed by reading it back with `lsattr`, not by trusting the exit code — a plain shell redirect could still truncate the "protected" file). When the attribute isn't actually active, the implementation falls back to mirroring every checkpoint line to syslog via `logger` — journald's storage isn't writable by the app process at all, which is a genuinely separate write path outside the app's own filesystem access, not just a second copy of the same vulnerable file. To verify integrity later: recompute the hash chain from the DB and diff it against whichever of the two (checkpoint file or `journalctl -t ps4-audit-checkpoint`) is actually hardened on the machine in question — any mismatch pinpoints exactly which entry was altered after the fact. Assumes the demo machine runs Linux (confirmed for this plan); the syslog fallback further assumes `logger`/journald are present, which is true on essentially every mainstream Linux distro.
- **Cross-case search:** generalize the perceptual-hash/SHA-256 matching pipeline (§4) so it runs against **every case's own uploaded evidence, not just the seeded `CorpusItem` table** — "has this exact file or a near-duplicate shown up in another case" needs to be answerable system-wide. This was independently flagged by both the officer review and the simulated jury panel as a bigger gap than audio/document detection, so it's treated as core scope here, not a stretch goal. Scope is deliberately hash/perceptual-hash only for the MVP — no face-embedding model — see §4 for why.

This satisfies the CLAUDE.md rule against unnecessary architecture (no microservices sprawl, no message queues) — it's one extra process, justified because the model literally cannot run in the Node/Next.js runtime.

---

## 3. Detection model approach

- **Image:** a pretrained open-source AI-generated-image / deepfake classifier from Hugging Face (CNN-based, not ViT, specifically so Grad-CAM is straightforward). Team picks the specific checkpoint during Phase 0 and validates it against a handful of known-real and known-fake images (including the ones already in `Docs/incidents/`) before committing to it.
- **Video:** reuse the image model via **frame sampling** (e.g. 1 frame/sec or scene-change sampling), run each sampled frame through the same classifier, aggregate to a clip-level probability + flag the worst-scoring frames/timestamps. This is a legitimate, defensible approach and avoids needing a separate video-specific model.
- **Heatmap:** Grad-CAM on the classifier's last conv layer, rendered as an overlay image, saved alongside the detection result — feeds the existing heatmap-toggle UI in `evidence-viewer.tsx` directly.
- **Audio / Document:** stretch goals — see §7.
- **Calibration, not just wiring:** before demo day, run the model against a small labeled set (a few obviously-real photos, a few known AI-generated images, the incident-case media) and hand-tune the probability→confidence-band thresholds. Per `AGENT_PS4_DEEPFAKE_REPORT.md`, cross-dataset generalization is weak — the honest move is visible confidence bands and a real INCONCLUSIVE path, not pretending the raw score is gospel. Use the report's own cited figures as the defensible baseline in the pitch deck and Q&A, rather than inventing new claims: the 2020 DFDC-winning model scored only **65.18% average precision** on a private real-world test set, and cross-dataset/unseen-generator evaluation shows **30–40 percentage-point accuracy drops** versus same-dataset benchmarks. Citing these numbers proactively (rather than waiting for a judge to raise them) is what makes the INCONCLUSIVE verdict path read as rigor, not hedging.
- **Anti-tamper honesty:** a judge will ask "what stops someone from stripping EXIF/C2PA metadata before upload?" The honest answer, and the one this pipeline is built around: nothing stops it, which is exactly why Evidence Fusion (§8 of `PS4_ANALYSIS_PIPELINE.md`) never treats metadata as sufficient alone — a stripped/absent credential is neutral, not exculpatory, and the SHA-256 is computed server-side at intake so every downstream signal is at least tied to a fixed, tamper-evident byte sequence regardless of what happened before upload. State this explicitly in the pitch deck rather than letting it surface as an unprepared-for question.
- **C2PA coverage caveat:** per `AGENT_PS4_DEEPFAKE_REPORT.md`, C2PA-capable capture hardware is rare — only a handful of 2026 flagship devices support it. The demo/pitch framing must say "C2PA check is real when a credential exists, and its absence is reported plainly, not treated as guilt" — never imply C2PA is a general-purpose solution most evidence will carry.

---

## 4. Data model (Prisma schema, sketch)

| Table | Key fields |
|---|---|
| `User` | id, name, email, passwordHash, role |
| `Case` | id, **firNumber**, title, summary, status, evidenceKind, **sensitivityLevel** (`standard \| ncii \| minor`), investigatorId, openedAt |
| `Evidence` | id, caseId, sha256, filePath, mimeType, uploadedAt, uploadedById |
| `MetadataResult` | evidenceId, container, resolution, duration, codec, encoderSignature, exifJson |
| `DetectionResult` | evidenceId, manipulationProbability, heatmapPath, modelName, modelVersion, ranAt |
| `ProvenanceResult` | evidenceId, c2paPresent, c2paValid, manifestJson |
| `CorpusItem` | id, sourcePlatform, sourceUrl, firstSeenAt, sha256, phash, thumbnailPath |
| `CorpusMatch` | evidenceId, corpusItemId, similarity, hammingDistance |
| `EvidenceMatch` | id, evidenceId, matchedEvidenceId, matchedCaseId, matchType (`sha256_exact \| phash_near`), similarity, hammingDistance |
| `PropagationEdge` | caseId, fromCorpusItemId, toCorpusItemId, timeDeltaLabel |
| `FusionVerdict` | evidenceId, verdict, confidence, **coverageCount, confidenceCeiling**, explanation, signalBreakdownJson |
| `VerdictOverride` | id, evidenceId, overriddenById, previousVerdict, newVerdict, reason, timestamp |
| `AuditLogEntry` | id, caseId, evidenceHash, actorId, action, timestamp, device, **entryHash, prevEntryHash** |

**New fields, added per the Cyber Crime officer review (§1 items 8–12):**
- `Case.firNumber` — required at case creation, not optional; §1 item 8.
- `Case.sensitivityLevel` — drives blur-by-default handling in every view that renders a thumbnail; §1 item 11.
- `VerdictOverride` — a real table, not client state; every override writes a row here **and** an `AuditLogEntry` (`OVERRIDDEN`); §1 item 9.
- `AuditLogEntry.entryHash` / `prevEntryHash` — each new entry hashes `(prevEntryHash + entry fields)`, forming a hash chain from the very first entry. Build this into the audit-log write path from the start in Phase 1 — retrofitting a hash chain onto existing unlinked rows later is much more painful than doing it from entry #1. §1 item 10.

**New fields/table, added per the simulated jury panel (`PS4_SIMULATED_JURY_PANEL.md`):**
- `EvidenceMatch` — cross-case search (§2), deliberately scoped to **hash and perceptual-hash matching only** for the MVP: exact SHA-256 duplicates and near-duplicate images/frames via perceptual hash (Hamming-distance threshold, same mechanism already planned for `CorpusMatch`). This catches reposts, re-encodes, and lightly-edited copies of the *same file* across different cases. It does **not** catch "same person, different photo/video" — that would need a face-embedding model, which is explicitly out of scope for the MVP timeline (a real added risk to calibrate and another model to validate, for a capability that isn't the core evidentiary claim). Name this limitation plainly in the pitch if asked, rather than letting the UI imply broader matching than it does.
- `FusionVerdict.coverageCount` / `confidenceCeiling` — see the fusion algorithm immediately below; these make "how many signals actually corroborated this verdict" a stored, queryable fact instead of something only visible by reading the explanation text.

### Fusion algorithm — coverage-aware confidence capping

The jury panel's technical judge asked directly: *"walk me through the exact fusion weights when only Stage 2 [the classifier] fires and everything else is null."* This is the concrete answer, meant to go directly into the `/investigate` implementation, not stay abstract:

For a given piece of evidence, define up to three **corroborating signals** (each either fires, is absent/neutral, or contradicts):
1. `metadataFlag == inconsistent` (Stage 1 — e.g. professional editing software signature on claimed "raw footage")
2. `c2paStatus == invalid` (Stage 3 — a credential exists but fails validation; **`absent` does NOT count as corroborating** — per §3's C2PA coverage caveat, no credential is neutral, not suspicious)
3. `hashMatches > 0 AND the matched corpus/case item pre-dates this upload with different content` (Stage 4 — evidence this is a repost/altered copy of something earlier)

```
coverageCount = count of the above 3 that fire (0–3)
confidenceCeiling = 60 + (coverageCount × 13)   // 0→60, 1→73, 2→86, 3→99

classifierScore = Stage 2's raw manipulation probability (0–100)
displayedConfidence = min(classifierScore, confidenceCeiling)

verdict =
  if c2paStatus == valid and displayedConfidence < 50 → AUTHENTIC   // strongest signal wins when clean
  else if c2paStatus == valid and displayedConfidence >= 50 → INCONCLUSIVE  // conflicting strong signals, never silently pick one
  else if coverageCount == 0 → INCONCLUSIVE   // classifier alone is never enough to reach a firm verdict, regardless of its score
  else if displayedConfidence >= 80 → MANIPULATED or AI_GENERATED (per Stage 2's sub-classification)
  else if displayedConfidence < 50 → AUTHENTIC
  else → INCONCLUSIVE
```

This guarantees the exact failure case the jury flagged cannot happen: if the classifier alone fires at 91% and everything else is null (`coverageCount = 0`), the verdict is forced to **INCONCLUSIVE**, not MANIPULATED — the UI must display *why* ("classifier flagged high manipulation probability, but no corroborating signal — treat as inconclusive pending further evidence"), not just a suppressed number. **`signalBreakdownJson` must record each of the three corroborating checks explicitly as `fired` / `absent` / `contradicted`**, not omit signals that didn't fire — this is the jury's "log absence as a fact, not silence" point, and it's what makes the audit trail defensible under cross-examination rather than just decorative. The specific constants above (60/13/80/50 thresholds) are a starting proposal, not tuned — see §11.

**Seeded corpus source — status corrected after review:** `Docs/incidents/` contains three fact-checked deepfake dossiers, but **none are currently usable as real `CorpusItem` seed data as-is** — this was checked directly, not assumed:
- CHD-2026-00133 (Murmu) and CHD-2026-00134 (Dwivedi): both `case-data.md` files explicitly state the actual viral media/poster thumbnail was **not collected**. Each folder does contain a `WhatsApp Video ....mp4`, but its provenance is unverified — likely demo-recording footage, not the disputed media itself. Do not treat it as corpus media without confirming what it actually is.
- The Modi–Netanyahu case has **no `case-data.md`** (no structured `CaseSummary` fields at all) and is a **fabricated-quote** case with no associated image/video — there is no file to compute a `sha256`/`phash` from, so it cannot back a `CorpusItem` row under the current schema.
- None of the three have a precomputed sha256/phash; only screenshots of fact-check articles exist, not the disputed media itself.

**Required Phase 0 action (blocking, not optional):** before the corpus/propagation-graph work in Phase 2 can start, someone must either (a) source the actual disputed media files for at least 2–3 of these cases (the original video/image, not just fact-check screenshots) so real hashes can be computed, or (b) build the seeded corpus from different media the team already has verified rights/files for, clearly documented as illustrative rather than the literal viral files. Do not silently seed `CorpusItem` with placeholder data labeled as if it were the real incident media — that would contradict the "never claim what isn't real" framing this whole plan is built on. Track this as a named Phase 0 task, not an assumption.

### Report format — bilingual Section 63 BSA certificate (English + Hindi)

Researched directly (not assumed) because getting this wrong defeats the point: **Section 65B of the Indian Evidence Act, 1872 was replaced by Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA), effective 1 July 2024.** The old single-signature 65B affidavit format is superseded. Section 63(4) now requires a **two-part certificate**, not one block:

- **Part A — declaration by the person in custody/control of the device** (in this platform, the investigating officer at intake): full name, parentage (S/o · D/o · W/o) or employment/badge particulars, complete address/posting; the source-device type (computer / DVR / mobile / flash drive / cloud / external media); device metadata (make & model, and — when the evidence originates from a specific seized device rather than an upload — IMEI/MAC/serial); a system-integrity clause (the device was regularly used and operating properly in the ordinary course of the stated activity); and the record's SHA-256 (or MD5) hash value, computed at intake. Signature, name, date, place.
- **Part B — cyber forensic expert authentication** (only required when a court directs independent verification — do not fabricate this for every case): expert's full credentials and designation, the extraction environment (tools used, chain of custody, laboratory reference number), an independent re-calculation of the hash for tamper detection, and the expert's signature, date, and laboratory seal. When Part B doesn't apply to a given exhibit, the report must say so plainly ("Part B — not applicable, no court direction for independent expert verification on this evidence") rather than either omitting the section or fabricating expert content.

**Data model additions needed for this** (extend §4's Prisma sketch): `Case.firNumber` (already added per §1 item 8), plus `Case.policeStation`, `Case.district`, `Case.investigatorRank`, `Case.investigatorBadgeNo`, `Evidence.deviceIdentifier` (optional — IMEI/MAC/serial, only when evidence comes from a specific seized device rather than a generic upload), and an optional `ForensicExpert { name, designation, labRef }` relation on `Evidence`, populated only when Part B genuinely applies.

**Report structure, in order** (this is what actually gets rendered/exported, replacing the current flat summary layout in `report-preview.tsx`):
1. Header — force crest, bilingual force/platform name, "Investigation Report / अन्वेषण रिपोर्ट", case ID, generation date.
2. Case & investigating officer particulars — FIR No. / प्राथमिकी संख्या, Police Station / थाना, District/UT / जिला, Investigating Officer (name, rank, badge) / अन्वेषण अधिकारी, evidence type, status, opened date.
3. Case summary (narrative — English only for MVP, see scope note below).
4. Exhibit particulars — SHA-256, device identifier when applicable.
5. Technical findings — signal breakdown, OSINT/reverse-search findings, propagation summary (structural headers bilingual; existing narrative finding text stays English for MVP).
6. Chain of custody table (bilingual column headers).
7. **The Section 63 BSA certificate — Part A and Part B as specified above.**
8. Investigating officer's final sign-off block + seal placeholder.
9. **Legal-status footer, bilingual, mandatory:** the exported document is a system-generated draft correctly structured to satisfy Section 63 BSA's evidentiary requirements — it attains legal validity only once physically or digitally signed/executed by the investigating officer and, where applicable, countersigned by the certifying forensic expert. The software does not itself certify anything; this must be stated on every export, not just implied by the disclaimer already on the current prototype's report page.

**Bilingual scope decision (stated explicitly, not silently chosen):** structural labels, section headers, table column headers, and the full certificate declaration text (Parts A and B, and the legal-status footer) are rendered in **English and Hindi**, since that's the legally load-bearing content. Dynamic narrative content — the case summary paragraph, AI-generated fusion explanations, OSINT finding snippets — stays **English-only for the MVP**; translating free-form generated text accurately is a meaningfully different (and riskier — mistranslation of a legal narrative is worse than no translation) scope than translating a fixed set of labels and a fixed certificate template. Flag full-document translation as a roadmap item, not core MVP scope, unless the team has a Hindi speaker available to review AI-generated translations before they go in front of a judge.

Sources: Section 63 BSA two-part Part A/Part B structure and required fields — [Section 63 BSA Certificate Template](https://chat2evidence.in/public/pages/section-63-bsa-certificate-template), [Section 63: Bhartiya Sakshya Adhiniyam & Digital Evidence](https://www.rkdewan.com/articles/electronic-records-now-governed-by-section-63-of-the-bhartiya-sakshya-adhiniyam-2023/), [Section 63 BSA 2023: Admissibility of Electronic Evidence](https://ksandk.com/litigation/section-63-bharatiya-sakshya-adhiniyam-2023/); seizure-memo/chain-of-custody conventions — [BIS Seizure Memo Format](https://www.bis.gov.in/qazwsx/enf/format-for-Seizure-Memo.pdf), [Seizure Memo and Panchnama: Legal Differences](https://www.legalserviceindia.com/Legal-Articles/seizure-memo-and-panchnama-understanding-the-legal-differences/); general forensic report structure — [Computer Forensic Report Format](https://www.geeksforgeeks.org/computer-forensic-report-format/).

---

## 5. API surface

Next.js route handlers:
- `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/cases`, `GET /api/cases`, `GET /api/cases/:id`
- `POST /api/cases/:id/evidence` — real upload, server-side SHA-256 (client-side hash in the current UI is cosmetic only — see Risk in §7), audit log `UPLOADED`
- `POST /api/cases/:id/investigate` — the single "Investigate" action from the strategy doc: runs metadata extraction, detection call, C2PA check, corpus search, and **cross-case `EvidenceMatch` search** **in parallel** (they're independent), then propagation build, then fusion — exactly the Stage 2/3/4-parallel, Stage 5/6-sequential shape already specified in `PS4_ANALYSIS_PIPELINE.md` §2. Must populate `FusionVerdict.coverageCount`/`confidenceCeiling` and write explicit `fired`/`absent`/`contradicted` states into `signalBreakdownJson` per §4's fusion algorithm — not just a bare verdict + confidence.
- `GET /api/cases/:id/pipeline-status` — polled (or SSE) by the existing animated pipeline panel
- `GET /api/evidence/:id/cross-case-matches` — cross-case search (§2, §4): returns any `EvidenceMatch` rows for this evidence, each with the matched case ID/title (subject to the requesting user's role/case-access) so an investigator can jump straight to "this same file also appears in case CHD-2026-00119"
- `POST /api/cases/:id/override` — human-in-the-loop; writes a real `VerdictOverride` row **and** a hash-chained `AuditLogEntry` (`OVERRIDDEN`) — the current UI only updates local dialog state, which is a correctness gap this endpoint must close, not just wrap (§1 item 9)
- `GET /api/cases/:id/report.pdf`, `GET /api/cases/:id/report.json` — the PDF must include the evidentiary certificate block (officer identity/rank, device/system ID, extraction process, hash) alongside the existing summary/signal-breakdown/propagation/audit sections (§1 item 12)
- `GET /api/audit` — every entry's `entryHash`/`prevEntryHash` must be independently re-verifiable (recomputable from the entry's own fields) and cross-checkable against `storage/audit-checkpoints.log` (§2), not just stored (§1 item 10)

Python service:
- `POST /detect/image`, `POST /detect/video-frame` → `{ probability, heatmapPngBase64 }`

---

## 6. Team split (4–5 people)

Proposed, adjust to actual skills:

1. **Backend/Infra** — Prisma schema, auth, upload + hashing, audit log (including the `chattr +a` checkpoint file and service-account file permissions, §2), the `/investigate` orchestration endpoint.
2. **ML/Detection** — Python FastAPI service, model selection + calibration, Grad-CAM, frame-sampling for video.
3. **Provenance & Corpus** — C2PA/EXIF parsing, perceptual hashing, seeded corpus + propagation graph builder, **plus cross-case `EvidenceMatch` search (§2, §4)** — same hashing infra, generalized to search across all cases, not just the seeded corpus.
4. **Frontend integration** — replace all `mock-data.ts` reads with real API calls, wire upload/pipeline-panel/propagation-graph to live data, login screen, cross-case-match links on the evidence viewer.
5. **Fusion, reporting & QA** (if 5th member; otherwise folded into #1) — **the coverage-aware Evidence Fusion algorithm (§4)** — this is now a specified algorithm, not just "a deterministic engine," and it's the single most-flagged gap from both the officer review and the jury panel, so treat it as a first-week priority, not a Phase-2 afterthought — PDF/JSON export (render the existing `/report` page with Puppeteer — don't rebuild it), end-to-end bug bash, demo rehearsal.

**Contract-first tip to avoid blocking each other:** define the API request/response TypeScript types on day 1 (Phase 0) so frontend can build against typed stub responses while backend/ML are still being wired — same pattern the current mock-data prototype already demonstrates.

---

## 7. Risks and explicit fallbacks

| Risk | Mitigation |
|---|---|
| Detector generalizes poorly on unseen generators (documented in the feasibility report — 30–40% cross-dataset accuracy drop is normal) | Never present raw probability as ground truth; confidence bands + a real INCONCLUSIVE path in the fusion engine; calibrate against known samples before demo. |
| No reliable internet at the venue | Everything in scope (§1) is designed to run fully offline: SQLite file, local model weights, local corpus. Live web-search (`search_web` tool from the strategy doc) is **optional bonus only** — implement it *if* a search API key + connectivity is confirmed on-site, with a hard fallback to corpus-only that the UI already supports gracefully. |
| Audio / document detection likely won't be finishable for real | Deprioritize below image/video. If time runs out, keep these two paths on an honestly-labeled heuristic/mock fallback rather than a broken real integration — do not silently fake it as "real" in the pitch. |
| Team blocked on each other (frontend waiting on backend, etc.) | Contract-first typed API stubs from Phase 0 (§6). |
| Scope creep re-adding brochure features 7/9/10 (Automated Alerting, full Security/Access-Control matrix, Scalability & Updatability messaging) | Out of scope for MVP — mention only in the pitch deck roadmap slide, not in the build. (Feature #6, Investigator Dashboard, is *in* scope — it's what this whole plan builds.) |
| Client-side SHA-256 in the current upload UI is cosmetic (per `DATA_CHECKLIST.md` — "nothing is actually uploaded/stored") | Must become a real server-side hash computed on the stored file bytes — this is the literal first line of the chain-of-custody story; it cannot stay decorative in the MVP. |
| `User.role` schema column exists but access control isn't enforced anywhere (official feature #9 requires more than a login screen) | Add the route-handler authorization guard described in §2 — treat as core scope, not a stretch goal, given `CLAUDE.md` §11 treats security as first-class. |
| Seeded corpus assumed ready-to-use from `Docs/incidents/`, but on inspection none of the three cases currently have the actual disputed media file or a precomputed hash (§4) | Named, blocking Phase 0 task: source real media for at least 2–3 corpus cases, or use clearly-labeled illustrative media instead — do not seed placeholder data disguised as real incident evidence. |
| The 24-hour build (8 Sep) is itself a judged elimination round — only 3–4 teams per track advance to the Grand Finale (brochure, Round 2) — not just unstructured build time | Phase 4 (§8) restructured below to include an explicit demo-readiness checkpoint partway through the day, not only end-of-day hardening. |
| Fusion engine could silently let the classifier dominate when the other 4 signals are absent (independently flagged by 3 of 4 personas in the simulated jury panel — the most-repeated single criticism across that whole exercise) | Coverage-aware confidence capping specified in §4 — `coverageCount == 0` forces INCONCLUSIVE regardless of raw classifier score; not left as an implementation detail. |
| Hash-chained audit log alone doesn't stop someone with disk access from rewriting the SQLite file and recomputing the chain (jury panel's technical judge) | Append-only `chattr +a` checkpoint file mirroring each entry hash outside the DB, plus dedicated service-account file ownership — §2. |
| Cross-case search (same hash/near-duplicate across different cases) deprioritized below audio/document detection in earlier plan drafts, despite being flagged by both the officer review and the jury panel as a bigger real-world gap | Elevated to core scope: `EvidenceMatch` table + endpoint, owned by the Provenance & Corpus role, built in Phase 1–2 (§6, §8) — scoped to hash/perceptual-hash only, not face embedding, to keep it achievable in the time left. |

---

## 8. Phased schedule

### Phase 0 — Foundation (now, 1 Sep)
- Lock model choice + validate on a handful of known real/fake samples.
- Prisma schema + SQLite migrations; FastAPI service skeleton; repo layout for the Python service alongside `police-evidence-platform/`.
- Define API contract types + the role-based authorization guard (§2) as part of the initial API scaffold, not bolted on later.
- **Source real corpus media (blocking, see §4):** confirm what's actually in the `Docs/incidents/` folders' video files, or locate/obtain the real disputed media for at least 2–3 cases; only once real files are in hand, write the seed script to load them into `CorpusItem` + demo `Case` rows with real computed hashes.
- **Set up the dedicated OS service account + file permissions** for `storage/app.db` and `storage/audit-checkpoints.log` now (§2) — this is foundational to how the app runs, not an add-on; retrofitting file ownership after other Phase 1 work assumes broad local write access is more disruptive than doing it first.
- Include `EvidenceMatch` in the Phase 0 Prisma schema pass (§4) alongside the other tables, so cross-case matching doesn't need a schema migration bolted on mid-build later.

### Phase 1 — Core vertical slice (2–4 Sep)
- Real upload → server-side SHA-256 → storage → `Case`/`Evidence` rows.
- Real metadata/EXIF extraction.
- Image classifier wired end-to-end with real Grad-CAM heatmap.
- **Auth (login/session) protecting every case route, with role enforcement from §2 wired in from day one** — not deferred, per §1 item 11.
- **Case creation form requires `firNumber` and `sensitivityLevel`** — no case can be created without a FIR/CCTNS number; sensitivity level defaults to `standard` and must be explicitly set to `ncii`/`minor` when applicable (§1 items 8, 11).
- **`AuditLogEntry` writes are hash-chained from the very first entry** (`UPLOADED` on first upload is entry #1) — build the chain into the write path now, since Phase 1 is when audit rows start being written at all (§1 item 10). **Every write also appends to `storage/audit-checkpoints.log`** (§2) from entry #1, same reasoning — start the external checkpoint alongside the in-DB chain, don't retrofit it once real entries already exist.
- Frontend: case list, case creation, upload flow switched to real APIs; case list and dashboard thumbnails respect `sensitivityLevel` blur-by-default (§2).

### Phase 2 — Fusion, provenance, corpus, video (5–6 Sep)
- Real C2PA/EXIF check.
- Perceptual hash + seeded-corpus matching + propagation graph builder.
- **Cross-case search (`EvidenceMatch`)**: extend the same perceptual-hash pipeline to run against all cases' evidence, not just `CorpusItem`; wire `GET /api/evidence/:id/cross-case-matches` and surface matches on the evidence viewer (§2, §4, §5, §6) — treat this as equal priority to the corpus/propagation work it reuses, not a follow-on.
- **Evidence Fusion engine implementing the coverage-aware algorithm from §4** (not just "a deterministic engine" — the specific `coverageCount`/`confidenceCeiling` capping logic, with `signalBreakdownJson` recording `fired`/`absent`/`contradicted` for every corroborating check), replacing the mock verdict.
- Video support via frame sampling on the same classifier.
- Audit log wired to every real action (all writes continue the hash chain **and** the `audit-checkpoints.log` append started in Phase 1).
- **Verdict override actually persisted:** `POST /api/cases/:id/override` writes a real `VerdictOverride` row and a hash-chained `AuditLogEntry`, and the override dialog reads the persisted state back — closes the "shown locally only" gap in the current prototype (§1 item 9).
- **Evidence-grade report export moved up from Phase 3**, since it's a must-exist item, not polish: PDF/JSON export (render the existing report page) now implements the full bilingual Section 63 BSA report format from §4 — case/IO particulars, exhibit particulars, the Part A + Part B certificate, and the legal-status footer — alongside the existing summary/signal/propagation/audit sections (§1 item 12).
- Frontend: pipeline panel driven by real poll/SSE status, propagation graph fed by real data.

### Phase 3 — Report, polish, rehearsal buffer (7 Sep)
- Report export polish only (the certificate block itself shipped in Phase 2) — Puppeteer PDF render quality, print styling, JSON export completeness.
- Loading/empty/error/success state audit across all screens (per `CLAUDE.md` UI rules).
- Freeze scope; run the full demo script end-to-end at least twice.
- Stretch only if ahead of schedule: audio detector, document OCR/tamper heuristic, optional live web-search tool.

### Phase 4 — 24-hour build, itself a judged elimination round (8 Sep)
Per the brochure, Round 2 is not unstructured build time — it shortlists only 3–4 teams per track to the Grand Finale. Plan the day around a mid-point checkpoint, not just end-of-day hardening:
- Morning: whatever slipped from Phase 3, with mentor guidance available; confirm the app runs fully offline end-to-end on the exact machine that will demo it.
- **Mid-day checkpoint:** the full demo script (§8 Phase 3) must be run-able and stable — treat this as a rehearsal for the same-day judged evaluation, not only for the Grand Finale.
- Afternoon: final polish only on what's already working; no new features started this late.
- Sync the pitch deck's claims to what's actually real vs. still proposed (keep the strategy doc's honesty framing — never claim live web/social search unless it's actually wired and confirmed working). Use §10's judging-criteria mapping to check the pitch covers innovation, impact, execution, and presentation explicitly.

### Phase 5 — Grand Finale (9 Sep)
- Present and demo to the four criteria in §10.

---

## 9. Phase completion & review workflow

This governs how each phase in §8 actually gets closed out — not just built, but checked in, reviewed, and tracked, so progress is never sitting only in someone's local working copy and no phase gets marked done without a human actually looking at it.

**Per phase, in order:**

1. **Validate before committing.** Run the project's build/lint/typecheck (per `police-evidence-platform/CLAUDE.md` §4 — "run tests/build/type checks, fix errors, verify the actual user flow") and manually exercise the phase's user-facing flow. Don't commit red.
2. **Commit with a phase-scoped message.** One commit (or a small tightly-scoped set) per phase, message naming the phase and what actually landed — e.g. `Phase 1: real upload, auth, FIR-gated case creation, hash-chained audit log`. No AI co-author/attribution line, per the repo's root `CLAUDE.md` commit convention.
3. **Human review is required before anything goes to the shared remote.** Open the diff for the phase (a PR if the team is using branches, or a direct walkthrough if working on one branch) and get an explicit sign-off from a teammate/lead before it's pushed — this is deliberate given how much of §1's item list (8–12) touches evidence-handling and access-control correctness; a phase should not ship un-reviewed just because it builds and demos locally.
4. **Push only after that review/approval**, not automatically on commit. If working solo against a shared remote, "review" can be a second look after a short break rather than another person, but it must happen — don't push straight off a green build.
5. **Update the status tracker** (`PS4_BUILD_STATUS.md`, same folder) immediately after push: phase, date, commit hash, reviewer, and current state (`in progress` / `in review` / `done` / `blocked`, with a one-line reason if blocked). This is the single source of truth for "where are we" — check it before starting the next phase rather than re-deriving status from memory or Slack scrollback.

This applies to Phases 0–3 (the pre-hack build). Phase 4 (8 Sep) keeps the same commit-and-review discipline but compressed — see the mid-day checkpoint in §8; don't skip review just because the clock is tighter, since that's exactly when an unreviewed regression is most costly.

---

## 10. Judging-criteria alignment

The Grand Finale is judged on **innovation, impact, execution, and presentation** (brochure). Round 2 (8 Sep) is a judged elimination round on the same axes, per §7/§8. Map the MVP explicitly so the pitch doesn't have to improvise this mapping live:

| Criterion | What in this plan demonstrates it |
|---|---|
| **Innovation** | Not "we built a detector" — the Evidence Fusion engine (multi-signal, never a single model's opinion) and the four-way verdict space (REAL/MANIPULATED/AI-GENERATED/INCONCLUSIVE) are the differentiators, per `AGENT_PS4_DEEPFAKE_REPORT.md`'s own positioning advice. Lead the pitch with this, not the model. |
| **Impact** | Chain-of-custody audit log + evidence-grade PDF/JSON report export, framed against real Indian law-enforcement workflow needs, not a generic consumer deepfake checker. |
| **Execution** | Everything in §1's MVP-ready list actually running live, offline, end-to-end — real hashing, real detection, real fusion, real export. Partial/mock paths (audio, document, live web-search) must be labeled as such on screen, never presented as finished. |
| **Presentation** | The existing dark-mode "command console" UI (`design.md`) plus a rehearsed demo script (Phase 3/4) built around one real case end-to-end, not a feature tour. |

**Q&A defensibility — questions to prepare for, sourced directly from the specialist report and this review:**
- "How accurate is your detector really?" → cite the DFDC 65.18% AP and 30–40-point cross-dataset drop figures (§3) proactively; explain why INCONCLUSIVE exists.
- "What if someone strips metadata before upload?" → answer per §3's anti-tamper honesty note.
- "Does C2PA actually cover most evidence you'll see?" → answer per §3's C2PA coverage caveat — no, it's a bonus signal, not the backbone.
- "Is your propagation graph live data?" → no, seeded corpus by design (§1, §4) — state this before being asked.
- "Who can see what in the system?" → point to the enforced role-based authorization guard (§2), not just a login screen.
- "How is this evidence actually usable in court?" → point to the real Section 63 BSA two-part bilingual certificate in the report export (§1 item 12, §4) and the hash-chained audit log (§1 item 10) — this is a direct answer to admissibility, not a deflection. Be precise if pressed: Section 63 replaced the old Section 65B (Indian Evidence Act, 1872) on 1 July 2024, and the software produces a correctly-structured *draft* — legal validity attaches only once the investigating officer (and, where a court directs, an independent forensic expert) actually signs it, per §4's legal-status footer. Don't overclaim that the software itself certifies anything.
- "Walk me through the exact fusion weights when only the classifier fires and everything else is null." (verbatim from the simulated jury panel's technical judge, `PS4_SIMULATED_JURY_PANEL.md`) → walk through §4's coverage-aware capping formula directly: `coverageCount == 0` forces INCONCLUSIVE no matter how high the raw classifier score is. Have the actual numbers ready, not a description of the concept.
- "What stops someone with disk access from rewriting your audit log?" → point to the `chattr +a` checkpoint file + service-account file isolation (§2) — and be honest that this is a demo-machine-appropriate mitigation, not a claim of unconditional immutability.
- "Can you find this same face or file in another case?" → yes for exact/near-duplicate files via `EvidenceMatch` (§4); explicitly no for "same person, different photo" — that needs a face-embedding model, deliberately out of scope for this MVP timeline. State the boundary plainly rather than letting the demo imply more than it does.

---

## 11. Open questions to resolve in Phase 0

- Exact Hugging Face model checkpoint for the image classifier (needs a short bake-off against sample images before locking in).
- Whether NextAuth or a hand-rolled session is faster for this team to implement correctly in the time available.
- Whether any team member has a live search API key (Bing/SerpAPI/Tavily) available and venue Wi-Fi is expected to be usable — decides whether the live web-search tool is attempted at all.
- **Corpus media sourcing (§4, blocking):** who is responsible for tracking down the real disputed media for the incident cases (or substituting clearly-labeled alternative media), and by when in Phase 0 — this gates all of Phase 2's corpus/propagation work.
- **Fusion confidence-cap constants (§4)** — the `60 + coverageCount × 13` ceiling and the 50/80 verdict thresholds are a reasoned starting proposal, not empirically tuned. Recalibrate against the real classifier's actual score distribution once Phase 1's model is running on the known real/fake validation set from §3 — the shape of the rule (zero corroboration → forced INCONCLUSIVE) should hold, but the exact numbers may need adjusting.
- ~~`chattr +a` verification step~~ — **resolved during implementation:** the dev machine's filesystem does *not* actually honor `chattr +a` (verified via `lsattr`, not assumed), so the code now checks the attribute rather than trusting the command's exit status, and falls back to a syslog (`logger`/journald) mirror when it's inactive — see §2. Still worth a quick check on the actual demo hardware before 8 Sep: if `chattr +a` *does* work there, both layers are active; if not, the syslog fallback alone is carrying the tamper-hardening claim, which is still real but worth knowing going in.
