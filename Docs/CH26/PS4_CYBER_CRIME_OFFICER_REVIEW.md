# PS4 — Field Review: Cyber Crime Investigating Officer Perspective

**Reviewer persona:** Sub-Inspector, Cyber Crime Cell (simulated domain-expert review — not an actual department officer or official endorsement; written to pressure-test the platform against real Indian law-enforcement workflow before the 24-hour build).
**Subject reviewed:** `police-evidence-platform/` as currently implemented — the actual UI/code, not just the design spec.
**Purpose:** what an investigating officer would flag as missing or wrong if handed this tool today, prioritized by what actually blocks real use versus what's just nice-to-have.

---

## Overall impression

The visual language is right — this looks like a tool built for a SOC, not a demo toy, and that matters more than people think when you're trying to get a DSP to trust a screen instead of a paper file. The four-way verdict space (not forcing REAL/FAKE), the confidence meter instead of a bare percentage, and the disclaimer banner on the report ("Investigative triage aid — not certified evidence. Human review required") are all things I'd expect from a team that's actually thought about how this gets used, not just how it demos.

That said, as it stands this is a **detection and visualization tool**. It is not yet an **investigation and evidence-management tool** — and for a Cyber Crime Cell, the second thing is what actually gets used every day. Below is what's missing, grouped by how much it would block real adoption.

---

## 1. Critical — evidence won't hold up without these

**No FIR / CCTNS linkage anywhere in the case record.** `CaseSummary` (`src/lib/types.ts`) has no FIR number field. In practice, every piece of digital evidence I touch is tied to an FIR under CCTNS from day one — a case that exists only as an internal `CHD-2026-XXXXX` ID with no link to the FIR is not usable evidence, it's a standalone tool. This needs to be a required field at case creation, not an afterthought.

**No Section 65B / BSA certificate generation.** The exported report (`report-preview.tsx`) is a good-looking summary, but it is not what a court needs. Under the Bharatiya Sakshya Adhiniyam (successor to Evidence Act Section 65B), electronic evidence needs a certificate of authenticity — who extracted it, from what device, using what process, signed by the person in control of the device/system at the time. Right now the report has "Signed off by {investigator}" as a plain text line with no formal certificate block, no officer rank/ID, no device/system identification. This is the single biggest gap between "nice dashboard" and "usable in court."

