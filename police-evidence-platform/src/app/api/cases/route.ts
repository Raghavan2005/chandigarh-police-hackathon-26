import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { nextCaseId } from "@/lib/case-id";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";

const createCaseSchema = z.object({
  firNumber: z.string().min(1, "FIR number is required — no case may exist without one."),
  policeStation: z.string().min(1),
  district: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  evidenceKind: z.enum(["image", "video", "audio", "document"]),
  sensitivityLevel: z.enum(["standard", "ncii", "minor"]).default("standard"),
  investigatorRank: z.string().optional(),
  investigatorBadgeNo: z.string().optional(),
  investigatorMobile: z.string().optional(),
  // Real case-dossier particulars a court-facing report cannot be filed
  // without (PS4_BUILD_STATUS.md's officer review) — all optional, since a
  // case is often opened before some of these are known.
  offenceSections: z.string().optional(),
  firDate: z.coerce.date().optional(),
  complainantName: z.string().optional(),
  complainantContact: z.string().optional(),
  accusedDetails: z.string().optional(),
  courtJurisdiction: z.string().optional(),
  gdEntryNumber: z.string().optional(),
  dispatchNumber: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const cases = await db.case.findMany({
    orderBy: { openedAt: "desc" },
    include: { investigator: { select: { name: true } } },
  });
  return NextResponse.json(cases);
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const parsed = createCaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid case details.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const { caseRecord, auditEntry } = await db.$transaction(async (tx) => {
    const id = await nextCaseId(tx);
    const caseRecord = await tx.case.create({
      data: {
        id,
        firNumber: data.firNumber,
        policeStation: data.policeStation,
        district: data.district,
        title: data.title,
        summary: data.summary,
        evidenceKind: data.evidenceKind,
        sensitivityLevel: data.sensitivityLevel,
        investigatorId: session.userId,
        investigatorRank: data.investigatorRank,
        investigatorBadgeNo: data.investigatorBadgeNo,
        investigatorMobile: data.investigatorMobile,
        offenceSections: data.offenceSections,
        firDate: data.firDate,
        complainantName: data.complainantName,
        complainantContact: data.complainantContact,
        accusedDetails: data.accusedDetails,
        courtJurisdiction: data.courtJurisdiction,
        gdEntryNumber: data.gdEntryNumber,
        dispatchNumber: data.dispatchNumber,
      },
    });
    // Same transaction as the case row itself — a case can never exist
    // without its opening audit entry committing alongside it.
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId: caseRecord.id,
        actorId: session.userId,
        action: "ASSIGNED", // case created and assigned to its opening investigator in the same act
        device: request.headers.get("user-agent") ?? undefined,
      },
      tx,
    );
    return { caseRecord, auditEntry };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json(caseRecord, { status: 201 });
}
