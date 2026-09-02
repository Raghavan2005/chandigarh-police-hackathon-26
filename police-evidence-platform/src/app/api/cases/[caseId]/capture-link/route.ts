import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { mintCaptureLink } from "@/lib/capture-link";
import { getLanOrigin } from "@/lib/server-url";

/**
 * Mints a short-lived, case-scoped "tablet capture" link (see CaptureLink
 * schema comment) — authenticated, so only a logged-in investigator can
 * generate one. The resulting URL itself needs no login: that's the whole
 * point, see src/app/capture/[token].
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;
  const caseRecord = await db.case.findUnique({ where: { id: caseId } });
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const link = await mintCaptureLink(caseId, session.userId);

  return NextResponse.json(
    {
      token: link.token,
      url: `${getLanOrigin(request)}/capture/${link.token}`,
      expiresAt: link.expiresAt,
    },
    { status: 201 },
  );
}
