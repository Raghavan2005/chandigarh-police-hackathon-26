import os from "os";

/**
 * The origin another device on the same network should use to reach this
 * server — not request.nextUrl.origin/request.url's own host, which just
 * reflects whatever hostname the browser making *this* request happened to
 * use (often "localhost", unreachable from a tablet on the same WiFi).
 * Falls back to the request's own origin if no non-internal IPv4 interface
 * is found (e.g. no network connection at all).
 */
export function getLanOrigin(request: Request): string {
  const url = new URL(request.url);
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        const port = url.port || (url.protocol === "https:" ? "443" : "80");
        return `${url.protocol}//${entry.address}:${port}`;
      }
    }
  }
  return url.origin;
}
