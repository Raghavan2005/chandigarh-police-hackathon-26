import "server-only";
import { Type } from "@google/genai";
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

// --- Unified graph model -------------------------------------------------
//
// One graph, two trust levels — never two disconnected views. "structural"
// nodes/edges are derived directly from this platform's own database (no
// LLM call, so they're free, instant, and available even without Gemini
// configured or any analyzable text on the case). "ai_inferred" nodes/edges
// come from Gemini's free-text entity/relationship extraction over already-
// analyzed exhibit text. Every ai_inferred entity is tied back into the
// structural graph via a "mentions" edge from the exhibit that named it
// (see MENTION_SCHEMA_FIELD below) — this is what makes the result an
// actual connected case graph instead of a handful of floating names with
// nothing tying them to the case's real evidence.

export type MindMapNodeKind = "case" | "exhibit" | "match" | "web_source" | "person" | "organization" | "location" | "other";
export type MindMapOrigin = "structural" | "ai_inferred";

export interface MindMapNode {
  id: string;
  kind: MindMapNodeKind;
  label: string;
  /** Short subtitle shown under the node / in its tooltip — e.g. a verdict,
   * a match similarity, a domain's page title. Never fabricated: empty
   * string when there's genuinely nothing more to say. */
  detail: string;
  /** ISO timestamp when this node has a real one (upload time, match's
   * first-seen date, search-result time) — null for AI-inferred entities,
   * which have no inherent timestamp of their own. Powers the timeline. */
  timestamp: string | null;
  origin: MindMapOrigin;
  /** In-app or external link to navigate to on click — null when there's
   * nowhere real to send the investigator (e.g. an AI-inferred entity). */
  href: string | null;
}

export interface MindMapEdge {
  from: string;
  to: string;
  label: string;
  /** Grounding quote/paraphrase from the source text — ai_inferred edges
   * only; structural edges are self-evident from the database fact they
   * represent and need no quote. */
  evidence: string | null;
  origin: MindMapOrigin;
}

export interface CaseMindMapResult {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  summary: string;
}

function exhibitNodeId(evidenceId: string): string {
  return `exhibit:${evidenceId}`;
}

