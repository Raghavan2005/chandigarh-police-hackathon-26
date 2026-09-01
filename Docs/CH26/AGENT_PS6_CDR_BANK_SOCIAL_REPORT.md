# PS6 (DFAP) Independent Evaluation — Unified Digital Footprint Analytics Platform (Telecom CDR/IPDR + Bank Statements + Social Media)

**Chandigarh Police Hackathon'26 — Track 6**
Evaluation date: 2026-08-18 | Deadline for proposal: 2026-08-20 (2 days from evaluation)

Claim classification key used throughout: **[FACT]** verified directly from a primary source · **[SOURCE-BACKED]** stated by a secondary/search source, not independently re-verified against a primary document · **[INFERENCE]** this agent's reasoning from verified facts · **[PROPOSED]** a recommendation/solution this report is putting forward, not a claim about the world.

---

## 0. Problem statement verified verbatim

Read directly from `C:\Users\User\Downloads\CH26\Track 6 Documentation.pdf` (4 pages). **[FACT]** The title, explanation, six objectives, twelve expected features, "Tech Stack" note (no stack mandated — participants must justify choices), and all four reference URLs in the brochure text of your prompt match the PDF text exactly. The PDF also contains two disclaimed graphics: Figure 1, an "Illustrative high-level architecture" diagram (Sources → Secure Multi-Source Ingestion Layer → Correlation & Analytics Engine → four investigator-facing outputs), and Figure 3, an "Illustrative mockup of an investigator-facing dashboard... conceptual design, not a functional screenshot" showing KPI tiles (Active Alerts, Linked Accounts, Flagged Numbers, Open Cases), an anomaly trend chart, an entity relationship snapshot graph, and a recent-alerts table. Both are explicitly non-functional concept art, not evidence of a real reference implementation.

---

## 1. Reference verification (all four sources checked)

| # | Source | Verified? | Assessment |
|---|---|---|---|
| 1 | newsgram.com — "Five arrested as Delhi Police bust interstate cyber-fraud racket" (2026-05-05) | **[FACT]** Real, live article, fetched directly | Five people aged 18–21 arrested from Udham Singh Nagar, Uttarakhand for an interstate cyber-fraud/mule-account racket. Victim Sashi Ranjan Bharti lost ₹1,01,869 to a fake WhatsApp investment scheme; ~₹3,40,877 total linked across complaints. Investigation used "bank transactions, KYC records, digital footprints, and financial trails." Mule accounts were central (accused ran/supplied accounts for commission). **The article does not mention CDR or IPDR by name** — it evidences the bank-statement + social-media (WhatsApp) + mule-account side of PS6's premise well, but not the telecom-CDR side. Minor mismatch between the brochure's framing and the underlying story, but the core "fragmented evidence across domains" premise holds. |
| 2 | ddnews.gov.in — "I4C-RBIH join hands to use AI against mule accounts and cyber frauds" | **[FACT]** Real, live article, fetched directly (dated 2026-05-13) | Confirms an MoU between I4C (Ministry of Home Affairs) and RBIH (Reserve Bank Innovation Hub, an RBI-backed entity) to feed I4C's Suspect Registry data into AI models (e.g., MuleHunter.ai) deployed across banks to detect mule accounts. This is a genuine, dated, official-source-quoted (Union Home Minister Amit Shah) government initiative — a strong, legitimate reference. |
| 3 | services.india.gov.in — National Cyber Crime Reporting Portal service page | **[SOURCE-BACKED]** — the specific brochure URL 302-redirected to a generic `india.gov.in/services` landing page rather than resolving to a dedicated portal detail page at fetch time; however the underlying institution is independently confirmed real | The National Cybercrime Reporting Portal (cybercrime.gov.in) and its I4C-run helpline **1930** are real, well-established Government of India services under MHA **[SOURCE-BACKED, per Wikipedia and multiple corroborating sources]**; I4C itself was inaugurated in Jan 2020. The specific brochure deep-link not resolving cleanly is a minor documentation/link-rot issue, not a fabrication — the referenced institution and service are unambiguously real. |
| 4 | securiumsolutions.com — "CDR and IPDR Analysis in Indian Criminal Investigations" | **[FACT]** Real, live page, fetched directly | Securium Solutions is a commercial cybersecurity/pen-testing/digital-forensics vendor (paid consulting services, contact-us CTAs). The article is **credible-but-unauthoritative marketing/educational content**: plausible technical claims about CDR/IPDR (calling numbers, cell-tower/base-station location, IP-to-subscriber mapping, admissibility under Evidence Act) but **no citations to primary legal texts, DoT circulars, or case law** — exactly as flagged in your brief. Treat as a general-audience explainer, not a legal or technical authority; every claim from it used in a pitch deck should be cross-checked against a primary source (as this report does below). |

