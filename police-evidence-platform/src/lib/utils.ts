import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a millisecond duration as "Xs" / "Xm Ys" / "Xh Ym" — shared by
 * the dashboard's avg-time-to-verdict KPI and the real pipeline panel so
 * both surfaces render the same real latency numbers the same way. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/** Bare `.toLocaleString()`/`.toLocaleDateString()` format according to the
 * runtime's default locale/timezone — fine for a Client Component's own
 * browser-only render, but a hydration-mismatch risk for anything whose
 * output is baked into server-rendered HTML (Server Components, or a
 * Client Component's first SSR pass): the server process's default locale
 * isn't guaranteed to match the value used at hydration time. Pinning both
 * explicitly makes the formatted string deterministic regardless of which
 * environment produces it. */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

export function formatDateOnly(date: Date): string {
  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
}

export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
}
