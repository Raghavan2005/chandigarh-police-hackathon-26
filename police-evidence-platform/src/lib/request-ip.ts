import "server-only";

/**
 * Real client IP, when available. Next.js's App Router gives no way to read
 * the raw socket address — only what a reverse proxy sets in headers. When
 * this app runs with nothing in front of it (e.g. `next dev`/`next start`
 * directly, which is how the hackathon demo runs), neither header is set
 * and this returns null — an honest "not available," never a fabricated
 * loopback/private address.
 */
export function getRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}
