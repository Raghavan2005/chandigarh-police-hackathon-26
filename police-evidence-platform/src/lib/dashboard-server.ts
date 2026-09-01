import "server-only";
import { db } from "@/lib/db";
import { formatDuration } from "@/lib/utils";

export interface Kpi {
  label: string;
  value: string;
  trend: number[];
  delta: string;
}

const TREND_DAYS = 14;
const ALERT_VERDICTS = ["MANIPULATED", "AI_GENERATED"];

/** Buckets a list of timestamps into one count per day, oldest to newest,
 * ending today — the real equivalent of mock-data.ts's hand-authored
 * trend arrays. With the small amount of real data seeded so far these
 * will look sparse/flat rather than the old mock's smooth upward curve;
 * that's the honest picture, not a bug. */
function dailyBuckets(dates: Date[], days: number, end: Date): number[] {
  const buckets = Array<number>(days).fill(0);
  const startOfEnd = new Date(end);
  startOfEnd.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfEnd.getTime() - day.getTime()) / 86_400_000);
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

const FLAGGED_TREND_WEEKS = 16;

/** Weekly counts of MANIPULATED/AI_GENERATED verdicts over the last 16
 * weeks, for the dashboard's "Flagged media volume" chart — this was
 * previously hardcoded to a fabricated smooth upward curve
 * ([12, 18, 15, 22, ...]) with no real dependency on corpus/propagation
 * data at all (that was a mis-scoping in an earlier status note); it only
 * ever needed FusionVerdict history, which already exists. */
export async function getFlaggedMediaTrend(): Promise<number[]> {
  const now = new Date();
  const start = new Date(now.getTime() - FLAGGED_TREND_WEEKS * 7 * 86_400_000);

  const flagged = await db.fusionVerdict.findMany({
    where: { verdict: { in: ALERT_VERDICTS }, computedAt: { gte: start } },
    select: { computedAt: true },
  });

  const buckets = Array<number>(FLAGGED_TREND_WEEKS).fill(0);
  for (const { computedAt } of flagged) {
    const weeksAgo = Math.floor((now.getTime() - computedAt.getTime()) / (7 * 86_400_000));
    const idx = FLAGGED_TREND_WEEKS - 1 - weeksAgo;
    if (idx >= 0 && idx < FLAGGED_TREND_WEEKS) buckets[idx]++;
  }
  return buckets;
}

export interface CrossCaseLinkSummary {
  linkedCaseCount: number;
  totalLinks: number;
  exampleCaseId: string | null;
}

/** Real replacement for RelationshipSnapshot's old fixed fake mini-graph
 * (six hardcoded nodes labeled Telegram/X/WhatsApp/Facebook with invented
 * edges) — counts real EvidenceMatch rows (the actual cross-case matching
 * built and verified earlier this session) instead. */
export async function getCrossCaseLinkSummary(): Promise<CrossCaseLinkSummary> {
  const matches = await db.evidenceMatch.findMany({
    select: { matchedCaseId: true, evidence: { select: { caseId: true } } },
  });
  const caseIds = new Set<string>();
  for (const m of matches) {
    caseIds.add(m.evidence.caseId);
    caseIds.add(m.matchedCaseId);
  }
  return {
    linkedCaseCount: caseIds.size,
    totalLinks: matches.length,
    exampleCaseId: matches[0]?.evidence.caseId ?? null,
  };
}

