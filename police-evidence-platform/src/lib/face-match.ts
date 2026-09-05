import "server-only";

/**
 * Real cosine-similarity comparison between two 512-d face embeddings
 * (ml-service/detector.py's embed_faces) — CCTV reference-face matching,
 * PS4 use case #1. Both vectors are already L2-normalized by the model, so
 * this is a plain dot product, but computed explicitly (not assumed) in
 * case a future caller passes an un-normalized vector.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Disclosed, stated threshold — NOT a scientifically validated biometric
 * decision boundary across a large dataset, just a real number chosen from
 * real verification runs on this exact embedding model (detector.py's
 * embed_faces docstring): the same real person across two different video
 * frames measured ~0.994 cosine similarity; two different real people
 * measured ~0.83. 0.90 sits with real headroom on both sides of that one
 * data point. Every match result still carries its raw similarity score
 * alongside this threshold — an investigator can judge a near-threshold
 * result themselves rather than trusting a bare true/false.
 */
export const FACE_MATCH_THRESHOLD = 0.9;
