import "server-only";
import { Type } from "@google/genai";
import { buildClient, isGeminiConfigured } from "@/lib/image-description";

export interface ThreatAssessmentResult {
  containsThreat: boolean;
  severity: "low" | "medium" | "high" | null;
  reasoning: string | null;
  quote: string | null;
}

export interface CachedThreatAssessmentResult extends ThreatAssessmentResult {
  ranAt: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    containsThreat: {
      type: Type.BOOLEAN,
      description: "True only if the conversation genuinely contains a real threat of harm, violence, or intimidation — not sarcasm, fiction, hypotheticals, or ordinary heated language.",
    },
    severity: {
      type: Type.STRING,
      enum: ["low", "medium", "high"],
      nullable: true,
      description: "How serious the threat is, only when containsThreat is true.",
    },
    reasoning: { type: Type.STRING, nullable: true, description: "Brief, specific basis for the judgment." },
    quote: { type: Type.STRING, nullable: true, description: "The exact concerning excerpt from the transcript, if any." },
  },
  required: ["containsThreat", "severity", "reasoning", "quote"],
};

const PROMPT = `You are assisting a police investigator reviewing a call recording's transcript. Judge for yourself, honestly, whether this conversation genuinely contains a real threat of harm, violence, or intimidation directed at someone. Do not flag sarcasm, fiction, hypotheticals, song lyrics, or ordinary heated argument as a threat. If it does contain a real threat, set severity (low/medium/high), explain your reasoning briefly, and quote the exact concerning excerpt. If it does not, set containsThreat to false and leave severity, reasoning, and quote null — never fabricate a threat that isn't there.`;

/**
 * Real Gemini judgment of whether a call-recording transcript contains a
 * genuine threat — never inferred from keywords alone, and never invents a
 * threat when asked to judge a benign conversation. Same shared client
 * (buildClient()) and structured-JSON-schema pattern as news-summary.ts.
 */
export async function analyzeThreat(transcriptText: string): Promise<ThreatAssessmentResult> {
  const genAI = buildClient();
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nTranscript:\n${transcriptText}` }] }],
    config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const text = result.text;
  if (!text) throw new Error("Gemini returned no content.");

  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null || typeof (parsed as { containsThreat?: unknown }).containsThreat !== "boolean") {
    throw new Error("Gemini returned a malformed response.");
  }

  const raw = parsed as {
    containsThreat: boolean;
    severity: "low" | "medium" | "high" | null;
    reasoning: string | null;
    quote: string | null;
  };

  if (!raw.containsThreat) {
    return { containsThreat: false, severity: null, reasoning: raw.reasoning ?? null, quote: null };
  }
  return {
    containsThreat: true,
    severity: raw.severity ?? null,
    reasoning: raw.reasoning ?? null,
    quote: raw.quote ?? null,
  };
}

/** Whether threat detection is actually configured — same credential as
 * every other Vertex AI Gemini caller in this codebase. */
export function isThreatDetectionConfigured(): boolean {
  return isGeminiConfigured();
}
