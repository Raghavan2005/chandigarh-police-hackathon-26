# PS4 — Analysis Pipeline: System Architecture

**Track:** PS4, AI-Generated Media Detection & Cross-Platform Origin Tracing
**Purpose of this file:** a single reference document for "how the system works" — the full pipeline from evidence upload to investigation report, including the OSINT/web-search layer. Written for the pitch deck's architecture slide and the prototype video's narration beat sheet.
**Status:** this whole document describes a **PROPOSED SOLUTION** — nothing here is a built/running system yet (see §7). Where a claim is instead a verified fact from the official brief, it is tagged **FACT**.

Sources: `Track 4 Documentation.pdf`, `AGENT_PS4_DEEPFAKE_REPORT.md`, `PS4_ROUND1_STRATEGY_CHAT.md` (all in this directory).

---

## 1. What happens, in one paragraph

An investigator uploads a piece of media (image, video, audio, or document). The system reads it — never trusts the filename or the uploader's claim — and runs five independent checks in parallel: does the file's *technical fingerprint* look tampered with, does an AI *classifier* think it's synthetic or edited, does it carry a *provenance credential* (C2PA) that proves its edit history, has this exact or near-identical file been *seen before* (by us or on the open web), and if so, *where did it first appear and how did it spread*. An **Evidence Fusion** step then combines all five signals into one verdict with a confidence level — never a single model's opinion standing alone — and hands it to a human investigator, who can accept, override, or mark it inconclusive. Every step is logged for chain of custody.

---

## 2. Pipeline at a glance

```
                    ┌───────────────────────────┐
                    │   INVESTIGATOR UPLOADS     │
                    │  image / video / audio /   │
                    │        document            │
                    └─────────────┬───────────────┘
                                  ↓
                    ┌───────────────────────────┐
                    │  STAGE 1 · INTAKE +        │
                    │  METADATA EXTRACTION       │
                    └─────────────┬───────────────┘
                                  ↓
        ┌─────────────────────────┼─────────────────────────┐
        ↓                         ↓                          ↓
┌───────────────┐       ┌───────────────────┐      ┌──────────────────┐
│ STAGE 2        │       │ STAGE 3            │      │ STAGE 4           │
│ MANIPULATION   │       │ PROVENANCE /       │      │ OSINT SEARCH      │
│ ANALYSIS       │       │ C2PA CHECK         │      │ (reverse search,  │
│ (AI classifier │       │ (Content           │      │ origin ID)        │
│ + heatmap)     │       │ Credentials)       │      │                   │
└───────┬────────┘       └─────────┬──────────┘      └─────────┬─────────┘
        │                          │                            ↓
        │                          │                  ┌──────────────────┐
        │                          │                  │ STAGE 5           │
        │                          │                  │ PROPAGATION       │
        │                          │                  │ MAPPING            │
        │                          │                  └─────────┬─────────┘
        └──────────────┬───────────┴──────────────────────────┘
                        ↓
            ┌───────────────────────────┐
            │  STAGE 6 · EVIDENCE        │
            │  FUSION                    │
            │  (multi-signal → verdict)  │
            └─────────────┬───────────────┘
                          ↓
            ┌───────────────────────────┐
            │  INVESTIGATOR REVIEW       │
            │  accept / override /       │
            │  mark inconclusive         │
            └─────────────┬───────────────┘
                          ↓
            ┌───────────────────────────┐
            │  STAGE 7 · INVESTIGATION   │
            │  REPORT + CHAIN OF CUSTODY │
            │  (PDF / JSON export)       │
            └───────────────────────────┘
```

Stages 2, 3, and 4 run **in parallel**, not sequentially — none of them depends on another's output, so there's no reason to make an investigator wait for all three in series. Stage 5 depends on Stage 4 (you can't map propagation before you've found other copies). Stage 6 waits for all four.

---

## 3. Stage-by-stage

### Stage 1 — Intake & Metadata Extraction

Reads whatever the container format exposes before any AI runs: file container, resolution/duration, codec, and any encoder signature left behind by editing software — plus a SHA-256 of the file itself, computed the moment it lands, so every later step in the pipeline can be tied back to a fixed, unaltered byte sequence (this hash is also the first line of the chain-of-custody log — see §7 note below).

Example of the kind of panel this stage populates in the investigator UI:

| Field | Example value |
|---|---|
| Container | MP4 (ISO BMFF) |
| Resolution | 1920×1080 @ 29.97 fps |
| Encoder signature | Adobe Premiere Pro 2026 |
| SHA-256 | `9f2a7c…e41b` |

**Why the encoder signature matters:** it doesn't prove manipulation by itself (plenty of legitimate footage passes through Premiere), but it's a fact the investigator should see up front — professional editing software in the metadata of a video presented as "raw phone footage" is exactly the kind of inconsistency that should raise a flag before the AI classifier even runs. This is a cheap, deterministic, always-available signal — unlike the classifier, it never has an "unseen generator" failure mode.

