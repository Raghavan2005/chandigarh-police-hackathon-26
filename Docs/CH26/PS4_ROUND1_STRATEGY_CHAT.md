# PS4 Round-1 Strategy — Chat Notes

Source: pasted conversation (external chat), saved 2026-08-19. Covers the Chandigarh Police Hackathon 2026 listing details plus a strategy discussion for PS4 (AI-Generated Media Detection & Cross-Platform Origin Tracing), building on `AGENT_PS4_DEEPFAKE_REPORT.md`.

---

## Hackathon listing details (from Unstop)

**The Chandigarh Police Hackathon** — University Institute of Engineering and Technology (UIET), Chandigarh
Location: Chandigarh, India | Team Size: 4–5 Members | Prizes worth ₹2,25,000 | Offline

### About

The Chandigarh Police National Hackathon 2026 is a national-level innovation and forensic technology hackathon organized by Chandigarh Police in collaboration with UIET, Panjab University, and Punjab Engineering College (PEC), Chandigarh. It encourages students to develop indigenous, affordable, and scalable solutions for real-world forensic and cybercrime challenges using AI, Machine Learning, Blockchain, Digital Forensics, OSINT, Big Data Analytics, and Secure Software Development.

### Eligibility

- Open to UG, PG, and PhD students from any recognized institution.
- Team Size: 4–5 members.
- Inter-college and intra-college teams both allowed.
- All team members must be present during the offline hackathon and grand finale.

### Problem statements

1. Synthetic Drug Detection Kit
2. Rapid DNA-Based Animal Sample Detection Kit
3. Dark Net & Encrypted Platform Drug Intelligence
4. AI-Generated Media Detection & Source Tracing
5. Crypto Flow & Fraud Analytics Platform
6. Multi-Source Investigative Analytics Platform (CDR/IPDR, Banking & Social Media)

### Competition format

**Round 1 – Idea Submission (Online)**
- Registration only via the official form (mandatory for entries to be considered).
- Join the WhatsApp group: https://chat.whatsapp.com/BZXRko59yIaEE7a6LpyyO8
- Submit a pitch deck (PPT) using the prescribed template.
- Upload a video explaining the proposed solution.
- Entries evaluated against predefined judging criteria; top teams shortlisted.

**Round 2 – 24-Hour Offline Hackathon**
- Shortlisted teams build/refine an MVP/prototype with mentor guidance.
- 3–4 teams per track qualify for the Grand Finale.

**Round 3 – Grand Finale**
- Finalists present and demo prototypes before the jury.
- Winners selected on innovation, impact, execution, and presentation.

### Event timeline

| Milestone | Date |
|---|---|
| Proposal Submission Opens | 31 Jul 2026 |
| Proposal Submission Deadline | 20 Aug 2026, 11:59 PM IST |
| Screening & Shortlisting | 20–25 Aug 2026 |
| Results Announcement | 25 Aug 2026 |
| Pre-Hack Preparation | 25 Aug – 7 Sep 2026 |
| Final 24-Hour Hackathon | 8 Sep 2026 |
| Grand Finale | 9 Sep 2026 |

### Prizes

- 1st: ₹1,00,000 + certificate
- 2nd: ₹75,000 + certificate
- 3rd: ₹50,000 + certificate
- Participation certificates for all; gift hampers for runner-ups.

### Rules

- Teams of 4–5 members.
- Inter-college and intra-college teams permitted.
- Must work on one official problem statement.
- Only shortlisted teams go to the offline hackathon.
- All members physically present for offline rounds and final presentation.
- Original work required, compliant with event guidelines.

### Contact

Organizing Committee: hackathon.chdpolice@gmail.com

---

## Strategy discussion: PS4 (AI-Generated Media Detection & Origin Tracing)

### Baseline read from the feasibility report

PS4 is viable but the team should **not** attempt to build the entire brochure feature set. The report rates the raw PS4 concept **YELLOW**, mainly because cross-platform APIs and detector generalization are major, unfixable-by-engineering risks (documented cross-dataset accuracy decline; DFDC-2020 winner scored only 65.18% AP on the private real-world test set).

Recommended scope for the solution:

1. **AI deepfake detection** — image/video classifier + confidence score.
2. **Explainability** — Grad-CAM/heatmap showing why the model suspects manipulation.
3. **Provenance verification** — EXIF + C2PA when credentials exist.
4. **Origin/repost matching** — perceptual hashing against a seeded evidence corpus.
5. **Propagation graph** — visualize how media moved through simulated/prepared sources.
6. **Police investigator dashboard** — case creation, evidence, verdict, timeline.
7. **Evidence-grade report** — export the investigation as PDF/JSON with audit trail.

**Strategic point:** the innovation should be the *investigator/evidence workflow*, not "we built a deepfake detector." Detector, hashing, and C2PA components are individually commoditized; the credible novelty surface is Indian law-enforcement workflow integration and audit-logged evidence export.

Deadline note: proposal due 20 Aug 2026, 11:59 PM IST (effectively ~1 day at time of writing). Offline build is 8 Sep 2026, after shortlisting.