function verdictDetail(ev: RealEvidence): string {
  if (!ev.fusionVerdict) return `${ev.mimeType} · not yet investigated`;
  return `${ev.mimeType} · ${ev.fusionVerdict.verdict} · ${ev.fusionVerdict.confidence}% confidence`;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface ChatExifInfo {
  isWhatsAppChat?: boolean;
  participantStats?: { name: string; messageCount: number; firstTimestamp: string | null; lastTimestamp: string | null }[];
  turnTaking?: { from: string; to: string; count: number }[];
}

function parseChatExif(ev: RealEvidence): ChatExifInfo | null {
  if (ev.mimeType !== "text/plain" || !ev.metadataResult?.exifJson) return null;
  const info = safeParse<ChatExifInfo>(ev.metadataResult.exifJson);
  return info?.isWhatsAppChat ? info : null;
}

/** Real person-node id, shared between the structural chat-participant layer
 * here and the AI-inferred entity layer below (`${type}:${name}`) — a named
 * participant who is later also named by the AI layer merges into this same
 * node instead of creating a disconnected duplicate (see synthesizeCaseMindMap:
 * it only creates a new node when this id doesn't already exist). */
function chatPersonNodeId(name: string): string {
  return `person:${name}`;
}

function formatChatTimestamp(iso: string | null): string {
  if (!iso) return "unknown time";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Real, zero-LLM structural facts for a WhatsApp chat exhibit — every group
 * member, their real message count and first/last-seen time, and real
 * conversational turn-taking between them (see whatsapp-chat.ts's own
 * computeParticipantStats/computeTurnTaking for what "turn-taking" honestly
 * does and doesn't claim). Previously "who else is in this group chat" was
 * left entirely to the AI-inferred entity layer, which could only notice a
 * participant if their name happened to surface in free-text extraction —
 * unreliable, and the reason a chat's own encryption-notice boilerplate was
 * once misread as an "Organization" entity (fixed at the source in
 * chatToPlainText, but this structural layer is the real fix: participants
 * are never something the AI needs to infer in the first place).
 */
// A real hackathon-logistics group chat used to develop this feature had 62
// distinct senders, most with exactly 1-2 messages (join notices, a single
// "ok" or "thanks") — fanning all 62 out as graph nodes around one exhibit
// produces an illegible wall of phone numbers no matter how good the layout
// math is, even though every one of those senders is a real fact. Capping
// to the most active real participants keeps the graph itself legible
// without losing anything: the full participant list (all of them, capped
// or not) is still shown in full on the exhibit's own ChatDetails panel —
// this cap only governs how many get promoted to a full graph node.
const MAX_PARTICIPANT_NODES = 20;

function addChatParticipantGraph(ev: RealEvidence, exId: string, nodes: MindMapNode[], edges: MindMapEdge[]): void {
  const info = parseChatExif(ev);
  if (!info?.participantStats) return;

  const shownStats = [...info.participantStats].sort((a, b) => b.messageCount - a.messageCount).slice(0, MAX_PARTICIPANT_NODES);
  const shownNames = new Set(shownStats.map((s) => s.name));
  const omittedCount = info.participantStats.length - shownStats.length;

  for (const stat of shownStats) {
    const personId = chatPersonNodeId(stat.name);
    if (!nodes.some((n) => n.id === personId)) {
      nodes.push({
        id: personId,
        kind: "person",
        label: stat.name,
        detail: `${stat.messageCount} message${stat.messageCount === 1 ? "" : "s"} in this chat · ${formatChatTimestamp(stat.firstTimestamp)} – ${formatChatTimestamp(stat.lastTimestamp)}`,
        timestamp: stat.firstTimestamp,
        origin: "structural",
        href: null,
      });
    }
    edges.push({
      from: exId,
      to: personId,
      label: `sent ${stat.messageCount} message${stat.messageCount === 1 ? "" : "s"}`,
      evidence: null,
      origin: "structural",
    });
  }

  if (omittedCount > 0) {
    nodes.push({
      id: `${exId}:more-participants`,
      kind: "other",
      label: `+${omittedCount} more participant${omittedCount === 1 ? "" : "s"}`,
      detail: `Real group members not individually graphed to keep this view legible — each sent only 1-2 messages. Full list is in this exhibit's own chat details panel.`,
      timestamp: null,
      origin: "structural",
      href: null,
    });
    edges.push({ from: exId, to: `${exId}:more-participants`, label: "also contains", evidence: null, origin: "structural" });
  }

  // Capped and sorted by count, and restricted to the participants actually
  // shown above — a turn-taking edge pointing at a node that was never
  // created would just be silently dropped at render time anyway (the graph
  // component skips edges whose endpoint isn't in `nodes`), but filtering
  // here keeps the count-based cap meaningful instead of wasting slots on
  // edges that can't render.
  const topTurns = (info.turnTaking ?? []).filter((t) => shownNames.has(t.from) && shownNames.has(t.to)).slice(0, 16);
  for (const turn of topTurns) {
    edges.push({
      from: chatPersonNodeId(turn.from),
      to: chatPersonNodeId(turn.to),
      // Deliberately not "replied to" — a flat export has no reply-to
      // metadata, so this is the honest, weaker claim the data actually
      // supports: their messages were adjacent in the real timeline, this
      // many times.
      label: `messaged right after ×${turn.count}`,
      evidence: null,
      origin: "structural",
    });
  }
}

/**
 * The real, deterministic half of the graph — built entirely from this
 * platform's own already-loaded database relations (getRealCase's include
 * tree already has everything used here; no extra query). No LLM call, no
 * hallucination risk, always available: this is what makes the mind-map
 * page show something genuinely useful the instant it's opened, even on a
 * case with zero analyzable text or no Gemini credentials configured —
 * the previous version had nothing to show until an external AI call
 * succeeded, which is exactly why it read as decorative rather than real.
 */
export function buildStructuralGraph(realCase: RealCase): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  const caseNodeId = `case:${realCase.id}`;
  nodes.push({
    id: caseNodeId,
    kind: "case",
    label: realCase.id,
    detail: `FIR ${realCase.firNumber} · ${realCase.policeStation}`,
    timestamp: realCase.openedAt.toISOString(),
    origin: "structural",
    href: null,
  });

  realCase.evidence.forEach((ev, index) => {
    const exId = exhibitNodeId(ev.id);
    nodes.push({
      id: exId,
      kind: "exhibit",
      label: `Exhibit ${index + 1}`,
      detail: verdictDetail(ev),
      timestamp: ev.uploadedAt.toISOString(),
      origin: "structural",
      href: `/cases/${realCase.id}`,
    });
    edges.push({ from: caseNodeId, to: exId, label: "contains", evidence: null, origin: "structural" });

    addChatParticipantGraph(ev, exId, nodes, edges);

    // Seeded-corpus matches — this platform's own "have we seen this file
    // before" database, previously invisible to the mind map entirely.
    for (const match of ev.corpusMatches) {
      const matchId = `match:corpus:${match.corpusItemId}`;
      if (!nodes.some((n) => n.id === matchId)) {
        nodes.push({
          id: matchId,
          kind: "match",
          label: "Corpus match",
          detail: `${match.corpusItem.sourcePlatform} · ${match.similarity.toFixed(0)}% similar · first seen ${match.corpusItem.firstSeenAt.toISOString().slice(0, 10)}`,
          timestamp: match.corpusItem.firstSeenAt.toISOString(),
          origin: "structural",
          href: null,
        });
      }
      edges.push({ from: exId, to: matchId, label: "matches seeded corpus item", evidence: null, origin: "structural" });
    }

    // Cross-case matches — a real link to another actual case in this
    // system, not a demo asset. href genuinely navigates there.
    for (const match of ev.matchesFrom) {
      const matchId = `match:case:${match.matchedCaseId}`;
      if (!nodes.some((n) => n.id === matchId)) {
        nodes.push({
          id: matchId,
          kind: "match",
          label: `Case ${match.matchedCaseId}`,
          detail: `${match.matchType === "sha256_exact" ? "exact file match" : "near-duplicate match"} · ${match.similarity.toFixed(0)}% similar`,
          timestamp: null,
          origin: "structural",
          href: `/cases/${match.matchedCaseId}`,
        });
      }
      edges.push({ from: exId, to: matchId, label: "matches evidence in another case", evidence: null, origin: "structural" });
    }

    // CCTV reference-face/plate matches (PS4 use case #1) — real cosine-
    // similarity/fuzzy-plate results, folded into the same "match" kind
    // rather than a separate one to keep the legend small.
    for (const match of ev.referenceMatchResults) {
      const matchId = `match:ref:${match.id}`;
      nodes.push({
        id: matchId,
        kind: "match",
        label: `Reference ${match.matchType} match: ${match.referenceLabel}`,
        detail: `${(match.similarity * 100).toFixed(0)}% similarity at ${match.timestampSeconds.toFixed(1)}s`,
        timestamp: match.ranAt.toISOString(),
        origin: "structural",
        href: null,
      });
      edges.push({ from: exId, to: matchId, label: "reference match found", evidence: null, origin: "structural" });
    }

    // Web/reverse-image search sources — the actual "cross-platform origin
    // tracing" half of PS4, previously not fed into the mind map at all.
    // Deduped by domain across both mechanisms and capped per exhibit so
    // the graph stays legible rather than exploding into dozens of nodes.
    const webNodesForExhibit = new Map<string, { url: string; title: string; timestamp: string }>();
    if (ev.webSearchResult) {
      const results = safeParse<{ title: string; url: string; domain: string }[]>(ev.webSearchResult.resultsJson) ?? [];
      for (const r of results) {
        if (!webNodesForExhibit.has(r.domain)) {
          webNodesForExhibit.set(r.domain, { url: r.url, title: r.title, timestamp: ev.webSearchResult.ranAt.toISOString() });
        }
      }
    }
    for (const rev of ev.reverseImageSearchResults) {
      const pages = safeParse<{ url: string; pageTitle?: string }[]>(rev.pagesWithMatchesJson) ?? [];
      for (const p of pages) {
        const domain = domainOf(p.url);
        if (!webNodesForExhibit.has(domain)) {
          webNodesForExhibit.set(domain, { url: p.url, title: p.pageTitle ?? domain, timestamp: rev.ranAt.toISOString() });
        }
      }
    }
    const cappedWebEntries = [...webNodesForExhibit.entries()].slice(0, 8);
    for (const [domain, info] of cappedWebEntries) {
      const webId = `web:${domain}`;
      if (!nodes.some((n) => n.id === webId)) {
        nodes.push({
          id: webId,
          kind: "web_source",
          label: domain,
          detail: info.title,
          timestamp: info.timestamp,
          origin: "structural",
          href: info.url,
        });
      }
      edges.push({ from: exId, to: webId, label: "found via web/reverse-image search", evidence: null, origin: "structural" });
    }
  });

  return { nodes, edges };
}

// --- AI-inferred layer -----------------------------------------------------

/** One real per-exhibit text block gathered for the mind-map synthesis —
 * only ever the text an investigator can already see elsewhere on this
 * exhibit (transcript/translation text, AI image descriptions, per-face
 * labels/notes, document text/summaries), never anything computed fresh
 * here. `tag` is a short, stable identifier (e.g. "EXHIBIT_1") Gemini is
 * asked to echo back exactly when it names which exhibit(s) mention an
 * entity — far more reliable to parse than matching its own verbose label
 * string back out of free-form model output. */
export interface CaseMindMapExhibitText {
  evidenceId: string;
  tag: string;
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

  const chatInfo = parseChatExif(ev);
  const documentText = extractDocumentText(ev.metadataResult?.exifJson);
  if (chatInfo) {
    // Labeled distinctly from a generic "Document text" excerpt — this is
    // what the prompt's own chat-handling instructions key off of to ask
    // for per-sender substance instead of a generic "communicated with".
    if (documentText) {
      sections.push(
        // Deliberately says "a group chat export" and never names the
        // specific messaging app — naming it here caused the exact same
        // "app name treated as case content" bug this file's own
        // chatToPlainText fix addresses (the app name isn't case-relevant
        // content; it's already recorded structurally, not something the AI
        // needs to independently notice, let alone as an Organization).
        `This exhibit is a real group chat export. Every group member is already known structurally (see case facts) — do not re-list them as a generic finding, and do not treat the messaging app itself as a person, organization, or any other case entity. The lines below are the chat's real messages in chronological order, each formatted as "Sender: message":\n${documentText}`,
      );
    }
  } else if (documentText) {
    sections.push(`Document text (extracted excerpt): "${documentText}"`);
  }
  if (ev.documentSummaryResult) sections.push(`AI summary of this document: ${ev.documentSummaryResult.summary}`);

  return sections;
}

/**
 * Real per-exhibit text aggregation for one case — gathers exactly what
 * PS4_USE_CASES.md #6 named as "the raw material [that] already exists":
 * transcript text (+ translations), AI image-description text, per-face
 * labels/notes, document text previews/summaries. Deliberately does NOT
 * touch cross-case/corpus matches or classifier scores as *text* here —
 * those are real structural facts, handled by buildStructuralGraph above
 * instead, and are also summarized in one line for the prompt's "case
 * facts" preamble below so the AI summary can be genuinely case-aware.
 * Takes the already-loaded `getRealCase()` result rather than re-querying
 * the DB — every relation this needs is already `include`d there.
 */
export function aggregateCaseText(realCase: RealCase): CaseTextAggregation {
  const exhibits: CaseMindMapExhibitText[] = [];

  realCase.evidence.forEach((ev, index) => {
    const sections = gatherExhibitSections(ev);
    if (sections.length === 0) return;
    const tag = `EXHIBIT_${index + 1}`;
    exhibits.push({
      evidenceId: ev.id,
      tag,
      label: `Exhibit ${index + 1} (${ev.mimeType}, uploaded ${ev.uploadedAt.toISOString().slice(0, 10)})`,
      textBlock: sections.join("\n"),
    });
  });

  const combinedText = exhibits.map((e) => `### ${e.tag} — ${e.label}\n${e.textBlock}`).join("\n\n");
  return { exhibits, combinedText, totalEvidenceCount: realCase.evidence.length };
}

/** One-line, real, structured summary of the case's non-text signals
 * (verdicts, match counts, particulars) — handed to Gemini as context it
 * may reference in the narrative `summary` field, but is explicitly told
 * not to extract entities/relationships from (those still come only from
 * the actual exhibit text, same anti-hallucination discipline as before).
 * This is what lets the summary say something like "the exhibit flagged
 * MANIPULATED at 86% confidence also shows a possible identification of…"
 * instead of blindly restating one caption with no case-level awareness. */
function buildCaseFactsPreamble(realCase: RealCase): string {
  const verdictCounts = new Map<string, number>();
  let corpusMatchCount = 0;
  let crossCaseMatchCount = 0;
  for (const ev of realCase.evidence) {
    if (ev.fusionVerdict) {
      const key = `${ev.fusionVerdict.verdict} (${ev.fusionVerdict.confidence}%)`;
      verdictCounts.set(key, (verdictCounts.get(key) ?? 0) + 1);
    }
    corpusMatchCount += ev.corpusMatches.length;
    crossCaseMatchCount += ev.matchesFrom.length;
  }
  const verdictLine =
    verdictCounts.size > 0
      ? [...verdictCounts.entries()].map(([k, count]) => `${count}× ${k}`).join(", ")
      : "no exhibits investigated yet";

  return [
    `FIR ${realCase.firNumber}, ${realCase.policeStation}, ${realCase.district}.`,
    `${realCase.evidence.length} exhibit(s) total. Verdicts so far: ${verdictLine}.`,
    `${corpusMatchCount} match(es) against the seeded demo corpus, ${crossCaseMatchCount} match(es) against other real cases in this system.`,
  ].join(" ");
}

export interface MindMapEntity {
  name: string;
  type: "person" | "organization" | "location" | "other";
  note: string;
  /** Which exhibit tag(s) (e.g. "EXHIBIT_1") actually named/showed this
   * entity — must exactly match a tag from the prompt's exhibit headers.
   * This is what ties an AI-inferred entity back into the real exhibit
   * structure instead of leaving it a floating, disconnected name. */
  mentionedInExhibits: string[];
}

export interface MindMapRelationship {
  from: string;
  to: string;
  label: string;
  evidence: string;
}

interface RawAiResult {
  entities: MindMapEntity[];
  relationships: MindMapRelationship[];
  summary: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["person", "organization", "location", "other"] },
          note: {
            type: Type.STRING,
            description: "One brief, grounded note on why this entity appears — based only on the provided text, never outside knowledge.",
          },
          mentionedInExhibits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Every exhibit tag (e.g. 'EXHIBIT_1') whose text actually named or showed this entity. Must exactly match a tag from the section headers below. At least one required.",
          },
        },
        required: ["name", "type", "note", "mentionedInExhibits"],
      },
      description: "Every named person, organization, or location actually mentioned in the provided exhibit text. Empty array if none.",
    },
    relationships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING, description: "Must exactly match a name in entities." },
          to: { type: Type.STRING, description: "Must exactly match a name in entities." },
          label: {
            type: Type.STRING,
            description: "A short, real relationship phrase grounded in the text, e.g. 'spoke to', 'sent document to', 'mentioned in'.",
          },
          evidence: {
            type: Type.STRING,
            description: "A brief quote or close paraphrase from the provided exhibit text that actually supports this relationship.",
          },
        },
        required: ["from", "to", "label", "evidence"],
      },
      description: "Only relationships directly evidenced by the provided text. Empty array if none can be grounded.",
    },
    summary: {
      type: Type.STRING,
      description: "A short, plain-language, factual narrative tying the case's exhibits together, informed by both the case facts and the exhibit text below, or a plain statement that there isn't enough to synthesize.",
    },
  },
  required: ["entities", "relationships", "summary"],
};

