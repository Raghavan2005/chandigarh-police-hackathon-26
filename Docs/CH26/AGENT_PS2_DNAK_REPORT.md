# PS2 (DNAK) — Independent Evidence-Based Evaluation
## "A Rapid DNA-Based Spot Detection Kit for Bovine/Animal Samples"
### Chandigarh Police Hackathon'26 — Track 2

Prepared: 2026-08-18. Verified against `Track 2 Documentation.pdf` (read directly, verbatim quotes below) and external web research. Deadline for pitch-deck submission is **20 Aug 2026 — 2 days from today**.

---

## 0. Verbatim source confirmation

The PDF text was read directly and matches the brief given almost word-for-word, including the 10 numbered "Expected Features" and the three references. One important structural fact confirmed by reading **Track 1's** PDF alongside Track 2's: Track 1 (synthetic-drug spot kit) carries an **explicit, bolded safety clause**:

> "⚠️ Safety Note for Demonstration: Under no circumstances are real illegal substances or hazardous reagents permitted at the venue. Teams must use safe, harmless household items (e.g., pH strips, food coloring, baking soda) to simulate their prototype's functionality during the hackathon pitch."

**Track 2's PDF contains no equivalent clause anywhere** — no mention of biosafety, biohazard handling, live-sample restrictions, or simulation requirements. This is a **FACT** (confirmed by direct read of both PDFs) and is the single most consequential open question for this track (see §13, §21, Verdict).

---

## 1–4. Problem framing

**1. What real problem is being solved?**
Species identification/authentication of meat and animal-derived products at the point of sale/inspection, where the only current gold-standard method (real-time PCR / Sanger or NGS sequencing) requires a certified lab, trained molecular biologists, and hours-to-days turnaround. PS2 asks for a field-usable, DNA-based (not just protein/antibody-based) rapid test.

**2. Is it genuinely important?**
SOURCE-BACKED OBSERVATION: yes, in three overlapping ways — (a) food-safety/consumer-fraud (mislabeled/adulterated meat), (b) halal/religious-compliance certification (porcine contamination is a serious trust breach for halal-certified products), and (c) law-enforcement/forensic use in cattle-slaughter-law enforcement (see §4). ICAR-NMRI's own laboratory (verified below) explicitly frames its work as "food fraud investigation," confirming this is an active, recognized problem in India, not a hypothetical one.

**3. India relevance?**
FACT: ICAR-National Meat Research Institute (Hyderabad) operates an NABL-accredited (ISO/IEC 17025:2017) Meat Species Identification Laboratory (MSIL), officially recognized by FSSAI as the **National Referral Laboratory for meat and meat products** via Gazette Notification. MSIL has validated assays for beef, buffalo, mutton, chevon, pig, horse, camel, yak, Mithun, chicken, turkey, duck, wildlife-meat species, and Halal (absence-of-porcine-DNA) testing, and has processed 380+ samples under NABL scope for regulatory agencies/states. [Source: icar.org.in, nmri.res.in/page/accreditation] This directly validates the PDF's reference [1] and shows real institutional demand this kit could theoretically extend the reach of.