**Input:** raw file. **Output:** structured metadata JSON + SHA-256, feeds Stages 2, 3, 6, 7.

---

### Stage 2 — Manipulation Analysis

The AI classifier stage: runs the image/video/audio through a detection model and returns a manipulation probability, plus a Grad-CAM-style heatmap localizing *where* the model thinks the manipulation is (face region, background, a specific audio segment) rather than a bare yes/no.

**INFERENCE, carried over from `AGENT_PS4_DEEPFAKE_REPORT.md`:** this is the pipeline's weakest, least defensible link — the field's own benchmarks show accuracy drops of 30–40% on cross-dataset/unseen-generator evaluation, and the 2020 DFDC-winning model scored only 65.18% average precision on a private real-world test set. This is exactly why Stage 2's output is never treated as the final verdict — it's one signal among five, fused in Stage 6, and the UI should present it with a confidence band, not a bare percentage.

**Input:** raw file + metadata. **Output:** manipulation probability, heatmap/localization, per-region confidence. Feeds Stage 6.

---

### Stage 3 — Provenance / C2PA Check

Looks for a **C2PA Content Credential** — a cryptographically signed edit history that some capture devices and editing tools attach. If present and valid, this is the single strongest signal in the whole pipeline (it's a verifiable chain, not an inference). If absent — which, honestly, is the common case — the system reports that plainly rather than treating "no credential" as evidence of guilt.

**SOURCE-BACKED OBSERVATION:** the specialist report flags the obvious follow-up question a judge will ask — *"What happens when almost no real content has a C2PA credential?"* The honest answer, and the one this pipeline is built around, is that C2PA is a bonus signal that strengthens a verdict when present, not the pipeline's backbone.

**Input:** raw file. **Output:** credential present/absent, and if present, its signed edit history. Feeds Stage 6.

---

### Stage 4 — OSINT Search (Reverse Search & Origin Identification)

Looks for other copies of this exact or near-identical file, using perceptual hashing / embedding similarity against an evidence corpus, plus a controlled web-search tool (architecture in §4). Goal: find the earliest known occurrence and any near-duplicates.

**Input:** file + perceptual hash + AI-generated search queries. **Output:** list of matches (source, first-seen date, similarity score). Feeds Stage 5 and Stage 6.

---

### Stage 5 — Propagation Mapping

Takes Stage 4's matches and orders them into a timeline/graph: original → first repost → subsequent reposts → viral spread, across whichever sources were found.

**PROPOSED SOLUTION, scoped honestly:** for the Round-1 prototype this runs against a **seeded evidence corpus** (a small prepared database of "known" prior media with source/date/hash), not a live crawl of Instagram/X/TikTok — live cross-platform social access is exactly the blocker the feasibility report calls out as unfixable by engineering effort within a hackathon timeline. The propagation graph is real in structure and logic; the data behind it is prepared, not scraped live, and the pitch deck/demo should say so.

**Input:** Stage 4 matches. **Output:** ordered propagation graph (nodes = sightings, edges = repost/derivation relationships). Feeds Stage 6 and the report.

---

### Stage 6 — Evidence Fusion

Combines the four upstream signals — manipulation probability, provenance status, hash/match evidence, propagation pattern — into one verdict with a confidence level. This is the pipeline's actual novelty surface (see §5 for the fusion logic).

**Input:** outputs of Stages 2–5. **Output:** verdict + confidence + a plain-language explanation of which signals drove it. Feeds investigator review and Stage 7.

---

### Stage 7 — Investigation Report + Chain of Custody

Every action from Stage 1 onward (upload, each analysis step, every investigator view/edit/override) is written to an append-only audit log keyed to the Stage-1 SHA-256. The final report — verdict, evidence, origin, propagation, confidence, and the audit trail itself — exports as PDF/JSON in a format meant to hold up as forensic documentation, not just a UI screenshot.

**Input:** Stage 6 verdict + full audit log. **Output:** exportable case report.

---

## 4. The OSINT / web-search architecture

**PROPOSED SOLUTION.** The core design decision: **the AI never gets an open browser.** It gets a fixed set of backend-controlled tools, and it decides which ones to call and in what order — the backend enforces the scope, the AI orchestrates within it.

```
Investigator uploads evidence
        ↓
  Detection engine (Stages 1–3 run first, always)
        ↓
  AI investigation agent
        ↓
  agent calls tools, one or more, in whatever order it decides:
        │
        ├─ search_web(query)                 → legitimate search API, backend-scoped
        ├─ search_image(query / image)        → reverse-image search
        ├─ get_page(url)                      → fetch a specific result for detail
        ├─ extract_metadata(file)             → Stage 1, callable again on a match
        ├─ calculate_perceptual_hash(file)     → for corpus/near-duplicate lookup
        ├─ search_evidence_database(hash)      → the seeded corpus (§ Stage 4/5)
        └─ create_timeline(events)             → assembles Stage 5's propagation graph
        ↓
  results combined → Stage 6 Evidence Fusion
        ↓
  investigator reviews the consolidated case, not raw tool output
```

**Why this shape, specifically:**

1. **A single "Investigate Evidence" action**, not a dozen separate buttons — the agent runs the full tool sequence itself (extract metadata → hash → run detector → generate search queries → web-search distinctive text/frames → check the evidence database → compare dates → build the timeline → summarize) and hands the investigator one consolidated case view instead of raw fragments.
2. **The web-search surface is narrow and backend-owned** — `search_web(query)` calls a real search API on the backend; the LLM never gets raw browsing or credentials. This is what makes "OSINT search running" in the UI an honest label rather than a claim of unrestricted internet access.
3. **The LLM never makes the final forensic call.** It summarizes and correlates; Stage 6's fusion logic (not the LLM's own judgment) produces the verdict, and a human investigator has the final word. This directly answers the report's core weakness — a detector that's confidently wrong on an unseen generator is dangerous, an agent that says "uncertain, human review required" is not.