function buildPrompt(casefacts: string): string {
  return `You are assisting a police investigator studying a case built from several pieces of evidence (call/video transcripts, translations, AI image descriptions, per-face notes, and document text/summaries).

Case facts (real, from the system's own records — you may reference these in your summary for context, but do NOT extract entities or relationships from this section; entities/relationships must come only from the exhibit text below):
${casefacts}

Below is the real, already-extracted text gathered from each exhibit on this case, one exhibit per section, each headed by a short tag like "EXHIBIT_1".

From the exhibit text alone:
1. List every named person, organization, or place actually mentioned, and for each one list exactly which exhibit tag(s) named or showed it (mentionedInExhibits).
2. List relationships between those entities that the text actually, directly evidences (e.g. "X called Y", "X sent a document to Y", "X is mentioned inside Y's transcript"). Never invent a relationship that isn't directly supported by a specific piece of the text below — if you cannot point to the exact text that shows it, do not include it.
3. Write a short, plain narrative summary connecting what these exhibits show together as a case, informed by both the case facts above and the exhibit text below.

Some exhibit sections below are real group chat transcripts (marked as such), where each line is "Sender: message" in real chronological order. For these:
- Every sender is already a known person in this case (tracked separately, structurally) — you do not need to list them as entities discovered by you; only add them as an entity if their "note" would say something substantive about them beyond just being a chat participant.
- For each sender's "note", summarize specifically what THAT PERSON said or did in the conversation — what they asked, arranged, admitted, instructed, or were told — not a generic statement that they "were part of a conversation" or "communicated with" someone.
- For relationships between two senders, the label must describe the actual substance of their exchange (e.g. "asked about delivery timing to", "instructed to stay silent about", "warned about consequences of"), grounded in an exact quoted line from the transcript — never the generic "communicated with" or "spoke to" for a chat exhibit.
- Never extract the messaging app/platform itself (whichever one it is) as a person, organization, or any other entity — it is not case content, only where the conversation happened to take place.

If the exhibit text is too sparse, vague, or the exhibits don't actually reference each other or common entities, return empty (or near-empty) arrays and say so plainly in the summary rather than guessing or inventing connections just to produce a fuller-looking result.`;
}

