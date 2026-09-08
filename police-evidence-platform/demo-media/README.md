# demo-media/

Drop-in folder for the raw source files backing the 7 demo cases (see the
project memory / chat log for the full plan — 2 AI-image, 1 AI-video, 1
audio, 1 document, 1 mixed "raw dump", 1 CCTV). Everything under here except
this README is gitignored — these are large raw media files, not app code,
and don't belong in source control.

Drop files into the matching subfolder; the case-seeding step will pick them
up from here to actually upload as real Evidence into each case (real
SHA-256/pHash computed from the actual bytes, real ML analysis run against
them — nothing here is faked or referenced without being real evidence in
the DB).

- `1-ai-image-premade/` — AI-generated image for the case built ahead of time (for walkthrough/screenshots)
- `2-ai-image-live-demo/` — AI-generated image reserved for creating the case live in front of judges (not pre-seeded)
- `3-ai-video/` — deepfake/manipulated video
- `4-audio/` — call recording / voice note (voice-clone or threat-detection angle)
- `5-document/` — PDF/scanned document (signature/tamper-detection angle)
- `6-raw-dump/` — a genuine mix of evidence types (screenshots, a recording, a PDF, etc.) for the cross-evidence mind-map use case — needs more than one file/type to be a meaningful test
- `7-cctv/` — CCTV footage, plus a separate reference face photo or plate string to match against it
