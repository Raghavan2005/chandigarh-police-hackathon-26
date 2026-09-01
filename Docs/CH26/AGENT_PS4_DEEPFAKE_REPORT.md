# PS4 (AIMD) — AI-Generated Media Detection & Cross-Platform Origin Tracing
## Independent Evidence-Based Feasibility Report — Chandigarh Police Hackathon'26

Prepared: 2026-08-18 | Deadline for proposal: 2026-08-20 (T-2 days) | Finale: 2026-09-08/09

Claim-tagging legend used throughout: **FACT** (independently verified, citable), **SOURCE-BACKED OBSERVATION** (reported by a credible secondary source but not independently re-derived by me), **INFERENCE** (my reasoned deduction from facts), **PROPOSED SOLUTION** (a recommendation, not a claim about the world).

---

## 0. Verified problem statement (from Track 4 Documentation.pdf)

**FACT** — I read the PDF directly. Title: "Platform to Identify AI-Generated/AI-Altered Videos & Images and Trace Their Origin Across Social Media." Full statement: "Development of an AI-Powered Digital Forensic Platform to Detect AI-Generated or Manipulated Images and Videos, Verify Their Authenticity, and Trace Their Origin and Dissemination Across Social Media." The document explicitly states this is about **lawful detection/verification tooling**, not deepfake generation, and that any generative components must be strictly limited to producing evaluation samples from public research datasets. Ten expected features are listed (multi-modal detection engine, provenance/metadata verification, explainable scoring, reverse search/origin ID, cross-platform propagation tracing, investigator dashboard, automated alerting, evidence-grade reporting, security/access control, scalability/updatability). Architecture diagrams (Figures 1–3) are explicitly labeled "illustrative … not real platform data." Three references are listed: Tiwari & Kumari (2026, IJSRST), and C2PA Technical Specification cited twice (effectively a duplicate entry).

---

## 1–4. Problem reality, importance, India relevance, regional relevance

**1. What real problem is being solved?** Detecting AI-generated/manipulated images and video, corroborating authenticity via provenance metadata, and tracing where manipulated content first appeared and how it spread across platforms — for law enforcement, journalists, and platform trust-and-safety teams. This is a real, active, well-documented problem space. **FACT** (problem exists, extensively covered in academic and industry literature — see §5, §11).

**2. Is it genuinely important?** Yes. **SOURCE-BACKED OBSERVATION**: reports describe explosive growth in deepfake volume online (roughly 500,000 deepfakes online in 2023 rising to an estimated ~8 million by 2025 per industry tracking, ~900%/yr growth) and financial-fraud impact estimates ("deepfake cases in India surge 550% since 2019, projected losses to hit ₹70,000 crore in 2024" per a BusinessWorld report citing an industry/research estimate). These are industry-report figures, not government statistics — treat the specific numbers as **directional, not precise** (single-source projections of this kind are frequently rounded/extrapolated and should not be repeated by a team as verified fact without re-citing the primary source).

**3. India relevance?** Strong and well-evidenced. **SOURCE-BACKED OBSERVATION**, multiple independent incidents:
- Political deepfakes during the 2024 general election cycle: fabricated video of DMK leader M. Karunanidhi, a deepfake of Delhi CM Arvind Kejriwal purportedly joining BJP, and deepfaked endorsement videos of actors Ranveer Singh/Aamir Khan urging votes for INC.
- Financial fraud: a January 2024 deepfake of Sachin Tendulkar promoting a betting app; a May 2025 case of a finance executive receiving a deepfaked "CEO video call" instructing a ₹1.5 crore transfer; a July 2025 case of AI-generated nude-image extortion (₹5 lakh demand) against an IT professional.
- A cited industry survey found 47% of Indian adults reported being a victim of, or knowing a victim of, an AI voice-clone/deepfake scam (vs. 25% global average) — **this is a single industry survey (consumer-security-vendor style report), not a government statistic; flag it as such if the team cites it.**
- Government response is real and active: MeitY issued advisories to intermediaries on AI-generated/synthetic content starting November 2023, and released **draft amendments to the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021** on 22 October 2025 specifically to address "synthetically generated information" (SGI), including labelling/visibility requirements for AI content. The Indian Cybercrime Coordination Centre (I4C) and National Cybercrime Reporting Portal exist as the institutional infrastructure this platform would plug into. **FACT** that MeitY/I4C exist and that the October 2025 draft SGI amendment exists; the amendment was still in **draft/consultation stage** as of the sources found — do not claim it is settled law.

