import "server-only";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export interface ReverseImageSearchResult {
  fullMatches: string[];
  partialMatches: string[];
  pagesWithMatches: { url: string; pageTitle: string | null }[];
  webEntities: { description: string; score: number }[];
  /** Google's own best-guess caption for what the image depicts overall —
   * the same real field Google Lens's "Looks like: ..." headline is built
   * from (`WebDetection.bestGuessLabels`), not something we're
   * inferring/labeling ourselves. */
  bestGuessLabels: string[];
  /** Real content classification — what the model actually sees in the
   * pixels ("Person", "Vehicle", "Turban", ...), from Vision API's
   * LABEL_DETECTION. Mechanistically different from `bestGuessLabels`
   * above: this doesn't depend on the image being indexed anywhere else
   * on the web, it's a direct classification of this file's own content. */
  labels: { description: string; score: number }[];
}

/** What the API route actually returns and what the cached DB row
 * deserializes into — the real lookup result plus when it was actually
 * run, so the UI can honestly show "as of <time>" instead of implying a
 * cached result is a live one. */
export interface CachedReverseImageSearchResult extends ReverseImageSearchResult {
  ranAt: string;
}

/**
 * Real reverse-image search via Cloud Vision's Web Detection — the one
 * capability in this build that genuinely requires network access and a
 * billed GCP project, unlike everything else (PS4_MVP_BUILD_PLAN.md §7's
 * risk table flagged this as an explicit non-goal until real credentials
 * were available). Sends the image bytes directly to Vision's API (no
 * public hosting of the evidence file required — that would be a real
 * chain-of-custody/NCII-privacy problem for sensitive cases), and returns
 * whatever Google's own index actually found — never fabricated results.
 *
 * Lazily constructs the client (not at module load) so a missing/invalid
 * credential fails the one real call it affects, not the whole app.
 */
export async function runReverseImageSearch(imageBuffer: Buffer): Promise<ReverseImageSearchResult> {
  const client = new ImageAnnotatorClient();
  const [result] = await client.annotateImage({
    image: { content: imageBuffer },
    features: [{ type: "WEB_DETECTION" }, { type: "LABEL_DETECTION", maxResults: 10 }],
  });
  const web = result.webDetection;

  return {
    fullMatches: (web?.fullMatchingImages ?? []).map((m) => m.url).filter((u): u is string => Boolean(u)),
    partialMatches: (web?.partialMatchingImages ?? []).map((m) => m.url).filter((u): u is string => Boolean(u)),
    pagesWithMatches: (web?.pagesWithMatchingImages ?? []).map((p) => ({
      url: p.url ?? "",
      pageTitle: p.pageTitle ?? null,
    })).filter((p) => p.url),
    webEntities: (web?.webEntities ?? [])
      .filter((e) => e.description && typeof e.score === "number")
      .map((e) => ({ description: e.description as string, score: e.score as number }))
      .sort((a, b) => b.score - a.score),
    bestGuessLabels: (web?.bestGuessLabels ?? []).map((l) => l.label).filter((l): l is string => Boolean(l)),
    labels: (result.labelAnnotations ?? [])
      .filter((l) => l.description && typeof l.score === "number")
      .map((l) => ({ description: l.description as string, score: l.score as number }))
      .sort((a, b) => b.score - a.score),
  };
}

/** Whether reverse-image search is actually configured — checked before
 * offering the feature in the UI/API so a missing credential shows an
 * honest "not configured" state instead of a confusing runtime error. */
export function isReverseImageSearchConfigured(): boolean {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

/** One reverse-image-search engine. Only `googleVisionProvider` below is
 * real today — this interface exists so a second provider (once a real key
 * + a confirmed, privacy-safe API contract exist) slots in without
 * rewriting the route or the merge logic, not because a second provider is
 * implemented now. */
export interface ReverseImageSearchProvider {
  id: string;
  label: string;
  isConfigured(): boolean;
  run(imageBuffer: Buffer): Promise<ReverseImageSearchResult>;
}

export const googleVisionProvider: ReverseImageSearchProvider = {
  id: "google_vision",
  label: "Google Vision",
  isConfigured: isReverseImageSearchConfigured,
  run: runReverseImageSearch,
};

/** Every provider this deployment actually has credentials for — currently
 * always just Google Vision, but callers should iterate this instead of
 * assuming one provider so a second one can be added later. */
export function getConfiguredProviders(): ReverseImageSearchProvider[] {
  return [googleVisionProvider].filter((p) => p.isConfigured());
}