async function callGeminiForEntities(combinedText: string, casefacts: string): Promise<RawAiResult> {
  const genAI = buildClient();
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `${buildPrompt(casefacts)}\n\nCase exhibits:\n${combinedText}` }] }],
    config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const text = result.text;
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
      typeof (e as MindMapEntity).note === "string" &&
      Array.isArray((e as MindMapEntity).mentionedInExhibits),
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

/**
 * Full mind-map synthesis for a case: the real structural graph (always
 * computed, no LLM) plus the AI-inferred entity/relationship layer merged
 * on top, connected back into the structural graph via each entity's
 * mentionedInExhibits. This is the one function that produces the complete
 * graph the UI renders — buildStructuralGraph alone is also exported for
 * the zero-cost "show something real immediately" path before any AI run.
 */
export async function synthesizeCaseMindMap(realCase: RealCase): Promise<CaseMindMapResult> {
  const structural = buildStructuralGraph(realCase);
  const aggregation = aggregateCaseText(realCase);
  const casefacts = buildCaseFactsPreamble(realCase);
  const ai = await callGeminiForEntities(aggregation.combinedText, casefacts);

  const tagToExhibitNodeId = new Map(aggregation.exhibits.map((e) => [e.tag, exhibitNodeId(e.evidenceId)]));

  const nodes: MindMapNode[] = [...structural.nodes];
  const edges: MindMapEdge[] = [...structural.edges];

  for (const entity of ai.entities) {
    const entityId = `${entity.type}:${entity.name}`;
    const existingNode = nodes.find((n) => n.id === entityId);
    if (!existingNode) {
      nodes.push({
        id: entityId,
        kind: entity.type,
        label: entity.name,
        detail: entity.note,
        timestamp: null,
        origin: "ai_inferred",
        href: null,
      });
    } else if (entity.note) {
      // A structural node (e.g. a real chat participant, created above with
      // zero LLM involvement) already exists under this exact id — this is
      // the intended merge, not a collision: the same person, one real node.
      // Its structural detail (message count, real timestamps) must not be
      // silently discarded, but the whole point of the AI layer here is the
      // substantive "what did this person actually say/do" gist — append it
      // rather than dropping it on the floor, which the pre-existence check
      // alone would otherwise do.
      existingNode.detail = `${existingNode.detail} · ${entity.note}`;
    }
    for (const tag of entity.mentionedInExhibits) {
      const exId = tagToExhibitNodeId.get(tag);
      if (!exId) continue; // model echoed back a tag that doesn't exist — drop rather than fabricate a link
      edges.push({ from: exId, to: entityId, label: "mentions", evidence: null, origin: "ai_inferred" });
    }
  }

  for (const rel of ai.relationships) {
    const fromId = `${ai.entities.find((e) => e.name === rel.from)?.type ?? "other"}:${rel.from}`;
    const toId = `${ai.entities.find((e) => e.name === rel.to)?.type ?? "other"}:${rel.to}`;
    if (!nodes.some((n) => n.id === fromId) || !nodes.some((n) => n.id === toId)) continue; // only connect entities we actually created a node for
    edges.push({ from: fromId, to: toId, label: rel.label, evidence: rel.evidence, origin: "ai_inferred" });
  }

  return { nodes, edges, summary: ai.summary };
}

