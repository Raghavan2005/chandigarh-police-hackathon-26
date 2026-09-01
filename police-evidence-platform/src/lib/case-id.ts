import { db } from "@/lib/db";

/**
 * Generates the next display case ID in the existing "CHD-{year}-{seq}"
 * convention (matches the mock data's CHD-2026-00131 style). Counts
 * same-year cases inside the caller's transaction so the count and the
 * insert that follows it are consistent — good enough for a single-process
 * hackathon deployment; a real multi-writer deployment would want a
 * dedicated sequence, not a count-then-insert.
 */
export async function nextCaseId(tx: Pick<typeof db, "case"> = db): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CHD-${year}-`;
  const count = await tx.case.count({ where: { id: { startsWith: prefix } } });
  const seq = (count + 1).toString().padStart(5, "0");
  return `${prefix}${seq}`;
}