**4. Chandigarh/Punjab/Haryana relevance — fact vs inference:**
- **FACT**: Punjab has the Punjab Prohibition of Cow Slaughter Act, 1955, which criminalizes cow slaughter/beef sale/possession, with penalties reportedly up to 10 years. Haryana has the Haryana Gauvansh Sanrakshan and Gausamvardhan Act, 2015, with minimum 3–5 years rigorous imprisonment for beef sale. [Sources: opindia.com, verdictum.in, CJP.org.in]
- **FACT — directly on point**: In July 2025/2026, a man ("Noor Mohammad") was arrested in **Chandigarh** for carrying meat without proof of species; a **forensic report identified the seized meat as "Bos Indicus" (bull/ox)**, and Section 8 of the Punjab Prohibition of Cow Slaughter Act, 1955 was invoked; the Punjab & Haryana High Court denied anticipatory bail, requiring custodial interrogation to trace the slaughter/sale chain. [Source: The Tribune, tribuneindia.com; LiveLaw.in coverage of a related P&H HC bail case]
- **FACT**: The Punjab & Haryana High Court has separately criticized the Haryana government for "improper execution" of its anti-cow-slaughter law, and a PIL is pending on vigilantism concerns tied to cow-protection enforcement in Haryana. [Source: opindia.com, legalmaestros.com]
- **INFERENCE**: Because species confirmation in these cases currently depends on a forensic/lab report (as in the Chandigarh case above), a field-deployable DNA spot kit could plausibly speed up on-the-spot confirmation for police/food-safety officers in exactly this jurisdiction — this is a reasonable and well-evidenced inference, not a stated fact from any source.
- **Caution — political sensitivity**: This is a legally and politically charged enforcement area (cow-vigilantism concerns are documented by the same courts). A student pitch should frame the tool neutrally as a **food-safety/species-authentication and forensic-evidence tool**, and should NOT position itself as a "cattle-slaughter enforcement device" — that framing risks appearing to endorse vigilante-adjacent enforcement rather than food-safety/consumer-protection, which is the brochure's own framing ("forensic investigations related to illegal slaughter, wildlife crimes, food adulteration, and evidence verification").

---

## 5–8. Prior art and novelty

**5. Existing solutions:**
- **ICAR-NMRI MSIL** (verified, FACT, see §3) — real-time PCR/sequencing lab, NABL-accredited, India's referral lab.
- **Commercial antibody-based (non-DNA) rapid kits already exist and are sold today**: e.g., "Pork Test Kit (Halal)" from Asianmedic — an immunochromatographic lateral-flow test for porcine antigen in raw/processed meat, marketed to certification bodies, food manufacturers, and regulators. [Source: asianmedic.com] This is protein/antibody-based, not DNA-based, but solves an overlapping consumer problem (pork detection) with a comparably fast, naked-eye lateral-flow format — meaning "a lateral-flow strip that flags meat adulteration" is **already a purchasable product**, just not DNA-based.
- **A large, mature published research literature on exactly this technique** (RPA/LAMP + lateral flow for meat species ID) already exists, including (all independently verified via search, not taken on faith from the PDF):
  - Multiple RPA-lateral-flow assays for cattle/buffalo/pig/sheep/goat/chicken species ID targeting cytb/D-loop (Springer, J. Food Sci. Technol. 2020).
  - RPA-based multiplex lateral-flow dipstick for duck-in-beef adulteration, 35-min result, naked-eye readout (PMC7601885, 2020).
  - RPA-lateral-flow for mutton adulteration (ScienceDirect, 2019).
  - CRISPR/Cas12a + RPA + lateral flow combinations for food pathogens/adulterants (JAFC 2024).
  - DNA-extraction-free dual-RPA + multiplex lateral-flow strips for duck/pork in beef/lamb (JAFC, acs.jafc.3c03259).
  - The exact paper cited as reference [3] in the brochure — **verified to exist and closely match**, but with a **citation discrepancy** (see §"Reference verification" below).
- Multiple recent (2024–2026) papers keep publishing incremental variants of this same idea (multicolor nanoparticle lateral flow, portable RPA/CRISPR biosensors for meat adulteration, ABC 2026), confirming this is an active, crowded, but still-academic research niche, not yet a mainstream consumer/field product category in India.

**6. What would a student team actually build?**
Realistically: a **pitch-and-slideware/partial-mockup project** — a physical lateral-flow strip housing (3D-printed or laser-cut), a description/diagram of the RPA/LAMP + primer design, purchased or borrowed pre-made lateral-flow strips (possibly generic/unrelated ones used as a physical prop), and — most plausibly built for real — a **companion mobile/web app** for photographing a strip, OCR/CV-based line interpretation, geotagging, and timestamped digital logging (this is explicitly the one *software* component in the brief and the only part that is genuinely hackathon-native).