---

## 5. Evidence Fusion logic

The verdict space is **four-way**, not a forced binary — this is deliberate, because "the model is 51% confident" and "we have no idea" are different findings and should look different to an investigator.

| Verdict | Fires when |
|---|---|
| **REAL** | Low manipulation probability, no contradicting metadata, no suspicious hash matches |
| **MANIPULATED** | Elevated manipulation probability *and* at least one corroborating signal (metadata inconsistency, missing/invalid provenance, or a matched earlier "original" that differs) |
| **AI-GENERATED** | High manipulation probability with generation-pattern indicators, and no provenance credential |
| **INCONCLUSIVE** | Signals disagree, confidence is low across the board, or coverage is incomplete (e.g., no matches found, C2PA absent, classifier uncertain) — this is a valid, honest output, not a failure state |

| Signal | Role in fusion |
|---|---|
| Manipulation probability (Stage 2) | Primary but never sole driver — weighted down when uncorroborated |
| C2PA credential (Stage 3) | Strongest single signal when present; neutral (not negative) when absent |
| Metadata consistency (Stage 1) | Cheap, deterministic corroborating signal |
| Hash/origin matches (Stage 4) | Corroborates *and* enables the "earliest known source" narrative |
| Propagation pattern (Stage 5) | Contextual — rapid, multi-source spread strengthens a MANIPULATED/AI-GENERATED read but doesn't establish it alone |

**Human-in-the-loop is not optional.** The investigator can accept, override with a stated reason, or escalate to "insufficient evidence" — and that decision, plus its reasoning, is itself logged into the chain of custody in Stage 7.

---

## 6. Four evidence types, condensed

| Evidence type | What Stage 2 checks | What's distinct about it |
|---|---|---|
| **Image** | Manipulation probability, suspicious-region heatmap | Straightforward mapping onto Stages 1–7 as written above |
| **Video** | Frame-level analysis, suspicious frames, face/manipulation regions, audio/video consistency | Adds a temporal dimension — flags *which frames*, not just *whether* |
| **Audio** | AI-generated voice probability, speaker/voice consistency, suspicious segments (waveform + timestamps) | Reverse search and propagation still apply, but "manipulation region" becomes a time range, not a spatial region |
| **Document / PDF** | OCR extraction, suspicious text/formatting, modification history where available | Manipulation classifier is closer to a forgery/tamper detector than a deepfake detector; use case is scanned notices, fake government orders |

---

## 7. What's real vs. proposed for Round 1

**PROPOSED SOLUTION / recorded project decision** (from `PS4_ROUND1_STRATEGY_CHAT.md`): Round 1 submits a **UI prototype + a 2–3 minute narrated demo video**, not a working model or backend. Every screen and pipeline stage above should be presented explicitly as "this is what the platform will do," never as "this is already running." The one line to avoid in the pitch deck and video: *"our AI already searches the entire web/social media."* The accurate line: *"the proposed AI investigation agent will orchestrate authorized web-search, reverse-search, provenance, and evidence-database tools."*

If shortlisted, the 24-hour offline round (8 Sep 2026) is where Stages 1–3 and a seeded-corpus version of Stages 4–6 would actually get built — see `PS4_ROUND1_STRATEGY_CHAT.md` for the prioritized build order (chain of custody → multi-signal fusion → manipulation localization → propagation clustering → inconclusive/human-review system).

---

## 8. Sources

- `Track 4 Documentation.pdf` — official PS4 brief, the ten expected features referenced in §1–6
- `AGENT_PS4_DEEPFAKE_REPORT.md` — feasibility analysis, cross-dataset accuracy figures cited in Stage 2
- `PS4_ROUND1_STRATEGY_CHAT.md` — Round-1 scope decision, tool-orchestration design, demo beat sheet