export async function getDashboardKpis(): Promise<Kpi[]> {
  const now = new Date();
  const trendStart = new Date(now);
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));
  trendStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [
    openCasesCount,
    casesInTrendWindow,
    casesLast7d,
    verdictsLast30d,
    verdictsInTrendWindow,
    verdictsLast7d,
    activeAlertsCount,
    alertsInTrendWindow,
    alertsLast7d,
    allVerdictLatencies,
  ] = await Promise.all([
    db.case.count({ where: { status: { not: "closed" } } }),
    db.case.findMany({ where: { openedAt: { gte: trendStart } }, select: { openedAt: true } }),
    db.case.count({ where: { openedAt: { gte: sevenDaysAgo } } }),
    db.fusionVerdict.count({ where: { computedAt: { gte: thirtyDaysAgo } } }),
    db.fusionVerdict.findMany({ where: { computedAt: { gte: trendStart } }, select: { computedAt: true } }),
    db.fusionVerdict.count({ where: { computedAt: { gte: sevenDaysAgo } } }),
    db.fusionVerdict.count({
      where: { verdict: { in: ALERT_VERDICTS }, evidence: { case: { status: { not: "closed" } } } },
    }),
    db.fusionVerdict.findMany({
      where: { computedAt: { gte: trendStart }, verdict: { in: ALERT_VERDICTS } },
      select: { computedAt: true },
    }),
    db.fusionVerdict.count({ where: { computedAt: { gte: sevenDaysAgo }, verdict: { in: ALERT_VERDICTS } } }),
    db.fusionVerdict.findMany({
      select: { computedAt: true, evidence: { select: { uploadedAt: true } } },
    }),
  ]);

  const latenciesMs = allVerdictLatencies.map(
    (v) => v.computedAt.getTime() - v.evidence.uploadedAt.getTime(),
  );
  const avgLatencyMs = latenciesMs.length
    ? latenciesMs.reduce((sum, ms) => sum + ms, 0) / latenciesMs.length
    : null;

  const recentLatencies = allVerdictLatencies
    .filter((v) => v.computedAt >= sevenDaysAgo)
    .map((v) => v.computedAt.getTime() - v.evidence.uploadedAt.getTime());
  const olderLatencies = allVerdictLatencies
    .filter((v) => v.computedAt < sevenDaysAgo && v.computedAt >= new Date(sevenDaysAgo.getTime() - 7 * 86_400_000))
    .map((v) => v.computedAt.getTime() - v.evidence.uploadedAt.getTime());
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

  let verdictDelta = "Not enough data yet";
  if (recentLatencies.length && olderLatencies.length) {
    const change = ((avg(recentLatencies) - avg(olderLatencies)) / avg(olderLatencies)) * 100;
    verdictDelta = `${change <= 0 ? "" : "+"}${change.toFixed(0)}% vs prior week`;
  } else if (recentLatencies.length) {
    verdictDelta = `${recentLatencies.length} verdict(s) this week`;
  }

  return [
    {
      label: "Active Alerts",
      value: String(activeAlertsCount),
      trend: dailyBuckets(alertsInTrendWindow.map((a) => a.computedAt), TREND_DAYS, now),
      delta: alertsLast7d > 0 ? `+${alertsLast7d} this week` : "No new alerts this week",
    },
    {
      label: "Open Cases",
      value: String(openCasesCount),
      trend: dailyBuckets(casesInTrendWindow.map((c) => c.openedAt), TREND_DAYS, now),
      delta: casesLast7d > 0 ? `+${casesLast7d} this week` : "No new cases this week",
    },
    {
      label: "Evidence Analyzed (30d)",
      value: String(verdictsLast30d),
      trend: dailyBuckets(verdictsInTrendWindow.map((v) => v.computedAt), TREND_DAYS, now),
      delta: verdictsLast7d > 0 ? `+${verdictsLast7d} this week` : "No new verdicts this week",
    },
    {
      label: "Avg. Time to Verdict",
      value: avgLatencyMs === null ? "No data yet" : formatDuration(avgLatencyMs),
      // Unlike the other three trends, this is per-verdict latency (seconds
      // per most-recent verdicts), not one bucket per calendar day — a
      // daily average would mostly be gaps at this data volume. Still real,
      // just a different real axis.
      trend: latenciesMs.length ? latenciesMs.slice(-TREND_DAYS).map((ms) => Math.round(ms / 1000)) : Array(TREND_DAYS).fill(0),
      delta: verdictDelta,
    },
  ];
}
