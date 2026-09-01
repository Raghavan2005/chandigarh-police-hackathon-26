/**
 * TEMPORARY STUB — a real C2PA implementation (via @contentauth/c2pa-node,
 * Adobe's official package) is being built separately and will replace this
 * file. Until then, this always reports "no credential found," which is
 * honestly the correct default state (per §3's C2PA coverage caveat — most
 * real evidence won't have one) but is NOT yet actually reading files.
 * Do not treat this as done — it's a placeholder so the rest of the
 * /investigate pipeline can be built and tested without waiting on it.
 */
export interface ProvenanceCheckResult {
  c2paPresent: boolean;
  c2paValid: boolean;
  manifestJson: string | null;
}

export async function checkProvenance(_filePath: string, _mimeType: string): Promise<ProvenanceCheckResult> {
  return { c2paPresent: false, c2paValid: false, manifestJson: null };
}
