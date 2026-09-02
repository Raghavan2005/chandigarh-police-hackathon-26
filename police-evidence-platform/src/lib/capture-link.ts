import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const CAPTURE_LINK_LIFETIME_MS = 4 * 60 * 60 * 1000; // 4 hours — long enough a running-late demo doesn't fail on stage

/**
 * Mints a new tablet capture link for a case — see the CaptureLink schema
 * comment (prisma/schema.prisma) for the security model this token is
 * (and isn't) meant to provide.
 */
export async function mintCaptureLink(caseId: string, createdByUserId: string) {
  const token = randomBytes(32).toString("base64url");
  return db.captureLink.create({
    data: {
      token,
      caseId,
      createdByUserId,
      expiresAt: new Date(Date.now() + CAPTURE_LINK_LIFETIME_MS),
    },
  });
}

/**
 * Re-validated on every request that uses a capture token (both the public
 * page render and the public upload route) — never trust a prior
 * validation from earlier in the same request chain.
 */
export async function validateCaptureLink(token: string) {
  const link = await db.captureLink.findUnique({
    where: { token },
    include: { case: true },
  });
  if (!link || link.expiresAt.getTime() <= Date.now()) return null;
  return link;
}