**Overall reference verdict:** 3 of 4 references check out cleanly as real, dated, and materially accurate; the 3rd (government portal) is real but the specific deep link redirects rather than resolving directly, and the 4th is a vendor blog whose content is plausible but non-authoritative. No reference is fabricated. This track's citations are noticeably more verifiable/real than is typical for hackathon brochures, which is a mild positive signal about how carefully this specific track's brief was assembled.

---

## 2. Indian legal framework governing CDR/IPDR access — the central constraint

- **[SOURCE-BACKED]** Historically, CDRs were obtainable under **Section 5(2) of the Indian Telegraph Act, 1885**, read with **Rule 419A of the Indian Telegraph Rules, 1951** (added 2007). Requests require sanction from a competent authority — typically an officer not below Superintendent of Police rank, with written approval routed through the Home Secretary (Union/State) — under grounds tied to public safety/emergency, sanctioned interception/disclosure.
- **[SOURCE-BACKED]** The **Telecommunications Act, 2023** now formally repeals/replaces the Indian Telegraph Act, 1885 and the Indian Wireless Telegraphy Act, 1933. On **6 December 2024**, DoT notified the **Telecommunications (Procedures and Safeguards for Lawful Interception of Messages) Rules, 2024**, which supersede old Rules 419/419A. Interception/disclosure directions must be in writing, on specified grounds, and are subject to a review committee. Separately, the **Telecommunications (Telecom Cyber Security) Rules, 2024** impose data-handling obligations on telecom licensees who process CDR/traffic/location data.
- **[SOURCE-BACKED]** IPDR: DoT mandates (2021 circular, and subsequent WiFi-provider mandates) require ISPs/UL licensees to retain IPDR logs (NAT/session mapping, source-destination IP, timestamps, ports/protocols) for a defined retention period (industry sources cite up to 2 years for some categories; CDR retention is commonly cited as ~6 months by secondary legal-advice sources — **[SOURCE-BACKED]**, not independently verified against a DoT primary circular in this pass).
- **[INFERENCE]** Net effect: both CDR and IPDR are **licensed-telecom-operator custody data**, releasable only to law-enforcement/authorized government requesters through a statutory chain of authorization (SP-rank officer request → competent-authority sanction → operator disclosure). There is **no lawful path for a student team, a college, or a private hackathon entrant to obtain real subscriber CDR/IPDR data** — not by request, not by scraping, not by "asking a telecom company," under either the old Telegraph Act regime or the new 2023 Act/2024 Rules regime.
- **[INFERENCE]** Bank statements/transaction data carry parallel protection: real customer transaction data is protected under RBI banking-secrecy norms, the DPDP Act 2023 (personal data), and IT Act provisions; access for investigation likewise requires a bank/RBI/court-sanctioned request, not something obtainable by a student team.
- **[INFERENCE]** Social media activity data is comparatively the *least* legally restricted of the three domains if scraping *public* posts/handles (subject to each platform's ToS and the DPDP Act's general personal-data-processing obligations), but coordinated/bot-behavior detection on real accounts still raises platform ToS and privacy issues for a demo.

**This is the single most important feasibility finding for PS6**, exactly as your brief anticipated: the platform's own subject matter (CDR/IPDR + bank statements) is, by design, data that a hackathon team can never legally possess in real form. Every viable team must build on synthetic/mock data and must say so explicitly.

---

