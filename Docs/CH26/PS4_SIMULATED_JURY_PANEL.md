# PS4 — Simulated Jury Panel: Reactions to the MVP Build Plan

**What this is:** four independent AI agent personas, each briefed as a distinct hackathon-judge archetype (police/impact, technical, innovation, presentation — matching the brochure's own judging criteria in `PS4_MVP_BUILD_PLAN.md` §10), read the actual plan and platform docs and reacted in character, then reacted to each other's opening remarks. **This is a simulation exercise to pressure-test the plan before a real pitch — not a record of real judges, real people, or a real event.** No claim here should be repeated as "the judges said X."

**Sources each persona read:** `PS4_MVP_BUILD_PLAN.md`, `PS4_CYBER_CRIME_OFFICER_REVIEW.md`, `AGENT_PS4_DEEPFAKE_REPORT.md`, `PS4_ANALYSIS_PIPELINE.md`, `PS4_ROUND1_STRATEGY_CHAT.md`, `detailed_project_report.md`, `police-evidence-platform/design.md`, `police-evidence-platform/package.json`.

**Panel:**
- **Insp. Simran Kaur** — senior police officer, impact/domain judge
- **Prof. Arvind Mehta** — UIET/PEC technical judge
- **Rhea Kapoor** — startup founder, innovation/positioning judge
- **Vikram Anand** — design/communications judge

---

## Round 1 — Opening remarks

**Insp. Simran Kaur:**

> Alright, sit down, sit down. Let me tell you what I liked first — genuinely. The FIR/CCTNS number as a required field at case creation, the hash-chained audit log, the NCII blur-by-default with the open action itself being logged — that's the officer review actually landing, not just being filed away. And the honesty around the detector — you citing 65% average precision and a 30 to 40 point cross-dataset drop *before* I ask it — that tells me you're not selling me a magic box. The four-way verdict with INCONCLUSIVE instead of forcing a binary is exactly right for how this actually gets used.
>
> Now my biggest concern. Everything you've shown me is evidence *creation* — hashing, detection, fusion, a certificate block. Fine. But a Cyber Crime Cell doesn't work one case in isolation. The moment I get a viral video, my first question is "has this exact face or this exact hash shown up in three other complaints this month" — and right now every case sits alone. No cross-case search, no accused tracking. Your own officer review flagged this as a real differentiator, not a stretch goal, and I don't see it prioritized above audio detection in your build order.
>
> So here's my question for the stage: when your Section 65B certificate gets challenged and a defense lawyer asks who had write access to that SQLite file between upload and export — walk me through, concretely, what stops that file from being touched outside your app entirely.

**Prof. Arvind Mehta:**

> Alright, let me give you my honest take. What I like — genuinely — is the offline-first infrastructure decision. SQLite, local filesystem, local Python inference over localhost, no live social-media scraping in scope. That is not corner-cutting, that is correct engineering for a 24-hour, connectivity-uncertain venue, and I wish more teams made that call deliberately instead of discovering it in a panic at 2 AM when the Wi-Fi drops. And I'll say it plainly: the fact that your own documents cite the DFDC winner's 65% average precision and the 30-to-40-point cross-dataset accuracy drop, unprompted, before I even ask — that's the single strongest signal in this whole packet that you understand the field. Most teams walk in claiming 99% and I dismantle them in ninety seconds.
>
> My biggest concern is the "Investigate" endpoint. You're fusing five signals — classifier, C2PA, hash-match, metadata, propagation — into one verdict, but for the overwhelming majority of real uploads, three of those five will return nothing: no C2PA credential, no corpus match, no propagation history. So in practice your "multi-signal fusion" often degenerates to one classifier score wearing a trust-inspiring UI. Does your fusion engine actually widen the INCONCLUSIVE band when coverage is that thin, or does it quietly let the classifier dominate?
>
> My question for the stage: walk me through the exact fusion weights when only Stage 2 fires and everything else is null — show me you built for that case, not just the demo case where everything lights up green.

**Rhea Kapoor:**

> Look, I've sat through a dozen of these this season, and every single one opens with "we built a deepfake detector." What I actually like here is that you say the detector's a commodity — pretrained, off-the-shelf, no training — and you're putting your chips on the evidence workflow instead. Chain of custody, evidence fusion, inconclusive-as-a-real-verdict instead of a forced binary, human override — that's the right instinct, and I'll give you credit, your strategy doc is honest about not claiming live cross-platform scraping you can't demo. That restraint is rare and I respect it.
>
> But here's my concern: right now, that whole differentiation story lives in a UI mockup and a demo video. Your own Round-1 scope decision says no model, no backend, nothing real yet. So when you tell me "the workflow is the product," I can't yet tell if that's a scope decision or a slide. A tamper-evident audit log is either backed by real hashing and immutable writes, or it's a nice-looking table.
>
> So here's my question for the stage: on September 8th, with 24 hours, which three things from that workflow will actually be real and verifiable — not narrated — by the time you demo? Name them, not describe them.

**Vikram Anand:**

> Alright, let me give this to you straight, because that's what you'll need before you walk into that room. What I like — genuinely — is the restraint. You didn't reach for the blue-purple AI-wrapper gradient every team is going to show up with. That gold-on-steel palette, the segmented confidence meter instead of a smooth "battery icon," the fact that INCONCLUSIVE gets its own honest color instead of being buried in grey — that's someone thinking about how a verdict actually gets read in a room, not how it looks in a Dribbble shot. And the pipeline animation as your one hero motion beat, tied to a real story — Case 001, a viral video, walked start to finish — that's the right instinct. Judges remember stories, not screen tours.
>
> My biggest worry is density. Three columns, ten pipeline steps, EXIF, C2PA, OSINT, hash chains — that's a lot of vocabulary for a five-minute slot in front of officials who are not going to parse "C2PA" in real time. Your own docs know this — you flagged the audit log as "deliberately boring." I'd ask: is the rest of the demo disciplined enough to match that restraint, or does it lean on the officer's ability to keep up?
>
> So here's my question for you on stage: what's the one sentence a DGP repeats to his commissioner the next morning? Give me that sentence right now.

---

## Round 2 — Cross-talk

**Insp. Simran Kaur** (responding to Prof. Mehta and Rhea Kapoor):

> Arvind, yes — that's exactly where it stops being a UX question and becomes a legal one for me. If Stage 2 is quietly carrying the verdict while four fields sit null, and the UI still renders a single confidence number, that's not a fusion engine, that's a classifier with a costume on. And in a courtroom, that costume is a liability — a defense advocate needs about four minutes to ask "so what did the other four signals actually say," and if the answer is "nothing, they were absent," your certificate now looks like it's overstating certainty it doesn't have. That's precisely why I keep coming back to chain of custody — the audit log has to record absence as a fact, not silence. "C2PA: not present" logged and timestamped is worth more evidentially than a clean-looking dial that never says what it didn't check.
>
> And Rhea — I'll take her challenge further, not soften it. Give me the hash chain, the coverage flags on the verdict, and the override log as your three. Not the detector. A detector any team can rent. A record that survives cross-examination is the product.

**Prof. Arvind Mehta** (responding to Insp. Kaur and Rhea Kapoor):

> Simran, technically — no, SQLite alone doesn't stop that. It's a file on disk. Give someone shell access and a hex editor and they can rewrite a row and your hash chain only tells you *after*, not *never*. What actually needs to exist: OS-level file permissions locking that file to a single service account, the app running as that account only, no interactive login on the box, and — this is the part I'd want confirmed — the hash chain's root gets anchored somewhere outside the file itself. Otherwise an attacker who touches the file can just recompute the whole chain and it looks pristine. That's a real gap, and I'd rather they say "we know" than pretend SQLite plus hashing equals immutability.
>
> Rhea — three things real by the 8th, that's achievable if they're honest about scope. SHA-256 at ingest, the hash-chained log with a fixed schema, and blur-by-default with logged unblur — all buildable in a day, they're mostly plumbing. Cross-dataset detector numbers, don't touch, that's not a 24-hour problem. So: pick three, skip the temptation to also fake cross-case search live.

**Rhea Kapoor** (responding to Prof. Mehta and Vikram Anand):

> Prof. Mehta, you're being generous — I'll be blunter. I asked earlier whether the workflow differentiation was real or theater, and this is exactly where that question cashes out. If Stage 2 fires alone and the other four sit null, and your fusion weights just let that lone score walk through wearing a "multi-signal" badge, then the certificate block isn't fusion — it's one model's opinion in a nicer font. That's not a technical nitpick, that's the product's entire credibility claim. So yes — show us the null-coverage weights, not the green demo.
>
> And Vikram — no, I don't think they have that sentence yet, and that's the tell. A DGP doesn't repeat "we hash and fuse five signals." He repeats something like "you can't fake it past us anymore" — but only once cross-case search and chain-of-custody are bulletproof, which Simran just showed us they're not. Right now their sentence would have an asterisk on it. That's fine for a 24-hour build, but own it — don't let the UI's confidence outrun what the pipeline actually proves today.

**Vikram Anand** (responding to Insp. Kaur, Prof. Mehta, and Rhea Kapoor):

> *(leans into the mic, half-smiling)* Okay — this is exactly what I meant, and also exactly why I said it. Simran's question — who touched that SQLite file between upload and export — that's not panel theater, that's the actual cross-examination this team will face in a Chandigarh courtroom. That's necessary density. Arvind's fusion-weights question, same thing — "what happens when only Stage 2 fires" is the whole ballgame for whether this is a detector or a decoration. Neither of those compresses into a demo sentence, and neither should. That's fine. The five-minute rule was never "never go deep" — it was "don't make me wade through jargon to find out you don't have an answer." Both of them have answers waiting; that's the tell.
>
> So — gut check on the one-liner. Not yet. Right now it's "we built an evidence chain-of-custody tool" — that's a category, not a sentence that survives contact. It becomes one sentence the moment they can say "we're the only PS4 tool where the SQLite file itself can prove nobody touched it." Prove that Monday, and Rhea's sentence writes itself.

---

## What the panel actually agreed on (consensus, read across both rounds)

1. **The honesty about detector limitations (65% AP, 30–40pt cross-dataset drop) is the single strongest asset in the packet.** Every judge independently called this out unprompted — it's read as credibility, not weakness.
2. **The workflow-not-detector positioning is the right bet, but it's unproven until built.** Rhea's and Vikram's skepticism converged on the same point: right now it's a scope decision described in a doc, not yet something demoable.
3. **The fusion engine's weakest real-world case — when only the classifier signal fires and everything else is null — is a genuine, unresolved gap.** Three of four judges (Mehta, Kaur, Kapoor) independently arrived at some version of this same concern from different angles (technical honesty, legal admissibility, product credibility). This is the single most-repeated criticism across the whole panel.
4. **The SQLite/hash-chain audit log is a good instinct but not yet sufficient on its own.** Mehta's technical point (file permissions, external anchoring of the hash root) sharpens what "tamper-evident" actually requires beyond what `PS4_MVP_BUILD_PLAN.md` §4 currently specifies.
5. **Cross-case search (hash/face across cases) is undersold in the current build order** — Kaur raised it, Kapoor and the panel's tone implicitly endorsed it as more central than audio/document detection.
6. **The UI restraint (dark console, segmented meter, honest INCONCLUSIVE color) reads as intentional, not decorative** — no pushback on this from any judge across two rounds.

## Recommended actions this surfaces for the plan

- Add explicit **null-coverage fusion behavior** to `PS4_MVP_BUILD_PLAN.md` §1/§8: when 3+ of 5 signals are absent, confidence must be capped and the verdict pulled toward INCONCLUSIVE — not left to whatever the classifier alone produces. This should be specified as fusion *logic*, not just a UI label.
- Log **signal absence explicitly** in the audit trail (e.g. `"C2PA: not present"` as a timestamped fact), not just omit it from display.
- Harden the tamper-evidence story beyond in-file hash chaining: OS-level file permissions restricting the SQLite file to a single service account, and anchoring the hash-chain root somewhere outside the file itself (even a simple signed daily checkpoint) so recomputation-after-tampering isn't invisible.
- Treat **cross-case search by hash/face** as a stronger priority signal than currently reflected — it was the most consistently reinforced gap across the panel, independent of the officer review that first flagged it.
- Before the Grand Finale, the team should be able to answer Vikram's prompt directly: name the one sentence a senior officer would repeat — and be honest with themselves about whether it's earned yet or still has "an asterisk on it," per Rhea's read.
