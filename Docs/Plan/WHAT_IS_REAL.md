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
- Reverse-image search — real multi-provider architecture (one working engine today, Google Cloud Vision Web Detection; structured so a second provider can be added later without a rewrite once real credentials + a confirmed, privacy-safe API contract exist for one). Sends evidence bytes directly to the provider (not a public URL), returns real exact/partial matches, referencing pages, and content labels, each tagged with which provider(s) actually found it; results from every configured provider are merged/deduped by URL into one list. Cached per-provider and re-runnable, credentialed in this environment (`GOOGLE_APPLICATION_CREDENTIALS`). Blocked entirely (403, server-enforced) for NCII/minor-sensitivity evidence — never sent externally. This is real reverse-image search against providers' own indexes, not live scraping of specific social platforms (Telegram/X/WhatsApp) — that distinction still holds, see below.
- AI news-summary cards — for any reverse-image-search matched page, a real fetch of that page's actual public content plus a real Vertex AI Gemini call that judges for itself whether it's genuinely a news article and, if so, produces a real summary (headline/outlet/date/summary) from the real fetched text. Never fabricates a summary for a non-news page or one it couldn't read — falls back to a plain link. Cached by URL (a matched page can recur across evidence items, no reason to re-fetch/re-summarize).
- AI image description — real Vertex AI Gemini call describing an image/video frame and naming any recognizable person as a best-effort lead (never a verified identification); same caching/re-run pattern and same NCII/minor block as reverse-image search above.
- Geographic sighting map (on the propagation page) — real EXIF GPS extraction (when the camera embedded it — most files won't have it, honestly shown as absent) with real offline IP geolocation (`geoip-lite`, bundled city-level database, no live calls, no account/key) as a fallback when a request happened to carry a resolvable public IP. Each point is labeled with its actual source (EXIF GPS vs. IP geolocation) — never blended, never guessed. IP capture itself only works when something in front of the app sets `x-forwarded-for`/`x-real-ip`; running locally with no reverse proxy (e.g. at the venue) means most sightings will have no IP to geolocate, and EXIF GPS will be the source that actually populates points, when present.
- Threat detection (from a call/video transcript) — real Vertex AI Gemini judgment of whether the actual conversation content contains a genuine threat, never inferred from keywords, honestly returns "no threat" for ordinary conversation. Same NCII/minor sensitivity gate as reverse-image search/image description. Cached per-transcript, re-runnable.
- Per-frame Grad-CAM heatmaps (video) — every sampled frame already gets a real heatmap computed by the classifier; all of them are now persisted and browsable (not just the single worst-scoring frame), so the "where in the clip" question has a real answer across the whole video, not one static frame.
- Video diff against a matched original — real frame extraction + pixel comparison (`sharp` + `pixelmatch`) between an exhibit and a real cross-case match's actual file, at the same timestamp the primary heatmap already flags as most suspicious. Only runs when a real file exists to diff against — the seeded corpus only stores a thumbnail, so corpus-only matches get an honest "no full original available" message, never a fake diff. Best-effort visual diff (no frame-registration correction), disclosed as such in the UI.
- PDF digital-signature detection — real, structural: detects a signature via the standard `/ByteRange`+`/Contents` pattern, extracts the signer's name from the embedded certificate, and checks whether the signed byte range still covers the whole current file (the real, well-known way to detect bytes appended after signing). Deliberately does not attempt full PKCS#7 cryptographic verification against a certificate authority trust chain — see the limitation below.

## Not real / not built

The UI says so plainly wherever these would appear — never faked, never a silent gap.

- Live social-platform spread scraping (Telegram/X/WhatsApp propagation tracing) — not built, explicit non-goal; reverse-image search (above) covers "does this appear elsewhere on the web," not "how did it spread across specific platforms"
- "Same person, different photo" matching (face-embedding across different pictures) — not built; only exact/near-duplicate *file* matching exists (hash-based). Gemini image description can name a recognizable person as a best-effort lead, which is a different (non-biometric) mechanism — see above.
- Propagation graph — not live social-media scraping; built from a small seeded demo corpus, labeled "illustrative demo corpus" everywhere it's shown
- Anything requiring live internet access at runtime — the whole app is designed to run fully offline after initial setup

## Real, but with a known limitation (disclosed, not hidden)

- **Image classifier**: real model, but calibration testing found it misreads ordinary compressed real-world photos (scores some unedited photos suspiciously high on raw score). The Evidence Fusion engine's corroboration requirement is what protects the final verdict from this — a raw high score with zero corroborating signal is always capped to `INCONCLUSIVE`, never forced to `MANIPULATED`. Full writeup: `ml-service/README.md` → "Calibration finding."
- **Audio detector**: only catches voice synthesis/spoofing, says nothing about whether audio was cut or spliced.
- **`chattr +a` audit-log hardening**: doesn't actually work on this filesystem (checked, not assumed) — falls back to mirroring the checkpoint file via syslog instead. Disclosed in code and docs, not silently swapped.
- **Document tamper check**: one narrow, checkable fact (file modified after its stated creation date), not a real forgery-detection model — deliberately does *not* feed into the verdict, since there's no real classifier behind it.
- **PDF digital-signature check**: real structural detection (signature present, signer name, whether the signed range covers the whole file) but deliberately does *not* cryptographically verify the signature (RSA-verify the digest against the certificate's public key, or validate a certificate-authority trust chain) — hand-rolling that correctly against every real signing tool's ASN.1 encoding choices was judged too fragile to ship; a wrong "cryptographically valid" claim would be worse than not making it.
- **Video diff**: a best-effort visual pixel diff, not a frame-registration-corrected forensic technique — highlighted pixels show where two frames differ, not necessarily the manipulated region specifically. Only available against real cross-case matches, never the seeded corpus.

## One thing worth knowing

A handful of pre-existing curated demo cases (referenced from `Docs/incidents/`, e.g. `CHD-2026-00124`) still render through an old mock-data-driven page that predates this real build — that one *does* show fabricated data on purpose, since it was never migrated. Any case created through the actual app goes through the fully real path and never touches that mock data.
