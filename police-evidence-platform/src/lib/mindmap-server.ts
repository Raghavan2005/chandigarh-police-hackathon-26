import "server-only";
import { SchemaType } from "@google-cloud/vertexai";
import { buildClient, isGeminiConfigured } from "@/lib/image-description";
import { extractDocumentText } from "@/lib/document-analysis";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type RealEvidence = RealCase["evidence"][number];

function safeParse<T>(json: string | null | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** One real per-exhibit text block gathered for the mind-map synthesis —
 * only ever the text an investigator can already see elsewhere on this
 * exhibit (transcript/translation text, AI image descriptions, per-face
 * labels/notes, document text/summaries), never anything computed fresh
 * here. */
export interface CaseMindMapExhibitText {
  evidenceId: string;
  label: string;
  textBlock: string;
}

export interface CaseTextAggregation {
  /** Only exhibits that actually had at least one real text section — an
   * exhibit with, say, only a deepfake score and no transcript/description/
   * document text contributes nothing here, which is expected and honest. */
  exhibits: CaseMindMapExhibitText[];
  /** Every exhibit's text block joined into one prompt-ready document. */
  combinedText: string;
  /** Total evidence rows on the case, real analyzed-text-or-not — used to
   * show "3 of 7 exhibits have analyzable text" rather than just the count
   * that made it in. */
  totalEvidenceCount: number;
}

function gatherExhibitSections(ev: RealEvidence): string[] {
  const sections: string[] = [];

  if (ev.transcriptResult) {
    const segments = safeParse<{ text: string }[]>(ev.transcriptResult.segmentsJson) ?? [];
    const transcriptText = segments.map((s) => s.text).join(" ").trim();
    if (transcriptText) sections.push(`Transcript (language: ${ev.transcriptResult.language}): "${transcriptText}"`);

    for (const translation of ev.transcriptResult.translations) {
      const translatedSegments = safeParse<{ text: string }[]>(translation.segmentsJson) ?? [];
      const translatedText = translatedSegments.map((s) => s.text).join(" ").trim();
      if (translatedText) {
        sections.push(`Translation (to ${translation.targetLang}) of the above transcript: "${translatedText}"`);
      }
    }
  }

  if (ev.imageDescriptionResult) {
    sections.push(`AI description of this image/frame: ${ev.imageDescriptionResult.description}`);
    const identities = safeParse<{ name: string; confidence: string }[]>(ev.imageDescriptionResult.possibleIdentitiesJson) ?? [];
    if (identities.length > 0) {
      sections.push(
        `AI-suggested possible identities visible in this image (unverified leads, not confirmed): ${identities
          .map((i) => `${i.name} (${i.confidence} confidence)`)
          .join(", ")}`,
      );
    }
  }

  for (const face of ev.faceAnnotations) {
    if (face.label) {
      sections.push(`Investigator's own label for detected face #${face.faceIndex} in this exhibit: "${face.label}"`);
    }
    const faceDescription = safeParse<{ description?: string; possibleIdentities?: { name: string; confidence: string }[] }>(
      face.descriptionJson,
    );
    if (faceDescription?.description) {
      sections.push(`AI description of detected face #${face.faceIndex}: ${faceDescription.description}`);
    }
    if (faceDescription?.possibleIdentities && faceDescription.possibleIdentities.length > 0) {
      sections.push(
        `AI-suggested identity for detected face #${face.faceIndex} (unverified lead): ${faceDescription.possibleIdentities
          .map((i) => `${i.name} (${i.confidence} confidence)`)
          .join(", ")}`,
      );
    }
  }

  const documentText = extractDocumentText(ev.metadataResult?.exifJson);
  if (documentText) sections.push(`Document text (extracted excerpt): "${documentText}"`);
  if (ev.documentSummaryResult) sections.push(`AI summary of this document: ${ev.documentSummaryResult.summary}`);

  return sections;
}

/**
 * Real per-exhibit text aggregation for one case — gathers exactly what
 * PS4_USE_CASES.md #6 named as "the raw material [that] already exists":
 * transcript text (+ translations), AI image-description text, per-face
 * labels/notes, document text previews/summaries. Deliberately does NOT
 * touch cross-case/corpus matches or classifier scores — those aren't
 * "text about who/what/where," they're a different kind of signal already
 * surfaced elsewhere (propagation view). Takes the already-loaded
 * `getRealCase()` result rather than re-querying the DB — every relation
 * this needs is already `include`d there.
 */
export function aggregateCaseText(realCase: RealCase): CaseTextAggregation {
  const exhibits: CaseMindMapExhibitText[] = [];

  for (const ev of realCase.evidence) {
    const sections = gatherExhibitSections(ev);
    if (sections.length === 0) continue;
    exhibits.push({
      evidenceId: ev.id,
      label: `Exhibit ${ev.id} (${ev.mimeType}, uploaded ${ev.uploadedAt.toISOString().slice(0, 10)})`,
      textBlock: sections.join("\n"),
    });
  }

  const combinedText = exhibits.map((e) => `### ${e.label}\n${e.textBlock}`).join("\n\n");
  return { exhibits, combinedText, totalEvidenceCount: realCase.evidence.length };
}

export interface MindMapEntity {
  name: string;
  type: "person" | "organization" | "location" | "other";
  note: string;
}

export interface MindMapRelationship {
  from: string;
  to: string;
  label: string;
  evidence: string;
}

export interface CaseMindMapResult {
  entities: MindMapEntity[];
  relationships: MindMapRelationship[];
  summary: string;
}

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    entities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING, enum: ["person", "organization", "location", "other"] },
          note: {
            type: SchemaType.STRING,
            description: "One brief, grounded note on why this entity appears — based only on the provided text, never outside knowledge.",
          },
        },
        required: ["name", "type", "note"],
      },
      description: "Every named person, organization, or location actually mentioned in the provided exhibit text. Empty array if none.",
    },
    relationships: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          from: { type: SchemaType.STRING, description: "Must exactly match a name in entities." },
          to: { type: SchemaType.STRING, description: "Must exactly match a name in entities." },
          label: {
            type: SchemaType.STRING,
            description: "A short, real relationship phrase grounded in the text, e.g. 'spoke to', 'sent document to', 'mentioned in'.",
          },
          evidence: {
            type: SchemaType.STRING,
            description: "A brief quote or close paraphrase from the provided exhibit text that actually supports this relationship.",
          },
        },
        required: ["from", "to", "label", "evidence"],
      },
      description: "Only relationships directly evidenced by the provided text. Empty array if none can be grounded.",
    },
    summary: {
      type: SchemaType.STRING,
      description: "A short, plain-language, factual narrative tying the case's exhibits together, or a plain statement that there isn't enough to synthesize.",
    },
  },
  required: ["entities", "relationships", "summary"],
};