## 3. Do synthetic/public/demo datasets exist? (thoroughly investigated)

**Telecom CDR:**
- **[FACT]** Kaggle hosts multiple relevant synthetic CDR datasets: "Telecom Fraud Detection Dataset" (10,000 synthetically generated call records with caller-level behavioral/graph/telecom-intelligence features, ~30% fraud rate, designed with realistic noise); "CDR - Call Details Record Dataset" (churn-oriented); "Fraud Detection using Call Detail Records"; "Telecom CDR Fraud Dataset." None are Indian-telecom-specific or IPDR-formatted, but their schemas (caller ID, called ID, timestamp, duration, cell/tower or location, call type) are directly adaptable to a mock Indian CDR generator.
- **[SOURCE-BACKED]** Academic literature (ASTESJ journal, arXiv papers on telecom fraud ML) provides published CDR feature schemas usable to hand-design a synthetic generator with realistic field names (IMEI/IMSI, cell ID/LAC, call type, duration, roaming flag).

**IPDR:** **[SOURCE-BACKED]** No ready-made public IPDR dataset was found; IPDR's real-world field structure (source/destination IP, timestamps, ports, protocol, session duration, NAT mapping) is documented by telecom-compliance vendors (Trisul, Innefu, Vehere, Nanovise) closely enough that a team can hand-build a plausible synthetic IPDR generator, but no existing labeled/public dataset was located — **this must be built from scratch as a synthetic generator**, not sourced.

**Bank/financial transactions:**
- **[FACT]** **PaySim** (Lopez-Rojas et al., 2016), hosted on Kaggle ("Synthetic Financial Datasets For Fraud Detection") and GitHub (`EdgarLopezPhD/PaySim`), is a well-known, widely-used, purpose-built synthetic mobile-money simulator: ~6.3M transactions over a 30-day simulated period, transaction types (CASH_IN/CASH_OUT/DEBIT/PAYMENT/TRANSFER), amount, origin/destination account IDs, and an `isFraud` label (0.13% fraud rate, ~8,213 fraud cases). This is directly usable as the "bank statement" data source for a prototype, with light relabeling to look like Indian bank-statement fields.
- **[FACT]** Additional Kaggle "Financial Fraud Detection Dataset" and similar exist as fallback/supplementary sources.

**Social media:** **[INFERENCE]** No single canonical public dataset was located in this pass for "coordinated/bot-like social media behavior," but bot-detection research datasets (e.g., Twitter bot benchmark sets referenced broadly in academic literature) exist in the wider ecosystem and synthetic post/engagement-graph generation (via a script) is straightforward for a demo.

**Prior hackathon precedent — the most important feasibility finding in this section:**
- **[FACT]** This is **not a new problem type in the Indian hackathon ecosystem**. Smart India Hackathon 2020, sponsored by the **Bureau of Police Research & Development (BPRD)**, ran problem statement **RK_312**, solved by team "winterfell" (public GitHub repo `sandy9999/Sih_Rk312_winterfell`), whose brief was: ingest CDR/IPDR in XLSX/CSV/TXT and convert into graphical node-edge visualizations for LEAs — i.e., essentially the entity-resolution + network-visualization slice of PS6. A second public repo, `Kaizer-7/CDR-IPDR`, also exists, confirming this exact sub-problem has been attempted by student teams before with mock/synthetic data.
- **[SOURCE-BACKED]** A related state-level initiative, **AI4AndhraPolice**, lists a live use-case "AI-powered analysis of large volumes of CDR/IPDR," confirming Indian state police forces are already pursuing exactly this capability operationally (see Section 4).

**[PROPOSED]** A student team's realistic data plan: (1) use PaySim directly for the banking layer (renaming/reformatting fields to resemble an Indian bank statement export); (2) hand-write a Python synthetic CDR generator seeded with Indian-style phone number formats, cell-tower/LAC IDs, and IMEI/IMSI patterns, optionally drawing feature distributions from the Kaggle telecom-fraud dataset; (3) hand-write a synthetic IPDR generator using the documented field schema (source/dest IP, timestamp, port, protocol, session duration); (4) script a small synthetic social-media activity/engagement dataset (handles, post timestamps, engagement graphs, a few "bot cluster" and "coordinated posting" injected patterns); (5) deliberately inject a small number of hand-planted cross-domain "storylines" (e.g., call → mule account transfer → coordinated social post) so the demo has a guaranteed "aha" moment. This is squarely a **[PROPOSED]** approach, not evidence of an existing generator — no ready-made "SIH-style demo generator for this exact 3-domain combination" was found; the team would need to build it as engineering work in week 1.

