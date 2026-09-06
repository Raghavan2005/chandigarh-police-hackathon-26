import "server-only";
import { existsSync } from "fs";
import { SchemaType, VertexAI } from "@google-cloud/vertexai";

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
  type: SchemaType.OBJECT,
  properties: {
    description: {
      type: SchemaType.STRING,
      description: "One or two plain sentences describing what is visible in the image overall.",
    },
    possibleIdentities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
          reasoning: {
            type: SchemaType.STRING,
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

/** Shared Vertex AI client builder — exported so other Gemini callers
 * (news-summary.ts) reuse the exact same auth path instead of duplicating
 * credential logic. */
export function buildClient(): VertexAI {
  const projectId = process.env.GEMINI_GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("GEMINI_GCP_PROJECT_ID is not set.");
  }
  return new VertexAI({
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
  const vertexAI = buildClient();
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
        ],
      },
    ],
  });

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
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

/** Shared Gemini/Vertex AI configuration check — every Gemini-backed
 * feature (image description, threat detection, document analysis, claim
 * verification, mind map) imports this instead of duplicating it. Checks
 * that the credential file actually exists on disk, not just that the env
 * var pointing at it is set — a missing key file (see secrets/README.md;
 * never committed, must be copied in per-machine) previously passed this
 * check and only failed later as a confusing runtime error instead of the
 * honest "not configured" response every caller is already designed to
 * give when this returns false. */
export function isGeminiConfigured(): boolean {
  const keyPath = process.env.GEMINI_APPLICATION_CREDENTIALS;
  return Boolean(keyPath && process.env.GEMINI_GCP_PROJECT_ID && existsSync(keyPath));
}

/** Whether Gemini image description is actually configured — checked
 * before offering the feature so a missing credential shows an honest
 * "not configured" state instead of a confusing runtime error. */
export function isImageDescriptionConfigured(): boolean {
  return isGeminiConfigured();
}
