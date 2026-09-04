import "server-only";
import geoip from "geoip-lite";

export interface SightingLocation {
  lat: number;
  lon: number;
  label: string;
  source: "exif" | "ip-geo";
}

const PRIVATE_IP_PATTERN = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc00:|fe80:)/;

/**
 * Real location, when one exists — EXIF GPS (exact, from the file itself)
 * takes priority over IP geolocation (approximate, city-level, and reflects
 * where a request came from, not necessarily where the media was
 * captured). Returns null rather than guessing when neither resolves —
 * most evidence will have no location at all, which is the honest common
 * case, not a failure to be hidden.
 */
export function resolveSightingLocation(input: {
  exifLat: number | null;
  exifLon: number | null;
  ip: string | null;
}): SightingLocation | null {
  if (input.exifLat !== null && input.exifLon !== null) {
    return { lat: input.exifLat, lon: input.exifLon, label: "Exact capture location", source: "exif" };
  }

  if (input.ip && !PRIVATE_IP_PATTERN.test(input.ip)) {
    const lookup = geoip.lookup(input.ip);
    if (lookup) {
      const [lat, lon] = lookup.ll;
      const label = [lookup.city, lookup.country].filter(Boolean).join(", ") || "Unknown location";
      return { lat, lon, label, source: "ip-geo" };
    }
  }

  return null;
}