---

## 4. Existing solutions in this space (name real tools)

| Tool/initiative | Real? | Relevance |
|---|---|---|
| **i2 Analyst's Notebook** (i2 Group, part of N. Harris Computer/Constellation) | **[FACT]** | 30+ year old, entity-link-property (ELP) visual link-analysis platform used by military intelligence, law enforcement, and fraud units worldwide. Directly overlaps with PS6's "entity resolution + network/relationship visualization" features. This is the closest mature enterprise analogue to half of what PS6 asks for. |
| **Maltego** | **[FACT]** | OSINT/link-analysis graphing tool, widely used for exactly this kind of entity-correlation graph work; free/community tiers exist. |
| **Palantir Gotham/Foundry** | **[SOURCE-BACKED, general knowledge]** | Enterprise-grade multi-source fusion/investigative-analytics platform used by intelligence and law-enforcement agencies globally; the "single platform correlating heterogeneous data sources for investigators" category leader. Not confirmed deployed in this specific Indian LE context in this research pass, but the category is unambiguously mature and dominated by well-funded incumbents. |
| **C5 – CDR Analyzer** | **[SOURCE-BACKED]** | Deployed statewide in Karnataka across District Police units/Commissionerates specifically for CDR analysis in crime investigation/surveillance. |
| **LIS (Link Intelligence)**, **i9 CDR & Tower Dump Analysis Software**, **C-trace** | **[SOURCE-BACKED]** | Multiple commercial Indian vendors (Milind Agarwal/LIS, iCube Solutions/i9, cdrsoftwares.com/C-trace) already sell CDR/tower-dump analysis software to Indian police units. This is a populated, not empty, commercial category in India specifically. |
| **I4C National Cybercrime Reporting Portal** (cybercrime.gov.in, helpline 1930) | **[FACT]** | Real, MHA-run, since ~2020/2023; citizen-facing fraud reporting, not an investigator analytics workbench — complementary to, not competitive with, PS6. |
| **I4C–RBIH / MuleHunter.ai** | **[FACT]** (per Section 1, ref #2) | Real AI initiative specifically targeting mule-account detection via bank-side data, MHA + RBI-backed. This is the closest real government analogue to PS6's banking-anomaly slice, and directly reduces the "novelty" claim available to teams — the government is already building AI mule-detection at national scale. |
| **AI4AndhraPolice — "AI-powered analysis of large volumes of CDR/IPDR"** | **[SOURCE-BACKED]** | A live state-police AI use-case page confirming at least one Indian state force already has an active CDR/IPDR AI-analytics initiative underway. |

**[INFERENCE]** Conclusion: the *general capability category* (multi-source link analysis for investigators) is a mature, decades-old enterprise software market (i2, Maltego, Palantir), and the *India-specific CDR/IPDR analysis* sub-market already has multiple deployed commercial products in actual state police use (Karnataka's C5, LIS, i9, C-trace). The *specific three-way fusion* of CDR/IPDR + bank statements + social media in one single platform, marketed as a unified cross-domain correlation tool, is less commonly seen as an off-the-shelf single product — that is the platform's one plausible integration-level novelty (see Section 6).

---

## 5. Chandigarh/Punjab/Haryana relevance

- **[FACT]** Chandigarh: police officer testimony in a bail-opposition filing confirmed multiple Chandigarh-jurisdiction bank accounts are functioning as mule accounts for fake-investment, part-time-job, and "digital arrest" scam proceeds (Tribune India reporting, 2026).
- **[FACT]** Haryana: Tribune India reports "mule accounts" emerging as a major cyber-fraud tool statewide in 2026.
- **[FACT]** Punjab: Punjab Police's state cyber crime division busted a gang supplying current bank accounts to route/layer/settle defrauded funds for China-based handlers, linked to 24 victims, ~₹26.65 lakh placed under lien (Tribune India, 2026); a separate multi-state raid spanning Delhi/Haryana/Uttarakhand/Punjab busted several syndicates (newsarenaindia.com).
- **[INFERENCE]** This is strong, current, regionally-specific evidentiary grounding — mule-account cyber fraud is an active, documented problem in exactly the tri-city/tri-state region hosting this hackathon, which materially strengthens PS6's "genuinely important, regionally relevant" case versus a generic global crime-tech pitch.

---

## Answers to the 25 required questions

**1. What real problem is being solved?** Investigators currently analyze telecom CDR/IPDR, bank records, and social media activity in separate tools and manually cross-reference them to build a case — slow, error-prone, and doesn't scale. **[FACT, per PDF explanation text]**

**2. Is it genuinely important?** Yes. **[SOURCE-BACKED]** Mule-account-enabled cyber fraud is large-scale, fast-growing, and multi-domain by nature (a call lures a victim, a mule account receives funds, social media coordinates recruitment) — exactly the fusion PS6 targets, corroborated by the I4C-RBIH MuleHunter.ai initiative and the newsgram.com case study.

**3. India relevance?** High. **[FACT]** I4C, MHA, RBIH, DoT licensing/interception rules, and multiple state police CDR-analysis deployments (Karnataka C5, Andhra AI use-case) show this is an active national policy and procurement priority, not a hypothetical.

**4. Chandigarh/Punjab/Haryana relevance?** High and current — see Section 5's three independently sourced 2026 regional mule-account cases (Chandigarh, Haryana, Punjab). **[FACT]**

**5. Existing solutions?** i2 Analyst's Notebook, Maltego, Palantir-class fusion platforms (general link-analysis category, decades mature); India-specific: C5 CDR Analyzer (Karnataka statewide), LIS, i9, C-trace (commercial CDR/tower-dump tools sold to Indian police); I4C-RBIH MuleHunter.ai (government AI mule-detection); AI4AndhraPolice CDR/IPDR AI use-case. **[FACT/SOURCE-BACKED, Section 4]**

**6. What would a student team actually build?** **[PROPOSED]** A web dashboard ingesting three synthetic CSV/JSON datasets (mock CDR, mock IPDR, PaySim-derived bank transactions, mock social posts), a Python backend doing fuzzy-match entity resolution (phone/account/IP/handle linking) and simple anomaly rules/ML (isolation forest on transaction volume/velocity; rule-based "call then transfer then post" alert), a graph visualization (e.g., via a JS graph library) of linked entities, a basic timeline view, and a canned PDF "intelligence report" export.

**7. What is genuinely novel?** **[INFERENCE]** Not the individual techniques (each is mature) — the plausible novelty is the *specific three-domain fusion UX and correlation logic* (CDR+IPDR+bank+social in one workbench with cross-domain alerting like "call followed by large transfer followed by coordinated posting"), packaged for Indian LE workflows, which is less commonly sold as a single integrated commercial product than the single-domain tools are.

**8. What is NOT novel?** **[FACT]** Link/entity-resolution analysis across structured data sources is a mature enterprise category — i2 Analyst's Notebook has existed 30+ years; Maltego and Palantir are established; India already has multiple commercial CDR-analysis vendors in live police use (C5, LIS, i9, C-trace). Anomaly detection on transaction/call data (isolation forest, graph analytics, fuzzy matching) is standard, well-documented ML, not a research breakthrough.

**9. Can a student team build a convincing prototype?** **[PROPOSED/INFERENCE]** Yes, on synthetic data, for a subset of the 12 features (ingestion, entity resolution, a graph view, a couple of anomaly rules, a timeline, one canned alert scenario) — full 12-feature, production-grade delivery in the timeframe is not realistic.

**10. Can it be demonstrated live during judging?** Yes, if scoped to a scripted synthetic-data walkthrough of 1–2 pre-planted "storylines" — **[PROPOSED]** — see Q25.

**11. What data is required (real-world formats)?** **[SOURCE-BACKED]** CDR: caller/called number, timestamp, duration, cell-tower/LAC ID, call type, IMEI/IMSI. IPDR: source/destination IP, timestamp, port, protocol, session duration, NAT mapping/subscriber ID. Bank statements: account number, transaction timestamp, amount, transaction type (debit/credit/transfer), counterparty account, IFSC/branch. Social media: handle, post timestamp, content metadata, engagement/interaction graph. (Real CDR/IPDR/bank field schemas per DoT circulars, telecom-compliance vendor documentation, and PaySim's published schema.)

**12. Can it be legally obtained/used?** **CRITICAL — NO.** **[FACT/INFERENCE, Section 2]** Real CDR requires Section 5(2) Telegraph Act (historically) / Telecommunications Act 2023 + Lawful Interception Rules 2024 authorization via SP-rank-officer request and competent-authority sanction; IPDR is similarly telecom-operator-custody, DoT-mandated-retention data; bank transaction data is RBI/DPDP-Act protected. **A student hackathon team cannot legally obtain or use real CDR, IPDR, or bank statement data for any person.** This must be stated explicitly and prominently in the team's pitch, and is the defining constraint of this entire track.

**13. Can synthetic/public datasets substitute?** **[FACT/PROPOSED, Section 3]** Yes for banking (PaySim, a real, well-known, purpose-built synthetic dataset) and partially for CDR (Kaggle synthetic telecom-fraud datasets provide a base schema/behavior model); IPDR and social-media layers have no ready-made public dataset found and must be hand-built via a synthetic generator script — feasible but is real week-1 engineering work, not a "download and go" shortcut.

**14. Hardware required (minimal)?** **[PROPOSED]** A single developer laptop (8–16GB RAM) for development; for the live demo, a laptop or small cloud VM is sufficient given synthetic-scale data (thousands, not billions, of records). No specialized hardware needed.

**15. Software required?** **[PROPOSED]** A web framework (e.g., Python/FastAPI or Node/Express) + frontend (React), a relational or graph-capable DB (Postgres, or Neo4j/graph library for relationship modeling), a JS graph-visualization library (e.g., a force-directed graph component), a mapping library for the geospatial view, PDF-report generation library. All open-source/free-tier.

**16. AI/ML required?** **[PROPOSED, naming realistic real approaches]** Fuzzy string/entity matching (e.g., Levenshtein/Jaro-Winkler or a record-linkage library) for cross-domain identifier resolution; Isolation Forest or simple statistical z-score/thresholding for transaction/call anomaly detection; graph analytics (centrality, community detection via NetworkX/Neo4j GDS) for network visualization and hidden-relationship discovery; optionally a lightweight rule engine for the cross-domain "call → transfer → post" alert chaining (full custom GNN training is realistic to *mention as a roadmap item*, not to actually train and validate in this timeframe — **[INFERENCE]**).

**17. APIs/services required?** **[PROPOSED]** None strictly required for a synthetic-data demo; optionally a mapping/geocoding API (e.g., OpenStreetMap/Leaflet, free) for the geospatial view; no real telecom/banking/social-media APIs are usable or appropriate given Section 12's legal constraint.

**18. Approximate prototype cost in INR?** **[PROPOSED]** Near-zero to a few thousand rupees — open-source stack, free-tier cloud hosting (or local demo), free/community-tier graph and mapping libraries, no paid data or API costs since only synthetic data is used. Realistic estimate: ₹0–₅,000 for optional cloud hosting/domain during the pre-hack and finale window.

**19. What can genuinely be built in 1 week?** **[PROPOSED]** A working pipeline for 1–2 data sources (e.g., mock CDR + PaySim bank data), basic entity resolution on a shared identifier (phone/account number), one or two anomaly rules, and a rough graph visualization — a thin vertical slice, not the full 12-feature list.

**20. What can be built by 8 Sep (the finale, ~2 weeks of prep after 25 Aug shortlisting)?** **[PROPOSED]** Adding the third data source (social media mock), a timeline view, a geospatial map view, a basic dashboard with KPI tiles, 1–2 canned cross-domain alert scenarios, and a simple exportable "report" — i.e., a scripted, narrow but working demo covering most of the 12 features shallowly rather than any one feature deeply.

**21. What could fail during a live demo?** **[PROPOSED/INFERENCE]** Entity-resolution false positives/negatives visible live if judges probe edge cases; graph visualization becoming unreadable/cluttered at even moderate node counts; anomaly-detection thresholds tuned to the team's own synthetic data producing implausible-looking alerts under judge-supplied "what if" scenarios; ingestion parser breaking on a judge-provided CSV with different column ordering/formatting; live network/DB latency issues on unfamiliar demo hardware/venue Wi-Fi at the offline finale.

**22. What would judges (police, product) challenge?** **[PROPOSED]** "Where would you actually get CDR/IPDR/bank data lawfully in a real deployment, and how would this integrate with the existing sanction/authorization workflow under the 2024 Lawful Interception Rules?" "How is this different from i2 Analyst's Notebook / the CDR tools already deployed in Karnataka?" "What happens with real telecom data volumes (millions of CDR records per case) versus your demo's synthetic thousands?" "How do you handle chain-of-custody/evidentiary admissibility (Section 65B Evidence Act) for anything your platform outputs?" "What's your false-positive rate and how would an investigator not drown in noise?"

**23. What claims should the team NOT make?** **[PROPOSED]** Must not imply real CDR/IPDR/bank/social data was ingested, tested, or validated — only synthetic/mock data was used, and this should be stated upfront rather than discovered under questioning. Must not claim the anomaly-detection accuracy/false-positive rates are validated against real investigative outcomes. Must not claim legal/regulatory approval or that the platform is "court-ready" — it is a prototype, not a certified evidentiary tool. Must not overstate novelty versus i2/Maltego/existing Indian CDR-analysis vendors.

**24. Strongest genuine differentiator?** **[PROPOSED]** The specific three-domain (telecom + banking + social) correlation and cross-domain alerting logic (e.g., "call → large transfer → coordinated social post" pattern chaining) packaged as one investigator workbench — most existing tools cover one or two domains, not this specific triad in one UI, even though each underlying technique is individually mature.

**25. Strongest live-demo scenario using synthetic data?** **[PROPOSED]** A scripted "digital-arrest / investment-scam mule network" storyline mirroring the verified newsgram.com case and the region's real mule-account pattern: synthetic victim receives a call → synthetic funds move rapidly through 2–3 mule accounts → a synthetic social media handle coordinating recruitment posts around the same timestamps → the platform auto-generates a single cross-domain alert and a relationship graph tying phone number, IMEI, bank accounts, and handle together, closing with a one-click exportable "intelligence report." This directly demonstrates the platform's one genuine differentiator (Q24) using a scenario grounded in a verified real regional pattern (Section 5), while staying honestly within the synthetic-data disclosure required by Q23.

---

## Scorecard (1–10, hackathon-winability)

| Category | Score | Justification |
|---|---|---|
| Problem significance | 8 | Verified, current, regionally-documented mule-account/cyber-fraud crisis; real government initiatives (I4C-RBIH) underway. |
| Innovation | 4 | Individual techniques (link analysis, anomaly detection) are decades-mature; only the specific 3-domain fusion packaging is arguably new. |
| Technical depth | 6 | Requires real (if standard) skills — fuzzy entity resolution, graph analytics, anomaly detection, multi-format ingestion; not trivial CRUD, not research-frontier either. |
| Prototype feasibility | 6 | Feasible on synthetic data for a scoped subset of features; the full 12-feature spec is not realistic in-timeframe. |
| Demo impact | 7 | Graph visualizations and cross-domain "aha" alerts demo well if scripted carefully. |
| Government usefulness | 6 | Directionally useful, but competes with already-deployed commercial CDR tools (C5, LIS, i9) and mature enterprise platforms (i2, Palantir-class); incremental, not category-creating. |
| Social impact | 7 | Cyber fraud/mule accounts cause real, large financial harm to citizens regionally and nationally. |
| Scalability | 4 | Architecture is plausible, but real telecom-scale data volumes, format heterogeneity across operators, and integration into LE legal workflows are non-trivial engineering the prototype won't demonstrate. |
| Cost | 9 | Near-zero cost to prototype using open-source tools and synthetic/public data. |
| Data availability | **2** | The defining weakness: real CDR/IPDR/bank data is legally unobtainable by a student team (Section 2); usable synthetic substitutes exist but are partial and require build effort (Section 3). |
| Implementation risk (10=lowest risk) | 4 | Multi-source ingestion + entity resolution + graph + anomaly detection + geospatial + reporting is a lot of surface area for the timeline; risk of shallow, buggy coverage across all 12 features rather than a solid narrow slice. |
| Judge understandability | 8 | Concept (link crime across phone/bank/social) is intuitive to explain to police judges even without technical depth. |
| Defensibility during Q&A | 4 | The "where would you get real data lawfully" and "how is this different from i2/Maltego/C5" questions are hard to answer well without a candid, well-rehearsed synthetic-data and differentiation narrative. |
| Existing-competition differentiation | 3 | Category is genuinely crowded (Section 4) — differentiation rests on integration packaging, not fundamentally new capability. |
| Time-to-prototype feasibility | 5 | Doable as a scoped MVP by finale; full spec is not. |
| Reliability during live demo | 5 | Scripted synthetic scenarios can be made reliable; anything judge-improvised (new CSV, new query) risks exposing fragile parsing/matching logic. |

---

## Feasibility verdict: **YELLOW**

**[PROPOSED — this agent's overall judgment, synthesizing the evidence above]**

PS6 is a legitimate, well-grounded, regionally-relevant problem statement backed by real government initiatives (I4C-RBIH/MuleHunter.ai), real documented regional mule-account cases (Chandigarh, Punjab, Haryana, 2026), and a real prior-hackathon precedent (SIH 2020 BPRD problem RK_312) proving student teams have tackled slices of this exact problem before. It is not a fabricated or fantastical brief.

However, three structural risks keep it out of GREEN:

1. **Data availability is the central, unavoidable constraint** (score 2/10): real CDR, IPDR, and bank statement data are protected under the Telecommunications Act 2023 / 2024 Lawful Interception Rules and RBI/DPDP banking-privacy norms, and are legally inaccessible to a student team under any circumstance. Every team on this track must build entirely on synthetic/mock data (PaySim for banking is a solid, real substitute; CDR/IPDR/social synthetic data must be largely hand-built) and must be transparent about this in the pitch, or risk a credibility-destroying challenge from police judges in Q&A.
2. **Crowded competitive category**: i2 Analyst's Notebook, Maltego, Palantir-class platforms, and multiple India-specific commercial CDR-analysis tools already deployed in state police use (Karnataka's C5, LIS, i9, C-trace) mean the "novel enterprise investigative platform" claim is weak; genuine differentiation is narrow (the specific 3-domain fusion + cross-domain alert chaining), not category-defining.
3. **Feature-scope risk**: the brief lists 12 substantial feature areas; a realistic team can credibly deliver a narrow, well-scripted vertical slice (3–5 features, one strong demo storyline) by the finale, but attempting broad shallow coverage of all 12 risks a fragile, unconvincing demo.

This is **not RED** because the problem is real, government-relevant, regionally well-evidenced, technically buildable at prototype scope with existing synthetic data (PaySim) and buildable-with-effort synthetic generators (CDR/IPDR/social), and has direct hackathon precedent proving feasibility. It is **not GREEN** because the central resource (real investigative data) is categorically unobtainable, the competitive landscape is mature and crowded, and the honest "we used only synthetic data, here's how a real deployment would legally source it" narrative is a harder sell to police judges than tracks with fewer regulatory/data-access blockers. Teams choosing PS6 should scope tightly, lead with the regional mule-account narrative (Section 5) and the I4C-RBIH precedent, disclose the synthetic-data approach proactively and confidently rather than letting judges surface it, and target one polished cross-domain demo scenario over broad shallow feature coverage.
