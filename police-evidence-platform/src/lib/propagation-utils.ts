import type { PropagationNode } from "@/lib/types";

/** Returns just the time portion of a "YYYY-MM-DD HH:MM IST"-style timestamp, or the date if no time is present. */
export function nodeTimeLabel(timestamp: string) {
  const parts = timestamp.split(" ");
  return parts.length > 1 ? parts[1] : parts[0];
}

function parseNodeDate(timestamp: string): Date {
  const [datePart, timePart] = timestamp.split(" ");
  return new Date(`${datePart}T${timePart ?? "00:00"}:00`);
}

/** Computes a human-readable span between the earliest and latest node timestamps. */
export function computeSpreadWindow(nodes: PropagationNode[]): string {
  if (nodes.length < 2) return "—";
  const times = nodes.map((n) => parseNodeDate(n.timestamp).getTime());
  const spanMs = Math.max(...times) - Math.min(...times);
  const minutes = spanMs / 60_000;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)} hr`;
  const days = hours / 24;
  if (days < 60) return `${Math.round(days)} d`;
  const months = days / 30.44;
  return `~${Math.round(months)} months`;
}
