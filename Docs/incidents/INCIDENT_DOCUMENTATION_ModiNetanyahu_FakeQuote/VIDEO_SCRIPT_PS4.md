# Round-1 Submission Video Script — PS4 (AIMD) Chandigarh Police Hackathon'26

~2:00 total. Structure: Teammate on camera (problem) → platform prototype walkthrough → Teammate on camera (close).

Replace `[PLATFORM NAME]`, `[TEAM NAME]`, and teammate names before recording.

---

## SEGMENT 1 — Teammate A + Teammate B on camera (0:00–0:40)

**[VISUAL: Teammate A, straight to camera, plain background or a Chandigarh Police Hackathon backdrop]**

> "Just this month, a post went viral claiming Prime Minister Modi privately warned Netanyahu about a Saudi-Turkey-Pakistan alliance — thousands of views, no source, attributed to an account with a track record of fabricated quotes and deepfakes. No ministry, no credible outlet, ever recorded that statement. It was fake — and it spread anyway."

**[VISUAL: Teammate B joins / cuts in]**

> "An IT professional was extorted for five lakh rupees over an AI-generated nude image that was never real. In Punjab, a fifty-nine-year-old woman lost one lakh forty thousand rupees to a cloned voice pretending to be her nephew, stuck in legal trouble in Canada.
>
> These aren't hypotheticals. They're open cases. And right now, the Punjab and Haryana High Court — sitting right here in our own tri-city — has issued notice to Google, Meta, and X, demanding a real answer to deepfakes. As of February this year, India even has a binding law — the MeitY IT Rules Amendment — forcing platforms to label AI-generated content and take down the worst of it within two hours.
>
> The problem isn't whether deepfakes and fake claims cause harm. It's that nobody investigating them has a fast, explainable way to prove it. That's what we built."

**[ON-SCREEN TEXT while speaking, timed to the numbers: "Viral fake Modi-Netanyahu quote — unverified" / "₹5L — AI extortion" / "₹1.4L — voice-clone scam, Punjab" / "P&H High Court PIL — active" / "MeitY IT Rules, 2026 — in force"]**

---

## SEGMENT 2 — Platform prototype walkthrough (0:40–1:35)

**[VISUAL: Screen recording of `[PLATFORM NAME]` dashboard. Voiceover can be Teammate A or B, or on-screen captions if narrating live is harder to rehearse.]**

> "This is `[PLATFORM NAME]` — an AI-forensics platform for investigators, built for exactly this workflow.
>
> An investigator uploads a suspect video or image. Our model — fine-tuned on FaceForensics++ and DFDC, the same benchmarks the field's real detection research uses — returns a confidence score, and a heatmap showing exactly which pixels triggered it. No black box.
>
> Next, we check the file's metadata and, where present, its C2PA content-credential manifest — corroborating evidence, not a magic yes/no.
>
> Then, origin tracing: we hash the media and match it against a known-sample corpus, showing where and how a piece of content has already surfaced — the propagation trail an investigator actually needs.
>
> Every result lands in a case file — verdict, evidence, audit trail — one click from an exportable report.
>
> And we're honest about limits: this is decision-support for a human analyst, not an autonomous verdict. Even the industry's best models don't claim perfect accuracy on content they weren't trained on — and neither do we. That honesty is the point."

**[VISUAL CUES: (1) upload screen → (2) confidence score + Grad-CAM heatmap overlay → (3) metadata/C2PA panel → (4) hash-match "origin trail" view → (5) case dashboard with PDF/JSON export button]**

---

## SEGMENT 3 — Teammate A / B on camera, close (1:35–2:00)

**[VISUAL: Teammate(s) back on camera]**

> "Deepfakes in India aren't slowing down — election fakes, voice-cloned fraud, extortion, all of it is already here, and now it's already law that platforms have to act on it. `[PLATFORM NAME]` gives Chandigarh Police and every cyber cell like it a fast, explainable first read — built to plug straight into the I4C and CFSL pipeline this state already runs.
>
> We're not claiming to replace an analyst. We're claiming to make the next one faster.
>
> Thank you."

**[ON-SCREEN CLOSING TEXT: "`[PLATFORM NAME]` — Team [TEAM NAME] — Chandigarh Police Hackathon'26 — PS4"]**

---

## Production notes

- **Timing discipline**: Segment 1 and 3 are scripted to read in ~35–40s and ~20–25s respectively at a natural pace (~150 wpm) — time a read-through and trim, don't add.
- **Screen recording**: Segment 2 needs the actual prototype UI recorded first; script the voiceover to match real screen timing once that recording exists, not the reverse.
- **What NOT to say on camera** (per the team's own hardening research): no claim of live cross-platform scraping across X/Meta/TikTok, no "near-100%" or "state-of-the-art" accuracy claim, no fabricated Chandigarh-specific deepfake incident, no death/casualty statistic.
- **Viral fake-quote example (added)**: keep this to "no official record / unverified, spread by an account with a history of fabricated content" — do not assert who created it or why, since that isn't established.

## Sourced facts used (all traceable to `AGENT_PS4_DEEPFAKE_REPORT.md` and `PS4_HARDENING_PLAN.md`)

- Viral post (account @InsiderWB / "The Whistle Blower") claiming PM Modi privately warned Netanyahu about a Saudi-Turkey-Pakistan alliance — no MEA or credible-outlet record of the statement; the same account has previously been fact-checked circulating fabricated Modi/Netanyahu content (per BOOM Live and other fact-checkers).
- ₹5 lakh AI-nude-image extortion (IT professional, July 2025).
- ₹1.4 lakh voice-clone scam (59-year-old woman, Punjab).
- Cloned voice of Bharti Airtel chairman Sunil Bharti Mittal used in an attempted fund-transfer fraud.
- 2024 election deepfakes: fabricated Karunanidhi video, fake Kejriwal-joins-BJP video, deepfaked celebrity endorsements.
- Live Punjab & Haryana High Court PIL (Ravinder Singh Dhull, Panchkula; bench led by Chief Justice Sheel Nagu) — notice issued to MeitY/MHA/I&B **and** Google India, Meta, X Corp.
- MeitY IT Rules Amendment, 2026 — notified 10 Feb 2026, in force 20 Feb 2026 — defines "Synthetically Generated Information," mandates provenance labelling and takedown within as little as 2 hours.
- 550% surge / ₹70,000 crore figures are flagged in-script as industry estimates, not government statistics.
- No verified death from deepfakes in Chandigarh/India was found in the team's research — none is claimed in this script.