**4. Chandigarh/Punjab/Haryana-specific relevance?** **Weak/unverified.** I could not find a documented deepfake-specific incident tied specifically to Chandigarh, Punjab, or Haryana in available sources. The only regional story surfaced was an unrelated ₹950 crore Haryana-government banking/cheque-fraud case (Chandigarh bank branches, Feb 2026) involving employee collusion and forged physical cheques — **not** a deepfake/AI-media case; do not conflate it. **PROPOSED SOLUTION for the pitch**: rather than claim a fabricated local incident, the team should honestly frame relevance as (a) Chandigarh Police/PEC Cyber Security Research Centre already partners with CFSL, CDTS, Punjab Police, CISF, and Army — i.e., an institutional/forensic-lab pipeline exists to receive such a tool — and (b) general Indian election, KYC/financial-fraud, and NCII-abuse patterns documented nationally are directly applicable to any state police force, Punjab/Haryana/Chandigarh included, given upcoming election cycles and high UPI/digital-payment fraud exposure in the region. Do not assert a specific fabricated regional case number.

---

## 5. Existing solutions (name real tools)

**FACT/SOURCE-BACKED OBSERVATION** (multiple current listicles/vendor pages, 2026):
- **Reality Defender** — enterprise deepfake detection across video/audio/image/text, real-time API.
- **Sensity AI** — deepfake/synthetic-media detection across video, image, audio; content-safety triage focus.
- **Hive Moderation** — high-volume content-moderation API including deepfake/manipulated-media classification, aimed at platform-scale trust & safety.
- **Microsoft Video Authenticator** — analyzes video/images, produces a manipulation-probability confidence score with pixel-level highlighting (originally released 2020 alongside Microsoft's provenance work; still referenced as an existing tool).
- **Deepware** — deepfake scanner tool (consumer/analyst-facing).
- **Intel FakeCatcher** — real-time deepfake detector using physiological signal (blood-flow/PPG) analysis.
- **InVID/WeVerify** — EU-funded open-source verification browser plugin/toolkit for journalists (reverse image/video search, metadata, forensic filters) — directly overlaps with the "reverse search + origin ID" feature.
- **PhotoDNA** (Microsoft) — perceptual hashing, but note: it is purpose-built for CSAM detection and access is **restricted** to vetted industry/NGO/law-enforcement partners (NCMEC-coordinated), not a general-purpose open API a student team can casually call.
- **TinEye** — commercial reverse-image search with a perceptual-hashing backend; API tier starts at $200/month for 5,000 searches; free web search available with no account.
- Numerous **open-source GitHub repos** fine-tuning Xception/EfficientNet/ResNet/Swin backbones on FaceForensics++/DFDC/Celeb-DF (e.g., `selimsef/dfdc_deepfake_challenge` — the actual DFDC-2020 prize-winning solution, publicly available with training/inference code).

**Conclusion:** every individual module the PS4 brochure lists (detector, provenance checker, reverse-search, propagation graph, dashboard) has multiple existing commercial and open-source implementations. **This is a heavily commoditized space at the component level; the integration is the only place novelty can plausibly live** (see §7–8).

---

## 6. What would a student team actually build (realistic subset)

**PROPOSED SOLUTION.** Given 2 weeks of pre-hack prep + a single 24-hour offline build, a "full platform" (10 features, multi-modal detection + real C2PA verification + real reverse search across live social platforms + propagation graph + alerting + RBAC + evidence export) is **not achievable** as production-grade software. A defensible, honestly-scoped subset:

1. **Image (and optionally short-video-frame) deepfake classifier** — fine-tune a pretrained backbone (EfficientNet-B0/Xception) on a public dataset subset (FF++ and/or a Kaggle deepfake dataset), producing a confidence score + Grad-CAM heatmap. This is realistic (see §9, §16).
2. **Metadata/EXIF consistency checker** — parse EXIF, check for editing-software signatures, re-compression artifacts, and (if present) a C2PA manifest using the open-source `c2pa-python`/`c2pa-node` SDK — but be explicit that this only fires on the tiny fraction of content that actually carries Content Credentials (see §17, §23).
3. **Perceptual-hash-based near-duplicate/reverse-search demo** — compute pHash on the uploaded media, match against a small **locally seeded** corpus of known sample images/videos (not live-scraping restricted platforms), demonstrating the *mechanism* rather than a live internet-scale search.
4. **A mocked/simulated propagation-graph visualization** — built from a prepared demo dataset (clearly labeled as a demo dataset, echoing the brochure's own "illustrative, not real platform data" caveat) rather than live cross-platform scraping, which is blocked by API restrictions (§17).
5. **Investigator dashboard** wrapping the above with case management, verdict review, and a PDF/JSON export ("evidence report") with an audit-trail stub.
6. Features 7 (automated alerting) and 9 (full security/RBAC) can be stubbed/described in the pitch rather than fully built; feature 10 (continual retraining) should be described as a *roadmap* item, not demoed.

This scoped version keeps every claim demonstrable and defensible instead of over-promising.

---

## 7–8. Genuinely novel vs. commoditized

**7. What is genuinely novel (if anything)?** **INFERENCE**: Not the individual detection/hashing/search components — those are commodity. Plausible novelty surfaces are: (a) **India/state-police-specific workflow integration** — chain-of-custody-compliant evidence export formatted for Indian legal/investigative process (e.g., aligned to Bharatiya Sakshya Adhiniyam evidentiary requirements, I4C case referral format), which off-the-shelf Western tools (Reality Defender, Sensity) do not tailor for; (b) **combining multiple weak signals (AI-artifact score + provenance/metadata + hash-match propagation) into one explainable, audit-logged verdict** tailored to a police/journalist workflow rather than a pure trust-and-safety API; (c) a propagation-timeline UI specifically built for investigator case management rather than generic content moderation.

**8. What is NOT novel?** Deepfake classifiers (Xception/EfficientNet/ViT fine-tunes), perceptual hashing, reverse image search, and even C2PA verification are all **heavily commoditized** — open-sourced (DFDC-winner code is public), available as SaaS APIs (Hive, Sensity, Reality Defender, TinEye), and standardized (C2PA is an open spec with open-source SDKs). A team must not present "we built a deepfake detector" as the innovation — judges with ML background will recognize this immediately as fine-tuning an existing architecture on an existing dataset.

---

## 9. Can a student team build a convincing prototype in this timeframe?

**Yes, for a narrow scope — no, for the full brochure feature list.** **SOURCE-BACKED OBSERVATION**: Training a robust deepfake detector *from scratch* in weeks is unrealistic — this mirrors the real research community's experience (FaceForensics++/DFDC baselines took dedicated research teams months, and even they show large generalization gaps, see §22). However, **fine-tuning a pretrained backbone is realistic**: multiple public GitHub repos exist that fine-tune EfficientNet/Xception/ResNet/Swin on FF++/DFDC/Celeb-DF, including the actual DFDC-2020 prize-winning solution (`selimsef/dfdc_deepfake_challenge`, PyTorch, openly licensed) that a team could study, adapt, or fine-tune further on a subset within days on a single rented GPU. This is the credible, achievable path — not training a novel architecture from zero.

---

## 10. Can it be demonstrated live during judging?

**Partially, with real risk (see §21).** A pre-recorded or curated-input demo of the classifier + heatmap + metadata check + hash-match-against-seeded-corpus is demonstrable live. A **live, unrehearsed classification of a judge-supplied random video/deepfake** is risky because of generalization gaps (§22) and because live cross-platform reverse search is blocked by API restrictions (§17) — the team should not attempt a live "search the internet" demo without a pre-seeded fallback dataset.

---

## 11–13. Data requirements, legality, substitutes

**11. What data is required?** Labeled real/fake image and video pairs across multiple manipulation techniques (face-swap, face-reenactment, GAN/diffusion full-synthesis) and, ideally, audio deepfakes for lip-sync/voice-clone detection.

**12. Legal/ethical sourcing — name specific datasets:**
- **FaceForensics++ (FF++)** — ~1,000 real YouTube videos + 4,000 fake videos across four manipulation methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures); requires signing an academic-use agreement with the dataset authors (TUM/Stanford collaboration) restricting redistribution and commercial use.
- **Celeb-DF (v2)** — 590 real + 5,639 high-quality deepfake celebrity videos; released for **academic research only**, requires a request form to the authors (Yuezun Li et al.), non-commercial license.
- **DFDC (Deepfake Detection Challenge, Meta/Facebook)** — the full challenge dataset (~100k+ clips per Meta's own description) released under a **research-only license** via Meta AI / Kaggle, with defined terms of use.
- **WildDeepfake** — 7,314 face sequences from 707 deepfake videos collected from the internet "in the wild"; research license.
All four are **legally obtainable for the stated purpose** (academic evaluation of detection models) under their respective non-commercial research licenses — directly consistent with the brochure's own instruction to use "publicly available research datasets" for any generative/evaluation component. **A team must not scrape or redistribute these outside the license terms, and must not use them to build/improve generation techniques** (explicitly prohibited by the brochure).

**13. Can synthetic/public datasets substitute?** Yes — FF++, Celeb-DF, DFDC, and WildDeepfake (above) are themselves the standard public substitutes for any need to "generate" fake samples; a team never needs to create novel deepfakes — they can and should draw entirely from these existing labeled corpora, consistent with the brochure's explicit safety note.

---

## 14–18. Hardware, software, AI/ML, APIs, cost

**14. Hardware required?** A single mid-tier GPU is sufficient for fine-tuning and inference at prototype scale — not a training cluster. **INFERENCE** based on typical EfficientNet/Xception fine-tuning workloads: an NVIDIA T4/RTX-class or single A100 for a few hours to a couple of days of fine-tuning on a data subset; **inference at demo time can run on a laptop GPU or even CPU for single-image/short-clip requests** with added latency.

**15. Software required?** PyTorch/TensorFlow, OpenCV/face-detection (e.g., MTCNN/RetinaFace for face-crop preprocessing), a perceptual-hashing library (`imagehash`/pHash), the open-source `c2pa` SDK (Rust/Python/Node bindings from the C2PA project) for manifest parsing, ExifTool/Pillow for metadata, a web backend (FastAPI/Node) + frontend (React) for the dashboard, and a graph-visualization library (e.g., D3/Cytoscape.js) for the propagation graph.

**16. AI/ML specifically required — realistic approaches:**
- **Fine-tune a pretrained CNN classifier** (Xception or EfficientNet-B0/B4, both proven on FF++/DFDC baselines) rather than designing a new architecture.
- Optionally a **frequency-domain analysis module** (GAN/diffusion fingerprint detection via FFT/DCT artifacts) as a complementary signal — well-documented in the literature as a lightweight, explainable add-on.
- **Grad-CAM or similar saliency mapping** for the explainable heatmap requirement — standard, well-supported technique, not a research risk.
- Vision-transformer-based detectors exist too (as later/alternative backbones) but add complexity without proportionate benefit for a hackathon timeline — **recommend sticking to CNN fine-tunes** for reliability.
- **Do not attempt to train a novel architecture, a multi-modal audio-visual lip-sync model, or a diffusion-fingerprint detector from scratch** — these are active open research problems even for well-resourced labs.

**17. APIs/services required — and the real blockers:**
- **Reverse image search**: TinEye API ($200/mo/5,000 searches) or Google Vision-family APIs (note: Google's Vision API Product Search is now in maintenance mode per current guidance, redirecting to Vision Warehouse) — usable but **not free at scale**, and none of these index the *social-media-internal* re-upload graph the brochure envisions.
- **Social media platform APIs — a genuine, well-documented blocker**: X (Twitter) API requires a minimum $200/month tier for meaningful read access; TikTok's Research API is restricted to accredited non-profit academic institutions in the US/Europe only, caps at 1,000 requests/day, and explicitly **prohibits commercial use**; Meta shut down CrowdTangle and now gates data behind a restricted Content Library program. **A student team, especially one outside the qualifying academic/geographic categories, realistically cannot get production access to live cross-platform data during a 2-week prep window.** This is a hard practical constraint the team must design around (mocked/seeded demo data, or a narrowly scoped single-platform integration using only public, ToS-compliant endpoints).
- **C2PA verification**: no external API cost — the C2PA SDK is open-source (Rust/Python/JS/WASM bindings) and free to use for reading/validating manifests.

**18. Approximate prototype cost in INR:** **INFERENCE**, based on current India GPU-rental pricing found: on-demand A100 40GB ≈ ₹150–180/hr (spot ≈ ₹60–80/hr) on providers like JarvisLabs/E2E Networks/Cyfuture; T4 ≈ ₹70–100/hr. A realistic fine-tuning + iteration budget of 15–25 GPU-hours over the prep period ≈ **₹1,500–5,000**. Add TinEye API trial/limited tier or free-tier alternatives (₹0–₹17,000/mo if a paid tier is used), domain/hosting (₹0–2,000 if using free-tier cloud), and incidental costs → **overall realistic total prototype cost: roughly ₹2,000–₹20,000**, well within a student team's reach, provided they avoid committing to paid production-tier social-media/API access.

---

## 19–20. What's achievable by 1 week / by 8 Sep

**19. In 1 week (proposal-stage prototype, i.e., before 20 Aug deadline is impossible given today is 18 Aug — this timeline applies to the pre-hack prep window 25 Aug–7 Sep):** a working fine-tuned image classifier with confidence score + heatmap on a curated test set, a basic metadata/EXIF+C2PA-manifest checker, and wireframed dashboard UI. **PROPOSED SOLUTION** or **INFERENCE**, not a verified fact.

**20. By 8 Sep (after ~2 weeks prep + the 24-hr build):** the scoped subset in §6 — classifier + provenance checker + seeded-corpus hash-match "reverse search" demo + a demo propagation graph on prepared sample data + dashboard tying it together + an exportable PDF/JSON evidence report. Full live internet-scale reverse search and live multi-platform scraping should **not** be promised for the finale demo.

---

## 21. What could fail during a live demo

**PROPOSED SOLUTION / risk list, based on documented, well-known failure modes:**
- **False negatives/positives on out-of-distribution content** — a judge supplying a fresh deepfake made with a generator/technique not represented in training data (e.g., a very recent diffusion-based face-swap tool) could easily be misclassified; this is the single most likely and most damaging live-demo failure, and is **well documented in the literature** (see §22).
- **No/unreliable internet at the venue** breaking any live API call (reverse search, C2PA remote trust-list checks, cloud inference if not run locally).
- **API rate limits** on TinEye/social APIs mid-demo.
- **Face-detector preprocessing failure** on unusual poses/lighting/occlusion causing the pipeline to silently degrade.
- **C2PA manifest absent** on whatever sample media is used, making that module a visible no-op unless a pre-signed sample is prepared in advance.
- **Latency** on video (frame-by-frame) inference taking too long for a live 24-hour-hackathon judging slot.

---

## 22. What judges would challenge

**INFERENCE**, based on the standard, well-documented critique in this field: an AI/ML-literate judge will almost certainly ask **"How does your detector generalize to a generator it wasn't trained on?"** This is the field's single most cited weakness. Evidence: models trained/tested within one dataset regularly report ~99% same-dataset accuracy, but **cross-dataset evaluation shows 30–40% accuracy declines** on harder/newer datasets like Celeb-DF (per multiple 2025–2026 survey papers, e.g. MDPI/ScienceDirect reviews found in this research). Even more strikingly, in Facebook's own real-world DFDC Challenge (2020), the **winning model achieved only 65.18% average precision on the private/black-box test set** — despite being the best of thousands of submissions — illustrating that headline in-domain accuracy figures do not transfer to unseen, real-world conditions. A cybersecurity-literate judge will also likely probe: "What happens when almost no real content has a C2PA credential — doesn't your provenance module do nothing for 99% of submissions?" and "What stops someone from stripping/forging metadata before upload?"

---

## 23. Claims the team should NOT make

**PROPOSED SOLUTION (explicit list):**
- Do **not** claim near-100% or "state-of-the-art" deepfake detection accuracy as a general capability — same-dataset benchmark numbers (~99%) are not honest claims about real-world/novel-generator performance (documented 30–40% cross-dataset drop; DFDC real-world winner only ~65%).
- Do **not** claim "full C2PA verification" as a general authenticity solution — C2PA only helps when the *original* media was signed at capture by C2PA-supporting hardware/software, which as of 2026 is limited to a handful of recent flagship devices (Leica M11-P/Q3, Sony Alpha 1 II/9 III, some Nikon Z-series via firmware, Samsung Galaxy S25-series with Snapdragon 8 Elite, Canon's committed-but-slower rollout). The overwhelming majority of existing/historical social-media content has **no C2PA credential at all**, so absence of a credential proves nothing either way — this must be stated honestly as a corroborating signal, not a verification mechanism.
- Do **not** claim live, unrestricted cross-platform scraping/tracing of Meta/X/TikTok — platform API access is legally and technically restricted (X requires paid tiers; TikTok Research API is academic-institution-only and non-commercial; Meta gates access behind a restricted Content Library) — a hackathon team cannot credibly claim production-grade live multi-platform tracing.
- Do **not** cite the "550% surge" or "₹70,000 crore" or "47% of Indian adults" figures as verified government statistics — they trace to industry/vendor survey reports, not official data; if used, attribute them explicitly as such.
- Do **not** present the deepfake classifier itself as the novel contribution — it is a fine-tuned open architecture on public data, which is the field norm, not an innovation.

---

## 24–25. Strongest differentiator and demo scenario

**24. Strongest genuine differentiator (PROPOSED SOLUTION):** Positioning as an **investigator workflow and evidence-chain platform** for Indian law enforcement — combining (a) an honestly-scoped, explainable detection signal, (b) provenance/metadata corroboration where available, and (c) a structured, audit-logged, legally-formatted evidence export tailored to Indian investigative/legal process — rather than positioning as "a better deepfake detector," which cannot credibly out-perform Reality Defender/Sensity/Hive in a hackathon timeframe.

**25. Strongest live-demo scenario (PROPOSED SOLUTION):** A **pre-curated "case walkthrough"**: submit a known, pre-tested sample (one real image with C2PA credentials intact, one manipulated sample from a public dataset the model was validated against) through the full pipeline — detection score + heatmap → metadata/provenance check → hash-match against a small seeded "known reposts" corpus → propagation-timeline visualization → one-click evidence-report export. This demonstrates every promised module end-to-end without depending on live internet/API calls or gambling on an unrehearsed out-of-distribution judge-supplied file (which should be offered as an optional *bonus* demonstration with an explicit, judge-facing caveat about generalization limits — turning a known weakness into a sign of scientific honesty).

---

## Hackathon-Winability Scoring (1–10 each)

| Category | Score | Justification |
|---|---|---|
| Problem significance | 9 | Real, escalating, multi-domain (fraud, political, NCII) harm, well documented in India specifically. |
| Innovation | 4 | Core components (detector, hashing, C2PA) are commoditized; novelty only in integration/workflow framing. |
| Technical depth | 6 | Fine-tuning pretrained models + metadata parsing + hashing is moderately deep but not research-novel; achievable competently. |
| Prototype feasibility | 6 | Scoped subset (§6) is realistic in the timeframe; full brochure feature set is not. |
| Demo impact | 7 | Heatmaps/visual explanations and a propagation graph are visually compelling for judges if pre-curated. |
| Government usefulness | 8 | Directly maps to I4C/CFSL/police forensic workflows and MeitY's active SGI regulatory push. |
| Social impact | 8 | Election integrity, financial fraud, NCII abuse are high-stakes, high-visibility harms. |
| Scalability | 5 | Detection/hash-matching scale reasonably; live cross-platform tracing does not scale without platform API deals the team won't have. |
| Cost | 8 | Prototype achievable for roughly ₹2,000–20,000 in GPU/API costs; low financial barrier. |
| Data availability | 7 | FF++/Celeb-DF/DFDC/WildDeepfake are real, legally obtainable, well-documented public research datasets. |
| Implementation risk (10=lowest risk) | 4 | Generalization failure is a known, high-probability risk; API restrictions block a headline feature (live cross-platform tracing). |
| Judge understandability | 8 | Concept ("catch deepfakes, trace where they came from") is intuitive to explain to any judge panel. |
| Defensibility during Q&A | 5 | Defensible only if the team proactively acknowledges generalization/C2PA-coverage limits (§22–23); indefensible if they overclaim. |
| Existing-competition differentiation | 4 | Reality Defender, Sensity, Hive, InVID/WeVerify already do most of this at production scale; hard to claim uniqueness. |
| Time-to-prototype feasibility | 6 | Scoped subset buildable in ~2-week prep + 24hr build; full platform is not. |
| Reliability during live demo | 5 | Reliable if pre-curated demo path used; unreliable if judges supply arbitrary novel content live. |

---

## GREEN / YELLOW / RED Verdict

## YELLOW

PS4 is a legitimate, important, well-documented problem with genuine India relevance and a clear institutional home (Chandigarh Police / PEC Cyber Security Research Centre / I4C / CFSL). It is **not** a RED/non-viable idea. But it carries **specific, well-documented technical and practical risks that make an unqualified GREEN irresponsible**:

- **Dependency risk**: the brochure's "cross-platform propagation tracing" feature depends on social-media API access that is documented to be restricted, expensive, or academic/geography-gated (X paid tiers, TikTok academic-only Research API, Meta's gated Content Library) — this headline feature cannot be built as a live, general-purpose capability in the given timeframe.
- **Data/API availability**: detection-training data is fine (FF++/Celeb-DF/DFDC/WildDeepfake are real, accessible, appropriately licensed for this exact use case) — this is a *green* sub-area. Reverse-search APIs (TinEye, Google Vision-family) are usable but rate/cost-limited, not free at production scale.
- **Model-training/generalization risk**: this is the domain's best-documented and most damaging weakness — same-dataset accuracy (~99%) does not reflect real-world performance (documented 30–40% cross-dataset accuracy drop; the actual Facebook DFDC-2020 challenge winner scored only ~65% average precision on the private/unseen test set). Any team claiming high, generalized accuracy will be scientifically exposed under judge questioning.
- **Live-demo failure risk**: this domain is notorious for detectors failing on out-of-distribution/novel content live — a judge testing the system with an unfamiliar sample is a real, high-probability failure mode unless the team manages the demo carefully (pre-curated primary case + honestly-framed optional live test).
- **Scientific-validation requirement**: any accuracy claims made in the pitch deck must be sourced to the team's own validation methodology (dataset, split, metric) and explicitly scoped ("X% on held-out FF++ test set," not "detects deepfakes with X% accuracy" as a blanket claim) — anything less will not survive expert Q&A.
- **Reference-quality flag**: reference [1] in the brochure, Tiwari, S. & Kumari, B. (2026), "Development of Digital Forensics Technique Based in AI to Identify Deepfake Video and Image," *International Journal of Scientific Research in Science and Technology*, 13(3), is a **real, findable paper** (confirmed via the publisher's own site, ijsrst.com/home/article/view/IJSRST26133116, published 4 May 2026, authors affiliated with Saraswati Higher Education & Technical College of Engineering, Varanasi) — but **IJSRST is a low-tier, pay-to-publish open-access journal not indexed in JCR/Scopus-style impact-factor listings**, per available discussion (Quora/ResearchGate threads flag journals of this type as low-credibility, though it is not confirmed to be on a formal predatory blacklist such as Beall's List). **Teams should not cite this reference as authoritative research support** in their pitch deck — it should, at most, be acknowledged as one of the brochure's listed references, not leaned on for technical credibility. References [2]/[3] (C2PA Technical Specification) are legitimate and verifiable — the real spec is hosted at spec.c2pa.org with current versions 2.0–2.4 (latest reviewed: 2.2, dated 2025-05-01), backed by real founding members (Adobe, ARM, BBC, Intel, Microsoft, Truepic) and real, if still-emerging, hardware adoption (Leica, Sony, Nikon, Samsung/Qualcomm, Canon committed).

**Bottom line**: fundable and pitchable as a YELLOW — proceed, but the team must (a) scope down to the achievable subset in §6, (b) build the pitch deck around honest, hedged accuracy claims and explicit acknowledgment of the generalization gap and C2PA-coverage gap as *known, industry-wide limitations the team is designing around* (this reads as scientific maturity to judges, not weakness), and (c) design the live-demo path to avoid dependence on live social-media API calls.

---

## Sources consulted

- [Development of Digital Forensics Technique Based in AI to Identify Deepfake Video and Image (IJSRST 13(3))](https://ijsrst.com/home/article/view/IJSRST26133116)
- [Is IJSRST a fake journal? — Quora discussion](https://www.quora.com/Is-IJSRST-International-Journal-of-Scientific-Research-in-Science-and-Technology-a-fake-journal-It-is-also-not-listed-in-the-JCR-impact-factor-list-2023)
- [C2PA Technical Specification 2.2 (spec.c2pa.org)](https://spec.c2pa.org/specifications/specifications/2.2/specs/_attachments/C2PA_Specification.pdf)
- [C2PA Cameras & Phones 2026 — AttestTrail](https://attesttrail.com/blog/c2pa-cameras-support)
- [Content Credentials on Smartphones 2026 — c2pa.ai](https://c2pa.ai/smartphone-guide)
- [Comprehensive Evaluation of Deepfake Detection Models: Accuracy, Generalization, and Resilience — MDPI Applied Sciences](https://www.mdpi.com/2076-3417/15/3/1225)
- [A Comprehensive Review of Deepfake Detection Techniques — MDPI](https://www.mdpi.com/2673-2688/7/2/68)
- [DeepFake video detection: Insights into model generalisation — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2543925125000075)
- [Facebook Deepfake Detection Challenge Results — Meta AI](https://ai.meta.com/blog/deepfake-detection-challenge-results-an-open-initiative-to-advance-ai/)
- [Facebook Deepfake Detection Challenge winner hits 65% accuracy — Neowin](https://www.neowin.net/news/facebook-announces-the-results-of-its-deepfake-detection-challenge-winner-hits-65-accuracy/)
- [selimsef/dfdc_deepfake_challenge — GitHub (DFDC prize-winning solution)](https://github.com/selimsef/dfdc_deepfake_challenge)
- [Deepfake Detection Tools Compared: Reality Defender, Sensity, Hive — Revelum](https://revelum.ai/insights/deepfake-detection-tools-compared/)
- [10 Best AI Deepfake Detection Tools In 2026 — CloudSEK](https://www.cloudsek.com/knowledge-base/best-ai-deepfake-detection-tools)
- [Deepfake Cases In India Surge 550% Since 2019 — BusinessWorld](https://www.businessworld.in/article/indias-deepfake-cases-up-550-losses-may-hit-rs-70000-cr-by-2024-report-541202)
- [Deepfakes and Financial Cybercrime: India's Multi-Layered Response — ORF](https://www.orfonline.org/expert-speak/deepfakes-and-financial-cybercrime-india-s-multi-layered-response)
- [2025 Indian electoral controversy — Wikipedia](https://en.wikipedia.org/wiki/2025_Indian_electoral_controversy)
- [Deepfake Regulation India 2025: MeitY's IT Rules Amendment — Mondaq](https://www.mondaq.com/india/new-technology/1720652/deepfake-regulation-india-2025-meitys-comprehensive-it-rules-amendment)
- [MeitY draft amendment document, Oct 2025](https://www.meity.gov.in/static/uploads/2025/10/8e40cdd134cd92dd783a37556428c370.pdf)
- [Best Reverse Image Search APIs in 2026 — Mixpeek](https://mixpeek.com/curated-lists/best-reverse-image-search-apis)
- [TinEye Review 2026 — Lemonsight](https://lemonsight.com/tool/image/tineye)
- [Social Media APIs in 2026: Real Costs, Rate Limits — Socialcrawl](https://www.socialcrawl.dev/blog/ultimate-guide-social-media-apis-2026)
- [Auditing Meta and TikTok Research API Data Access under DSA Article 40(12) — arXiv](https://arxiv.org/html/2601.12390v1)
- [GPU Cloud India: Rent NVIDIA GPUs from ₹38.88/hr — JarvisLabs](https://jarvislabs.ai/in)
- [Cloud GPU Pricing Comparison India 2026 — AceCloud](https://acecloud.ai/blog/cloud-gpu-pricing-comparison/)
- [Haryana Government accounts fraud — Wikipedia](https://en.wikipedia.org/wiki/Haryana_Government_accounts_fraud)
- [GitHub - zhangxin-xd/Deepfake-Datasets](https://github.com/zhangxin-xd/Deepfake-Datasets)
- [Celeb-DF dataset repository — GitHub](https://github.com/yuezunli/celeb-deepfakeforensics)
