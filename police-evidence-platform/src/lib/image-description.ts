import "server-only";
import { existsSync } from "fs";
import { GoogleGenAI, Type } from "@google/genai";

export interface PossibleIdentity {
  name: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface ImageDescriptionResult {
  description: string;
  possibleIdentities: PossibleIdentity[];
}

export interface CachedImageDescriptionResult extends ImageDescriptionResult {
  ranAt: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "One or two plain sentences describing what is visible in the image overall.",
    },
    possibleIdentities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
          reasoning: {
            type: Type.STRING,
            description: "Brief, specific visual basis for the guess (e.g. distinctive attire, setting, other people present).",
          },
        },
        required: ["name", "confidence", "reasoning"],
      },
      description:
        "Only named, publicly recognizable individuals you are genuinely confident are depicted, based on well-known public appearance. Empty array if no one is recognizable or if any person present is a private individual.",
    },
  },
  required: ["description", "possibleIdentities"],
};

const PROMPT = `You are assisting a police forensic evidence review. Describe this image plainly and factually.

If any well-known public figure (politician, celebrity, other widely-recognized public person) appears to be depicted, list them in possibleIdentities with your honest confidence. Only include a name if you have a real, specific visual basis for it (distinctive, well-known appearance/attire/context) — do not guess a plausible-sounding name just to fill the field. If the person(s) shown are ordinary/private individuals, or you are not genuinely confident, leave possibleIdentities empty rather than speculating. Never fabricate a name.`;

/** Shared Gemini client builder — exported so every other Gemini caller
 * (threat-detection.ts, document-analysis.ts, mindmap-server.ts,
 * news-summary.ts, claim-verification.ts) reuses the exact same auth path
 * instead of duplicating credential logic. Two real auth modes, tried in
 * this order:
 * 1. GEMINI_API_KEY — a plain Gemini Developer API key from
 *    aistudio.google.com/apikey. No GCP project, billing, or service
 *    account needed — the quick, free, personal route.
 * 2. GEMINI_APPLICATION_CREDENTIALS + GEMINI_GCP_PROJECT_ID — a GCP
 *    service-account key with the Vertex AI User role (see
 *    secrets/README.md). What this app originally shipped with; still
 *    supported for whoever already has one.
 * Both go through the same @google/genai SDK and the same
 * models.generateContent() call shape below — the SDK itself abstracts
 * the difference, this file only decides which credential to hand it. */
export function buildClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }
  const projectId = process.env.GEMINI_GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("Neither GEMINI_API_KEY nor GEMINI_GCP_PROJECT_ID is set.");
  }
  return new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: "us-central1",
    googleAuthOptions: {
      keyFilename: process.env.GEMINI_APPLICATION_CREDENTIALS,
    },
  });
}

/**
 * Real AI image description via Vertex AI Gemini — mechanistically
 * different from Cloud Vision (`reverse-image-search.ts`): Gemini directly
 * analyzes the image's content using its own trained knowledge, instead of
 * matching/inferring from other indexed web pages. That's what makes it
 * capable of naming a recognizable public figure at all (Vision API has no
 * face/identity recognition feature whatsoever) — but it's still a
 * language model making a best-effort visual judgment, not a verified
 * biometric match, and can hallucinate a plausible-sounding wrong name.
 * Every caller must present this as an investigative lead, never a
 * confirmed identification.
 */
export async function describeImage(imageBuffer: Buffer, mimeType: string): Promise<ImageDescriptionResult> {
  const genAI = buildClient();
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = result.text;
  if (!text) {
    throw new Error("Gemini returned no content.");
  }

  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { description?: unknown }).description !== "string" ||
    !Array.isArray((parsed as { possibleIdentities?: unknown }).possibleIdentities)
  ) {
    throw new Error("Gemini returned a malformed response.");
  }

  const raw = parsed as { description: string; possibleIdentities: unknown[] };
  return {
    description: raw.description,
    possibleIdentities: raw.possibleIdentities
      .filter(
        (p): p is PossibleIdentity =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as PossibleIdentity).name === "string" &&
          ["high", "medium", "low"].includes((p as PossibleIdentity).confidence) &&
          typeof (p as PossibleIdentity).reasoning === "string",
      ),
  };
}

/** Shared Gemini configuration check — every Gemini-backed feature (image
 * description, threat detection, document analysis, claim verification,
 * mind map) imports this instead of duplicating it. True if either real
 * auth mode buildClient() accepts is actually usable: a plain
 * GEMINI_API_KEY, or a GEMINI_APPLICATION_CREDENTIALS file that actually
 * exists on disk (not just an env var pointing at a path — a missing key
 * file, see secrets/README.md, never committed, must be copied in per
 * machine) plus GEMINI_GCP_PROJECT_ID. Checking real usability here, not
 * just "is some env var set," is what lets every caller give an honest
 * "not configured" response instead of a confusing runtime error. */
export function isGeminiConfigured(): boolean {
  if (process.env.GEMINI_API_KEY) return true;
  const keyPath = process.env.GEMINI_APPLICATION_CREDENTIALS;
  return Boolean(keyPath && process.env.GEMINI_GCP_PROJECT_ID && existsSync(keyPath));
}

/** Whether Gemini image description is actually configured — checked
 * before offering the feature so a missing credential shows an honest
 * "not configured" state instead of a confusing runtime error. */
export function isImageDescriptionConfigured(): boolean {
  return isGeminiConfigured();
}
