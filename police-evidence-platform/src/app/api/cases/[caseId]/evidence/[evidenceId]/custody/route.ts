import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";

/**
 * Real physical chain-of-custody entries (seizure / handover / storage
 * transfer), per exhibit — distinct from AuditLogEntry, which only logs
 * system access (who logged in and clicked what), not the "received from /
 * handed to / independent witnesses" record a court expects for a
 * physically seized exhibit. See CustodyTransfer in schema.prisma.
 */
const custodyTransferSchema = z.object({
  fromPerson: z.string().min(1, "\"From\" is required."),
  toPerson: z.string().min(1, "\"To\" is required."),
  purpose: z.string().min(1, "Purpose is required."),
  location: z.string().optional(),
  witness1Name: z.string().optional(),
  witness1Address: z.string().optional(),
  witness2Name: z.string().optional(),
  witness2Address: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const transfers = await db.custodyTransfer.findMany({
    where: { evidenceId },
    orderBy: { occurredAt: "asc" },
    include: { recordedBy: { select: { name: true } } },
  });
  return NextResponse.json(transfers);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = custodyTransferSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid custody transfer record.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const { transfer, auditEntry } = await db.$transaction(async (tx) => {
    const transfer = await tx.custodyTransfer.create({
      data: {
        evidenceId,
        fromPerson: parsed.data.fromPerson,
        toPerson: parsed.data.toPerson,
        purpose: parsed.data.purpose,
        location: parsed.data.location || null,
        witness1Name: parsed.data.witness1Name || null,
        witness1Address: parsed.data.witness1Address || null,
        witness2Name: parsed.data.witness2Name || null,
        witness2Address: parsed.data.witness2Address || null,
        recordedById: session.userId,
      },
    });
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId,
        evidenceHash: evidence.sha256,
        actorId: session.userId,
        action: "CUSTODY_TRANSFERRED",
        device: request.headers.get("user-agent") ?? undefined,
      },
      tx,
    );
    return { transfer, auditEntry };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json(transfer, { status: 201 });
}
