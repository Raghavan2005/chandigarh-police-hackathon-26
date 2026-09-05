import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { getRealCase } from "@/lib/cases-server";
import { aggregateCaseText, isMindMapConfigured, synthesizeCaseMindMap } from "@/lib/mindmap-server";

/**
 * Real cross-evidence mind map (PS4_USE_CASES.md #6) — gathers every real
 * per-exhibit text already visible elsewhere on this case (transcripts/
 * translations, AI image descriptions, per-face notes, document text/
 * summaries) and makes one Gemini structured-JSON call to extract named
 * entities, text-evidenced relationships between them, and a narrative
 * summary. Same cache-and-manually-re-run philosophy, same NCII/minor
 * sensitivity gate, and same 501-when-unconfigured pattern as every other
 * Gemini caller in this app (describe-image, document-summary) — this
 * call sends the case's aggregated text to an external service, so the
 * gate applies at the case level rather than per exhibit.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isMindMapConfigured()) {
    return NextResponse.json(
      { error: "Cross-evidence mind map isn't configured on this deployment (no Gemini credentials set)." },
      { status: 501 },
    );
  }

  const { caseId } = await params;
  const realCase = await getRealCase(caseId);
  if (!realCase) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  if (realCase.sensitivityLevel !== "standard") {
    return NextResponse.json(
      {
        error:
          "This case is flagged sensitive — sending its evidence text to an external service is blocked to avoid exposing it outside this platform.",
      },
      { status: 403 },
    );
  }

  const aggregation = aggregateCaseText(realCase);
  if (aggregation.exhibits.length === 0) {
    return NextResponse.json(
      {
        error:
          "No analyzed exhibits on this case have any real text yet (no transcript, AI image description, face note, or document text/summary) — nothing to synthesize a mind map from.",
      },
      { status: 422 },
    );
  }

  const result = await synthesizeCaseMindMap(aggregation.combinedText).catch((error: unknown) => {
    console.error("[mindmap] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Mind-map synthesis failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const saved = await db.caseMindMap.upsert({
    where: { caseId },
    create: {
      caseId,
      entitiesJson: JSON.stringify(result.entities),
      relationshipsJson: JSON.stringify(result.relationships),
      summary: result.summary,
      exhibitCount: aggregation.exhibits.length,
    },
    update: {
      entitiesJson: JSON.stringify(result.entities),
      relationshipsJson: JSON.stringify(result.relationships),
      summary: result.summary,
      exhibitCount: aggregation.exhibits.length,
      ranAt: new Date(),
    },
  });

  await writeAuditEntry({
    caseId,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-mindmap",
  });

  return NextResponse.json({
    entities: result.entities,
    relationships: result.relationships,
    summary: result.summary,
    exhibitCount: saved.exhibitCount,
    ranAt: saved.ranAt,
  });
}
