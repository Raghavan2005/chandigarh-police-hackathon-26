# PS5 (CFTA) — Independent Evidence-Based Evaluation
## "A Platform to Track Illicit Crypto Flow, Flag Fraudulent Accounts, and Analyze Suspicious Financial Transactions"
### Chandigarh Police Hackathon'26 — Track 5

Report date: 2026-08-18 | Deadline for proposal submission: 2026-08-20 (2 days from today)

---

## 0. Verification of the Track 5 PDF and its citations

The problem statement, objectives, expected features, and reference list were read verbatim from `Track 5 Documentation.pdf` in `C:\Users\User\Downloads\CH26`. The document itself labels this "Track 5"; the brochure's official short code is CFTA. All six references were independently checked against live web sources.

| # | Reference in PDF | Verification result |
|---|---|---|
| [1] | DOJ/USAO-EDPA, "Two Charged in Connection With Cryptocurrency Money Laundering Service That Allegedly Laundered Over $389 Million," Jun 11 2026 | **FACT — confirmed real and correctly dated.** Announced 11 Jun 2026 by the U.S. Attorney's Office, Eastern District of Pennsylvania. Two men (Ruslan Tkachuk, 37, and Alexander Ledenev, 25, both of Batumi, Georgia) were charged over "AudiA6," a crypto money-laundering service alleged to have laundered ~10,333 BTC (~$389.7M at transaction time) since 2021, discovered via blockchain analysis. Corroborated independently by the U.S. Secret Service newsroom and Oversight.gov mirrors of the same DOJ release. |
| [2] | FATF, "Virtual Assets: Red Flag Indicators of Money Laundering and Terrorist Financing," Sep 2020 | **FACT — confirmed real.** Published 14 Sept 2020 by FATF, based on 100+ real case studies; covers red flags in transactions, transaction patterns, anonymity-enhancing tech/services (mixers, P2P exchanges, privacy coins), sender/recipient profiles, source-of-wealth/funds anomalies, and geographical risk. Publicly downloadable PDF confirmed at fatf-gafi.org. |
| [3] | Chainalysis, "The 2026 Crypto Crime Report," 2026 | **FACT — confirmed real, and the cited figures are accurate as published.** $154B received by illicit addresses in 2025 (a 162% YoY increase) and the $17B fraud/impersonation-scam estimate are both genuine, current Chainalysis figures, corroborated by CoinDesk, Yahoo Finance and multiple crypto-trade press covering the same report in Jan 2026. |
| [4] | Meiklejohn et al., "A Fistful of Bitcoins," ACM IMC 2013 | **FACT — confirmed real**, foundational paper on Bitcoin clustering heuristics (common-input-ownership + change-address heuristics), doi 10.1145/2504730.2504747. |
| [5] | Reid & Harrigan, "An Analysis of Anonymity in the Bitcoin System," Security and Privacy in Social Networks (Springer, 2013) | **FACT — confirmed real**, early foundational transaction-graph/address-clustering analysis of Bitcoin, doi 10.1007/978-1-4614-4139-7_10. |
| [6] | Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008 | **FACT — confirmed real**, the original Bitcoin whitepaper, hosted at bitcoin.org/bitcoin.pdf. |

