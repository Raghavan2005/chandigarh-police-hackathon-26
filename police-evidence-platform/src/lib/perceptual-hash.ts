import sharp from "sharp";

/**
 * Perceptual hash for images — dHash (difference hash), 64-bit.
 *
 * Why dHash over aHash/pHash: aHash (average-vs-mean threshold) is more
 * sensitive to gamma/brightness shifts between re-encodes than dHash is,
 * and pHash (DCT-based) needs a DCT implementation, an extra dependency
 * not otherwise justified for a hackathon MVP. dHash needs only grayscale
 * + resize + a row of pairwise pixel comparisons, all of which `sharp`
 * (already a transitive dep of Next.js's image pipeline, now promoted to a
 * direct dependency in package.json) provides directly — no extra
 * image-hashing package needed, and it's a standard, well-documented
 * algorithm (see e.g. https://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html).
 *
 * Algorithm: resize to 9x8 grayscale, then for each of the 8 rows compare
 * each pixel to its right neighbor (9 pixels -> 8 comparisons per row),
 * giving 8 rows x 8 bits = 64 bits total. Bit is 1 when the left pixel is
 * brighter than its right neighbor. This is invariant to overall
 * brightness/contrast shifts and small JPEG re-encode artifacts, which is
 * exactly the "same image, re-saved/reposted" case CorpusMatch/
 * EvidenceMatch (PS4_MVP_BUILD_PLAN.md §4) needs to catch.
 *
 * Output format: 64 bits packed into a 16-character lowercase hex string
 * (4 bits per hex digit) — fixed length, suitable for the Hamming-distance
 * comparison in hamming.ts.
 */
const HASH_WIDTH = 9;
const HASH_HEIGHT = 8;

export async function computePerceptualHash(buffer: Buffer, mimeType: string): Promise<string | null> {
  // Video frame-based hashing is being wired in separately — this function
  // only handles images for now, per the task split.
  if (!mimeType.startsWith("image/")) {
    return null;
  }

  try {
    const { data, info } = await sharp(buffer)
      .grayscale()
      .resize(HASH_WIDTH, HASH_HEIGHT, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.width !== HASH_WIDTH || info.height !== HASH_HEIGHT) {
      // Shouldn't happen given fit: "fill", but don't silently hash garbage
      // if sharp ever returns an unexpected buffer shape.
      console.warn(`[perceptual-hash] unexpected raw buffer shape ${info.width}x${info.height}`);
      return null;
    }

    let bits = "";
    for (let row = 0; row < HASH_HEIGHT; row++) {
      for (let col = 0; col < HASH_WIDTH - 1; col++) {
        const left = data[row * HASH_WIDTH + col];
        const right = data[row * HASH_WIDTH + col + 1];
        bits += left > right ? "1" : "0";
      }
    }

    return bitsToHex(bits);
  } catch (error) {
    // Corrupt/unsupported image — same convention as extractImageExif in
    // metadata.ts: log a warning, return an honestly-empty result, never throw.
    console.warn(`[perceptual-hash] failed to compute hash for image:`, error);
    return null;
  }
}

function bitsToHex(bits: string): string {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}