/** Whether the mind-map synthesis is actually configured — same Gemini
 * credential as every other Vertex AI caller in this app. The structural
 * graph above never needs this; only the AI-inferred layer does. */
export function isMindMapConfigured(): boolean {
  return isGeminiConfigured();
}

export interface CaseLocationMention {
  exhibitLabel: string;
  name: string;
  quote: string;
  resolved: boolean;
  /** The real chat participant whose message the quote came from — found
   * by matching the quote back against the chat's own "Sender: message"
   * lines (see findSenderForQuote below), not asked of Gemini directly (it
   * only ever sees the flattened text, not a structured sender field, so
   * asking it to name the sender would just be re-deriving something we
   * can already look up exactly). Null when the exhibit isn't a chat, or
   * the quote couldn't be matched back to one line (e.g. it spans a
   * multi-line message) — shown as an honest "exhibit only" fallback, not
   * a guessed name. */
  sender: string | null;
  /** Real link to the exhibit's own document/chat details section on the
   * case's Evidence tab (its default tab, so the hash lands directly on
   * it) — lets an investigator jump straight from a place name to the
   * actual message that named it. */
  href: string;
}

/** Chat text is stored flattened as "Sender: message" lines
 * (whatsapp-chat.ts's chatToPlainText) — the same lines Gemini was shown to
 * extract the quote from in the first place, so the sender that quote came
 * from is always findable by matching it back against those exact lines,
 * not a separate inference. Returns null for a document with no such
 * lines, or if the quote spans a multi-line message and no single line
 * contains it whole — an honest miss, not a wrong guess. */
