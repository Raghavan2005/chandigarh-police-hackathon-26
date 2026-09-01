/**
 * Bit-level Hamming distance between two equal-length hex-encoded
 * perceptual hashes (see perceptual-hash.ts — currently always 16 hex
 * chars / 64 bits, but this function doesn't hard-code that so it keeps
 * working if the hash length ever changes).
 *
 * A length mismatch means two hashes produced by different algorithms/bit
 * lengths are being compared, which is a real bug in the caller (e.g.
 * comparing an image dHash against a differently-shaped video-frame hash)
 * — not an expected runtime case — so this throws rather than returning a
 * meaningless number.
 */
export function hammingDistance(hexA: string, hexB: string): number {
  if (hexA.length !== hexB.length) {
    throw new Error(`hammingDistance: hash length mismatch (${hexA.length} vs ${hexB.length})`);
  }

  let distance = 0;
  for (let i = 0; i < hexA.length; i++) {
    const nibbleA = parseInt(hexA[i], 16);
    const nibbleB = parseInt(hexB[i], 16);
    if (Number.isNaN(nibbleA) || Number.isNaN(nibbleB)) {
      throw new Error(`hammingDistance: non-hex character at position ${i} ("${hexA[i]}" vs "${hexB[i]}")`);
    }
    let xor = nibbleA ^ nibbleB;
    // Kernighan's bit-count: clear the lowest set bit each iteration.
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}
