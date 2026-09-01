import { Reader } from "@contentauth/c2pa-node";

/**
 * Real C2PA (Content Authenticity Initiative "Content Credentials") manifest
 * detection and validation — PS4_MVP_BUILD_PLAN.md §2/§3. Per the plan's
 * "C2PA coverage caveat," most real-world evidence will NOT carry a
 * credential — that's the expected common case, reported plainly, never
 * treated as suspicious on its own (see fusion.ts, which never counts
 * c2paPresent=false as a corroborating signal).
 */
export interface ProvenanceCheckResult {
  c2paPresent: boolean;
  c2paValid: boolean;
  manifestJson: string | null;
}

/**
 * Takes the buffer directly, not a file path — the official
 * @contentauth/c2pa-node package has a real bug when given a `FileAsset`
 * (`{ path }`): its own `assetSize.js` does `import * as fs from "fs-extra"`
 * then calls `fs.stat(asset.path)`, and under Node's ESM interop with this
 * fs-extra version, `fs.stat` resolves to `undefined` (the CJS module's
 * named exports aren't synthesized correctly — only `fs.default.stat`
 * exists). Confirmed independently: `Reader.fromAsset({ path, mimeType })`
 * throws "fs.stat is not a function" on every real file tested.
 * `Reader.fromAsset({ buffer, mimeType })` (a `SourceBufferAsset`) takes a
 * different code path in `assetSize.js` that returns before ever touching
 * `fs`, sidestepping the bug entirely rather than working around it (e.g.
 * patching node_modules, which wouldn't survive a reinstall). Confirmed
 * working against real files in this repo — see the commit that added this.
 */
export async function checkProvenance(buffer: Buffer, mimeType: string): Promise<ProvenanceCheckResult> {
  try {
    const reader = await Reader.fromAsset({ buffer, mimeType });

    if (!reader) {
      // The overwhelmingly common, expected case — see the C2PA coverage
      // caveat above. Not an error.
      return { c2paPresent: false, c2paValid: false, manifestJson: null };
    }

    const manifestStore = reader.json();
    const validationState = manifestStore.validation_state;
    const c2paValid = validationState === "Valid" || validationState === "Trusted";

    return {
      c2paPresent: true,
      c2paValid,
      manifestJson: JSON.stringify(manifestStore),
    };
  } catch (error) {
    // A real error (corrupt file, unsupported container, library failure)
    // — log it, but still return the honest "absent" result rather than
    // failing the whole /investigate call over a provenance-check crash.
    // Matches the established convention in metadata.ts and
    // perceptual-hash.ts: never let one signal's failure take down the rest
    // of the pipeline.
    console.warn(`[provenance] C2PA check failed for a ${mimeType} file:`, error);
    return { c2paPresent: false, c2paValid: false, manifestJson: null };
  }
}
