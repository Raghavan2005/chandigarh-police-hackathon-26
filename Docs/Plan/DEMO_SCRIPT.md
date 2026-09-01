# PS4 — Demo Script

A concrete run-of-show for the Phase 3/4 "run the full demo script end-to-end at least twice" rehearsal requirement (`PS4_MVP_BUILD_PLAN.md` §8). No such script existed yet — this one is grounded in features actually built and live-verified this session (see `PS4_BUILD_STATUS.md`), not aspirational. Update this file, don't fork a new one, as the flow changes during rehearsal.

**Target length:** ~6–8 minutes for the core flow (steps 1–8), leaving room for Q&A. Steps 9–10 are optional extensions if time allows.

## Pre-demo checklist (do this before walking up to present, not during)

- [ ] `ml-service` (`uvicorn main:app`) running and `/health` returns `modelLoaded: true`. **Pre-warm the audio model** by hitting `/detect/audio` once with any short clip beforehand if audio will be shown — first load is slow (~1.2GB, downloads+loads on first call) and a live cold-load during the demo is a real risk. Confirm `audioModelLoaded: true` before going on stage.
- [ ] Next.js app running (`npm run build && npm run start` for a real prod build, not `next dev` — dev mode is slower and shows extra dev-only UI chrome).
- [ ] Confirm the machine can run **fully offline** (§7 risk table's explicit requirement) — disconnect Wi-Fi and confirm the app still works, since both model weights should already be cached locally by demo day.
- [ ] Know your login: `raghavan@chandigarhpolice.gov.in` / `investigator123` (investigator) and `admin@chandigarhpolice.gov.in` / `admin123` (admin, for the audit-log beat). **Change these seeded demo passwords before presenting to actual judges/police if this ever leaves a dev machine** — they're printed in `prisma/seed.ts` and are not a real secret.
- [ ] Have `public/evidence/case-image-evidence.jpg` ready to upload live — it's a seeded corpus item (`prisma/seed.ts`), so uploading it live guarantees a **real** cross-case/corpus match during the demo, not a coincidence you have to hope for.
- [ ] Do one full silent run-through immediately before presenting, exactly as scripted below, so you know current timings and that nothing regressed.
- [ ] Delete or ignore any leftover test cases from development (titles containing "temporary, to be deleted" or "UI audit" — harmless if judges see them, but cleaner if the case list doesn't have them visible. Do **not** delete their underlying audit-log rows — see `PS4_BUILD_STATUS.md`'s note on why that would break the hash chain; if it matters for demo polish, create a fresh case list filter/search instead of deleting).

## The script

### 1. Login (real auth, ~15s)
Open `/login`. Point out: real session auth, no public sign-up — accounts are provisioned by an administrator, matching how a real cell onboards staff (`prisma/seed.ts`'s own design note). Sign in as the investigator.

### 2. Dashboard (~30s)
Land on `/`. This is real data, not mock: Active Alerts, Open Cases, Evidence Analyzed (30d), Avg. Time to Verdict are computed from the actual database, not hardcoded. Point at the "Flagged media volume" chart and Recent alerts table — same story, real weekly verdict counts.

### 3. Create a new case, live (~90s)
Click **New Case**. Fill real particulars (FIR number, police station, your rank/badge — mention these are recorded on the Section 63 BSA certificate as declarant particulars). Pick **Image** as evidence type, upload `case-image-evidence.jpg` from the dropzone. Submit.

Say explicitly: *this just created a real case row and uploaded a real file — SHA-256 computed server-side on the actual bytes, not decorative.*

### 4. Investigate, live (~20-60s depending on classifier speed)
On the case page, click **Investigate**. Narrate while it runs: this is calling a real local ML service (not cloud, not mocked) that does face-crop detection + Grad-CAM, checks for a C2PA manifest, computes a perceptual hash and searches it against every other case and the seeded corpus, then runs all of that through the Evidence Fusion algorithm.

When it completes, walk through the result panel left to right:
- **Analysis pipeline**: each real step with real numbers (raw classifier score, C2PA present/valid, matches found).
- **Verdict**: the fused verdict + confidence.
- **Evidence fusion** section below: the signal-by-signal breakdown (fired/absent/contradicted) and the coverage-based cap math — *this is the answer to "walk me through the exact fusion weights when only the classifier fires"* (§10 Q&A prep) if asked.
- Because this file is a seeded corpus item, **"Matches found" will be > 0** — click into it to show the real cross-case/corpus match, not a hardcoded example.

### 5. Human override (~30s)
Click **Override** on the evidence card. Show the reason field is required (try submitting empty first if you want to demonstrate the validation, then fill it in). Submit a real override. Point out: this writes a real `VerdictOverride` row *and* a hash-chained `OVERRIDDEN` audit entry in the same transaction — not a client-side-only toggle.

### 6. Cross-case & corpus matches page (~20s)
Click **Cross-case & corpus matches** in the header. Real matches ordered by timestamp, not a live OSINT spread scrape (be upfront about that boundary — §10's Q&A prep: *"Is your propagation graph live data? No, seeded corpus by design."*).

### 7. Export the report (~30s)
Click **Report** → **Export PDF**. While it renders, mention this is a real headless-Chrome server-side render of the same authenticated page a human sees — not `window.print()`. When it opens, scroll to the bilingual Section 63 BSA certificate block and the chain-of-custody table. This is the direct answer to "how is this evidence actually usable in court" (§10) — be precise: it's a correctly-structured *draft*, legal validity attaches only once the investigating officer signs it.

### 8. Audit log (~30s)
Log out, log in as **admin**. Open **Audit Log** in the sidebar. Point at the green "Hash chain verified" banner — every entry across every case, independently re-verifiable, cross-checked against an append-only checkpoint file outside the database (`chattr +a` where the filesystem supports it). This is the direct answer to "what stops someone with disk access from rewriting your audit log."

### 9. Optional — NCII handling (~20s, if time allows)
Create or open a case with NCII sensitivity marked. Show the blur-by-default state and that clicking "View sensitive content" is itself a logged, auditable action.

### 10. Optional — audio detector (~20s, only if pre-warmed per the checklist)
Upload a short audio clip to a case, click Investigate. Note the honesty framing out loud: this is a voice-spoofing/synthesis classifier, not a splice/edit detector — it says nothing about whether audio was cut or rearranged.

## Closing line (have this ready verbatim)

*"Everything you just saw ran locally, offline, against real files — the only thing seeded ahead of time was the demo corpus, and we say so on screen everywhere it matters. Where we don't have a real capability yet — live web search, face-embedding cross-photo matching — we say that plainly instead of faking it."*

This directly mirrors the plan's own **Execution** and **Innovation** judging-criteria framing (§10) — lead with the fusion engine and the honesty, not "we built a detector."
