# What's real vs. not — PS4 platform

A plain-language summary of what actually works vs. what's missing or limited, for anyone (team, judges, Q&A prep) who wants the honest picture without reading the full build log in `PS4_BUILD_STATUS.md`. Update this file whenever a "not real" item becomes real, or a new limitation is found — don't let it go stale.

## Real (built, wired to actual data, verified live)

- Login/auth — real sessions, real password hashing, no public sign-up
- Case creation — real DB rows, FIR/CCTNS number required
- Evidence upload — real SHA-256 computed server-side on the actual stored bytes
- Metadata/EXIF extraction — real (ffprobe / exifr / pdf-parse)
- Image/video deepfake detection — real ML model (`not-lain/deepfake`), real Grad-CAM heatmap
- Audio deepfake/voice-spoofing detection — real ML model (`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`)
- Face detection box + crop — real MTCNN output (actual detected coordinates + the actual aligned face crop the classifier scored)
- C2PA provenance check — real check (most files simply won't have a manifest — shown as neutral, not suspicious, when absent)
- Perceptual-hash cross-case/corpus matching — real Hamming-distance matching against other cases and the seeded corpus
- Evidence Fusion — real deterministic coverage-capping algorithm, not a mock verdict field
- Human override — real, persisted to the database and the audit trail
- Chain-of-custody audit log — real, hash-chained, cross-checked against an append-only checkpoint file outside the database
- PDF/JSON report export — real, server-rendered, bilingual Section 63 BSA two-part evidentiary certificate
- Role-based access control — real (admin vs. investigator gating, enforced on every route)
- NCII/minor-sensitivity blur-then-reveal — real, the reveal action itself is logged
- Document/PDF metadata extraction + tamper heuristic — real
- Dashboard KPIs — computed from real case/evidence/verdict data, not hardcoded

## Not real / not built

The UI says so plainly wherever these would appear — never faked, never a silent gap.

- OSINT / reverse-image / live web search — not built at all, needs a search API key we don't have
- "Same person, different photo" matching (face-embedding across different pictures) — not built; only exact/near-duplicate *file* matching exists (hash-based)
- Propagation graph — not live social-media scraping; built from a small seeded demo corpus, labeled "illustrative demo corpus" everywhere it's shown
- Anything requiring live internet access at runtime — the whole app is designed to run fully offline after initial setup

## Real, but with a known limitation (disclosed, not hidden)

- **Image classifier**: real model, but calibration testing found it misreads ordinary compressed real-world photos (scores some unedited photos suspiciously high on raw score). The Evidence Fusion engine's corroboration requirement is what protects the final verdict from this — a raw high score with zero corroborating signal is always capped to `INCONCLUSIVE`, never forced to `MANIPULATED`. Full writeup: `ml-service/README.md` → "Calibration finding."
- **Audio detector**: only catches voice synthesis/spoofing, says nothing about whether audio was cut or spliced.
- **`chattr +a` audit-log hardening**: doesn't actually work on this filesystem (checked, not assumed) — falls back to mirroring the checkpoint file via syslog instead. Disclosed in code and docs, not silently swapped.
- **Document tamper check**: one narrow, checkable fact (file modified after its stated creation date), not a real forgery-detection model — deliberately does *not* feed into the verdict, since there's no real classifier behind it.

## One thing worth knowing

A handful of pre-existing curated demo cases (referenced from `Docs/incidents/`, e.g. `CHD-2026-00124`) still render through an old mock-data-driven page that predates this real build — that one *does* show fabricated data on purpose, since it was never migrated. Any case created through the actual app goes through the fully real path and never touches that mock data.