function findSenderForQuote(textPreview: string | null, quote: string): string | null {
  if (!textPreview) return null;
  const trimmedQuote = quote.trim();
  if (!trimmedQuote) return null;
  for (const line of textPreview.split("\n")) {
    const match = line.match(/^([^:]+): (.*)$/);
    if (!match) continue;
    const [, sender, text] = match;
    if (text.includes(trimmedQuote) || trimmedQuote.includes(text.trim())) return sender.trim();
  }
  return null;
}

/**
 * Real place names Gemini found in each exhibit's own text at ingest time
 * (location-extraction.ts), aggregated across the whole case — zero
 * additional LLM calls here, just reading the already-persisted
 * LocationMentionResult rows getRealCase() already includes. Deliberately
 * plain names + quotes, no lat/lon in this shape: this feeds a minimal
 * text list on the mind-map page, not a map (that attempt — plotting these
 * on the case's Source Finder map — was tried and explicitly reverted per
 * product decision; see git history on combined-source-map.tsx). A name
 * Gemini found but Nominatim couldn't geocode still appears here, marked
 * unresolved rather than dropped — this list is about what was said, not
 * about what could be mapped.
 */
export function collectLocationMentions(realCase: RealCase): CaseLocationMention[] {
  const mentions: CaseLocationMention[] = [];
  realCase.evidence.forEach((ev, index) => {
    if (!ev.locationMentionResult) return;
    const places = safeParse<{ name: string; quote: string; lat: number | null }[]>(
      ev.locationMentionResult.locationsJson,
    );
    if (!places) return;
    const textPreview = extractDocumentText(ev.metadataResult?.exifJson);
    for (const place of places) {
      mentions.push({
        exhibitLabel: `Exhibit ${index + 1}`,
        name: place.name,
        quote: place.quote,
        resolved: place.lat !== null,
        sender: findSenderForQuote(textPreview, place.quote),
        href: `/cases/${realCase.id}#ev-${ev.id}-document`,
      });
    }
  });
  return mentions;
}
