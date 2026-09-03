import { db } from "@/lib/db";

/**
 * Generates the next display Investigation ID, mirroring case-id.ts's
 * "CHD-{year}-{seq}" convention with its own prefix. Same caveat as
 * nextCaseId: count-then-insert inside the caller's transaction, good
 * enough for a single-process deployment, not a safe pattern for a real
 * multi-writer one.
 */
export async function nextInvestigationId(tx: Pick<typeof db, "investigation"> = db): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const count = await tx.investigation.count({ where: { id: { startsWith: prefix } } });
  const seq = (count + 1).toString().padStart(5, "0");
  return `${prefix}${seq}`;
}
