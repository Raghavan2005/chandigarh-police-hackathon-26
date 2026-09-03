import "server-only";
import { db } from "@/lib/db";

/**
 * Alerts visible to a given user: their own targeted alerts, plus
 * platform-wide ones (targetUserId null — currently only
 * AUDIT_INTEGRITY_FAILURE) restricted to admins, matching the global audit
 * log's own admin-only gate (PS4_MVP_BUILD_PLAN.md §2).
 */
function visibilityWhere(userId: string, role: string) {
  return role === "admin"
    ? { OR: [{ targetUserId: userId }, { targetUserId: null }] }
    : { targetUserId: userId };
}

export async function listAlertsForUser(userId: string, role: string) {
  return db.alert.findMany({
    where: visibilityWhere(userId, role),
    orderBy: { createdAt: "desc" },
    include: {
      case: { select: { id: true, title: true } },
      acknowledgedBy: { select: { name: true } },
    },
  });
}

export async function getUnacknowledgedAlertCount(userId: string, role: string): Promise<number> {
  return db.alert.count({
    where: { ...visibilityWhere(userId, role), acknowledgedAt: null },
  });
}
