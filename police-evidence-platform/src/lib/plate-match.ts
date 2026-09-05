import "server-only";

/**
 * Fuzzy license-plate string matching — CCTV reference-plate matching, PS4
 * use case #1. Real edit-distance-based similarity against OCR'd plate
 * text (ml-service/plate_ocr.py), not exact string equality: EasyOCR on a
 * real low-resolution/angled CCTV frame commonly misreads one character
 * (O/0, I/1, B/8), and an investigator's typed reference plate is exactly
 * as likely to have a transcription slip — a fuzzy match surfaces those as
 * real, honestly-scored near-matches instead of silently missing them.
 */
export function normalizePlate(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Classic Levenshtein edit distance, iterative DP — no new dependency for
 * a handful of short (<=12 char) strings per match run. */
function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[rows - 1][cols - 1];
}

/** 1 - (edit distance / longer string's length), 0-1 — 1.0 for an exact
 * normalized match, degrading smoothly per character difference. Real
 * string-similarity score, never fabricated. */
export function plateSimilarity(referenceText: string, candidateText: string): number {
  const a = normalizePlate(referenceText);
  const b = normalizePlate(candidateText);
  if (a.length === 0 || b.length === 0) return 0;
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

// Disclosed, stated threshold — allows a 1-2 character OCR/typo slip on a
// typical 8-10 character Indian plate (e.g. "CH01AB1234") without allowing
// an unrelated plate through. Every match result still carries its raw
// similarity score, never a bare true/false.
export const PLATE_MATCH_THRESHOLD = 0.7;
