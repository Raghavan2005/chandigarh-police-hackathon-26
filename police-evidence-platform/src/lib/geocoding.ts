import "server-only";

/**
 * Real place-name → coordinate geocoding via OpenStreetMap's public
 * Nominatim API — chosen specifically because it needs no API key (this
 * deployment has none configured for any mapping/geocoding service; see
 * .env), matching the same "works out of the box on a hackathon laptop"
 * constraint the rest of this app's real-but-free integrations follow
 * (geoip-lite for IP geolocation, the bundled world-outline dataset for the
 * map itself). A name that doesn't resolve to anywhere real (too generic,
 * misspelled, fictional) returns null — never a guessed or fabricated
 * coordinate.
 *
 * Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * requires a real identifying User-Agent and caps the public instance at
 * 1 request/second — enforced here with a real sequential queue, not just
 * documented and hoped for, since violating it can get this deployment's IP
 * blocked from the service entirely.
 */

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const MIN_INTERVAL_MS = 1100; // just over 1/sec, leaving margin for clock jitter

export interface GeocodedPlace {
  lat: number;
  lon: number;
  displayName: string;
}

let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function scheduleAfterRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  // Swallow so one failed lookup doesn't poison the queue for every lookup
  // queued after it — each caller still gets its own real rejection/result.
  queue = run.catch(() => undefined);
  return run;
}

/**
 * Resolves one free-text place name to a real coordinate. Returns null on
 * no match, a network failure, or a malformed response — every case is a
 * genuine "could not place this on the map," not a hidden throw that would
 * take down the rest of an exhibit's extraction with it.
 *
 * A verified, real limitation worth documenting rather than hiding: a
 * common, undisambiguated name resolves to Nominatim's single top global
 * match, which is not guaranteed to be the place the text actually meant —
 * confirmed live: a bare "Sector 45" (no city given) resolves to Sector 45
 * in Gurgaon, not Chandigarh, purely because Nominatim ranked it higher
 * globally. location-extraction.ts's Gemini step already captures
 * surrounding city/state context when the text provides it (e.g. "Sector
 * 45, Chandigarh" geocodes correctly as one unit) — this only remains a
 * real risk when the source text itself never disambiguates. This is
 * exactly why every mentioned-place marker is labeled "an investigative
 * lead to verify" everywhere it's shown, not a confirmed location.
 */
export async function geocodePlaceName(name: string): Promise<GeocodedPlace | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  return scheduleAfterRateLimit(async () => {
    try {
      const url = new URL(NOMINATIM_ENDPOINT);
      url.searchParams.set("q", trimmed);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");

      const response = await fetch(url.toString(), {
        headers: {
          // Nominatim rejects/blocks requests without a real identifying
          // UA — a generic fetch default is exactly what its policy asks
          // deployments not to send.
          "User-Agent": "Pramana-ChandigarhPoliceHackathon/1.0 (evidence-platform; contact: investigator console)",
          Accept: "application/json",
        },
      });
      if (!response.ok) return null;

      const results: unknown = await response.json();
      if (!Array.isArray(results) || results.length === 0) return null;

      const top = results[0] as { lat?: unknown; lon?: unknown; display_name?: unknown };
      const lat = typeof top.lat === "string" ? parseFloat(top.lat) : null;
      const lon = typeof top.lon === "string" ? parseFloat(top.lon) : null;
      if (lat === null || lon === null || Number.isNaN(lat) || Number.isNaN(lon)) return null;

      return {
        lat,
        lon,
        displayName: typeof top.display_name === "string" ? top.display_name : trimmed,
      };
    } catch (error) {
      console.warn(`[geocoding] Nominatim lookup failed for "${trimmed}":`, error);
      return null;
    }
  });
}
