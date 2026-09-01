# MASTER AGENT REPORT: Chandigarh Police Hackathon'26 — Problem Statement Selection

**Prepared by:** Master Agent (cross-track synthesis) | **Date:** 2026-08-18 | **T-minus to Round-1 deadline:** 2 days (20 Aug 2026)

**Evidence legend used throughout:** **FACT** (independently verified against a primary source) · **SOURCE-BACKED OBSERVATION** (credible secondary source, not independently re-derived) · **INFERENCE** (reasoned deduction from verified facts) · **PROPOSED SOLUTION** (a recommendation, not a claim about the world). Master-Agent synthesis judgments (rankings, weighting, the final call) are this report's own analysis, built strictly on the six specialist reports' evidence bases — they are flagged as such rather than tagged sentence-by-sentence.

---

## 1. Executive Summary

Six independent specialist agents each deep-dived one Chandigarh Police Hackathon'26 problem statement (PS1–PS6). Every single one returned a **YELLOW** verdict — feasible, but with real, named limitations. There is no GREEN option hiding in this set, and the job here is not to find one; it is to determine which YELLOW is genuinely the safest bet for a student team with a pitch deck due in **48 hours** and a real build window of roughly two-and-a-half weeks (25 Aug–8 Sep) after that.

After cross-comparing all six reports against each other (not averaging their scorecards) and spot-verifying the underlying PDFs and brochure directly, this report recommends:

**WINNER: PS5 — CFTA (Illicit Crypto Flow Tracking & Fraud Detection).**

PS5 wins not because it is the most novel (it scored 4/10 on innovation, same as everyone else) but because it is the only track where **every structural risk that sinks the other five is absent**: no wet-lab dependency (unlike PS2), no legally unobtainable core dataset (unlike PS6, and partially PS1), no unfixable scientific generalization ceiling undermining the headline demo (unlike PS4), and no live legal/reputational landmine risk (unlike PS3). Its one real weakness — a saturated field of billion-dollar incumbents (Chainalysis, Elliptic, TRM Labs) — is a *positioning* problem, solvable with an honest India/FIU-IND-accessibility narrative, not a structural blocker the team cannot engineer around. PS5 also has the best data availability of all six tracks (a real 203,769-transaction labeled dataset, the Elliptic Kaggle set, plus fully legal live public blockchain data) and the single strongest live-demo mechanic available in this hackathon: a judge can independently verify the team's result against a public block explorer in real time.

**RUNNER-UP: PS3 — DWID (Darknet/Encrypted Drug Sales Detection).** A very close second on raw weighted score, and it carries the single best "why now" narrative of the six — a sitting Rajya Sabha statement (~2 Aug 2026) about Punjab's "digitally enabled" drug mafia, delivered roughly two weeks before this hackathon's deadline. It loses to PS5 on data currency (its best public dataset is a 2011–2015 archive) and, more importantly, on tail risk: darknet subject matter creates a live, standing temptation ("just show them it's real") that could produce a genuinely disqualifying incident in front of a police-heavy judging panel — a risk category PS5 simply does not have.

**What the team should do in the next 48 hours:** Commit to PS5 for the Round-1 pitch deck now. This is a low-regret decision: the deck can be built entirely from (a) the six references already verified real in the PS5 specialist report, (b) the Elliptic dataset's public documentation, and (c) the regional Chandigarh/Punjab/Haryana crypto-fraud cases already sourced in that report (Sector 45-D FIR, Punjab's 956 FIRs, Haryana's 141,685 complaints) — no lab access, no legal clearance, no reagent sourcing, and no live-scraping decision is required before Wednesday. The video component can show a working live lookup against a real public wallet address today, using nothing but a free-tier blockchain-explorer API and an afternoon of scripting — a demo no other track can produce this fast without risk. If shortlisted (results 25 Aug), the ~2-week pre-hack window is used to build the GNN/rule-engine layer and polish the dashboard (see Roadmap, §26); the actual MVP is not needed until then.

---

## 2. Six PS Overview

| PS | Official Code | One-line brief |
|---|---|---|
| PS1 | SRTK | Portable biochemical spot-test kit for on-site synthetic-drug/NPS screening |
| PS2 | DNAK | Rapid DNA-based field kit to identify bovine/animal species in seized biological samples |
| PS3 | DWID | Intelligence platform to detect illicit drug sales on darknet marketplaces and encrypted platforms |
| PS4 | AIMD | AI-powered platform to detect AI-generated/altered images and video and trace their origin across social media |
| PS5 | CFTA | Platform to track illicit crypto flows, flag fraudulent wallets/accounts, and analyze suspicious financial transactions |
| PS6 | DFAP | Unified analytics platform correlating telecom CDR/IPDR, bank statements, and social media activity |

All six are organized by Chandigarh Police with UIET (Panjab University) and PEC Chandigarh, whose Cyber Security Research Centre partners with Chandigarh Police, Punjab Police, CISF, CFSL, CDTS, and the Indian Army **(FACT, confirmed directly from the brochure text — verified via `pdftotext` extraction of `Chandigarh Police Hackathon Brochure.pdf`, which exceeded the Read tool's direct-read limit)**. Round-1 (pitch deck PPT + video) closes 20 Aug 2026; screening 20–25 Aug; results 25 Aug; pre-hack prep 25 Aug–7 Sep; 24-hour offline build 8 Sep; Grand Finale 9 Sep in Chandigarh; prizes ₹1,00,000/₹75,000/₹50,000 plus runner-up hampers **(FACT, confirmed against the brochure's Event Calendar and prize pages)**.

---

## 3. Research Methodology

This report synthesizes, rather than re-derives, six independent specialist evaluations, each of which: verified the relevant `Track N Documentation.pdf` verbatim against the brochure text; independently fact-checked every cited reference against live web sources; answered a fixed 25-question diagnostic (problem reality, India/regional relevance, prior art, buildability, data legality, cost, demo risk, judge Q&A exposure); scored 16 winnability categories 1–10; and issued a GREEN/YELLOW/RED verdict.

For this master synthesis: all six specialist reports (`AGENT_PS1_SRTK_REPORT.md` through `AGENT_PS6_CDR_BANK_SOCIAL_REPORT.md`) were read in full. The underlying source PDFs were spot-verified directly rather than re-read exhaustively: `Track 3 Documenation.pdf` was read in full and its problem statement, ten expected features, and the "Link"-placeholder reference defect were confirmed to match the PS3 specialist report's claims exactly. `Chandigarh Police Hackathon Brochure.pdf` (41.8MB, over the Read tool's limit) was extracted via `pdftotext -layout` and read in full, confirming the event calendar, prize structure, team-size rules, organizing-institution partnerships, and all six one-line problem summaries match what the specialist reports assumed. No contradiction was found between any specialist report and its underlying source document in this spot-check. Given the specialist reports' internally consistent, heavily cross-verified citation work (particularly PS3's recovery of the "broken" reference URLs and PS5's clean six-for-six reference verification), no targeted re-research via WebSearch was judged necessary — the specialist evidence base is treated as sound ground truth for this synthesis, per the task's own instruction.

---

## 4. Evidence Quality

Citation-verification quality varied meaningfully across the six specialist reports, and this variance is itself a signal worth weighing:

- **PS5 (Crypto):** the cleanest of all six — all 6 references independently confirmed real, correctly dated, and accurately represented, including a nuanced catch that Chainalysis's own $154B figure is a revisable lower-bound estimate, not settled fact. **FACT.**
- **PS3 (Darknet):** references initially *appeared* broken (bare "Link" text with no visible URL) but were recovered by extracting the PDF's embedded hyperlink annotations, resolving to real Europol/Chainalysis sources — a genuine documentation defect in the organizers' PDF, independently reconfirmed by this master agent's own direct read of the PDF.
- **PS6 (CDR/Bank/Social):** 3 of 4 references verified cleanly real and current; one government-portal deep link 302-redirects rather than resolving directly (minor link-rot, not fabrication).
- **PS2 (DNA/Bovine):** reference [1] (ICAR-NMRI) verified solid; reference [3] carries a genuine **citation discrepancy** — the real paper's authors and journal (Liu et al., *LWT* 2025) do not match the brochure's stated authors/journal ("Zhang, Wang, Liu," *Food Chemistry* 2025) — flagged explicitly for the team to avoid repeating.
- **PS4 (Deepfake):** the C2PA references are solid; reference [1] (Tiwari & Kumari, IJSRST) is a real but low-tier, non-Scopus-indexed pay-to-publish journal — usable as a citation but not as technical authority.
- **PS1 (Drug spot-test):** all 3 references verified clean and accurately characterized — no red flags.

**Master-Agent observation (INFERENCE):** no specialist report found a fabricated citation anywhere across all 22 references reviewed — a genuinely well-assembled brochure by hackathon standards. This means the teams' risk in every track is *feasibility and framing*, not "the problem statement is built on fake sources."

---

## 5. PS1 Analysis — SRTK (Biochemical Drug Spot-Test Kit)

The real, narrow problem is digitizing the *reading* of a 60-year-old presumptive chemistry technique (Marquis/Mecke/Mandelin-style spot tests), not inventing new drug-detection chemistry — SWGDRUG already classifies colorimetric tests as Category C (low-discrimination, presumptive-only), and confirmatory ID legally still requires GC-MS-class lab work **(FACT, Philp & Fu 2018, SWGDRUG Recommendations, both independently verified)**.