**7. Genuinely novel vs prior art (honest assessment):**
Almost nothing about "RPA/LAMP + lateral flow for species ID" is technically novel — it is a well-published technique with 5+ years of academic literature (see §5) and the brochure's own reference [3] is itself a 2025 refinement of the same idea, meaning the problem-statement authors are pointing straight at prior art rather than an original insight. Any genuine novelty a student team could plausibly claim would have to come from **India-specific/field-engineering aspects that are less published**: (a) India-specific low-cost lyophilization/room-temperature-stability formulation using cheap local stabilizers, (b) an India-specific target panel (bovine vs buffalo vs porcine, tuned to Indian informal-market realities rather than the Chinese chicken/duck/pork axis the literature is dominated by), (c) the compliance/logging companion app tied into an Indian regulatory chain-of-custody workflow (FSSAI/halal-cert format), and (d) cost-engineering for India's price-sensitive field-inspector context.

**8. What is NOT novel:**
The core molecular biology (RPA or LAMP isothermal amplification, cytochrome-b/COX mitochondrial primer targets, lateral-flow visual readout, 20–35 min turnaround, multiplexed color-coded lines) is directly lifted from — and explicitly cited from — existing 2019–2025 peer-reviewed literature. This is not a criticism unique to this team; it's inherent to the problem statement as written by the organizers.

### Reference verification (FACT-checked)

| Ref in PDF | Verification result |
|---|---|
| [1] ICAR-NMRI MSIL, NABL-accredited | **VERIFIED TRUE.** Confirmed via icar.org.in and nmri.res.in/page/accreditation. NABL/ISO 17025:2017 accredited; FSSAI-designated National Referral Laboratory. |
| [2] FSSAI "Regulatory Framework Overview," via Drishti IAS | **PLAUSIBLE/GENERIC** — Drishti IAS is a UPSC coaching-content site, not a primary regulatory source; it does host FSSAI-overview articles, but this is a weak, secondary reference for a technical hackathon brief. Treat as SOURCE-BACKED but low-authority; teams should cite FSSAI's own Food Safety and Standards Act 2006 / Food Safety and Standards (Food Product Standards and Food Additives) Regulations directly instead. |
| [3] Zhang, Wang, Liu et al., "...Food Chemistry, 2025" | **PARTIALLY VERIFIED, WITH A DISCREPANCY.** A closely matching real paper exists: "Lateral flow biosensor utilizing self-assembled DNA-multicolor Au/Ag nanoassemblies and dual-tailed RPA for on-site triplex detection of chicken, duck and pork adulteration in beef" — **but its actual authors are Liu, Yuan, Wang, Tian, Wu, Li, Chen, Wang, Liu (not "Zhang, Wang, Liu"), and it was published in *LWT* (Volume 232, article 118425, Sept 2025), not *Food Chemistry*.** Content matches closely: 21-min workflow incl. microneedle DNA extraction + RPA + multicolor lateral-flow strip; LOD 0.1 g/kg in beef; no cross-reactivity against 9 non-target species + 1 vegetable. **Flag this citation discrepancy explicitly to the team** — the brochure's reference is either a misattribution/mis-citation of this LWT paper, or refers to a different, unfound paper. Either way, do not present it to judges as a verbatim-correct citation without double-checking; cite the verified LWT paper instead if used. |

---

## 9–13. Buildability and demo reality

