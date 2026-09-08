import "server-only";
import { Type } from "@google/genai";
import { buildClient, isGeminiConfigured } from "@/lib/image-description";
import { geocodePlaceName } from "@/lib/geocoding";

export interface ExtractedLocationMention {
  name: string;
  quote: string;
  lat: number | null;
  lon: number | null;
  displayName: string | null;
}

interface RawPlaceMention {
  name: string;
  quote: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    places: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The place name exactly as it appears in the text — a city, district, state, country, landmark, or area.",
          },
          quote: {
            type: Type.STRING,
            description: "The exact sentence or line from the text that actually names this place.",
          },
        },
        required: ["name", "quote"],
      },
      description: "Every distinct real-world place actually named in the text. Empty array if none are mentioned.",
    },
  },
  required: ["places"],
};

const PROMPT = `You are assisting a police investigator. Read the following real text (a chat export or document) and list every distinct real-world place actually named in it — a city, town, district, state, country, or named area/landmark.

Rules:
- Only include a place that is explicitly named in the text below. Never infer a place from context that isn't a real named location (e.g. do not turn "the warehouse" into a place unless a place name is actually given for it).
- Do not include generic words that aren't place names (e.g. "the group", "home", "office") even if they might describe a location colloquially.
- Do not include the name of the messaging app or platform itself.
- For each place, quote the exact line of text that names it.
- If no real place names are mentioned, return an empty array — do not invent one to produce a fuller-looking result.`;

interface RawAiResult {
  places: RawPlaceMention[];
}

async function callGeminiForPlaces(text: string): Promise<RawPlaceMention[]> {
  const genAI = buildClient();
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nText:\n${text}` }] }],
    config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const responseText = result.text;
  if (!responseText) throw new Error("Gemini returned no content.");

  const parsed: unknown = JSON.parse(responseText);
  if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as { places?: unknown }).places)) {
    throw new Error("Gemini returned a malformed response.");
  }

  const raw = parsed as RawAiResult;
  return raw.places.filter(
    (p): p is RawPlaceMention =>
      typeof p === "object" && p !== null && typeof p.name === "string" && p.name.trim().length > 0 && typeof p.quote === "string",
  );
}

// Bounds worst-case latency: Nominatim's real-instance rate limit (see
// geocoding.ts) means N distinct places costs at least N seconds to fully
// resolve. A chat mentioning many one-off place names would otherwise make
// an upload hang for a very long time — capped at the busiest real case
// seen in testing (a hackathon logistics chat named ~2-3 real places) with
// generous headroom, not a number picked to look reasonable.
const MAX_PLACES_PER_EXHIBIT = 8;

/**
 * Full real pipeline for one exhibit's extracted text: Gemini names the real
 * places actually mentioned (grounded, with a quote — same anti-
 * hallucination discipline as mindmap-server.ts's entity extraction), then
 * each distinct name is geocoded to a real coordinate via Nominatim
 * (geocoding.ts) — sequentially, respecting its rate limit. A name Gemini
 * extracts but Nominatim can't resolve (too generic, e.g. "Sector 45" alone
 * with no city) is kept with lat/lon/displayName all null — a real, honest
 * "found the name, couldn't place it on a map" result, not silently
 * dropped.
 */
export async function extractLocationMentions(text: string): Promise<ExtractedLocationMention[]> {
  const rawPlaces = await callGeminiForPlaces(text);

  const deduped = new Map<string, RawPlaceMention>();
  for (const p of rawPlaces) {
    const key = p.name.trim().toLowerCase();
    if (!deduped.has(key)) deduped.set(key, p);
  }
  const capped = [...deduped.values()].slice(0, MAX_PLACES_PER_EXHIBIT);

  const results: ExtractedLocationMention[] = [];
  for (const place of capped) {
    const geocoded = await geocodePlaceName(place.name);
    results.push({
      name: place.name,
      quote: place.quote,
      lat: geocoded?.lat ?? null,
      lon: geocoded?.lon ?? null,
      displayName: geocoded?.displayName ?? null,
    });
  }
  return results;
}

/** Whether location-mention extraction is actually configured — same
 * Gemini credential as every other Vertex AI caller in this app. Nominatim
 * needs no credential/key at all (see geocoding.ts). */
export function isLocationExtractionConfigured(): boolean {
  return isGeminiConfigured();
}