Punjab relevance is real and strong but narratively mismatched to the brief's framing: Punjab's dominant drug problem (per NCB 2025 data cited in the specialist report — 51,516 NDPS FIRs, ~58% of national heroin seizures, a documented "second wave" of pharmaceutical-opioid diversion) is heroin/opioid/pharma-diversion, not exotic novel-psychoactive-substance identification, which is what the brief's "multi-analyte classification" ask is really built for.

The central technical problem: the brief effectively asks for a single cheap color/spectral sensor (TCS3200/AS7262/AS7341, 3–11 channels) to do what the literature shows genuinely requires either full spectroscopy (Raman/FTIR, e.g., Thermo Fisher's TruNarc — expensive, contradicts the cost objective) or a multi-reagent sensor array ("electronic tongue," a legitimate but harder, unstated design pivot). This is a **hardware-physics ceiling, not an ML problem** — no amount of clever training data fixes it. The specialist report's key finding: the one genuinely defensible novelty is not the sensing/ML layer at all (crowded prior art: Kineticolor 2025, multiple smartphone-colorimetry papers) but a **cryptographic chain-of-custody hashing layer** bolted onto the spot test — an evidentiary-integrity angle none of the reviewed prior art touches.

**Verdict: YELLOW** (specialist call, confirmed by this synthesis). Buildable, cheap (~₹3,000–6,000), safely demoable under the brochure's own mandated household-surrogate rule — but only if the team abandons the literal "multi-analyte from one scan" claim and leads with the custody-hash differentiator instead.

---

## 6. PS2 Analysis — DNAK (DNA-Based Bovine/Animal Spot Kit)

The strongest *regional legal grounding* of any track: a real 2025/2026 Chandigarh case (a man arrested carrying meat later forensically identified as "Bos Indicus," Section 8 of the Punjab Prohibition of Cow Slaughter Act, 1955 invoked, anticipatory bail denied by the Punjab & Haryana High Court) is a directly on-point precedent **(FACT, Tribune India, LiveLaw.in)**. ICAR-NMRI's NABL-accredited national referral lab confirms this is a real, institutionally recognized problem, not a hypothetical one.

But this track has the worst skillset-mismatch risk of the six: it requires wet-lab molecular biology (DNA extraction, primer design, RPA/LAMP isothermal amplification, lateral-flow strip conjugation chemistry) that a typical CS/ECE-heavy UIET/PEC hackathon team is unlikely to have on its roster. The core molecular technique (RPA/LAMP + lateral-flow species ID) is directly lifted from — and the brief's own reference [3] is itself an example of — a crowded, mature 2019–2025 published literature; there is essentially no room to claim core-chemistry novelty.

**The single most consequential open finding:** Track 1's PDF carries an explicit, bolded safety clause banning real hazardous reagents/substances at the venue and mandating household-item simulation. **Track 2's PDF has no equivalent clause anywhere** — confirmed by direct comparative read of both PDFs. This means the venue's policy on real biological reagents (enzymes, gold-nanoparticle conjugates, even legal meat tissue) is **genuinely unknown**, not merely unaddressed — a live, unresolved organizer-dependency risk that no other track carries in this form.

Compounding this: reagent/primer lead times (3–7+ business days minimum for custom oligo synthesis) do not comfortably fit even the 25 Aug–7 Sep pre-hack window if not started immediately, and estimated real-prototype cost (₹15,000–60,000+, dominated by enzyme reagents) is both the highest and least-certain of any track.

**Verdict: YELLOW per the specialist report — this synthesis flags it as an EFFECTIVE NEAR-RED for a typical CS/ECE team specifically.** The gap between "YELLOW in principle" and "buildable by this specific likely team composition" is wider here than in any other track: PS2 scored lowest of all six on Implementation risk (2/10), Time-to-prototype feasibility (2/10), and Reliability during live demo (3/10) — three of the exact dimensions this hackathon's tight timeline weights most heavily. Unlike PS6's data-unavailability (a known, statable constraint a team can design around from day one) or PS4's generalization gap (a known limitation a team can honestly disclose), PS2's blocker is a **binary team-composition and unresolved-permission gate**: if the team lacks a genuine biotech member and the venue disallows real reagents, there is no honest scoped-down version left that still demonstrates the DNA-based core of the brief — only a hardware mockup plus companion app, which is not what PS2 is actually about.

---

## 7. PS3 Analysis — DWID (Darknet Drug Sales Detection)

The best-timed pitch hook of any track: BJP leader Tarun Chugh's Rajya Sabha statement (~2 Aug 2026) explicitly describing Punjab's drug mafia as having "rapidly transformed into a digitally enabled criminal network" using darknet platforms, encrypted apps, and cryptocurrency, while criticizing the state government's "outdated digital infrastructure" **(FACT, multiply reported by Daily Excelsior/Tribune, ~2 weeks before this hackathon's deadline)** — a nearly made-to-order "why now, why here" opening for a deck.

NCB context is real and current: 92 darknet/crypto-linked NDPS cases (2020–Apr 2024), a dedicated NCB Task Force on Darknet and Crypto-Currency, and the very recent "Team Kalki" case (Feb–Mar 2026, a pan-India darknet+crypto+Session-messenger network dismantled, 1,000+ consignments since Jan 2025) give the team a concrete, citable, current case study.

The category is mature and commercially saturated (DarkOwl, Flashpoint, Recorded Future, Searchlight Cyber, Cybersixgill on the dark-web-intel side; Chainalysis/TRM/Elliptic on the crypto-tracing side; Maltego/i2/Palantir on the link-analysis side) — no individual component is novel. The one legitimately defensible path is an India/Punjab-localized investigator workflow (NDPS-Act-aligned chain of custody, Punjabi/Hindi code-mixed drug-slang handling) that Western commercial tools do not build for.

**The critical constraint: no legal, current, bulk darknet dataset exists for a student team.** The best available legal substitute is the Gwern DNM Archives — a real, legally published academic mirror of ~89 now-defunct darknet markets, but dating to 2011–2015, over a decade stale for a 2026 pitch. Public blockchain data can genuinely be queried live and legally for the wallet-correlation module. Under no circumstance should the team access a live .onion marketplace, even briefly "to show it's real" — this is explicitly flagged by the specialist report as the single most likely way this specific track could produce a genuine incident (legal, reputational, or operational-security) in front of a police-heavy judging panel, rather than merely a weak demo.

**Verdict: YELLOW** (specialist call, confirmed). Legally buildable end-to-end using synthetic + archival + public-blockchain data with zero need to touch anything illegal — but the highest legal/reputational tail-risk of any track if the team is not tightly disciplined about the demo-data policy from day one.

---

## 8. PS4 Analysis — AIMD (AI-Generated Media Detection & Origin Tracing)

