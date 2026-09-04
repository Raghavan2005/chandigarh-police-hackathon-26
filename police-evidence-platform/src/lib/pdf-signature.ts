import "server-only";
import forge from "node-forge";

export interface PdfSignatureInfo {
  present: boolean;
  // Whether the signed ByteRange actually spans the entire current file
  // (start at byte 0, end at EOF, excluding only the /Contents blob
  // itself). False is a real, well-known indicator that bytes were
  // appended to the file after this signature was applied — the standard
  // "incremental update" tampering pattern for signed PDFs. Null when no
  // signature is present.
  coversWholeFile: boolean | null;
  // Subject Common Name from the embedded X.509 signing certificate, when
  // parseable — real data read from the certificate, never a verified
  // trust-chain identity (no CA trust store is validated against; see the
  // module comment below for what this check does and doesn't claim).
  signerName: string | null;
}

const EMPTY: PdfSignatureInfo = { present: false, coversWholeFile: null, signerName: null };

/**
 * Real, structural PDF digital-signature check — detects a signature via
 * the standard `/ByteRange` + `/Contents` pattern (regex over the raw
 * bytes, not a full PDF object-tree parse — a reasonable simplification
 * for detecting the presence of *a* signature, same tradeoff class as the
 * existing PDF metadata extraction's narrow scope) and reports whether the
 * signed range covers the whole file.
 *
 * Deliberately does NOT attempt full CMS/PKCS#7 cryptographic signature
 * verification (RSA-verifying the signed digest against the certificate's
 * public key) — node-forge's PKCS#7 support makes that fragile to hand-roll
 * correctly for every real-world signing tool's exact ASN.1 encoding
 * choices, and a subtly-wrong "cryptographically valid" claim would be
 * worse than not making the claim at all. What this DOES give, honestly:
 * whether a signature structure exists, who it names as signer (from the
 * certificate, unverified against any trust root), and whether the file
 * has grown past what that signature actually covers — a real, useful,
 * narrow fact, in the same spirit as the existing "modified after
 * creation" heuristic below.
 */
export function verifyPdfSignature(buffer: Buffer): PdfSignatureInfo {
  const latin1 = buffer.toString("latin1"); // 1 byte -> 1 char, so regex match indices are real file byte offsets

  const byteRangeMatches = [...latin1.matchAll(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g)];
  if (byteRangeMatches.length === 0) return EMPTY;

  // Multiple signatures are legitimate (e.g. co-signed documents) — the
  // last one applied is the one whose range should reach the current EOF.
  const last = byteRangeMatches[byteRangeMatches.length - 1];
  const a = Number(last[1]);
  const b = Number(last[2]);
  const c = Number(last[3]);
  const d = Number(last[4]);
  if (![a, b, c, d].every(Number.isFinite)) return EMPTY;

  const coversWholeFile = a === 0 && c + d === buffer.length;

  let signerName: string | null = null;
  try {
    // This signature's own /Contents hex blob sits exactly in the gap its
    // ByteRange excludes — slicing there (rather than a global search)
    // stays correct even with multiple signatures in the file. The gap's
    // boundary lands right on the value's own `<`/`>` delimiters (the
    // `/Contents` keyword itself is just outside it, in the first ByteRange
    // segment) — stripping to hex characters is simpler and more robust
    // than trying to match the exact surrounding punctuation.
    const gap = latin1.slice(a + b, c);
    const hex = gap.replace(/[^0-9A-Fa-f]/g, "");
    if (hex.length > 0) {
      const der = forge.util.hexToBytes(hex);
      // The reserved /Contents slot is zero-padded to a fixed length
      // (real signature bytes are shorter than the reserved space) —
      // parseAllBytes: false stops at the actual DER structure's own
      // declared length instead of erroring on the trailing zero padding.
      // @types/node-forge only types the second arg as boolean, but the
      // real implementation accepts this options object (verified against
      // node_modules/node-forge/lib/asn1.js directly).
      const asn1 = forge.asn1.fromDer(
        der,
        { strict: true, parseAllBytes: false, decodeBitStrings: true } as unknown as boolean,
      );
      const message = forge.pkcs7.messageFromAsn1(asn1) as forge.pkcs7.PkcsSignedData;
      const cert = message.certificates?.[0];
      const cn = cert?.subject.getField("CN");
      signerName = typeof cn?.value === "string" ? cn.value : null;
    }
  } catch (error) {
    console.warn("[pdf-signature] Could not parse the signing certificate:", error);
  }

  return { present: true, coversWholeFile, signerName };
}