**Important nuance on the headline stat (do not let the team over-claim it):** Chainalysis itself frames "$154B received by illicit addresses" as a **lower-bound estimate that will be revised upward** as more addresses get attributed over time (this is true of every past Chainalysis annual report — prior-year figures are always revised up substantially in the following year's report), and the report notes the illicit share of *all* attributed on-chain volume remains **below 1%** of total transaction volume. A large share of the 162% YoY jump is driven by a 694% surge in value received by **sanctioned entities** (e.g., a ruble-backed stablecoin, A7A5, moving $93.3B) — not a proportional 162% rise in "typical" laundering or retail fraud. The $17B fraud/impersonation figure is separately confirmed, with a genuinely well-evidenced trend: impersonation scams up ~1,400% YoY, AI-enabled scams ~4.5x more profitable than non-AI scams, and average scam payment size rising from $782 (2024) to $2,764 (2025). Teams should cite the $154B/$17B figures as attributed to Chainalysis, not as an objective ground truth — Chainalysis's own methodology admits under-counting and revision.

**Verdict on the reference list overall:** Unusually solid for a hackathon PDF — every citation is a real, correctly-dated, verifiable, and (for [3]) a currently-accurate statistic. No fabricated or misattributed references found. This is the strongest citation quality among typical hackathon problem statements.

---

## 1. What real problem is being solved?
**FACT-anchored problem:** cryptocurrency-enabled money laundering and fraud are real, large, and growing (see §0). Compliance teams at exchanges/banks/regulators must trace pseudonymous on-chain fund flows, correlate them with off-chain identity/KYC and banking data, and flag suspicious activity fast enough to freeze funds before they're laundered out through mixers, cross-chain bridges, or cashed out at exchanges. This is a genuine, well-documented workflow gap in real institutions today (FACT, evidenced by the existence of an entire commercial industry — Chainalysis, Elliptic, TRM Labs — built to solve exactly this).

## 2. Is it genuinely important?
Yes — **SOURCE-BACKED OBSERVATION.** $154B (Chainalysis lower-bound estimate) in illicit crypto flows and $17B in fraud/impersonation losses in 2025 alone represent real, material harm; the DOJ AudiA6 case ($389M laundered via a single service) shows this is not abstract — it's actively prosecuted. The blockchain-analytics compliance market itself is estimated at $2.5B (2025) growing toward $9.9B by 2032, confirming institutional demand is real and monetizable (SOURCE-BACKED, from TradersUnion/Slashdot market-comparison sources — treat market-size figures as industry-analyst estimates, not audited data).

## 3. India relevance
**FACT/SOURCE-BACKED:** India's crypto regulatory stance remains a real, live, and codified policy area — not "no regulation":
- A flat 30% tax + 4% cess on virtual digital asset (VDA) gains and 1% TDS on VDA transfers has applied since 2022 and remains unchanged in 2026.
- Since the March 2023 PMLA notification, Virtual Digital Asset Service Providers (VDASPs) — exchanges, custodial wallets — must register with **FIU-IND** and follow AML/CFT obligations. As of FY2024-25, FIU-IND's annual report lists **49 registered VDASPs (45 domestic, 4 offshore serving Indian users)**.
- RBI does not regulate crypto directly (it maintains its own CBDC/Digital Rupee project instead) but continues to flag systemic risk; **FIU-IND is the operative AML enforcement body a platform like PS5 would need to interoperate with (STR filing, sanctions/PEP lists).**
- From 1 April 2026, stricter VDASP reporting standards took effect with daily fines for inaccurate reporting; cross-border data sharing under OECD's Crypto-Asset Reporting Framework (CARF) is due to begin 1 April 2027.
- This means a real "lawful on-chain + off-chain data" workflow (as the PS5 brief specifies) has a concrete Indian regulatory target: FIU-IND STR formats, PMLA obligations, and the VDASP registry — a student team can legitimately model their "Reporting & Evidence Management" feature against FIU-IND's actual STR/reporting requirements rather than inventing one.

## 4. Chandigarh/Punjab/Haryana relevance
**FACT (regional cases found via search), directly relevant:**
- A Chandigarh (Sector 45-D) resident lost ₹6.58 lakh in a Telegram-based crypto investment scam, FIR at the Chandigarh Cyber Crime Police Station (Tribune India).
- CBI searches across 11 locations in Delhi and Haryana tied to a crypto-fraud ring impersonating government officials for fake "tech support" scams paid in crypto.
- Punjab Police: 956 FIRs across 29 dedicated cybercrime police stations (May 2025–Jun 2026), 729 arrests — shows an active, resourced regional cybercrime enforcement apparatus that a crypto-tracing tool would plug into.
- Haryana: 1,41,685 cybercrime complaints in 2025 (+8.5% YoY) — Haryana Police also reported strong fund-freezing/recovery performance region-wide (Tribune).
This gives the team genuine local-relevance talking points: crypto fraud is not a hypothetical for this region — it is an active FIR-generating problem for the exact host force (Chandigarh Police) running the hackathon.

## 5. What existing solutions already exist
**FACT.** This is a mature, heavily commercialized space:
- **Chainalysis** — market leader, 1,500+ institutional/government clients, used by regulators/banks/law-enforcement for compliance and court-admissible tracing; publisher of the very Crypto Crime Report cited in the PS.
- **Elliptic** — pioneer since 2013, 550+ asset coverage, publisher of the well-known Elliptic Bitcoin dataset (see §13).
- **TRM Labs** — founded 2018, reached ~$1B unicorn valuation, AI-driven threat intel and real-time cross-chain screening.
- **Crystal Blockchain** (Bitfury) — real-time tracking, AI risk scoring, cloud/on-prem deployment.
- **Open-source/academic alternative:** **GraphSense** — a genuinely open-source (MIT-licensed), Spark/Cassandra-backed cryptoasset analytics platform (Bitcoin, Bitcoin Cash, Litecoin, Zcash, Ethereum, Tron) built by AIT/Complexity Science Hub, offering REST APIs and address/entity clustering — this is the single most useful prior-art reference for a student team, since its clustering heuristics and architecture are publicly documented (arXiv:2102.13613) and reusable.
- **RBI's MuleHunter.AI** — a directly relevant *Indian government precedent* (though for bank mule accounts, not crypto): an in-house RBI ML tool live in 26+ banks, built on 19 behavioral features, reportedly ~95% accuracy at Canara Bank. This is a strong domestic analogue the team can cite to show government appetite for exactly this class of tool, and a reason to frame PS5 as "MuleHunter.AI, but for crypto wallets, aimed at Indian law enforcement."

## 6. What would a student team actually build?
Realistically: a web dashboard that (a) ingests a small set of seed wallet addresses, (b) pulls their transaction graphs from free-tier public blockchain APIs (Etherscan/Blockchain.com/similar), (c) applies known clustering heuristics (common-input-ownership, change-address heuristic from Meiklejohn/Reid-Harrigan) plus simple graph algorithms to group addresses into likely-entities, (d) runs rule-based + light ML anomaly detection (rapid layering, structuring, mixer-interaction flags, sanctioned-address hits) against a public labeled dataset (Elliptic) for training/validation, (e) visualizes the transaction graph and risk scores, (f) generates a mock "STR-style" PDF report, and (g) demos live lookups on real public wallet addresses (e.g., known sanctioned/hack-linked addresses) plus a rehearsed "known bad" example for reliability.

## 7. What is genuinely novel — honest assessment
Be candid: **there is very limited room to out-innovate Chainalysis/Elliptic/TRM Labs on the core tracing technology in a hackathon.** These firms have years of proprietary attribution-tag databases (linking addresses to real-world exchanges/entities), petabytes of historical data, in-house intelligence teams, and law-enforcement partnerships a student team cannot replicate. Genuine novelty is realistically limited to: (a) **India-specific framing** — mapping outputs directly to FIU-IND STR formats and PMLA obligations, something the multinational incumbents do not localize deeply for Indian regional police; (b) **explainability-first UX** — incumbents are often black-box/subscription APIs; a transparent, rule-traceable "why was this flagged" system is a legitimate differentiator for judges who value evidentiary defensibility; (c) **low-cost/open accessibility** for smaller state/city police forces that cannot afford enterprise licenses (see §24); (d) combining crypto-graph analysis with India's mule-account ecosystem (bridging RBI's MuleHunter.AI bank-side detection with wallet-side detection) — this specific combination does not appear to have a named public precedent in current sources found.

