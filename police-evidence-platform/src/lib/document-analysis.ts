import "server-only";
import { SchemaType } from "@google-cloud/vertexai";
import { buildClient, isGeminiConfigured } from "@/lib/image-description";

export interface DocumentSummaryResult {
  summary: string;
}

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "Two to four plain, factual, neutral sentences summarizing what this document actually says.",
    },
  },
  required: ["summary"],
};

const PROMPT = `You are assisting a police investigator reviewing a document exhibit. Summarize the following extracted text in plain, factual, neutral language — what the document actually says, not your opinion of it. Never invent content beyond what's in the text; if the text is too sparse or garbled to summarize confidently, say so plainly in the summary instead of guessing.`;

/**
 * Real Gemini plain-language summary of a document's actual extracted
 * text (MetadataResult.exifJson's textPreview) — same Vertex AI auth path
 * and structured-JSON-schema pattern as image-description.ts/news-summary.ts.
 */
export async function summarizeDocument(text: string): Promise<DocumentSummaryResult> {
  const vertexAI = buildClient();
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nDocument text:\n${text}` }] }],
  });

  const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) throw new Error("Gemini returned no content.");

  const parsed: unknown = JSON.parse(responseText);
  if (typeof parsed !== "object" || parsed === null || typeof (parsed as { summary?: unknown }).summary !== "string") {
    throw new Error("Gemini returned a malformed response.");
  }

  return { summary: (parsed as { summary: string }).summary };
}

/** Whether document AI analysis (summary + threat detection) is actually
 * configured — same credential as every other Vertex AI Gemini caller. */
export function isDocumentAnalysisConfigured(): boolean {
  return isGeminiConfigured();
}

/** Pulls the real extracted text (metadata.ts's textPreview, up to 2000
 * chars) back out of MetadataResult.exifJson — the same text already
 * shown in the Document Details panel, not a fresh extraction. Null when
 * there's nothing to analyze (no exifJson, malformed, or empty preview). */
export function extractDocumentText(exifJson: string | null | undefined): string | null {
  if (!exifJson) return null;
  try {
    const info = JSON.parse(exifJson) as { textPreview?: unknown };
    return typeof info.textPreview === "string" && info.textPreview.trim() ? info.textPreview : null;
  } catch {
    return null;
  }
}