### The 10 official PS4 expected features (from the problem statement)

1. **Multi-Modal Detection Engine** — detect AI-generated/manipulated images and videos.
2. **Provenance & Metadata Verification** — check metadata, EXIF, provenance credentials (C2PA).
3. **Explainable Scoring** — manipulation/authenticity confidence score with supporting evidence.
4. **Reverse Search & Origin Identification** — find matching/near-matching copies, identify likely original source.
5. **Cross-Platform Propagation Tracing** — track spread of media across social platforms.
6. **Investigator Dashboard** — centralized interface for police/investigators.
7. **Automated Alerting** — alerts when suspicious/AI-generated media is detected.
8. **Evidence-Grade Reporting** — reports suitable for forensic/evidentiary use.
9. **Security & Access Control** — authentication, authorization, access controls.
10. **Scalability & Updatability** — architecture supports scaling and retraining as new generation techniques emerge.

In simple terms: Upload media → Detect → Explain → Verify origin → Find copies → Trace spread → Investigate → Alert → Generate evidence report → Secure the whole system.

### Differentiation gaps worth adding (not all — avoid feature bloat)

| Gap | Feature | Why it matters |
|---|---|---|
| 1 | Evidence Chain / Chain of Custody | Track who uploaded, accessed, analyzed, modified, exported evidence — core to police/forensics. |
| 2 | Multi-Signal Fusion | Combine AI score + metadata + C2PA + hash matches + visual artifacts into one explainable verdict. |
| 3 | Manipulation Localization | Highlight *where* manipulation is suspected (face, background, hands, text), not just a yes/no. |
| 4 | Media Integrity Timeline | Chronological timeline: original → edit → upload → repost → detection. |
| 5 | Evidence Similarity / Clustering | Group visually similar files into one campaign/event instead of case-by-case. |
| 6 | Case Correlation | Detect when the same media appears across multiple police investigations. |
| 7 | Source Reliability Score | Confidence/reliability score per discovered source. |
| 8 | Tamper-Evident Evidence Vault | Hash uploaded evidence + immutable audit records proving it wasn't altered in-system. |
| 9 | Human-in-the-Loop Review | Investigator can accept/reject/override the AI's assessment with a reason. |
| 10 | Model Uncertainty / "Insufficient Evidence" Verdict | Verdict space REAL / MANIPULATED / AI-GENERATED / INCONCLUSIVE instead of forced binary. |
| 11 | Attack/Adversarial Detection | Detect evasion attempts (compression, cropping, resizing, metadata stripping). |
| 12 | Investigation Collaboration | Multiple authorized investigators share a case with comments, assignments, audit history. |

**Prioritized top 5** (recommended build order for differentiation):

1. Evidence Chain / Chain of Custody
2. Multi-Signal Fusion Engine
3. Manipulation Localization
4. Campaign & Propagation Clustering
5. Inconclusive / Human Review System

Positioning line: existing tools ask *"Is this deepfake?"* — this platform asks *"What happened to this evidence, why do we believe it's manipulated, where did it originate, how did it spread, and can an investigator defend this conclusion?"*

### Proposed AI web-search / OSINT architecture

Do **not** give the AI unrestricted internet/browser access. Instead expose it a controlled tool set and let it orchestrate:

```
Investigator uploads image/video
  → Detection engine
  → AI investigation agent
  → calls specific tools
  → Web search / reverse-image search / metadata / internal evidence database
  → combines results
  → investigator reviews
```

**1. Tools, not raw browsing** — the agent gets functions such as:
- `search_web(query)`
- `search_image(query/image)`
- `get_page(url)`
- `extract_metadata(file)`
- `calculate_perceptual_hash(file)`
- `search_evidence_database(hash)`
- `create_timeline(events)`

The AI decides which tool to call and when (e.g., extract metadata → compute pHash → run detector → web-search distinctive text → search similar copies → compare dates → build timeline → summarize for investigator).

**2. Web search stays backend-controlled** — the LLM never browses freely; the backend exposes a narrow `search_web(query)` surface backed by a legitimate search API, so the AI orchestrates but the backend controls access scope.

**3. Reverse image search via a seeded evidence corpus** — for the hackathon MVP, don't attempt to crawl Instagram/X/TikTok live. Use perceptual hash / CLIP embedding lookup against a locally seeded database of prior "known" media (id, first_seen date, source, hash) to demonstrate a believable propagation timeline (e.g., Telegram → X → Facebook) without claiming live cross-platform scraping. The feasibility report specifically flags live cross-platform social access as a major blocker — a seeded corpus + simulated propagation graph sidesteps it honestly.

**4. Single "Investigate Evidence" action** replaces a dozen separate buttons — the agent runs the full pipeline (AI analysis → metadata → C2PA → visual search → evidence-database matches → earliest known occurrence → propagation → confidence/limitations) and returns one consolidated case view.

**5. The LLM must not make the final forensic call.** Pipeline should be:

```
ML detector ──────┐
Metadata ─────────┤
C2PA ─────────────┤
Hash matches ─────┤
Web evidence ─────┤
Propagation ──────┤
                  ↓
             Evidence Fusion
                  ↓
         Investigator Review
                  ↓
        Final Case Assessment
```

The LLM summarizes and correlates evidence; it does not invent evidence or override forensic signals. This also directly addresses the report's core weakness (detectors fail on unseen manipulation techniques) by exposing uncertainty rather than false confidence.

### Round-1 scope decision: UI + prototype video only, no model/backend build

For Round 1, the team is **not** building the actual ML model or a working backend — the objective is to sell the concept, workflow, and differentiation through a UI prototype and a narrative demo video. Scope covers four evidence types: **image, video, audio, and documents/PDFs** — presented explicitly as proposed platform capability, not as already-implemented.

**Round-1 prototype concept — "police investigator's AI evidence workstation":**

```
                    ┌─────────────────────┐
                    │   INVESTIGATOR      │
                    │                     │
                    │ Upload Evidence     │
                    └──────────┬──────────┘
                               ↓
             ┌─────────────────────────────────┐
             │       AI FORENSIC ENGINE        │
             └─────────────────────────────────┘
                    ↓       ↓       ↓
              Detection  Provenance  OSINT
                    ↓       ↓       ↓
             ┌──────────────────────────┐
             │    EVIDENCE FUSION       │
             └────────────┬─────────────┘
                          ↓
             ┌──────────────────────────┐
             │ INVESTIGATION REPORT     │
             │                          │
             │ • Verdict                │
             │ • Evidence               │
             │ • Origin                 │
             │ • Propagation            │
             │ • Confidence             │
             └──────────────────────────┘
```

**Four input modes (UI demonstrates the intended workflow — not run live in Round 1):**

- **Image** — manipulation probability, suspicious-region highlighting, metadata/EXIF, C2PA status, similar images, possible earliest source, propagation timeline, evidence confidence.
- **Video** — frame-level analysis, suspicious frames, face/manipulation regions, audio/video consistency, metadata, source matches, propagation timeline.
- **Audio** — AI-generated voice probability, speaker/voice consistency, suspicious segments, waveform with highlighted timestamps, metadata, source/search matches, transcript, evidence timeline.
- **Document / PDF** — OCR extraction, suspicious text/formatting, metadata, document origin, similar documents, source discovery, modification history where available, AI-generated/manipulated content assessment. Use case: scanned notices, fake government orders, manipulated documents.

**Single "INVESTIGATE" action, narrated in the demo video as an agent pipeline:**

```
1. Identify evidence type
          ↓
2. Extract metadata
          ↓
3. Analyze manipulation
          ↓
4. Generate search queries
          ↓
5. Search available web/evidence sources
          ↓
6. Find similar/duplicate content
          ↓
7. Identify earliest known occurrence
          ↓
8. Build propagation graph
          ↓
9. Correlate evidence
          ↓
10. Generate investigation report
```

**Demo video should tell a story, not narrate a UI tour.** Example beat sheet ("Case 001 — Suspicious viral video"):

1. A police investigator receives a viral video claiming a public official made a controversial statement; uploads it.
2. `00:00` — Evidence received (`video.mp4`); system identifies Video + Audio content.
3. AI Analysis — video manipulation 91% confidence, suspicious facial region detected.
4. Audio Analysis — synthetic voice indicators detected, suspicious segment 00:17–00:24.
5. Provenance — no valid Content Credentials found.
6. OSINT Investigation — agent searches for relevant matches.
7. Origin Analysis — earliest known occurrence → Source A → Source B → Source C → viral distribution.
8. Investigation Summary — "Multiple independent signals indicate that the media may have been manipulated. Earliest discovered matching content: Source A. Propagation identified across multiple sources. Investigator review required."
9. Generate Evidence Report → PDF.

**Important framing correction:** don't claim "our AI already searches the entire web/social media." Say instead: *"The proposed AI investigation agent will orchestrate authorized web-search, reverse-search, provenance, and evidence-database tools."* This stays technically credible and matches the feasibility report's explicit limitation that live, unrestricted social-platform tracing is a major blocker — don't pitch a capability that can't realistically be demonstrated later.

### Round-1 deliverables

**A. UI prototype**
- Investigator dashboard
- New case creation
- Upload evidence
- Image / video / audio / document workflows
- AI investigation screen
- Evidence fusion view
- Origin/propagation graph
- Case timeline
- Report generation
- Audit trail

**B. 2–3 minute prototype video**
- One compelling case, full investigation journey
- Briefly demonstrate all four evidence types
- Close on the police-use-case impact

**C. Pitch deck**
- Problem
- Existing gap
- Proposed platform
- Architecture
- Innovation
- Four evidence types
- AI investigation agent
- Evidence fusion
- Chain of custody
- Demo story
- Roadmap

**Bottom line:** for Round 1, this is a stronger strategy than attempting to build an ML model now — the goal is for judges to see exactly how the system would work, why police need it, and what would be built in the 24-hour round if shortlisted.