const PROMPT = `You are assisting a police investigator studying a case built from several pieces of evidence (call/video transcripts, translations, AI image descriptions, per-face notes, and document text/summaries). Below is the real, already-extracted text gathered from each exhibit on this case, one exhibit per section.

From this text alone:
1. List every named person, organization, or place actually mentioned.
2. List relationships between those entities that the text actually, directly evidences (e.g. "X called Y", "X sent a document to Y", "X is mentioned inside Y's transcript"). Never invent a relationship that isn't directly supported by a specific piece of the text below — if you cannot point to the exact text that shows it, do not include it.
3. Write a short, plain narrative summary connecting what these exhibits show together as a case.

If the text is too sparse, vague, or the exhibits don't actually reference each other or common entities, return empty (or near-empty) arrays and say so plainly in the summary rather than guessing or inventing connections just to produce a fuller-looking result.`;

/**
 * Real Gemini structured-JSON-schema synthesis across a case's aggregated
 * exhibit text — same Vertex AI auth path (buildClient()) and single-call
 * pattern as document-analysis.ts/image-description.ts. Unlike
 * claim-verification.ts this makes no live search call; it only reasons
 * over the real text already gathered by aggregateCaseText(), which is
 * itself only ever text already visible elsewhere in this app.
 */
export async function synthesizeCaseMindMap(combinedText: string): Promise<CaseMindMapResult> {
  const vertexAI = buildClient();
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nCase exhibits:\n${combinedText}` }] }],
  });

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content.");

  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as { entities?: unknown }).entities) ||
    !Array.isArray((parsed as { relationships?: unknown }).relationships) ||
    typeof (parsed as { summary?: unknown }).summary !== "string"
  ) {
    throw new Error("Gemini returned a malformed response.");
  }

  const raw = parsed as { entities: unknown[]; relationships: unknown[]; summary: string };

  const entities: MindMapEntity[] = raw.entities.filter(
    (e): e is MindMapEntity =>
      typeof e === "object" &&
      e !== null &&
      typeof (e as MindMapEntity).name === "string" &&
      ["person", "organization", "location", "other"].includes((e as MindMapEntity).type) &&
      typeof (e as MindMapEntity).note === "string",
  );

  const relationships: MindMapRelationship[] = raw.relationships.filter(
    (r): r is MindMapRelationship =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as MindMapRelationship).from === "string" &&
      typeof (r as MindMapRelationship).to === "string" &&
      typeof (r as MindMapRelationship).label === "string" &&
      typeof (r as MindMapRelationship).evidence === "string",
  );

  return { entities, relationships, summary: raw.summary };
}

/** Whether the mind-map synthesis is actually configured — same Gemini
 * credential as every other Vertex AI caller in this app. */
export function isMindMapConfigured(): boolean {
  return isGeminiConfigured();
}