## 8. What is NOT novel
The core techniques — address clustering via common-input-ownership heuristic, transaction-graph visualization, anomaly/rule-based flagging, "risk score" dashboards — are all well-published (Meiklejohn 2013, Reid & Harrigan 2013) and already productized (Chainalysis Reactor, Elliptic Investigator, TRM Forensics, GraphSense). FATF's red-flag indicator list is public and already baked into every commercial AML product. A "wallet risk dashboard with graph visualization" is, honestly, a fairly standard hackathon/portfolio project pattern by 2026 — judges familiar with the space will recognize this immediately, so execution quality and the India-specific/explainability angle matter far more than the base concept.

## 9. Can a student team build a convincing prototype?
**Yes — SOURCE-BACKED, this is realistic.** Public blockchain data is free and legally accessible (§12), the Elliptic Kaggle dataset provides ready-made labeled ground truth for ML validation (§13), and open-source reference implementations (GraphSense, publicly documented clustering heuristics) exist to build on rather than invent from scratch. A working, demoable prototype combining real-time explorer lookups + a pre-trained anomaly classifier + a graph UI is very achievable in the hackathon's timeframe.

## 10. Can it be demonstrated live during judging?
**Yes — genuinely one of the more demo-friendly tracks**, as the task brief anticipated. Unlike darknet-forum or CDR-record tracks, public blockchain explorer data is queryable live, on-stage, with a real wallet address (e.g., a publicly known scam/hack address, or a sanctioned address from OFAC's SDN list) and the audience can verify results against a public block explorer in real time — a strong trust-building demo mechanic other tracks cannot easily match.

## 11. What data is required?
On-chain: address balances, transaction history, input/output graphs (Bitcoin/Ethereum). Off-chain (aspirational only, per PS's own "where legally accessible" caveat): exchange KYC records, bank transaction records, STRs, sanctions lists. Labeled training data: illicit/licit wallet or transaction labels for supervised ML.

## 12. Can it be legally obtained/used?
**This is a genuine and important advantage of this track.** Public blockchain data (every transaction on Bitcoin, Ethereum, etc.) is, by design, permanently public and legal to query/analyze — no consent, license, or subpoena required (FACT — this is inherent to how public blockchains work). Publicly available sanctions lists (OFAC SDN, UN sanctions lists) and the FATF red-flag document are also freely usable.
**What is NOT legally accessible to a student team and must be explicitly excluded from real claims:** real exchange KYC/customer identity data, real bank transaction records, real STRs (these are confidential regulatory filings under PMLA — unauthorized possession/disclosure is itself an offense), and real sanctions-screening vendor feeds (commercial, licensed). Any "off-chain correlation" feature in the prototype must be built on synthetic/mock off-chain data, clearly labeled as such — this is the single most important legal/ethical guardrail for this track.

## 13. Can synthetic/public datasets substitute?
**Yes — FACT, verified.** The **Elliptic Bitcoin dataset** (publicly available, including on Kaggle) is real: 203,769 Bitcoin transaction nodes, 234,355 edges, 166 anonymized features per node, labeled licit (21%/42,019)/illicit (2%/4,545)/unknown (77%/157,205), spanning 49 two-week time steps. Released by Elliptic (the commercial company) specifically to support AML research — an ideal, citable, real ground-truth dataset for training/validating a demo classifier. Extensions exist too (Elliptic++ node+actor dataset, referenced in academic literature via arXiv/PyG). This directly answers the "how did you get training data legally" judge question (§22).

## 14. What hardware is required?
Minimal — **FACT, pure software track.** A laptop is sufficient for development; for the demo, only internet connectivity to reach public blockchain-explorer APIs and a pre-cached/pre-trained model as fallback are needed. No specialized hardware, GPUs (a small one may help but isn't required for classical ML/GNN training on the Elliptic dataset's scale), or field equipment.

## 15. What software is required?
Backend (Python/Node), a graph database or graph library (Neo4j, NetworkX, or GraphSense-style REST layer), a frontend dashboard framework, a lightweight ML/GNN library (scikit-learn, PyTorch Geometric — the Elliptic dataset has ready PyG loaders per Kumo.ai's guide), and API clients for blockchain explorers.

## 16. What AI/ML is required?
Realistic, achievable approaches: (a) classical supervised classifiers (Random Forest/XGBoost) on Elliptic's 166 engineered features — this is the well-trodden benchmark approach in published work; (b) **Graph Neural Networks** (GCN/GraphSAGE via PyTorch Geometric) trained on the Elliptic transaction graph — multiple published papers (GuiltyWalker, Inspection-L, arXiv:2306.06108) already demonstrate this is tractable at hackathon scale; (c) unsupervised anomaly detection (isolation forest, clustering) for flagging structuring/rapid-layering patterns not covered by labels; (d) rule-based FATF red-flag encoding (deterministic, explainable) layered on top of ML scores — combining both is what gives the "explainable risk indicators" objective in the PS credibility.

## 17. What APIs/services are required?
Free/low-cost, real options confirmed: **Etherscan API** (free tier: 5 req/sec, 100,000 req/day, though a July-2026 policy change trimmed some free-tier endpoint limits — verify current terms before the demo); **Blockchain.com** explorer/Data API (free, rate-limited ~1 query/10 sec on the plain-text API, up to 10 req/sec on the Pay API); **Blockchair, Blockchain.info, mempool.space** and similar public explorers as alternates/fallbacks; **GraphSense's own public REST API/instance** as an open-source reference; OFAC SDN list (free, public) for sanctions-hit demo scenarios.

## 18. Approximate prototype cost in INR
Near-zero for the hackathon build itself: free-tier blockchain APIs, free Elliptic dataset, open-source software stack, laptops the team already owns. Realistic incidental costs: cloud hosting/compute for the demo deployment (~₹0–3,000 using free tiers of Render/Vercel/Railway or a student cloud credit), optional paid API tier if free-tier limits are hit during heavy demo testing (~₹0–5,000 one-off). Total prototype cost: **roughly ₹0–5,000**, i.e., effectively free — a genuine cost advantage versus other tracks needing hardware/sensors.

## 19. What can genuinely be built in 1 week?
A working pipeline: query a handful of real wallet addresses via a free explorer API → build/display a transaction graph → run the pretrained Elliptic-based classifier to color-code risk → show a couple of FATF-style rule flags (e.g., "interacted with known mixer address," "rapid fan-out pattern") → basic dashboard UI. This is realistic in a week given all components rely on existing public building blocks.

## 20. What can be built by 8 Sep (finale)?
With ~2 weeks pre-hack prep (25 Aug–7 Sep) plus the 24-hour final: a more polished dashboard (case management, alert queue, search-by-hash/address, exportable "evidence report" PDF), a better-trained GNN model with an explainability layer (e.g., feature-importance or subgraph highlighting for each flag), a small mock "off-chain correlation" demo layer using synthetic bank/STR data clearly labeled as illustrative, and 2-3 rehearsed live-lookup demo scenarios (a known scam address, a sanctioned address, a clean address) to show range without depending on unpredictable live results.

## 21. What could fail during a live demo?
Real risks: blockchain explorer API rate-limiting or downtime mid-demo (mitigate: cache responses, have a local fallback dataset); no/poor venue internet (mitigate: pre-recorded fallback video + locally cached demo data, exactly as the brochure's own submission format — PPT + video — anticipates); a chosen "real" wallet address returning an unexpectedly boring/empty result live (mitigate: pre-verify demo addresses well in advance and keep 2-3 backups); GNN/ML model producing a confusing or wrong-looking score live (mitigate: lead with the deterministic rule-based flags for reliability, treat ML score as a secondary layer); API key/quota exhaustion from over-testing right before the demo (mitigate: dedicated demo-only API key untouched until show time).

## 22. What would judges challenge?
- "How is this different from Chainalysis/Elliptic/TRM Labs, who already do this at scale?" — the team needs a rehearsed, honest answer (§7/§24), not a claim of superior tracing accuracy.
- "Where did you get this data, and is it legal?" — team should confidently cite: public blockchain data is legal by design (§12), Elliptic Kaggle dataset for labeled training (§13), no real KYC/STR/bank data used, off-chain correlation is illustrated with clearly-marked synthetic data only.
- "Can your tool actually identify who is behind a wallet?" — correct, defensible answer is **no** — de-anonymization to a real identity legally requires exchange KYC records obtained via subpoena/MLAT, which the team does not and should not claim to have (§23).
- "What happens with false positives — could this wrongly flag an innocent person/account?" — team should show they understand explainability and human-in-the-loop review is required before any enforcement action.
- "Is this actually usable by Chandigarh Police day one, or is it a toy demo?" — be honest that production deployment requires FIU-IND/legal integration, formal data-sharing agreements with exchanges, and much larger attribution databases than a hackathon team can build — position it as a decision-support/triage tool for smaller agencies, not a Chainalysis replacement.

## 23. What claims should the team NOT make
- Do **not** claim the tool can de-anonymize real-world identities behind wallet addresses without lawful exchange/subpoena access — this is legally and technically false for a hackathon prototype.
- Do **not** claim access to or use of real STRs, real bank records, or real exchange KYC data — these are confidential/regulated; only synthetic/mock versions should be shown, clearly labeled.
- Do **not** claim detection accuracy figures without citing the exact dataset/methodology (e.g., don't say "95% accurate at catching launderers" without specifying it's against the Elliptic benchmark's illicit/licit subset, which itself excludes 77% "unknown" transactions).
- Do **not** claim the $154B/$17B Chainalysis figures as universally agreed-upon ground truth — attribute them explicitly to Chainalysis and note they are lower-bound/revisable estimates (§0).
- Do **not** claim the platform is "as good as" or "better than" Chainalysis/Elliptic on live tracing — judges with any domain awareness will see through this immediately and it damages credibility more than admitting the honest scope.

## 24. Strongest genuine differentiator
**Cost/accessibility gap for under-resourced agencies — this appears to be a real, evidence-supported gap.** Chainalysis/Elliptic/TRM Labs are enterprise-licensed products (implied high per-seat/subscription cost consistent with their $1B+ valuations and 1,500+ institutional-client, primarily national-regulator/large-bank customer base) — there is no public evidence found that smaller city/state police cybercrime cells (e.g., Chandigarh's, Punjab's 29 cybercrime stations, or Haryana's) currently have direct access to these enterprise tools; India's own domestic response so far (I4C's NCTAU advisories, RBI's MuleHunter.AI for bank mule accounts) shows government appetite for **home-grown, lower-cost, India-context tools** rather than enterprise foreign licenses. A genuinely differentiated pitch: "an FIU-IND/PMLA-aligned, explainable, low-cost triage tool built specifically for Indian state/city police cybercrime cells who cannot afford Chainalysis/Elliptic licenses" — combined with an explainability-first design (rule-traceable flags, not black-box scores) that is directly useful as court-defensible evidence. This is a defensible, honest differentiator, not a hype claim.

## 25. Strongest live-demo scenario
Load a **publicly known, verifiable illicit wallet address** (e.g., an address linked to a well-documented hack, scam, or a real OFAC-sanctioned address — many are public knowledge from past incidents) into the dashboard live, show the transaction graph auto-expanding to reveal a mixer-interaction or rapid fund-splitting pattern, have the rule-based FATF red-flag engine fire a specific, named indicator (e.g., "rapid layering: 12 hops in 40 minutes" or "counterparty exposure to sanctioned entity"), and generate a one-click structured "evidence report" PDF — closing with a comparison to a clean, ordinary wallet address showing no flags, to demonstrate the tool discriminates rather than over-flagging everything. This showcases live-queryable public data (audience can verify independently), the explainability layer, and the reporting feature in under 3 minutes.

---

## Score Card (1–10 per category)

| Category | Score | Justification |
|---|---|---|
| Problem significance | 9 | Verified $154B/$17B Chainalysis figures, real DOJ prosecutions, real regional FIRs — genuinely large, well-documented problem. |
| Innovation | 4 | Core techniques (clustering, graph anomaly detection, red-flag rules) are well-published and already commercialized; novelty is mainly in framing/accessibility, not technique. |
| Technical depth | 6 | GNNs on a real labeled graph dataset plus rule engines is legitimately technical, but well within published-recipe territory (arXiv papers exist showing the exact approach). |
| Prototype feasibility | 8 | Free data, free labeled dataset, open-source reference implementations (GraphSense) make a working prototype realistic in the timeframe. |
| Demo impact | 8 | Live, audience-verifiable public blockchain lookups are a strong, credible demo mechanic — better than most tracks. |
| Government usefulness | 6 | Real analogue exists (MuleHunter.AI) showing government appetite, but production use requires FIU-IND/legal data-sharing integration far beyond hackathon scope. |
| Social impact | 7 | Crypto fraud demonstrably harms ordinary citizens regionally (Chandigarh/Punjab/Haryana cases confirmed); tool could plausibly aid real investigations if matured. |
| Scalability | 5 | Architecturally scalable in principle (GraphSense proves it), but a hackathon team won't build production-grade multi-chain ingestion at scale; this is aspirational. |
| Cost | 9 | Near-zero build cost (~₹0–5,000) — free data, free APIs, free datasets, no hardware. |
| Data availability | 9 | Genuinely strong: legal public blockchain data + Elliptic labeled dataset + public FATF/sanctions lists — one of the best-resourced tracks for legitimate data. |
| Implementation risk (10=lowest) | 7 | Moderate — mostly software integration risk, some API rate-limit/downtime risk, but no exotic hardware/dark-web/legal-access blockers. |
| Judge understandability | 7 | "Track illicit crypto flows" is intuitive, though judges may need the team to clearly explain what's real vs. synthetic data. |
| Defensibility during Q&A | 5 | Vulnerable to the obvious "how is this different from Chainalysis" and "is this legal/real data" questions — defensible only with careful, honest framing (see §22–23). |
| Existing-competition differentiation | 3 | Weakest score — multi-billion-dollar, well-funded, deeply established commercial incumbents dominate this exact space; genuine differentiation is narrow (cost/accessibility/India-focus). |
| Time-to-prototype feasibility | 8 | Free-tier APIs + public dataset + open-source references mean a demoable MVP is achievable within a week and refinable by 8 Sep. |
| Reliability during live demo | 6 | Public API dependency introduces some live-demo risk (rate limits/downtime/venue internet), mitigated by caching and rehearsed backup scenarios. |

**Average: ~6.7/16 categories** — a track with strong fundamentals (data, cost, demo-ability, problem significance) undercut mainly by weak differentiation against entrenched, extremely well-funded commercial competitors and moderate Q&A defensibility risk.

---

## Overall Feasibility Verdict: **YELLOW**

**Rationale:**
- **GREEN factors:** Data availability is genuinely excellent for a hackathon (legal, free, public blockchain data + a real labeled dataset — the Elliptic dataset — removes the "where do we even get training data" problem that plagues many other tracks). Cost is near-zero. The track is unusually demo-friendly since results can be verified live against public block explorers. All six PDF citations verified as real and (mostly) accurately represented — a well-researched problem statement, reducing "misleading brief" risk.
- **YELLOW/RED factors:** This is arguably the single most commercially saturated problem space among the six tracks — Chainalysis, Elliptic, TRM Labs, and Crystal Blockchain are multi-billion-dollar-valued, deeply entrenched incumbents with proprietary attribution databases no student team can approximate; judges with any due-diligence awareness will ask the differentiation question directly, and a team without a rehearsed, honest, narrowly-scoped answer (cost/accessibility/India-focus/explainability, not "better tracing") will struggle in Q&A. Regulatory/legal risk is low for the *public on-chain* portion but real for the *off-chain* portion — the PS explicitly requires "lawful" sources, and a team that (even accidentally) implies access to real KYC/STR/bank data would face a serious credibility (and potentially legal) problem; this must be actively managed, not left implicit. Live-demo reliability depends on third-party free-tier API uptime/rate limits, a real but manageable risk with caching/fallback preparation.

**Bottom line:** PS5 is a legitimately buildable, well-evidenced, low-cost, highly demoable track — one of the better-resourced tracks for a student team on the data/cost/feasibility axes — but it is also the track most exposed to the "incumbent product already does this better, at scale, with real government contracts" challenge. Winning requires the team to explicitly *not* compete on raw tracing power and instead lean hard into the honest, defensible differentiators: India/FIU-IND-specific workflow alignment, explainability for evidentiary use, and low-cost accessibility for under-resourced state/city police forces — a genuine and evidence-supported gap (§24) — rather than positioning the project as "we built Chainalysis in 24 hours."
