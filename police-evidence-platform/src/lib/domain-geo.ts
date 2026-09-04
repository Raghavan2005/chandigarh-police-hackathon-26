import "server-only";
import dns from "dns/promises";
import geoip from "geoip-lite";

export interface DomainLocation {
  lat: number;
  lon: number;
  label: string;
}

const PRIVATE_IP_PATTERN = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc00:|fe80:)/;

/**
 * Real domain -> IP -> geolocation, reusing the same offline geoip-lite
 * database already used for evidence-sighting IP geolocation (geo.ts) — no
 * new dependency. Real, disclosed caveat: most sites sit behind a CDN
 * (Cloudflare, Fastly, ...), so the resolved location is very often the
 * CDN edge location, not the publisher's actual physical base — same
 * "approximate, not exact" honesty already applied there. Returns null
 * (never guesses) on any DNS/lookup failure.
 */
export async function resolveDomainLocation(domain: string): Promise<DomainLocation | null> {
  if (!domain) return null;
  try {
    const { address } = await dns.lookup(domain);
    if (PRIVATE_IP_PATTERN.test(address)) return null;
    const lookup = geoip.lookup(address);
    if (!lookup) return null;
    const [lat, lon] = lookup.ll;
    const label = [lookup.city, lookup.country].filter(Boolean).join(", ") || "Unknown location";
    return { lat, lon, label };
  } catch {
    return null;
  }
}