The highest raw problem-significance score of the six (9/10): well-documented Indian harm across three domains — 2024 election deepfakes (fabricated Karunanidhi video, Kejriwal/BJP fake, celebrity-endorsement fakes), financial fraud (a ₹1.5 crore deepfaked-CEO-call case, a ₹5 lakh nude-image extortion case), and an active regulatory response (MeitY's October 2025 draft "synthetically generated information" amendment to the IT Rules) **(SOURCE-BACKED OBSERVATION on incident specifics; FACT that MeitY/I4C exist and the draft amendment is real, still in consultation stage)**.

**No Chandigarh/Punjab/Haryana-specific deepfake incident was found by the specialist agent** — the only regional story surfaced (a ₹950 crore Haryana banking cheque-fraud case) is unrelated (physical forged cheques, not AI media) and must not be conflated in a pitch. This is a genuine, material regional-relevance gap versus PS2/PS3/PS5/PS6, all of which have real local case studies.

Every individual module the brief asks for (classifier, provenance checker, reverse search, propagation graph) already exists commercially at production scale (Reality Defender, Sensity AI, Hive Moderation, InVID/WeVerify) and the actual DFDC-2020 prize-winning detector code is public on GitHub — fine-tuning a pretrained backbone (Xception/EfficientNet) on FaceForensics++/DFDC/Celeb-DF is realistic in the timeframe; training something novel is not, and shouldn't be attempted.

**The load-bearing weakness, and the reason this track cannot be recommended over PS5:** the field's own best-documented failure mode is a **generalization gap that cannot be engineered around, only honestly disclosed**. Same-dataset benchmarks report ~99% accuracy, but cross-dataset evaluation shows a documented 30–40% accuracy decline, and Facebook's own DFDC-2020 challenge winner — the single best submission out of thousands — scored only **65.18% average precision on the private, real-world test set**. This is not a hackathon-team execution problem; it is the current state of the entire research field. Any team that claims strong, general deepfake-detection accuracy will be scientifically exposed by the first AI-literate judge who asks "does this generalize to a generator you didn't train on?" — and the honest answer undercuts the demo's headline claim in a way none of PS5's weaknesses do to *its* headline claim. Separately, the "trace origin across social media" feature is blocked by hard, well-documented platform-API restrictions (X paid tiers, TikTok Research API academic-only, Meta's gated Content Library) — a second headline feature that cannot be built as claimed.

**Verdict: YELLOW** (specialist call, confirmed). Legitimately important and buildable in a narrow, honestly-scoped form (classifier + heatmap + metadata check + seeded-corpus hash-match, not live cross-platform tracing) — but the combination of an unfixable scientific ceiling on the core claim plus zero regional relevance hook makes this a harder Q&A track to win than its raw problem-significance score suggests.

---

## 9. PS5 Analysis — CFTA (Illicit Crypto Flow Tracking) — WINNER (full case in §22)

Best data availability of all six tracks (9/10 in the specialist scorecard): public blockchain data is, by design, permanently public and legal to query with no consent/license/subpoena required, and the **Elliptic Bitcoin dataset** (203,769 labeled transaction nodes, 234,355 edges, 166 features, licit/illicit/unknown labels, publicly on Kaggle) is a real, purpose-built, citable ground-truth training set — solving the "where does training data even come from" problem that every other track struggles with in some form.

All 6 references independently verified real and accurately represented — the cleanest citation record of the six tracks, including a genuine, current DOJ prosecution ($389M laundering case, charged 11 Jun 2026) and Chainalysis's 2026 Crypto Crime Report ($154B illicit flows, $17B fraud/impersonation losses, both independently corroborated).

Real, current, regional grounding: a Chandigarh Sector 45-D FIR (₹6.58 lakh Telegram crypto-investment scam), CBI searches across Delhi/Haryana tied to a crypto-fraud "tech support" ring, Punjab's 956 cybercrime FIRs across 29 dedicated police stations, and Haryana's 141,685 cybercrime complaints in 2025 — all independently sourced, all placing this problem squarely in front of the exact host force running the hackathon.

A real Indian government precedent for appetite exists: RBI's **MuleHunter.AI**, an in-house ML tool live in 26+ banks (reportedly ~95% accuracy at Canara Bank) — the specialist report's suggested framing, "MuleHunter.AI, but for crypto wallets, aimed at Indian law enforcement," is a genuinely strong, evidence-backed positioning line.

The core techniques (address clustering via common-input-ownership/change-address heuristics, GNN-based transaction-graph classification, FATF red-flag rule encoding) are well-published (Meiklejohn 2013, Reid & Harrigan 2013) and already productized by Chainalysis/Elliptic/TRM Labs — there is real, acknowledged risk here, but it is the *only* structural risk this track carries, and it is a competitive-positioning problem, not a legal, biological, or scientific one.

**Verdict: YELLOW per the specialist report — this synthesis assesses it as the STRONGEST of the six YELLOWs**, because its lone weakness (differentiation against well-funded incumbents) is solvable through honest narrative framing alone, with no dependency on anything the team cannot control (no wet-lab access, no legal-data gate, no unfixable scientific ceiling, no live-legality landmine).

---

## 10. PS6 Analysis — DFAP (Unified CDR/IPDR/Bank/Social Analytics)

The strongest *regional case-evidence density* of any single track: three independently sourced, dated 2026 mule-account cyber-fraud cases spanning exactly the tri-city/tri-state hosting region — a Chandigarh bail-opposition filing confirming local mule accounts tied to "digital arrest"/fake-investment scams, a Haryana-wide mule-account trend reported by Tribune India, and a Punjab cyber-crime-division bust of a China-linked mule-account-supply gang (₹26.65 lakh placed under lien) **(FACT, all independently verified)**. A real national government initiative (I4C–RBIH's MuleHunter.ai MoU, confirmed via a live ddnews.gov.in article quoting the Union Home Minister) shows this exact fusion-of-signals problem has active government backing.

There is a direct, verified prior-hackathon precedent: SIH 2020's BPRD-sponsored problem RK_312, solved by team "winterfell," has a public GitHub repo (`sandy9999/Sih_Rk312_winterfell`) tackling essentially the CDR/IPDR-to-network-visualization slice of this exact problem — genuine proof that student teams have built pieces of this before.

**The load-bearing, structural weakness: real CDR, IPDR, and bank-statement data are legally unobtainable by a student team under any circumstance.** This is not a data-scarcity problem solvable with more effort — it is a hard legal wall. CDR/IPDR access requires statutory authorization under the Telecommunications Act 2023 and the DoT's 2024 Lawful Interception Rules, routed through an SP-rank-officer request and competent-authority sanction; bank transaction data is separately protected under RBI banking-secrecy norms and the DPDP Act 2023. **There is no lawful path for a hackathon team to touch real subscriber data in any of these three domains, at any stage.** The specialist report scored data availability 2/10 — tied with PS1 for the lowest of all six, but structurally worse, because PS1's low score is about controlled-substance training data (a narrow, acknowledged gap the team can honestly work around with surrogates), whereas PS6's low score is about the *entire subject matter's primary data source* being off-limits by design.

Compounding this, the competitive category is unusually crowded *with real, already-deployed Indian government tooling specifically* — not just foreign commercial incumbents. Karnataka's C5 CDR Analyzer is deployed statewide across District Police units; multiple named Indian vendors (LIS, i9, C-trace) already sell CDR/tower-dump analysis software to Indian police; Andhra Pradesh already runs an "AI4AndhraPolice" CDR/IPDR analytics use-case. A police-heavy judging panel is unusually well-positioned to ask "isn't this already deployed two states over?" — a harder version of the "how is this different from Chainalysis" question every crowded track faces, because the comparison here is a domestic government deployment, not a foreign SaaS vendor.

**Verdict: YELLOW per the specialist report — this synthesis confirms YELLOW but flags the data-availability constraint as effectively load-bearing/RED-adjacent within an overall buildable YELLOW**, similar in kind (though not in cause) to PS2's near-RED classification: both tracks are honestly buildable only as a synthetic-data demonstration of a *concept*, never of the thing the brief is actually asking for.

---

## 11. Comparison Matrix

All twenty required dimensions, scored 1–10 by this Master Agent, grounded in and cross-checked against the six specialist scorecards (dimensions 1, 4–5, 9–18 map closely to specialist-report categories; dimensions 2–3, 6–8, and 20 are this synthesis's own derived scores, since the specialist reports discuss but do not independently number them).

| # | Dimension | PS1 SRTK | PS2 DNAK | PS3 DWID | PS4 AIMD | PS5 CFTA | PS6 DFAP |
|---|---|---|---|---|---|---|---|
| 1 | Problem severity | 6 | 7 | 7 | 9 | 9 | 8 |
| 2 | Indian relevance | 7 | 8 | 8 | 8 | 8 | 8 |
| 3 | Chandigarh/Punjab relevance | 6 | 8 | 9 | 3 | 8 | 9 |
| 4 | Novelty | 4 | 3 | 4 | 4 | 4 | 4 |
| 5 | Technical depth | 6 | 5 | 6 | 6 | 6 | 6 |
| 6 | AI potential | 5 | 2 | 6 | 7 | 7 | 6 |
| 7 | Hardware potential | 8 | 6 | 1 | 2 | 1 | 1 |
| 8 | Software potential | 6 | 5 | 9 | 8 | 9 | 8 |
| 9 | Data availability | 2 | 6 | 4 | 7 | 9 | 2 |
| 10 | Prototype feasibility | 8 | 3 | 7 | 6 | 8 | 6 |
| 11 | Cost feasibility | 8 | 4 | 9 | 8 | 9 | 9 |
| 12 | Development time fit | 8 | 2 | 7 | 6 | 8 | 5 |
| 13 | Live demo strength | 7 | 4 | 6 | 7 | 8 | 7 |
| 14 | Reliability of demo | 6 | 3 | 6 | 5 | 6 | 5 |
| 15 | Government usefulness | 6 | 6 | 6 | 8 | 6 | 6 |
| 16 | Scalability | 6 | 5 | 5 | 5 | 5 | 4 |
| 17 | Judge appeal | 8 | 6 | 8 | 8 | 7 | 8 |
| 18 | Q&A defensibility | 5 | 4 | 5 | 5 | 5 | 4 |
| 19 | Competition differentiation | 4 | 3 | 4 | 4 | 3 | 3 |
| 20 | Overall winning potential (holistic) | 6.0 | 3.0 | 6.5 | 5.5 | 7.5 | 5.0 |

---

## 12. Weighted Scoring

**Weighting rationale (Master Agent judgment):** given a Round-1 deadline 48 hours away and a real build window of only ~18 working days total, this synthesis deliberately weights *feasibility, data availability, development-time fit, demo strength/reliability, and Q&A defensibility* far more heavily than raw novelty or technical ambition. A brilliant idea that cannot be honestly demoed by 8 Sep is worth less here than a modest one that can. Novelty and differentiation are weighted lightly because **all six tracks scored 3–4/10 on innovation and differentiation in their own specialist reports** — this dimension does not discriminate between the six options and should not drive the decision. Weights (sum to 100, dimension 20 excluded from the weighted sum as a holistic cross-check rather than an independent input):

| Dimension | Weight | Dimension | Weight |
|---|---|---|---|
| 1. Problem severity | 4 | 11. Cost feasibility | 4 |
| 2. Indian relevance | 3 | 12. Development time fit | 8 |
| 3. Chandigarh/Punjab relevance | 4 | 13. Live demo strength | 8 |
| 4. Novelty | 3 | 14. Reliability of demo | 8 |
| 5. Technical depth | 4 | 15. Government usefulness | 5 |
| 6. AI potential | 5 | 16. Scalability | 3 |
| 7. Hardware potential | 2 | 17. Judge appeal | 5 |
| 8. Software potential | 3 | 18. Q&A defensibility | 8 |
| 9. Data availability | 9 | 19. Competition differentiation | 5 |
| 10. Prototype feasibility | 9 | | |

**Weighted totals (score × weight, summed, ÷10 to normalize to /100):**

| PS | Weighted Score /100 |
|---|---|
| **PS5 CFTA** | **69.2** |
| PS4 AIMD | 61.9 |
| PS3 DWID | 61.5 |
| PS1 SRTK | 60.2 |
| PS6 DFAP | 55.7 |
| PS2 DNAK | 44.1 |

PS5 leads clearly. PS4 and PS3 are within 0.4 points of each other — a statistical tie the raw numbers cannot resolve, and Master-Agent judgment is applied to break it (see §21, §23): PS4's numeric edge comes almost entirely from its high problem-severity and government-usefulness scores, but its core demo claim rests on a scientific limitation (the generalization gap) that the team cannot fix, only disclose — a *harder* category of weakness than PS3's legal-sensitivity risk, which is fully manageable through disciplined demo design. Combined with PS4's near-total absence of a Chandigarh/Punjab hook (3/10, the single lowest score in the entire matrix) against PS3's exceptional, current regional narrative (9/10, tied for highest), this synthesis resolves the near-tie in PS3's favor for the runner-up slot.

---

## 13. Feasibility Analysis

Ranking tracks purely by "can a realistic 4–5 person UIET/PEC team actually deliver the honest core of this brief by 8 Sep":

1. **PS5** — yes, comfortably. Free data, a real labeled dataset, open-source reference architecture (GraphSense), no legal gate.
2. **PS1** — yes, for the honestly-scoped custody-hash + narrow classifier version; no for the literal "multi-analyte from one scan" version.
3. **PS3** — yes, using archival + synthetic + public-blockchain data; the discipline required is procedural (never touch a live darknet site), not technical.
4. **PS4** — yes, for the scoped subset (classifier + metadata check + seeded-corpus hash-match); no for live cross-platform tracing, which is genuinely API-blocked.
5. **PS6** — yes, but only as a synthetic-data demonstration of the *concept*; the brief's actual subject matter (real CDR/IPDR/bank correlation) can never be shown working on real data.
6. **PS2** — conditionally yes, only if the team already has a biotech member and the venue confirms real-reagent permission within days; otherwise the "prototype" degenerates into a housing mockup plus an app, which does not demonstrate the DNA-based core of the brief at all.

---

## 14. Innovation Analysis

Every specialist report independently converged on the same finding: **none of the six tracks offers genuine technical-breakthrough novelty.** Each track's core techniques are well-published, and in most cases already productized by mature commercial vendors (spot-test colorimetry: Kineticolor and smartphone-ML-colorimetry papers predate PS1; RPA/LAMP lateral-flow species ID: a crowded 2019–2025 literature that PS2's own cited reference belongs to; dark-web/crypto/link-analysis: DarkOwl/Flashpoint/Chainalysis/Maltego/Palantir for PS3; deepfake detection: Reality Defender/Sensity/Hive/DFDC-winner-code-on-GitHub for PS4; blockchain forensics: Chainalysis/Elliptic/TRM/GraphSense for PS5; CDR/link analysis: i2/Maltego/Palantir plus multiple already-deployed Indian vendors for PS6).

The only place genuine, honestly-claimable novelty survives across all six tracks is **integration and localization**, not core technique: PS1's custody-hashing layer, PS2's India-specific ambient-stable panel + FSSAI-aligned logging, PS3's Punjab-localized NDPS-Act-aligned investigator workflow, PS4's Indian-evidentiary-format export, PS5's FIU-IND/PMLA-aligned explainable-triage tool for under-resourced agencies, and PS6's specific three-domain fusion UX. A team on any track should stop trying to out-invent the underlying science and instead compete on **honest, disciplined systems integration aimed at a real Indian institutional gap** — this is the shared lesson across all six reports.

---

## 15. Government Impact

PS4 scores highest on raw government usefulness (8/10) — it maps directly to I4C's active mandate and MeitY's live regulatory push. PS5, PS6, PS2, PS3, and PS1 cluster at 6/10: each has a real institutional touchpoint (FIU-IND for PS5; I4C-RBIH/MuleHunter.ai for PS6; ICAR-NMRI/FSSAI for PS2; NCB's Task Force/NIDAAN/NCORD for PS3; CFSL Chandigarh for PS1), but in every case, real production deployment sits far beyond what a hackathon prototype can demonstrate — this is a genuine, shared limitation, not a PS5-specific weakness. PS5's strongest government-impact argument is not raw score but *fit*: RBI's MuleHunter.AI is direct proof the Indian government already funds and deploys exactly this class of in-house AI tool, at the scale a state police cybercrime cell could plausibly use.

---

## 16. Chandigarh/Punjab Relevance

This is the dimension with the widest spread across the six tracks (3–9), and it materially affects Q&A defensibility because "why here, why now" is a natural first question from a police-heavy panel:

- **PS6 and PS3 tie for strongest (9/10)** — PS6 via three independently sourced 2026 regional mule-account cases; PS3 via the Aug 2026 Rajya Sabha statement, which is the single most *current* regional hook of any track (roughly two weeks pre-deadline).
- **PS2 and PS5 (8/10)** — PS2 via a direct, named 2025/2026 Chandigarh forensic case; PS5 via a Chandigarh Sector 45-D FIR plus Punjab/Haryana cybercrime statistics.
- **PS1 (6/10)** — real Punjab drug-trafficking data exists, but it is narratively mismatched to the brief's NPS-identification framing (see §5).
- **PS4 (3/10), the clear outlier** — no Chandigarh/Punjab/Haryana-specific deepfake incident was found by the specialist agent; the team would be pitching a nationally-important but locally-unanchored problem to a locally-anchored judging panel.

---

## 17. Live Demo Analysis

PS5 has a demo mechanic none of the other five can match: a **judge-verifiable, real-time, live public-blockchain lookup**, where the audience can independently confirm the result against a public block explorer as it happens. No other track offers this — PS1's demo is necessarily a household-surrogate simulation (mandated by the brochure's own safety rule), PS2's is either a mockup or a high-risk live wet-lab run, PS3's must stay off any live darknet source by design, PS4's live path risks an out-of-distribution misclassification, and PS6's is a scripted synthetic-data walkthrough by necessity. PS5's live-demo strength score (8/10) and reliability score (6/10, tied for the equal-highest with PS1 and PS3) reflect this structural advantage.

---

## 18. Data Availability

This is the single most decisive dimension in this synthesis's weighting, and the widest legitimate spread in the matrix:

- **PS5 (9/10):** legal, live, free public blockchain data + a real 203,769-transaction labeled dataset (Elliptic).
- **PS4 (7/10):** FF++/Celeb-DF/DFDC/WildDeepfake are all real, legally obtainable under academic-research licenses for exactly this use case.
- **PS2 (6/10):** reference sequences and published primers are freely available (NCBI GenBank); the constraint is reagents/wet-lab access, not data per se.
- **PS3 (4/10):** legally usable but structurally stale (2011–2015 archival data) plus synthetic filler.
- **PS1 and PS6 (2/10, tied lowest):** PS1's gap is narrow (real-drug reference standards, unobtainable but workable-around with household surrogates); PS6's gap is total and structural (real CDR/IPDR/bank data is categorically off-limits by law, for the entire life of the platform, not just the hackathon).

---

## 19. Technical Risk

Each track carries a different *category* of technical risk, and the categories are not equally severe:

- **Team-composition/skill-gate risk (PS2):** requires a biology specialist a CS/ECE team likely lacks — a binary go/no-go risk resolvable only by team roster, not engineering effort.
- **Legal/structural data-gate risk (PS6, partially PS1):** the core data source is categorically unobtainable — resolvable only by scoping down to a synthetic-data concept demo, never by more engineering.
- **Scientific-ceiling risk (PS4):** the field's own best models show a documented cross-dataset generalization gap — resolvable only by honest disclosure, not by better training.
- **Legal-sensitivity/tail-risk (PS3):** manageable through procedural discipline (never touch a live darknet source), but the downside if mishandled is unusually severe (reputational/legal incident in front of police judges).
- **Competitive-crowding risk (PS5, and to a lesser extent PS1/PS3/PS6):** a positioning problem, fully solvable through honest narrative framing — the *mildest* risk category of the five, because it requires no scoping compromise to the actual product, only to the claims made about it.

PS5's risk profile is therefore uniquely favorable: its only material risk sits in the mildest category.

---

## 20. Cost Analysis

| PS | Estimated prototype cost | Notes |
|---|---|---|
| PS5 | ₹0–5,000 | Free data, free datasets, free-tier APIs, open-source stack |
| PS3 | ₹0–10,000 | Free/open-source stack + light LLM-API usage for NLP/synthetic data |
| PS6 | ₹0–5,000 | Open-source stack, synthetic data only |
| PS4 | ₹2,000–20,000 | GPU-hours for fine-tuning + possible reverse-search API tier |
| PS1 | ₹3,000–6,000 | Commodity electronics (ESP32, AS7341/TCS3200, GPS, enclosure) |
| PS2 | ₹15,000–60,000+ (validated) / a few hundred (mockup-only) | Dominated by enzyme-reagent and custom-oligo-synthesis cost; least-certain estimate of the six |

All six are affordable relative to the ₹1,00,000 first prize; cost is not a discriminating factor except that PS2's cost is both highest and least predictable, compounding its other risks.

---

## 21. Hybrid Opportunity Analysis

Four cross-PS hybrids were considered, per the task brief's prompt:

- **PS1 + chain-of-custody emphasis:** already the *core* recommendation for PS1 on its own (see §5) — not really a hybrid across tracks, just the honest scoping of PS1 itself. No separate action needed.
- **PS3 + PS5 (darknet + crypto correlation):** this is the most genuinely promising hybrid. Both tracks' specialist reports independently cite the *same* companies (Chainalysis, wallet-clustering heuristics) and the same real case study (NCB's "Team Kalki" — a darknet-plus-crypto-plus-Punjab-relevant network). **Recommendation: do not build two platforms.** Instead, use a Punjab-drug-trafficking-financed-by-crypto narrative as the flagship *use case* inside the PS5 build — i.e., PS5's wallet-risk-scoring demo scenario becomes "here is how Punjab's digitally-enabled drug trade (per the Aug 2026 Rajya Sabha statement) launders proceeds through crypto," rather than building PS3's separate dark-web-ingestion pipeline. This captures PS3's strongest narrative asset (regional currency, the Team Kalki case) without taking on PS3's data-staleness or legal-tail-risk problems, and without meaningful scope creep, since PS5's architecture already supports "flag a wallet, show why."
- **PS5 + PS6 (crypto + CDR/bank correlation):** rejected as a build target. PS6's core weakness (real CDR/bank data is categorically unobtainable) does not go away by attaching it to PS5 — it would import PS6's structural data-blocker into an otherwise-clean track for no offsetting benefit, and doubles the feature surface a 4–5 person team must deliver in 18 days. Not recommended.
- **PS4 + PS6 (deepfake + cross-domain correlation):** rejected for the same reason — combines PS4's scientific-ceiling risk with PS6's legal-data-gate risk, the two most structurally severe risk categories identified in §19, in a single build. This is scope creep with compounding downside, not competitive advantage.

**Master-Agent conclusion on hybrids:** only one hybrid clears the bar of "genuine competitive advantage without scope creep" — folding PS3's Punjab/darknet narrative into PS5's crypto-tracing demo as a use-case framing, not a second platform. This is reflected in the Winner recommendation (§22) and the Demo Strategy (§27).

---

## 22. WINNER: PS5 — CFTA (Illicit Crypto Flow Tracking & Fraud Detection)

### Why this one

PS5 is the only track where every disqualifying-category risk identified across the other five (wet-lab/skillset gate, categorical legal data blocker, unfixable scientific generalization ceiling, live legal/reputational tail-risk) is simply absent. Its remaining risk — a saturated field of well-funded incumbents — is the mildest risk category available in this comparison (§19): it requires only honest narrative framing, not a scoping compromise to the product itself. Combined with the best data-availability score of all six tracks (9/10: free, legal, live public blockchain data plus a real 203,769-transaction labeled dataset), the strongest live-demo mechanic (a judge-verifiable, real-time public lookup no other track can replicate), a clean six-for-six verified reference list, and real, current regional grounding (Chandigarh Sector 45-D FIR, Punjab's 956 FIRs, Haryana's 141,685 complaints), PS5 produces the highest weighted score (69.2/100) by a clear margin and is the lowest-regret choice given a 48-hour Round-1 deadline.

### Exactly what to build

**Build:**
1. A web dashboard that accepts a wallet address (Bitcoin and/or Ethereum) and queries free-tier public blockchain-explorer APIs (Etherscan, Blockchain.com) for its transaction graph.
2. Address-clustering using the published common-input-ownership and change-address heuristics (Meiklejohn 2013; Reid & Harrigan 2013).
3. A risk-scoring classifier trained/validated on the **Elliptic** labeled dataset — start with RandomForest/XGBoost on its 166 engineered features (the well-trodden published benchmark approach) as the reliable baseline; add a GraphSAGE/GCN GNN via PyTorch Geometric as a stretch enhancement if time allows, citing published recipes (GuiltyWalker, Inspection-L) rather than inventing an architecture.
4. A deterministic, explainable **FATF red-flag rule engine** layered on top (mixer interaction, rapid layering/fan-out, sanctioned-address hits, structuring patterns) — this should be the *primary* signal shown live, with the ML score as a secondary corroborating layer, for reliability.
5. A graph visualization (Neo4j + Bloom, or lighter: NetworkX + Cytoscape.js/D3) showing the entity/transaction network.
6. A one-click, structured "evidence report" export (PDF/JSON) formatted to loosely mirror an FIU-IND STR structure — clearly labeled as a concept demonstration, not a certified filing.
7. Basic case management + RBAC (hand-rolled JWT or Keycloak) + audit log, to answer the security/access-control expectation.
8. 2–3 pre-verified, rehearsed live-lookup scenarios: one publicly known scam/sanctioned address, one clean/ordinary address (to show the tool discriminates rather than over-flagging), and — per the hybrid recommendation in §21 — one scenario framed around a Punjab-drug-trafficking-financed-by-crypto narrative referencing the real NCB "Team Kalki" case.

**Do NOT build:**
- Any integration claiming real exchange KYC, real bank records, or real STR data — these are legally confidential; only clearly-labeled synthetic/mock off-chain data may ever appear in the demo.
- A wallet-to-real-identity de-anonymization claim — this legally requires exchange KYC obtained via subpoena/MLAT and cannot be built or implied.
- Multi-chain support beyond Bitcoin/Ethereum — scope creep with no demo payoff.
- Production-grade continuous monitoring or a claim of "better than Chainalysis" tracing power — both are indefensible under Q&A (§28) and unnecessary for winning.
- A from-scratch GNN architecture — use documented, published recipes only; a working RandomForest baseline beats a broken novel GNN every time on stage.

**The MVP must contain, at minimum:** live wallet lookup → address clustering → rule-based red-flag firing (at least 2–3 named FATF indicators wired to real logic, not hardcoded) → graph visualization → one-click report export. Everything else (RBAC, GNN, mock off-chain correlation) is polish layered on top of this working core.

**What the live demo should show:** Load a publicly known, verifiable illicit or sanctioned wallet address live on stage. Show the transaction graph auto-expand to reveal a mixer-interaction or rapid fund-splitting pattern. Have the rule engine fire a specific, named indicator (e.g., "rapid layering: N hops in M minutes" or "counterparty exposure to a sanctioned entity"). Generate the one-click evidence report. Then repeat with a clean address to show the tool does not over-flag. Close with the India/FIU-IND-accessibility narrative and, if time allows, the Punjab-crypto-drug-trafficking framing from the Team Kalki case. Total demo time: under 3 minutes, exactly as the specialist report recommends.

### Recommended architecture

- **Data:** live public blockchain APIs (Etherscan free tier: 100,000 req/day; Blockchain.com explorer/Data API as fallback); Elliptic Kaggle dataset for ML training/validation; OFAC SDN public list for sanctions-hit demo scenarios; clearly-labeled synthetic mock data for any off-chain (bank/STR) illustration.
- **Hardware:** none — laptop-class development and demo hardware only.
- **AI/ML:** RandomForest/XGBoost baseline on Elliptic's 166 features (primary, reliable); optional GraphSAGE/GCN GNN via PyTorch Geometric (stretch); deterministic FATF rule-encoding layer for explainability (primary demo signal).
- **Database:** Neo4j Community Edition (or NetworkX for a lighter footprint) for the graph layer; PostgreSQL for case records.
- **Backend:** Python/FastAPI.
- **Frontend:** React + Cytoscape.js/D3 for graph visualization.
- **Security:** JWT-based or Keycloak RBAC; audit logging on every case action.
- **Legal safeguards:** explicit, persistent on-screen labeling of any synthetic/mock data; no real KYC/bank/STR data anywhere in the system; disclaimers positioning the tool as investigative triage/decision-support, never as certified evidence or a de-anonymization capability.

### Approximate cost

₹0–5,000 (free-tier APIs and datasets, open-source stack, optional minor cloud-hosting spend).

### Days to build

Pitch deck + video: achievable within the 2 days to 20 Aug using only free/public resources — no lab access, legal clearance, or reagent lead time required. If shortlisted (25 Aug), the working MVP is built across the ~2-week pre-hack window (25 Aug–7 Sep) plus the 24-hour offline build (8 Sep) — roughly 16–18 working days total, which the specialist report and this synthesis both assess as comfortably sufficient for the scoped MVP above, given every component builds on documented, existing recipes rather than novel research.

### Top 5 risks and mitigations

1. **"How is this different from Chainalysis/Elliptic/TRM Labs?"** → Rehearsed answer: cost/accessibility for under-resourced state/city cybercrime cells (29 dedicated Punjab cybercrime stations alone cannot plausibly all hold enterprise licenses) + FIU-IND/PMLA-aligned explainability, never a claim of superior tracing power.
2. **Blockchain-explorer API rate-limiting or downtime mid-demo.** → Cache responses in advance; pre-verify 2–3 backup demo addresses; keep a dedicated, untouched-until-showtime API key; have a locally cached fallback dataset ready.
3. **Team implies real KYC/bank/STR access even accidentally.** → Persistent, explicit on-screen "SYNTHETIC DATA" labeling on any off-chain-correlation UI element; script the narration to state this proactively rather than let judges surface it.
4. **GNN/ML score looks confusing or wrong live.** → Lead every demo moment with the deterministic rule-based flag (always correct and explainable by construction); treat the ML score strictly as a secondary, clearly-labeled corroborating signal.
5. **Team lacks prior graph-ML experience, GNN build stalls.** → Build the RandomForest/XGBoost baseline first and treat it as demo-ready on its own; attempt the GNN only as a stretch goal using the published Elliptic + PyTorch Geometric tutorials/papers (GuiltyWalker, Inspection-L) as a direct recipe, with an explicit fallback plan to skip it entirely without weakening the core demo.

---

## 23. RUNNER-UP: PS3 — DWID (Darknet Drug Sales Detection)

PS3 lost to PS5 by a narrow weighted margin (61.5 vs 69.2) driven by two compounding factors, not one:

**Data currency.** PS5's core data (live public blockchain transactions) is current to the second the demo runs. PS3's best legally-usable dataset — the Gwern DNM Archives — is a real, legitimate academic resource, but it is a decade-old snapshot (2011–2015) of markets that no longer exist. A team can honestly label this as "illustrative historical data," but it structurally cannot produce the same "this is happening right now, verify it yourself" demo moment PS5 offers, which the specialist scorecards reflect directly (data availability 4/10 for PS3 vs 9/10 for PS5).

**Risk category severity.** PS3's central risk — the standing temptation to touch a live darknet source "just to show it's real" — is fully avoidable through team discipline, but if it is *not* avoided, the downside is categorically worse than anything PS5 risks: a genuinely disqualifying legal, reputational, or operational-security incident in front of a police-heavy judging panel, versus PS5's worst case of merely a tough differentiation question in Q&A. A hackathon evaluation under real time pressure should discount options whose failure mode is catastrophic-but-avoidable more heavily than options whose failure mode is merely awkward-but-recoverable, even when their raw feasibility scores are close.

PS3 remains a strong, legitimate second choice — it has the best "why now" narrative of any track (the Aug 2026 Rajya Sabha statement) and a fully legal, buildable path (synthetic + archival + public-blockchain data). It is recommended as the team's fallback if, after further internal discussion, the team's own composition or interests point away from crypto/finance and toward the darknet-intelligence narrative instead — with the explicit condition that the demo-data policy (never touch a live .onion source) is locked in before any building begins, not decided under time pressure later.

---

## 24. Exact MVP

The PS5 MVP, restated as an ordered build checklist for the pre-hack window:

1. Wallet-address input → live blockchain-explorer API query (Etherscan/Blockchain.com) → raw transaction list retrieved.
2. Address-clustering heuristics applied (common-input-ownership, change-address) → entities grouped.
3. Elliptic-trained RandomForest/XGBoost classifier scores the entity → risk score returned.
4. FATF rule engine evaluates the same transaction data → named red-flag(s) fire where applicable (at minimum: mixer interaction, rapid fan-out/layering, sanctioned-address hit).
5. Graph visualization renders the entity/transaction network with risk-colored nodes.
6. "Generate Report" button exports a structured PDF/JSON summary of the above.
7. Basic login/RBAC gate + audit log entry recorded per lookup.
8. 2–3 pre-verified demo addresses (one flagged, one clean, one Punjab-crypto-drug-trafficking-narrative-linked) rehearsed end-to-end at least five times before 8 Sep.

Everything beyond this list (GNN upgrade, full case-management workflow, mock off-chain correlation layer) is stretch scope, attempted only after the above eight steps are demo-solid.

---

## 25. Recommended Architecture

(Repeated here per the required section list; identical to the architecture specified in §22 for the Winner.)

- **Data layer:** Etherscan API (free tier) + Blockchain.com API as fallback; Elliptic Kaggle dataset (offline, bundled with the build); OFAC SDN list (static, bundled); synthetic/mock off-chain data generator for illustrative bank/STR correlation, explicitly labeled in the UI.
- **Hardware layer:** none required; standard laptop for development and demo.
- **AI/ML layer:** RandomForest/XGBoost (primary, on Elliptic's 166 features) + optional GraphSAGE/GCN GNN via PyTorch Geometric (stretch) + deterministic FATF rule engine (primary explainability layer).
- **Database layer:** Neo4j Community Edition (graph) + PostgreSQL (case records), or a lighter NetworkX + SQLite combination if the team prefers minimal ops overhead for a 24-hour build.
- **Backend layer:** Python/FastAPI, exposing REST endpoints for lookup, scoring, graph data, and report generation.
- **Frontend layer:** React, with Cytoscape.js or D3 for the graph visualization and a standard dashboard/KPI layout for case overview.
- **Security layer:** JWT-based auth with role-based access control (investigator vs. admin roles at minimum), audit logging of every lookup/action, encrypted transport (HTTPS) for any deployed instance.
- **Legal-safeguards layer:** persistent, unavoidable UI labeling distinguishing "live public blockchain data" from "synthetic/illustrative data"; an explicit in-app disclaimer that outputs are investigative triage aids, not certified evidence or identity-attribution claims; no code path that ever ingests or displays real KYC/bank/STR data.

---

## 26. Development Roadmap

| Window | Milestone |
|---|---|
| **Now – 20 Aug (2 days)** | Finalize PS5 commitment; write pitch deck using verified references (§9, §22); record a short demo video showing a *working* live lookup against one real public wallet address (achievable in an afternoon with a free-tier API call and a minimal UI) — this single element differentiates the submission from a slides-only deck. |
| **20–25 Aug (screening window)** | No team action required beyond responding to any organizer clarification requests; optionally continue refining the deck/video if time permits. |
| **25 Aug (results)** | If shortlisted: assign roles — one member owns blockchain-API integration + clustering, one owns the ML layer (RandomForest baseline first), one owns the rule engine + explainability, one owns frontend/graph-viz, one (if a 5th member) owns case-management/RBAC + report export and demo rehearsal logistics. |
| **25 Aug – 1 Sep (week 1 of prep)** | Build the 8-step MVP checklist in §24 end-to-end on 2–3 pre-selected real demo addresses. Get the RandomForest baseline trained and validated on Elliptic. Stand up the rule engine with at least 3 named FATF indicators wired to real logic. |
| **1–7 Sep (week 2 of prep)** | Polish graph visualization and report export; attempt the GNN stretch goal only if the baseline is fully solid; build the case-management/RBAC layer; write and rehearse the demo script (§27) at least five times; prepare the Punjab-crypto-narrative demo scenario (§21 hybrid). |
| **8 Sep (24-hour offline build)** | Final integration, bug-fixing, and demo-script rehearsal under real venue conditions (test venue Wi-Fi dependency; have a cached/offline fallback ready per §29). |
| **9 Sep (Grand Finale)** | Present the rehearsed 3-minute demo (§22, §27) followed by the judge Q&A (§28). |

---

## 27. Demo Strategy

**Opening (30 seconds):** Lead with the regional-relevance hook — cite the Chandigarh Sector 45-D crypto-scam FIR and Punjab's 956 cybercrime FIRs across 29 dedicated stations, framing the problem as already active in the host force's own jurisdiction, not a hypothetical.

**Core demo (under 3 minutes):** Live-lookup a publicly known illicit/sanctioned wallet address → graph auto-expands revealing a mixer-interaction or rapid-fan-out pattern → rule engine fires a named, specific red flag → risk score displayed with the ML layer shown as a secondary corroborating signal, not the headline → one-click evidence-report export generated on screen. Immediately contrast with a clean address returning no flags, to prove the tool discriminates rather than over-flags — this single contrast preempts the "false positive" question before a judge has to ask it.

**Narrative closer (30–60 seconds):** The Punjab-crypto-drug-trafficking framing from §21's hybrid recommendation — "this is how Punjab's digitally-enabled drug trade, as described in the Rajya Sabha two weeks ago, actually moves money" — followed by the honest positioning line: "not a Chainalysis replacement — a low-cost, explainable triage layer for the state and city cybercrime cells that cannot afford an enterprise license."

**Fallback plan:** If venue internet fails, run the identical script against a pre-cached response set from the same real addresses, disclosed honestly as "cached results from our verified test run, shown here due to venue connectivity" — consistent with the brochure's own PPT + video submission format anticipating exactly this kind of contingency.

---

## 28. Judge Q&A Preparation — 5-Judge Panel Simulation (PS5)

### Judge 1 — Police/Government

**Q1. How would Chandigarh Police actually use this on day one?**
A: Position it as a decision-support/triage layer for smaller cybercrime cells — flagging leads tied to regional FIRs (e.g., the Sector 45-D case) for escalation, not a Chainalysis replacement.
*Weak point:* No real integration with any actual FIU-IND workflow exists yet.
*Fix:* Build a mock STR-format export mapped to real FIU-IND reporting fields, and demonstrate the "handoff" concept explicitly rather than claiming a completed integration.

**Q2. What happens with false positives — could this wrongly flag an innocent person?**
A: Every flag traces to a specific, named rule (a FATF indicator) or a documented feature — never a black-box score — and the system requires human review before any enforcement action.
*Weak point:* No real precision/recall validation exists against ground-truth Indian cases.
*Fix:* Report actual measured metrics from the Elliptic benchmark honestly, scoped explicitly to that dataset, and state plainly that real-world validation is a post-hackathon requirement.

**Q3. Is this legally admissible evidence?**
A: No — it is an investigative triage/leads tool. Final evidence still requires full chain-of-custody handling and expert forensic sign-off.
*Weak point:* The hackathon prototype has no legal-admissibility engineering.
*Fix:* Present the audit-logging/report-export layer as a concept demonstration of what a legally hardened version would require, never as a claim of compliance.

**Q4. How is this different from tools police might already license?**
A: Cost/accessibility — most under-resourced state/city cybercrime cells cannot afford enterprise licenses; this is a low-cost, explainable, India/FIU-IND-aligned alternative built specifically for them.
*Weak point:* No confirmed pricing comparison exists.
*Fix:* Cite incumbents' $1B+ valuations and enterprise/institutional client base as indirect evidence of high cost, explicitly flagged as an inference, not a confirmed quote.

**Q5. What's your plan if a flagged wallet turns out to belong to a legitimate business?**
A: The clean-address demo scenario is deliberately built to show the tool does not over-flag; a case-review/dismissal workflow is part of the concept.
*Weak point:* This workflow is not actually built.
*Fix:* At minimum, mock a "case cleared/dismissed" status transition in the case-management UI to show the concept is designed-in, not an afterthought.

### Judge 2 — AI/ML Expert

**Q1. What model architecture, and why?**
A: RandomForest/XGBoost on Elliptic's 166 published features as the reliable primary; an optional GraphSAGE/GCN GNN via PyTorch Geometric as a stretch enhancement; a rule-based FATF layer for explainability on top.
*Weak point:* GNN training/validation within the timeframe is genuinely ambitious.
*Fix:* Present the baseline as the production-ready component and the GNN honestly as a stretch/roadmap item, not claim both are equally mature.

**Q2. What's your accuracy, and on what data split?**
A: Report the actual measured metrics on Elliptic's labeled licit/illicit subset with a proper train/test split — never an invented number.
*Weak point:* 77% of the Elliptic dataset is unlabeled ("unknown"), so real-world performance beyond this benchmark is unproven.
*Fix:* Disclose this explicitly; frame the numbers as "benchmark-validated," never as "real-world-validated."

**Q3. How does this generalize to wallets/chains not represented in Elliptic?**
A: Honestly, it does not automatically — the deterministic heuristics/rules transfer better than the trained classifier, which would need retraining on newer/broader data for production use.
*Weak point:* Genuine, real limitation.
*Fix:* Frame as a known extensibility roadmap item, consistent with how the whole field treats this problem — do not claim it is solved.

**Q4. Why not just use the existing open-source GraphSense platform directly?**
A: The build adapts GraphSense's documented clustering-heuristic architecture as a foundation rather than reinventing address-clustering from scratch, and adds the India-specific explainability/reporting/UX layer GraphSense does not provide out of the box.
*Weak point:* Raises the "how much did you actually build vs. reuse" question.
*Fix:* Be transparent in the deck about exactly what is adapted from published prior art versus original integration work — this reads as maturity, not weakness, to a technical judge.

**Q5. How would you catch a genuinely novel laundering technique your model has never seen?**
A: Honestly, the supervised classifier likely will not catch it; the rule-based FATF layer (manually updatable) and unsupervised anomaly detection (isolation forest on transaction velocity/structuring) are the realistic first line of defense for novel patterns, not the trained model.
*Weak point:* A real, industry-wide limitation, structurally similar to PS4's generalization gap.
*Fix:* Use the same honesty strategy that de-risks PS4's equivalent weakness — disclose proactively as a known, field-wide limitation rather than let a judge surface it.

### Judge 3 — Cybersecurity Expert

**Q1. How do you secure the platform itself — show me, not just describe.**
A: Live demonstration of role-based login restricting sensitive case views, with a timestamped audit-log entry per action.
*Weak point:* Hackathon-grade auth (JWT/Keycloak) is not production-hardened or penetration-tested.
*Fix:* State explicitly that this is a security-concept demonstration, not a certified system.

**Q2. What stops someone from feeding your system spoofed wallet activity?**
A: Public blockchain data is cryptographically verifiable by construction — the analysis layer inherits the blockchain's own integrity guarantees; synthetic off-chain data is always clearly labeled and never presented as verified evidence.
*Weak point:* The clustering heuristics themselves are known to be adversarially evadable (mixers/CoinJoin are specifically designed to defeat them) — a real, industry-acknowledged problem, not something this tool solves.
*Fix:* Acknowledge the mixer-evasion arms race explicitly as an unsolved, industry-wide problem that Chainalysis/Elliptic themselves openly discuss, rather than imply the tool has cracked it.

**Q3. What's your threat model if the platform itself is compromised?**
A: Standard practice — encryption at rest/in transit, RBAC, audit logging — but no full security audit has been performed on the hackathon prototype.
*Weak point:* Unvalidated.
*Fix:* Present as a designed-for-hardening roadmap item requiring a real audit before any production use.

**Q4. How would this satisfy Bharatiya Sakshya Adhiniyam evidence-law chain-of-custody requirements?**
A: Hash-stamped, timestamped exportable reports are a starting concept; full legal admissibility requires further certification well beyond a hackathon prototype.
*Weak point:* Not legally validated.
*Fix:* Frame explicitly as a roadmap item requiring partnership with a body like CFSL post-hackathon.

**Q5. Could this tool be misused for surveillance overreach?**
A: The prototype only analyzes public blockchain data plus explicitly-labeled synthetic data; production deployment would need governance controls (audit trail, warrant-linked access) as a policy safeguard, not just a technical feature.
*Weak point:* No governance layer is actually built.
*Fix:* Propose a policy framework alongside the technical architecture in the deck — showing awareness of the risk is itself a strong Q&A answer.

### Judge 4 — Product/Startup Judge

**Q1. Who is your customer, precisely?**
A: State/city police cybercrime cells (29 dedicated stations in Punjab alone) and other FIU-IND-adjacent regulated entities priced out of enterprise licenses — a real, named, underserved segment.
*Weak point:* No confirmed pricing/procurement research has actually been done.
*Fix:* Acknowledge this is an early-stage hypothesis to validate with real agencies post-hackathon, not a confirmed market study.

**Q2. Why would Chandigarh Police pick you over just licensing Chainalysis?**
A: Cost-accessibility plus India-specific STR/PMLA alignment plus explainability (rule-traceable flags versus a black-box score).
*Weak point:* No confirmed cost comparison exists.
*Fix:* State this framing as an evidence-supported inference, not a verified fact.

**Q3. What's the go-to-market plan beyond the hackathon?**
A: A plausible pilot pathway through PEC's Cyber Security Research Centre, which already partners with Chandigarh Police, CFSL, and CISF.
*Weak point:* Speculative — no partnership is actually confirmed.
*Fix:* Keep this strictly as a "next steps" slide, never a claimed done deal.

**Q4. What's your biggest technical risk to scaling this beyond a demo?**
A: Honestly, attribution-tag database quality (linking addresses to real-world entities) is the actual moat incumbents have spent years building — a hackathon team cannot replicate this quickly.
*Fix:* Propose starting from public attribution sources (OFAC lists, publicly disclosed case addresses) and community-sourced tagging as an explicit scaling roadmap, not a claim of parity with Chainalysis's proprietary database.

**Q5. What's the sustainability/business model if this became real?**
A: A government-licensing/grant-funded model, analogous to RBI's in-house MuleHunter.AI, rather than a commercial SaaS competing head-on with Chainalysis.
*Weak point:* Unvalidated business model.
*Fix:* Be upfront this is a public-good/government-tool framing, consistent with the hackathon's own government context, not a VC-scale startup pitch.

### Judge 5 — Forensics/Scientific Expert

**Q1. Is your wallet-clustering "risk score" scientifically validated, or just a heuristic guess?**
A: The core clustering heuristics are peer-reviewed, foundational, published research (Meiklejohn 2013; Reid & Harrigan 2013) with documented failure modes discussed openly in that literature; the team's added ML layer is currently only benchmarked against Elliptic.
*Weak point:* The heuristics have known false-positive/negative failure modes.
*Fix:* Cite the specific caveats from the foundational papers directly in the deck, rather than presenting the heuristics as infallible.

**Q2. Can your tool's output actually identify a real person behind a wallet?**
A: No — correctly, explicitly, no. De-anonymization to a real identity legally requires exchange KYC records obtained via a lawful subpoena/MLAT process, which a wallet-risk score alone can never provide.
*Weak point:* This meaningfully limits the tool's standalone evidentiary value.
*Fix:* Frame the tool's role explicitly as "narrows the field for a subpoena-backed follow-up," never as identification.

**Q3. What's your dataset's provenance, and are there consent/ethical issues?**
A: The Elliptic dataset is anonymized and was released by Elliptic specifically to support AML research, with no direct personal-identity linkage in the exposed features.
*Weak point:* None significant — this is a genuine strength.
*Fix:* Cite this cleanly and confidently; it is one of the few unambiguous "yes, this is done right" answers available in the whole pitch.

**Q4. How would this hold up under adversarial cross-examination in an actual NDPS/PMLA prosecution?**
A: Honestly, a hackathon prototype's outputs are not, by themselves, admissible; production use would need proper expert certification and methodology validation, analogous to how forensic-tool validation generally works.
*Weak point:* A significant, acknowledged gap.
*Fix:* Position the tool explicitly as an investigative lead-generation aid — a tip that must still be independently verified — never as standalone courtroom evidence.

**Q5. What is the human cost of a false positive in your specific domain?**
A: Acknowledge the real due-process stakes — a wrongly flagged wallet/account could trigger unwarranted scrutiny; propose a mandatory human-review gate before any account action, with transparent false-positive-rate reporting as a required feature, not an afterthought.
*Weak point:* Not actually built in the hackathon timeframe.
*Fix:* At minimum, mock the "reviewed/cleared" workflow state in the UI to demonstrate the concept is designed-in from day one, echoing the same fix used for Judge 1's Q5.

---

## 29. Risk Mitigation

Consolidated top-level risks for the PS5 track and their mitigations (expands on §22's top-5 with additional cross-cutting items):

| Risk | Category | Mitigation |
|---|---|---|
| "How is this different from Chainalysis?" | Positioning | Rehearsed cost/accessibility + explainability narrative; never claim superior tracing power |
| API rate-limit/downtime mid-demo | Technical/live-demo | Caching, pre-verified backup addresses, dedicated untouched API key, offline fallback video |
| Accidental implication of real KYC/bank/STR access | Legal/credibility | Persistent on-screen synthetic-data labeling; proactive disclosure in narration |
| GNN/ML score looks wrong or confusing live | Technical/live-demo | Lead with deterministic rule-based flags; ML as secondary signal only |
| Team lacks GNN experience, build stalls | Technical/schedule | RandomForest baseline first and demo-ready on its own; GNN as explicit stretch goal with a fallback plan |
| Venue Wi-Fi failure on finale day | Live-demo/logistics | Locally cached response set for the exact rehearsed demo addresses; disclosed honestly if used |
| Judge supplies an unfamiliar/random wallet address | Live-demo/reliability | Offer this only as an optional bonus after the primary rehearsed demo, with an honest caveat about scope, mirroring PS4's own recommended mitigation for the same class of risk |
| Overclaiming accuracy/de-anonymization capability | Q&A/credibility | Hard rule for the whole team: never state a number not measured on a named dataset/split; never claim identity attribution |
| Regulatory/legal confusion about crypto's status in India | Q&A/credibility | Cite the actual FIU-IND/PMLA/VDASP framework accurately (30% tax + 4% cess since 2022, FIU-IND registration since March 2023, 49 registered VDASPs) rather than assuming crypto is unregulated in India |

---

## 30. Final Recommendation

Commit to **PS5 (CFTA)** for the Round-1 pitch deck immediately — within the next 48 hours, before the 20 Aug deadline. This is the lowest-regret decision available: PS5 requires no lab access, no legal clearance, no reagent sourcing, and no irreversible demo-data decision before Wednesday, and its Round-1 video can show a genuinely *working* live lookup against a real public wallet address, built in an afternoon — a differentiator no other track can match this fast without real risk (PS1's would need a real sensor rig; PS2's would need reagents/lab access; PS3's would need a carefully-built synthetic dataset to avoid looking thin; PS4's would need a fine-tuned model; PS6's would need a synthetic-data generator built from scratch).

If the team's composition or interests genuinely pull toward the darknet/drug-intelligence narrative instead, PS3 is a fully legitimate, well-evidenced fallback — provided the "never touch a live darknet source" rule is locked in as policy before any building begins. No other track (PS1, PS2, PS4, PS6) is recommended over these two, for the specific, evidence-backed reasons summarized in the Final Verdict block below.

```
WINNER: PS5 — CFTA (Illicit Crypto Flow Tracking, Fraudulent-Account Flagging & Suspicious-Transaction Analysis)
SCORE: 69/100
WHY IT CAN WIN: Best data availability of all six tracks (free, legal, live public blockchain data + the real 203,769-transaction labeled Elliptic dataset); cleanest reference-verification record (6/6 confirmed real and accurate); a live-demo mechanic (judge-verifiable public block-explorer lookup) no other track can match; real, current regional grounding (Chandigarh Sector 45-D FIR, Punjab's 956 cybercrime FIRs, Haryana's 141,685 complaints); a real Indian government precedent for appetite (RBI's MuleHunter.AI); and, critically, its one weakness (crowded incumbents) is a positioning problem, not a structural blocker — unlike every other track's core risk.
BIGGEST ADVANTAGE: The only track where the team can demo something that is genuinely, verifiably real and legal, live, in front of judges, using nothing but a public blockchain address and a free API call.
BIGGEST RISK: Competing narrative-wise against Chainalysis/Elliptic/TRM Labs, multi-billion-dollar incumbents with proprietary attribution databases no student team can approximate — mitigated entirely through honest India/FIU-IND-accessibility positioning, never a claim of superior tracing power.
WHAT WE MUST BUILD: Live wallet lookup → address-clustering (published heuristics) → RandomForest/XGBoost risk classifier trained on Elliptic → deterministic FATF red-flag rule engine (primary demo signal) → graph visualization → one-click evidence-report export → basic RBAC/audit log. GNN upgrade is a stretch goal only.
WHAT WE MUST AVOID: Any claim of real KYC/bank/STR data access; any claim of de-anonymizing a real identity; any claim of matching or beating Chainalysis on raw tracing power; any invented accuracy number not measured on a named dataset/split; multi-chain scope creep.
30-DAY BUILD PLAN: Days 1-2 (now-20 Aug): pitch deck + working live-lookup demo video. Days 3-7 (20-25 Aug, screening): no action needed. Days 8-14 (25 Aug-1 Sep): build the 8-step MVP end-to-end on 2-3 pre-verified real addresses; train/validate the RandomForest baseline on Elliptic; wire up 3+ named FATF rules. Days 15-21 (1-7 Sep): polish graph viz + report export; attempt GNN stretch goal only if baseline is solid; build RBAC/case management; rehearse the 3-minute demo script 5+ times. Day 22 (8 Sep, 24-hour build): final integration and venue-condition rehearsal. Day 23 (9 Sep): Grand Finale.
LIVE DEMO: Live-lookup a publicly known illicit/sanctioned wallet address on stage -> graph auto-expands revealing a mixer/rapid-fan-out pattern -> rule engine fires a named red flag -> one-click evidence report generated -> contrast against a clean address showing zero flags -> close on the India/FIU-IND-accessibility narrative, optionally framed around the real NCB "Team Kalki" Punjab darknet-plus-crypto case.
JUDGE WOW MOMENT: The moment a judge realizes they can pull out their own phone, open a public block explorer, and independently verify the exact result the team just showed on stage, live, in real time — no other track in this hackathon can produce that moment.
RUNNER-UP: PS3 — DWID (Darknet/Encrypted Drug Sales Detection Platform). Lost by a narrow weighted margin (61.5 vs 69.2) driven by weaker data currency (best legal dataset is a 2011-2015 archive, versus PS5's live current data) and a categorically worse failure mode if mishandled (a live darknet-access incident in front of police judges is disqualifying, versus PS5's worst case of a tough but survivable differentiation question). Strongest asset: the Aug 2026 Rajya Sabha statement on Punjab's "digitally enabled" drug mafia, the single best "why now" hook of any track.
WHY NOT THE OTHER FIVE:
- PS1 (SRTK): The core "one cheap sensor does multi-analyte AI classification" ask is not physically deliverable as literally specified; the one real differentiator (custody-hash logging) is a thin slice of the actual brief.
- PS2 (DNAK): Requires wet-lab biology skills and reagents a CS/ECE-heavy team likely lacks, plus an unresolved, unconfirmed venue biosafety policy that is a live, unmitigated open risk with only days to resolve it.
- PS4 (AIMD): Highest raw problem-significance score of the six, but its headline claim rests on a scientific generalization-gap ceiling the team cannot engineer around, only disclose, and it carries the weakest Chandigarh/Punjab relevance hook of any track (3/10).
- PS6 (DFAP): Real CDR/IPDR/bank data is categorically, legally unobtainable by a student team for the platform's entire lifetime, not just the hackathon, and the category already has multiple deployed Indian government competitors (Karnataka's C5, LIS, i9, C-trace), making "novel platform" claims unusually hard to defend to a police panel.
- PS3 (DWID): Loses narrowly to PS5 on data currency and failure-mode severity, but remains the strongest legitimate alternative — see RUNNER-UP above.
FINAL RECOMMENDATION: Commit to PS5 now, for the pitch deck due in 48 hours. Build the eight-step MVP in §24 across the pre-hack window if shortlisted. Keep PS3 as the team's only acceptable fallback, and only if the "never touch a live darknet source" rule is locked in as policy before any building begins.
```