**9. Can a student team build a convincing prototype?**
This is the hardest track of the six by skillset mismatch: it requires **wet-lab molecular biology** (DNA extraction, primer design and validation, isothermal amplification chemistry, lateral-flow strip conjugation chemistry with gold nanoparticles/antibodies), not electronics/software, which is what most engineering hackathon teams (UIET/PEC students, likely CS/ECE-heavy) are equipped for. PROPOSED SOLUTION-level judgment: unless the team specifically includes biotechnology/microbiology students with real lab access (PEC's Cyber Security Research Centre partners with CFSL, which does have forensic biology capability, but student hackathon teams do not automatically get CFSL lab access), a genuine end-to-end wet prototype is very unlikely in the available time.

**10. Can it be demonstrated live during judging — what would actually be shown?**
Three realistic tiers, from least to most credible:
- **Tier 1 (most likely, safest)**: Slides + a physical strip-holder/cartridge mockup (3D-printed housing) + a video of a lab-scale RPA-lateral-flow assay (either the team's own footage if they had lab access at some point before the demo, or citing/replaying literature videos with clear "results from prior lab work, not live" framing) + a live demo of only the companion logging app scanning a **pre-printed/pre-made strip image** (real or fabricated prop) to show the CV/OCR + geotag + timestamp pipeline.
- **Tier 2 (higher risk, higher payoff)**: A live pipetting demonstration using real but non-hazardous/food-grade materials (e.g., using a known, purchasable, non-controversial meat sample like chicken vs. a store-bought "pork" reference standard) to run an actual RPA-lateral-flow assay live, if reagents/primers can be sourced and validated well in advance and organizers explicitly permit biological reagents at the venue.
- **Tier 3 (not recommended)**: Fully live wet-lab assay with organizer-approved biological reagents run start-to-finish on stage within the judging window — technically the "ideal" demo per the brief's 20–35 min turnaround claim, but logistically very risky (see §21) and its permissibility is **unconfirmed** (see §13/Verdict).

**11. What data is required?**
- Reference mitochondrial sequences for target species (cytochrome b / COX1/COX2) — **publicly available** via NCBI GenBank (no restriction).
- Primer/probe sequences — either designed from scratch (Primer3/NCBI Primer-BLAST, both free, verified real tools) or taken from the already-published papers in §5 (many of these papers publish their primer sequences in supplementary material, which is legally citable/reusable with attribution for a hackathon, not for commercial resale).
- Positive/negative control DNA or tissue samples from each target species (bovine, buffalo, porcine, poultry) for actual wet validation.
- Cross-reactivity panel data (documented LOD/specificity) — this is explicitly Feature #8 in the brief and is the hardest to produce credibly in days.

**12. Can it be legally obtained/used (biological sample sourcing)?**
INFERENCE/inconclusive from available research: raw meat samples of legal species (chicken, mutton, buffalo/beef-substitute, pork where legal) are purchasable from any market and are **not restricted** for DNA-extraction purposes in most of India (unlike, say, cow/bovine meat which is restricted or banned depending on state — Punjab/Chandigarh/Haryana all restrict bovine slaughter/possession under the Acts cited in §4). This creates a genuine legal tension: a kit whose whole selling point is "detect bovine adulteration" would, to validate itself with a true bovine-DNA positive control, need to legally source bovine reference DNA/tissue — which in Punjab/Haryana/Chandigarh is itself legally fraught. **The team should use buffalo, pork, or poultry as their live-demo positive/negative pair and avoid handling actual cattle/beef tissue at the venue, using literature-published bovine cytb sequences (from GenBank, not physical tissue) for the "bovine" primer design/validation slide instead.** This is a PROPOSED SOLUTION / risk-mitigation recommendation, not a stated fact.

**13. Can synthetic/mock data or non-biological simulation substitute for the hackathon demo?**
Yes, and given the unresolved biosafety-permission question (§0), this is very likely the *pragmatic* and possibly *required* path, by direct analogy: Track 1 (PS1), which is closer to hazardous (chemical spot tests for drugs), has an explicit organizer rule banning real hazardous reagents/illegal substances and mandating simulation with household items (pH strips, food coloring, baking soda). **Track 2 has no equivalent published rule, which is itself the risk** — the team cannot assume real biological reagents (even legal ones like chicken/pork tissue, enzymes, gold nanoparticle conjugates) are permitted at the venue without explicit organizer confirmation, because biological/enzymatic reagents plus a live audience/judging floor raise different (if generally lower-severity) safety and venue-hygiene concerns than PS1's chemicals, and no one has stated the policy either way. **This must be raised as a direct clarification question to organizers before 20 Aug.**

---

## 14–17. Technical requirements

**14. Hardware/lab equipment required (real, named):**
- Primer design: **NCBI Primer-BLAST** (free, web-based, uses Primer3 core) — verified real and appropriate for cytb/COX species-specific primer design.
- DNA extraction: simple lysis buffer or bead-based kits — e.g., Chelex-100 resin-based extraction (cheap, ambient-temp, widely used in forensic/field literature) or commercial rapid-extraction kits.
- Isothermal amplification: **RPA runs at 37–42°C** (near body temperature — can even be run in a shirt pocket or a cheap hand-warmer/heating pad, no thermocycler) vs **LAMP which needs a steadier ~60–65°C** (needs a simple heating block, water bath, or a $5–20 portable heater — still far cheaper/simpler than a PCR thermocycler). RPA is the better fit for "no specialized equipment" claims; LAMP is cheaper per-reagent but needs more precise heat.
- Lateral flow strips: purchasable off-the-shelf **nitrocellulose membrane** (verified Indian supplier pricing ~₹70/membrane on TradeIndia) plus conjugate pad, sample pad, absorbent pad, backing card, and gold-nanoparticle or antibody conjugate — can be self-assembled from commodity LFA components or (more realistically for a hackathon) a generic pre-made lateral-flow cassette repurposed/labeled for the demo.
- TwistDx (Abbott-owned) sells commercial **TwistAmp** RPA reagent kits — verified real commercial product, but **no confirmed India pricing found**; likely needs import/distributor sourcing (Biolinkk, gBiosciences and similar Indian life-science distributors carry RPA kits) and realistic lead time may exceed the hackathon's prep window.

**15. Software required:**
Explicitly **optional** per the brief (Feature #7: "Digital Result Logging (Optional Companion App)"). If built: a mobile/web app for photographing the strip, basic image-processing/line-detection (even simple color-threshold CV, not necessarily ML), timestamp + GPS geotagging, and a compliance record/export — this is standard, buildable-in-days software work well within a typical CS student's skillset.

**16. AI/ML required — explicit flag of difference from other tracks:**
**FACT (verified by direct PDF read)**: unlike Track 1 (PS1), which *mandates* "AI/ML Colorimetric Analysis" with multi-analyte classification and model-update extensibility as a graded "Expected Feature," **Track 2's brief contains no AI/ML requirement anywhere.** The closest analog — interpreting the strip result — is described only as "photograph/interpret strip results" inside the *optional* companion app, and naked-eye readout is explicitly the baseline requirement ("no specialized reader for a basic positive/negative result"). A team could add simple ML-based line detection for polish/differentiation, but it is not required, and judges evaluating consistently across all 6 tracks may weight this track's technical-depth score differently since there is less scope for an "AI showcase" than PS1/PS4.

**17. APIs/services required:**
Minimal: possibly a maps/geotagging API (e.g., a free geolocation API) for the optional app, and standard mobile-camera APIs for strip photography. No specialized cloud AI service is needed unless the team adds ML on top (optional). This is a low-API-dependency track compared to AI-heavy tracks.

---

## 18–20. Cost and timeline

**18. Approximate prototype cost in INR:**
- Nitrocellulose membrane: ~₹70/unit (verified, TradeIndia listing) — small quantities for a demo cartridge, so materials cost is low (tens to low hundreds of rupees per strip once other LFA components — conjugate pad, backing card, sample pad, gold-nanoparticle conjugate — are sourced, likely ₹200–₹1,000+ per strip all-in for small-batch/DIY assembly, since commodity LFA kits are typically sold in bulk/wholesale lots, not singly).
- RPA/LAMP enzyme reagents (TwistAmp or equivalent): these are the dominant cost driver — commercial isothermal-amplification enzyme mixes are specialty biochemistry reagents typically priced in the ₹15,000–₹50,000+ range per kit (dozens of reactions) based on general life-science distributor pricing patterns for such enzyme mixes; **exact India pricing could not be verified** in this research (INFERENCE/estimate, not a confirmed figure — flag as unverified).
- Primer synthesis: custom DNA oligo synthesis from an Indian vendor (e.g., Eurofins Genomics India, Bioserve, Xcelris) typically costs a few hundred rupees per primer for standard unmodified oligos, more for fluorescent/labeled probes — order lead time is typically **3–7+ business days**, which is a real scheduling risk against a 2-day pitch deadline and even the ~2-week pre-hack window.
- Overall PROPOSED-SOLUTION estimate for a working wet-lab-validated prototype: **likely ₹15,000–₹60,000+**, dominated by enzyme reagent cost and primer synthesis — this is materially higher than the near-zero/low-hundreds-of-rupees cost structure of the electronics-only tracks, and cost estimates here are less confidently sourced than the electronics tracks' component costs.
- A "mockup only" (housing + app + slides, no real wet-lab validation) could be built for **a few hundred to a couple thousand rupees** (3D printing/laser cutting + a generic prop strip), which is the far more realistic scope for the actual 2-day-to-deadline / ~2-week-prep timeline.

**19. What can genuinely be built in 1 week?**
A convincing pitch deck, primer design work-product (via Primer-BLAST, no wet lab needed — pure bioinformatics), a literature-grounded assay design narrative, a 3D-printed/mocked cartridge housing, and a working companion logging app (photo capture + geotag + timestamp + basic line-color detection). **Not** realistically achievable in 1 week without pre-existing lab access: actual reagent sourcing, primer synthesis turnaround, and wet-lab validation of sensitivity/specificity.

**20. What can be built by 8 Sep (finale, ~3 weeks away)?**
If the team secures a college biotech/microbiology lab and reagents early (during the 25 Aug–7 Sep pre-hack window), a **single-species, single-primer-pair proof-of-concept** (e.g., detect porcine vs. non-porcine DNA in a spiked sample) run at least once successfully in a lab setting is plausible — full multiplexed bovine/buffalo/porcine differentiation with documented LOD/cross-reactivity (Feature #8) in ~3 weeks is a stretch even for an experienced lab, let alone a first-time student assay-development effort.

---

## 21–23. Risk and defensibility

**21. What could fail during a live demo?**
- Contamination (any stray DNA — even from the demonstrator's own skin/breath — can produce false positives in a highly sensitive isothermal-amplification assay).
- Primer cross-reactivity/non-specificity discovered live (this is exactly what Feature #8 is meant to validate in advance — if not properly validated, a live demo risks an embarrassing false result in front of judges).
- Timing: even a "fast" 20–35 min assay does not fit neatly into a typical 5–10 minute judging pitch slot — the team would need pre-started reactions timed to finish during the pitch, adding logistics risk.
- Reagent/enzyme degradation if not properly stored (cold-chain-independent lyophilized stability, Feature #9, is itself an unsolved R&D problem for a student team to nail in weeks — see §"20").
- Strip flow/wicking failures (dry-out, over-flooding, non-specific binding smearing lines) are common even in professional LFA manufacturing, let alone DIY-assembled strips.
- Ambient temperature dependency for RPA — needs to stay within a workable range; a cold venue or AC could slow amplification unpredictably.

**22. What would judges challenge?**
- "How is this different from the ICAR-NMRI lab or the already-cited 2025 paper?" (see §7 — team needs an honest, specific answer, likely centered on cost/field-deployability/India-specific tuning, not on the core chemistry).
- "Show me the sensitivity/specificity data" (Feature #8) — if this doesn't exist because there was no time for real validation, judges with any science background will immediately spot an unvalidated claim.
- "Is this actually DNA-based, or did you fall back to an antibody/protein test like the existing commercial pork-test kits?" — given the wet-lab difficulty, some teams may be tempted to substitute an antibody-lateral-flow approach (like Asianmedic's existing product) while still calling it "DNA-based" in their pitch; this is a credibility trap.
- "What happens with degraded/processed/cooked meat samples?" (DNA degrades with heat processing — a known real-world limitation of DNA-based species ID that the brief doesn't address).
- Regulatory/legal question: "Would FSSAI or a court accept this as legal evidence, or only as a screening flag?" — team must be careful to position the kit as a **presumptive screening tool**, not a legally admissible confirmatory test (mirrors exactly the "presumptive vs. confirmatory" distinction that Track 1's own reference literature makes for drug spot tests).

**23. What claims should the team NOT make?**
- Do NOT claim NABL/ISO-17025-equivalent accuracy or claim the kit can "replace" ICAR-NMRI's accredited lab — it should be pitched strictly as a **field-screening/triage tool** that flags samples for confirmatory lab testing, consistent with how every published RPA-lateral-flow paper positions itself (presumptive, not confirmatory).
- Do NOT claim court-admissible forensic evidentiary status without judicial/regulatory validation.
- Do NOT overstate a fully working live wet-lab demo if it wasn't actually run and validated in advance — do not fabricate "our sensitivity is X% / LOD is Y ng" numbers without having actually generated them.
- Do NOT claim the core RPA/LAMP-lateral-flow method itself is a novel invention — it is well-published prior art (§5, §8); claim novelty only in the specific India-context engineering/integration choices.

**24. Strongest genuine differentiator:**
Most credible, honestly-claimable differentiator: an **India-specific, cost-optimized, ambient-stable panel tuned to the Indian informal meat trade's actual species-confusion axis (bovine/buffalo vs. porcine vs. other), bundled with a compliance-logging companion app aligned to FSSAI/halal-certification audit-trail needs** — i.e., a systems-integration and localization differentiator, not a core-chemistry one.

**25. Strongest live-demo scenario:**
The safest, most judge-legible live demo is **not the wet-lab assay itself** but: (a) a physical, well-designed field kit/cartridge prototype the judges can hold, (b) a pre-recorded or lab-validated video of the actual assay running (clearly labeled as prior lab footage, not live-on-stage), and (c) a **live, working demo of the companion logging app** — photographing a (real or prop) strip, showing instant geotagged/timestamped digital record creation. This sidesteps the live-biology failure modes in §21 while still demonstrating genuine, working software.

---

## Scorecard (1–10, 10 = best/lowest-risk as specified)

| Category | Score | Justification |
|---|---|---|
| Problem significance | 7 | Real, institutionally recognized (ICAR-NMRI, FSSAI) food-fraud/halal/forensic problem, but narrower in day-to-day police relevance than violent-crime or drug tracks. |
| Innovation | 3 | Core technique is directly lifted from a crowded, well-published 2019–2025 research literature, including the brief's own cited paper. |
| Technical depth | 5 | Genuinely deep molecular-biology content exists, but it's prior-art depth, not the team's own depth unless real primer/assay design work is done. |
| Prototype feasibility | 3 | Requires wet-lab access, biotech skillset, and reagent lead times most hackathon (CS/ECE-heavy) teams don't have, in a 2-day-to-deadline / ~3-week-to-finale window. |
| Demo impact | 4 | A real live positive/negative color-change result would be visually strong, but is high-risk to pull off (see §21); safer demo (app + mockup) is less visually dramatic. |
| Government usefulness | 6 | Plausible aid to FSSAI/food-safety officers and forensic/police species-ID workflows, but positioned as a screening aid, not a standalone enforcement tool. |
| Social impact | 6 | Real consumer-protection, halal-trust, and food-safety value; politically sensitive framing risk around cattle-slaughter enforcement (see §4) must be handled carefully. |
| Scalability | 5 | Chemistry is inherently scalable (per-test cost can fall with volume), but only after real R&D investment well beyond hackathon scope. |
| Cost | 4 | Meaningfully higher and less-certain cost than the electronics-only tracks (₹15,000–₹60,000+ estimated for a validated prototype, unverified precisely); mockup-only version is cheap. |
| Data availability | 6 | Reference mitochondrial sequences and published primers are freely available (NCBI GenBank, literature supplements); physical positive-control tissue sourcing is legally constrained for bovine specifically (§12). |
| Implementation risk (10=lowest) | 2 | High risk: wet-lab dependency, reagent lead times, unconfirmed venue biosafety policy, and a skillset mismatch with a likely CS/ECE-heavy team. |
| Judge understandability | 6 | The problem and result (color line = species detected) are intuitive; the underlying isothermal-amplification chemistry is not something most judges can evaluate rigorously, cutting both ways. |
| Defensibility during Q&A | 4 | Prior-art crowding (§7/§22) and the "presumptive vs. confirmatory" distinction are hard questions the team must handle carefully and honestly. |
| Existing-competition differentiation | 3 | Weak on core chemistry (well-published), moderate on India-specific systems-integration framing (§24). |
| Time-to-prototype feasibility | 2 | The 2-day deck deadline and ~3-week build window are very tight against real reagent lead times (3–7+ days for custom primers alone) and lab-access dependency. |
| Reliability during live demo | 3 | Real molecular assays are inherently contamination/timing/temperature-sensitive; a mockup-plus-app demo is far more reliable than a live wet-lab run. |

---

## FINAL VERDICT: 🟡 YELLOW — Feasible only with major scope reduction and an unresolved organizer-dependency

**This is not a RED/no-go problem** — it is a real, well-evidenced, institutionally-relevant problem with strong India/FSSAI/ICAR grounding and a directly on-point regional (Chandigarh) forensic case precedent (§4). But it is **not GREEN** because of stacked, concrete feasibility risks:

**Dependency risks:**
1. **Wet-lab / biology-skilled team member access is not guaranteed** — this track requires molecular biology / biotechnology expertise that a typical CS/ECE hackathon team (from UIET/PEC) may not have on the roster. Verify team composition before committing to this track.
2. **Reagent/primer sourcing lead time (3–7+ business days for custom oligos, uncertain lead time for RPA/LAMP enzyme kits)** does not comfortably fit the 20 Aug pitch deadline or even the 25 Aug–7 Sep pre-hack window without starting immediately.
3. **Venue biosafety policy for real biological reagents is UNCONFIRMED** — Track 1's PDF explicitly bans real hazardous reagents/substances and mandates simulation; Track 2's PDF is silent. Do not assume either permission or prohibition — **this must be explicitly clarified with organizers before committing to any live wet-lab demo plan.**
4. **Cost is the least-certain and highest-variance of all six tracks' likely material costs** — enzyme-reagent pricing in India could not be confirmed and is plausibly ₹15,000–₹60,000+ for a real validated prototype, vs. near-zero for a mockup.

**Unavailable hardware/data:** No thermocycler needed (that's the whole point of isothermal amplification), which is a genuine plus — but validated Indian-sourced RPA/LAMP enzyme kits and legally-sourceable bovine-species reference DNA (given regional cow-slaughter law, §4/§12) are real, non-trivial sourcing gaps.

**Regulatory blockers:** None that prohibit *building* the concept (primer design, bioinformatics, app development are all unrestricted), but real bovine tissue handling intersects with Punjab/Haryana/Chandigarh cattle-slaughter law (§4/§12) — mitigate by using legally unambiguous species (buffalo, pork, poultry) for any live positive/negative control work, and treat "bovine" detection as a bioinformatics/literature-sequence exercise rather than physical-tissue work.

**Live-demo failure risks:** Contamination, cross-reactivity, timing-fit-to-pitch-slot, and ambient-temperature sensitivity (§21) make a fully live wet-lab demo the highest-failure-probability demo format of any track reviewed. **Recommended path: build the companion logging app for real, build a physical kit mockup, and present validated (even if literature-sourced/small-scale) assay data + a clearly-labeled non-live or lab-recorded video — not a live in-front-of-judges wet-lab run — unless organizers explicitly confirm real reagents are permitted at the venue and the team validates the assay well in advance.**

**Bottom line recommendation:** A team should only pick this track if it (a) already has at least one member with real molecular-biology/biotech lab experience and access, (b) can get an organizer clarification on real-reagent venue policy within the next 1–2 days, and (c) is prepared to scope the "prototype" honestly as bioinformatics + app + physical-kit mockup + (best case) small-scale lab-validated single-species assay, rather than a full multiplexed, validated, live-demoed kit matching every one of the brief's 10 Expected Features.
