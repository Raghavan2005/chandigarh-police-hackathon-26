import "server-only";
import { GoogleGenAI } from "@google/genai";
import { SchemaType } from "@google-cloud/vertexai";
import { buildClient } from "@/lib/image-description";

export interface ClaimCitation {
  title: string;
  url: string;
  domain: string;
}

export interface ClaimVerificationResult {
  // "confirmed": real sources show the person did say/do this.
  // "debunked": real sources show this is false/fabricated (e.g. a
  //   fact-check specifically addressing this claim).
  // "unclear": no real coverage found either way — absence of evidence,
  //   not evidence of absence.
  verdict: "confirmed" | "debunked" | "unclear";
  summary: string;
  citations: ClaimCitation[];
}

function buildGenAIClient(): GoogleGenAI {
  const projectId = process.env.GEMINI_GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("GEMINI_GCP_PROJECT_ID is not set.");
  }
  return new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: "us-central1",
    googleAuthOptions: { keyFilename: process.env.GEMINI_APPLICATION_CREDENTIALS },
  });
}

const RESEARCH_PROMPT = (claim: string) =>
  `You are assisting a police investigator determining whether a person actually made a specific statement, based on real news and fact-check sources — not your own general knowledge. Claim/transcript content in question:\n\n"${claim}"\n\nSearch for and report what real, current sources say about this specific claim. Be specific about what you actually found (or didn't find) in the search results — never speculate beyond what the search results show, and say plainly if you found no coverage either way.`;

const STRUCTURE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: {
      type: SchemaType.STRING,
      enum: ["confirmed", "debunked", "unclear"],
      description:
        "'confirmed' if real sources show the person did say/do this; 'debunked' if real sources (e.g. a fact-check) show this is false/fabricated; 'unclear' if no real coverage was found either way.",
    },
    summary: {
      type: SchemaType.STRING,
      description: "Two to four plain, factual sentences summarizing what the research actually found.",
    },
  },
  required: ["verdict", "summary"],
};

const STRUCTURE_PROMPT = `Based on the research findings below, produce a structured verdict. Never upgrade "no coverage found" to "confirmed" or "debunked" — that case is "unclear".`;

/**
 * Real claim verification — genuinely different from every other AI
 * capability in this build: instead of asking Gemini to judge from its own
 * training knowledge, this performs a real, live Google Search (Vertex AI
 * grounding, via the newer @google/genai SDK — the older
 * @google-cloud/vertexai client used elsewhere in this codebase only
 * exposes the deprecated googleSearchRetrieval tool, which the Gemini 2.5
 * models this app uses reject outright; confirmed live, not assumed) and
 * reports what real, current sources actually say, with real citation
 * URLs. Two calls, not one: Vertex AI rejects combining the Search tool
 * with structured/controlled JSON output in a single call (confirmed
 * live — "controlled generation is not supported with Search tool"), so a
 * second, tool-free call (same structured-JSON pattern as every other
 * Gemini caller here) turns the first call's real findings into a clean
 * verdict.
 */
export async function verifyClaim(claimText: string): Promise<ClaimVerificationResult> {
  const genAI = buildGenAIClient();

  const searchResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: RESEARCH_PROMPT(claimText),
    config: { tools: [{ googleSearch: {} }] },
  });
  const researchText = searchResponse.text;
  if (!researchText) {
    throw new Error("Gemini grounded search returned no content.");
  }

  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const citations: ClaimCitation[] = groundingChunks
    .filter((c): c is typeof c & { web: NonNullable<typeof c.web> } => Boolean(c.web?.uri))
    .map((c) => ({
      title: c.web.title ?? c.web.domain ?? "Source",
      url: c.web.uri as string,
      domain: c.web.domain ?? "",
    }));

  const vertexAI = buildClient();
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", responseSchema: STRUCTURE_SCHEMA },
  });
  const structureResult = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${STRUCTURE_PROMPT}\n\nResearch findings:\n${researchText}` }] }],
  });

  const structureText = structureResult.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!structureText) {
    throw new Error("Gemini returned no content for the structuring step.");
  }
  const parsed: unknown = JSON.parse(structureText);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !["confirmed", "debunked", "unclear"].includes((parsed as { verdict?: unknown }).verdict as string)
  ) {
    throw new Error("Gemini returned a malformed response.");
  }
  const raw = parsed as { verdict: "confirmed" | "debunked" | "unclear"; summary: string };

  return { verdict: raw.verdict, summary: raw.summary, citations };
}

/** Whether claim verification is actually configured — needs the same
 * Gemini credential as every other caller, plus the newer @google/genai
 * SDK actually being installed (it's a separate package from
 * @google-cloud/vertexai, added specifically for Search grounding). */
export function isClaimVerificationConfigured(): boolean {
  return Boolean(process.env.GEMINI_APPLICATION_CREDENTIALS && process.env.GEMINI_GCP_PROJECT_ID);
}
