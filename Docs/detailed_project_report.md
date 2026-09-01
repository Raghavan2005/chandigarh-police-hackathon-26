# AI Forensic Evidence Platform (Project PS4)
## Complete Picture of the Project

We are building an **AI Forensic Evidence Platform**, a command-console web application designed specifically for police investigators and law enforcement agencies. This project addresses Problem Statement 4 (PS4) of the Chandigarh Police Hackathon'26: **AI-Generated Media Detection & Cross-Platform Origin Tracing**. 

Unlike generic consumer SaaS apps or simple deepfake detectors, this platform is an **investigator workflow and evidence-chain tool**. It is designed with a "Dark by default, evidence-first" philosophy, resembling a SOC/SIEM dashboard. The platform does not just ask, *"Is this a deepfake?"* Instead, it asks: *"What happened to this evidence, why do we believe it's manipulated, where did it originate, how did it spread, and can an investigator defend this conclusion?"* 

It combines multiple weak signals (AI-artifact scores, metadata, C2PA provenance credentials, OSINT web evidence, and hash matches) into an explainable, audit-logged verdict, ultimately outputting a chain-of-custody-compliant report ready for the Indian legal process.

---

## Problem Statement

**Title:** Development of an AI-Powered Digital Forensic Platform to Detect AI-Generated or Manipulated Images and Videos, Verify Their Authenticity, and Trace Their Origin and Dissemination Across Social Media.

**The Reality:** The volume of AI-generated media and deepfakes is growing explosively, leading to severe issues like political manipulation, financial fraud, and NCII (Non-Consensual Intimate Imagery) abuse. Law enforcement lacks a unified, legally compliant tool to detect these manipulations, explain the AI's reasoning, trace the media's spread across social platforms, and package this data as court-admissible evidence. 

---

## Proposed Solution

Our solution is a **Multi-Signal Investigator Console**. Recognizing that deepfake detectors alone are commoditized and prone to generalization failures, our platform focuses on **evidence fusion and workflow integration**. 

The proposed solution orchestrates an AI investigation pipeline that:
1. Validates the media using fine-tuned AI classifiers and visualizes manipulations via heatmaps.
2. Corroborates authenticity by parsing EXIF data and C2PA (Content Credentials) manifests.
3. Conducts OSINT and perceptual hashing against an evidence corpus to find reverse matches.
4. Synthesizes these findings into an explainable "Evidence Fusion" verdict (Authentic / Manipulated / AI-Generated / Inconclusive) that exposes uncertainty instead of making overconfident binary claims.
5. Generates a secure, printable evidence report complete with a tamper-evident audit log.

---

## Features We Currently Have (UI / Prototype Build)

Our current Next.js-based prototype includes the following implemented features and UI screens:

- **Dashboard / Landing:** KPI metrics (Active alerts, avg. time to verdict), anomaly trend charts, and a recent alerts table.
- **Evidence Upload Zone:** A secure dropzone with real-time, client-side SHA-256 hash generation for immediate tamper-evidence.
- **Investigation Core View:**
  - **Evidence Viewer:** Media player equipped with a **Heatmap Toggle** to overlay manipulation-localization masks (e.g., highlighting modified facial regions).
  - **Live Analysis Pipeline:** An animated, step-by-step pipeline showing the AI's work (Metadata extraction, manipulation analysis, provenance checks, OSINT search).
  - **Verdict Block:** Confidence meter detailing the specific reasons for the verdict.
  - **Face Match / OSINT Panel:** Displays sources and matches found across the web.
- **Propagation Graph:** A chronological timeline and node-based graph showing how media spread across platforms (e.g., Telegram → X → Facebook).
- **Evidence Fusion Panel:** A signal stack showing how different methods (ML, C2PA, Metadata, Hash) contributed to the final verdict.
- **Audit Log & Export:** A dense, mono-font table tracking chain-of-custody (who uploaded, analyzed, or exported evidence) and a module to export printable PDF/JSON evidence reports.

---

## Key Features

1. **Multi-Modal Detection Engine:** Support for analyzing Images, Videos, Audio, and Documents/PDFs.
2. **Chain of Custody / Tamper-Evident Vault:** Immutable tracking of evidence from upload to export.
3. **Multi-Signal Evidence Fusion:** Combines AI detection, metadata parsing, and cryptographic provenance (C2PA) into one view.
4. **Explainable AI (Manipulation Localization):** Grad-CAM/Saliency heatmaps that highlight *where* the manipulation occurred, allowing human verification.
5. **Cross-Platform Origin Tracing:** Simulated propagation graphs detailing the media's timeline and earliest known source.
6. **Human-in-the-loop Review:** The AI assists but does not replace the investigator, allowing for manual overrides and "Inconclusive" verdicts.
7. **Evidence-Grade Reporting:** Generation of case reports tailored to Indian law enforcement processes (aligned with I4C/CFSL).

---

## Deliverables / Proposed Outcome

1. **Round-1 UI Prototype & Demo Video:** A high-fidelity, interactive front-end prototype (Dark Mode) demonstrating the complete investigator workflow using curated case studies (e.g., a viral fake quote video).
2. **Evidence-Workflow Architecture:** A defined backend orchestration strategy using controlled tools (not unrestricted web browsing) to prevent LLM hallucinations.
3. **Robust Pitch Deck & Feasibility Report:** Documentation that honestly addresses AI generalization risks and social media API limitations while highlighting our superior workflow and evidence-chain integration as the core innovation.
4. **Final Hackathon MVP (Target):** A scoped build integrating a fine-tuned CNN classifier, open-source C2PA validation, and a seeded-corpus OSINT reverse-search, all wrapped in our investigator dashboard.
