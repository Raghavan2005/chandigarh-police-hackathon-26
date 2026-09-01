import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;
  const caseRecord = await db.case.findUnique({
    where: { id: caseId },
    include: {
      investigator: { select: { name: true } },
      evidence: {
        include: {
          metadataResult: true,
          detectionResult: true,
          provenanceResult: true,
          fusionVerdict: true,
        },
      },
    },
  });

  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  await writeAuditEntry({
    caseId: caseRecord.id,
    actorId: session.userId,
    action: "VIEWED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(caseRecord);
}