**Verdict override is not actually persisted.** I opened the override dialog on the case page and it says outright: *"overrides are shown locally on this panel only and are not yet written to the audit trail or reflected elsewhere on the case."* This is a functional gap, not a copy issue — human-in-the-loop review is supposed to be the whole point of this system (per the platform's own design docs), and right now a supervisor's override doesn't survive a page refresh, let alone end up in the chain of custody. This has to be real before it's demoed to anyone who'll ask "so what happens when the AI is wrong and I correct it?"

**The audit log is not tamper-evident.** `/audit` (`src/app/audit/page.tsx`) is a plain table reading from one hardcoded case's log. A chain-of-custody log that anyone with DB access can edit is not a chain of custody — it needs to be append-only and each entry should be hash-chained to the previous one (or otherwise cryptographically sealed), so that "the log itself hasn't been altered" is a claim the platform can actually back up, not just assert.

---

## 2. Critical — sensitive content handling

**No protection for NCII (non-consensual intimate imagery) or minors.** The docs explicitly name NCII abuse as a use case, but nothing in the evidence viewer, case list thumbnails, or dashboard suggests any restricted-access tier or blur-by-default behavior for this content class. A case list should never show a raw thumbnail of NCII or POCSO-relevant material to anyone browsing the dashboard — it should be blurred/masked until a specific investigator with justification opens it, and that open action itself should be separately logged. Right now every case thumbnail renders the same way regardless of content sensitivity.

**No content/offense classification.** There's no field anywhere for what kind of case this is — NCII, political disinformation, financial fraud, communal-harmony risk, impersonation. These categories have different legal handling (POCSO applicability, IT Rules 2021 intermediary-notice timelines, different escalation paths), and the platform currently treats every case identically.

---

## 3. Security & access control — currently absent, not just weak

**There is no login screen in the app at all.** I checked `src/app/` — there's a dashboard, case pages, audit page, but no auth route. Anyone who can reach the URL sees every case. For a tool holding evidence including NCII material, this is not a "harden it later" item — it's a blocker before this touches anything real. The `CaseMetaPanel` shows a single "Investigator" text field with no session/identity behind it at all.

**No role separation.** Constable-level access, investigating-officer access, and supervisory (DSP/SP-level sign-off) access are all different in a real cell. An "Override verdict" action especially should require investigator-plus-supervisor, not be a single click available to whoever's looking at the screen.

**No watermarking on exports.** If a report or evidence screenshot leaks, there's currently no way to trace which officer's account exported it. Every PDF/JSON export should be watermarked with exporting officer ID + timestamp.

---

## 4. Case management gaps — the daily-use workflow

**"Assign investigator" button does nothing.** It's present in the UI (`case-meta-panel.tsx`) but has no handler — no case load-balancing, no assignment history.

**No case priority or SLA tracking.** The dashboard KPI row shows "Avg. Time to Verdict" as a stat, but there's no per-case priority (a viral political deepfake the night before an election is not the same urgency as a routine complaint) and no alerting when a case sits past its SLA.

**No supervisory review layer.** Every action in the current flow is one investigator acting alone. Real cases — especially anything that might go to court — need a second sign-off before a verdict is finalized, not just an "Override" button available to the same single role.

**No case notes / collaboration.** Beyond the override reason field (which itself isn't persisted yet — see §1), there's nowhere for an investigator to leave running notes, and no way for a second officer to be looped into a case with comments.

**Single hardcoded case on the audit page.** `/audit` only ever shows `CHD-2026-00124`'s log — no per-case filtering, no search, no date range, no export of the audit log itself.

---

## 5. Missing intelligence: connecting cases to each other

**No cross-case search.** I can't search "has this exact hash, this face, or this phone number/handle appeared in any other case" from the UI — every case is viewed in isolation. In real cyber-crime work, the same fabricated video reposted under five different complaints, or the same face appearing across three unrelated NCII cases, is exactly the pattern that identifies a repeat offender or an organized campaign. This is a real gap, not a stretch feature — it's the difference between closing five cases separately and identifying one accused running all five.

**No accused/suspect entity tracking.** There's no way to attach a suspect (name, handle, phone, device) to a case and see everything else linked to that same identity.

**No campaign/duplicate clustering across cases** — related to the above but distinct: even without a named suspect, visually near-identical media reposted across multiple *unrelated* complaints should surface as a linked cluster automatically.

---

## 6. Public-facing workflow — where cases actually originate

**No NCRP / I4C intake path.** Most cyber-crime cases start life as a complaint filed on the National Cyber Crime Reporting Portal (cybercrime.gov.in), with an NCRP acknowledgment number. Right now the only way a case enters this system is an investigator manually uploading a file (`/cases/new`) — there's no field for the originating NCRP number and no import path from a citizen complaint. This matters for both traceability and for closing the loop back to the complainant.

**No complainant status updates.** Once a case is logged, the person who filed the original complaint has no visibility into it through this system — that's normally expected at least at a basic "under investigation / resolved" level.

---

## 7. Takedown and escalation — the actual outcome we need, not just a graph

**Propagation graph doesn't lead anywhere actionable.** The graph is genuinely useful for understanding spread, but there's no next step from it — no "generate takedown/blocking request" action referencing IT Rules 2021 intermediary obligations or Section 69A, addressed to the platform where the earliest/most-viral copy was found. Right now it's a visualization, not a workflow.

**No automated alerting for high-severity patterns.** If a case's propagation shows rapid multi-platform spread of an AI-generated video near an election or a communal-sensitive event, that should trigger a proactive alert up the chain (to a state cyber cell or I4C), not wait for an investigator to notice it in a queue.

---

## 8. Report/export polish gaps

**No digital signature on exports.** A real evidentiary export should be cryptographically signed (or at minimum eSign-integrated), not just a PDF anyone could edit before forwarding.

**No language localization.** Everything is English-only. Reports going into court in Punjab/Chandigarh, and complainant-facing material, often need Hindi or Punjabi — at minimum the printable report should support this.

**Technical Provenance panel shows identical placeholder values for every case** (`case-meta-panel.tsx` — same truncated SHA-256, same "EXIF Data: Stripped," same "C2PA Manifest: No Signature" regardless of which case is open). This is a mock-data limitation the team already knows about, but flagging it here because in a live demo to an actual officer, showing the *same* technical fingerprint on every piece of evidence would immediately read as fake, undermining trust in everything else on screen.

---

## 9. Lower priority / genuinely nice-to-have

- Mobile-friendly capture flow for field collection (seizure at the scene, not always at a desk).
- Configurable data-retention/purge policy, especially for NCII material once a case closes.
- Bulk import for cases originating from a raid/device seizure rather than one-at-a-time upload.

---

## Prioritized punch list

**Must exist before this touches a real case (legal/security blockers):**
1. FIR/CCTNS number field on every case
2. Section 65B/BSA-style evidentiary certificate in the exported report, not just a summary
3. Verdict override actually persisted to the audit trail
4. Tamper-evident (hash-chained) audit log
5. Login/auth screen + role-based access, especially before any NCII content is involved
6. Restricted-access/blur-by-default handling for NCII and minors-related content

**Should exist before the Grand Finale demo (credibility with judges who've worked a real case):**
7. Case offense classification (NCII / fraud / disinfo / etc.)
8. Cross-case search by hash/face — this is a strong differentiator to show, not just a gap to fix
9. Working "Assign investigator" + a supervisory sign-off step
10. Per-case (not hardcoded) audit log view with filtering
11. Case-specific (not identical-placeholder) technical provenance data

**Roadmap-slide material (name them as "planned," don't attempt to build all of this in the time left):**
12. NCRP/I4C complaint intake + complainant status updates
13. Takedown-request generation from the propagation graph
14. Automated escalation alerting for high-severity spread patterns
15. Digital signature/eSign on exports, Hindi/Punjabi report localization
16. Accused/suspect entity tracking and campaign clustering across cases
