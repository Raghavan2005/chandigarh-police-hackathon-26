import { WORLD_COUNTRIES } from "@/lib/world-countries-data";

export const GLOBE_SIZE = 320;
export const GLOBE_CENTER = GLOBE_SIZE / 2;
export const GLOBE_R = GLOBE_CENTER - 12;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface GlobePoint2D {
  x: number;
  y: number;
  visible: boolean;
}

/** Spherical mean direction — the correct way to find a "center" for a set
 * of lat/lon points (unlike averaging lat/lon directly, which breaks near
 * the antimeridian and drags the center toward whichever pole is nearer).
 * Converts each point to a unit vector, averages the vectors, converts the
 * resultant direction back to lat/lon. Used to auto-pick the globe's
 * starting rotation so the maximum number of markers land in the visible
 * hemisphere at once, rather than locking dead-center on a single point
 * and potentially hiding every other marker on the far side — the
 * investigator can always drag to bring the rest into view anyway. */
export function sphericalCentroid(points: { lat: number; lon: number }[]): { lat: number; lon: number } {
  let x = 0, y = 0, z = 0;
  for (const { lat, lon } of points) {
    const phi = toRad(lat);
    const lambda = toRad(lon);
    x += Math.cos(phi) * Math.cos(lambda);
    y += Math.cos(phi) * Math.sin(lambda);
    z += Math.sin(phi);
  }
  x /= points.length;
  y /= points.length;
  z /= points.length;
  const lon = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);
  return { lat: (lat * 180) / Math.PI, lon: (lon * 180) / Math.PI };
}

/**
 * `Math.sin`/`Math.cos`/`Math.atan2` are not guaranteed bit-identical across
 * JS engines — Node's V8 (server-side render, computing this once for the
 * initial SSR pass) and a browser's V8 (client hydration, recomputing the
 * identical math from the same props) can disagree in the last binary digit
 * of a trig result for the exact same input. Invisible to the eye, but not
 * to React's hydration check, which diffs the server-rendered attribute
 * *string* against the client's freshly computed number — the same real,
 * confirmed-live bug class as mindmap-graph.tsx's computeLayout, fixed the
 * same way: round to 6 decimal places, many orders of magnitude finer than
 * a screen pixel, so server and client always agree on the exact string
 * React renders/hydrates against.
 */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Orthographic projection (the classic "photo of a globe from space" math)
 * centered on (lat0, lon0) — a real projection, not a flat rectangle
 * pretending to be a sphere. `visible` is false for the far hemisphere
 * (small negative tolerance so points right at the terminator still draw,
 * rather than popping in/out at exactly 90°). */
export function projectOrthographic(lat: number, lon: number, lat0: number, lon0: number): GlobePoint2D {
  const phi = toRad(lat);
  const lambda = toRad(lon);
  const phi0 = toRad(lat0);
  const lambda0 = toRad(lon0);
  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);
  const x = GLOBE_CENTER + GLOBE_R * Math.cos(phi) * Math.sin(lambda - lambda0);
  const y = GLOBE_CENTER - GLOBE_R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0));
  return { x: round6(x), y: round6(y), visible: cosC > -0.02 };
}

/** A great-circle sweep (fixed lat or fixed lon), broken into separate
 * point runs wherever it crosses to the far side of the globe — drawing
 * one continuous polyline across a visibility gap would draw a spurious
 * line straight through the middle of the sphere. */
function graticuleRuns(points: { lat: number; lon: number }[], lat0: number, lon0: number): GlobePoint2D[][] {
  const runs: GlobePoint2D[][] = [];
  let current: GlobePoint2D[] = [];
  for (const { lat, lon } of points) {
    const p = projectOrthographic(lat, lon, lat0, lon0);
    if (p.visible) {
      current.push(p);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) runs.push(current);
  return runs;
}

export function buildGraticule(lat0: number, lon0: number): GlobePoint2D[][] {
  const runs: GlobePoint2D[][] = [];
  for (let lon = -150; lon <= 180; lon += 30) {
    const points = [];
    for (let lat = -85; lat <= 85; lat += 5) points.push({ lat, lon });
    runs.push(...graticuleRuns(points, lat0, lon0));
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 5) points.push({ lat, lon });
    runs.push(...graticuleRuns(points, lat0, lon0));
  }
  return runs;
}

export interface ProjectedCountries {
  /** Filled land shapes — only for a country ring that's currently
   * entirely within the visible hemisphere; an SVG path auto-closes an
   * open subpath with a straight line, which would draw an ugly false
   * chord across a country ring that's been cut off at the horizon, so
   * those get an outline instead (below), never a fill. */
  fillPaths: string[];
  /** Coastline outlines for rings that cross the horizon — same
   * gap-on-invisibility segmentation as the graticule lines. */
  strokeRuns: GlobePoint2D[][];
}

/** Projects the bundled simplified world outlines (world-countries-data.ts)
 * onto the current globe rotation — real country/coastline shapes, not
 * just a lat/lon grid, so the sphere actually reads as "Earth" rather than
 * an abstract globe. */
export function projectCountryOutlines(lat0: number, lon0: number): ProjectedCountries {
  const fillPaths: string[] = [];
  const strokeRuns: GlobePoint2D[][] = [];
  for (const country of WORLD_COUNTRIES) {
    for (const ring of country.rings) {
      const projected = ring.map(([lon, lat]) => projectOrthographic(lat, lon, lat0, lon0));
      if (projected.every((p) => p.visible)) {
        fillPaths.push(`M ${projected.map((p) => `${p.x},${p.y}`).join(" L ")} Z`);
        continue;
      }
      let current: GlobePoint2D[] = [];
      for (const p of projected) {
        if (p.visible) {
          current.push(p);
        } else if (current.length > 1) {
          strokeRuns.push(current);
          current = [];
        } else {
          current = [];
        }
      }
      if (current.length > 1) strokeRuns.push(current);
    }
  }
  return { fillPaths, strokeRuns };
}

/** Pulls the arc's midpoint toward the globe's center by a fraction,
 * reading as a gently-bowed flight-path arc rather than a straight chord
 * cutting across the sphere — same trick real route maps use. */
export function arcPath(p1: GlobePoint2D, p2: GlobePoint2D): string {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const cx = midX + (GLOBE_CENTER - midX) * 0.18;
  const cy = midY + (GLOBE_CENTER - midY) * 0.18;
  return `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`;
}

export interface GlobeMarker {
  key: string;
  lat: number;
  lon: number;
  href: string | null;
  title: string;
  variant: "origin" | "result";
  /** Per-series color (e.g. one color per exhibit) — arcs only connect
   * markers that share both a `groupId` and this color. */
  color: string;
  /** Ties a "result" marker back to the "origin" marker it should arc
   * from — usually the exhibit id. */
  groupId: string;
  /** 1-based chronological position, set on origin markers only. Drives
   * the numbered badge and the dashed timeline path connecting origins in
   * upload order — "where it started, in what order." */
  order?: number;
}

/** Real domain geolocation is city/region-level, not exact — it's common
 * (especially for shared hosting/CDNs) for several results, or a result
 * and its origin, to resolve to the near-identical coordinate. Left as-is
 * they'd render as one indistinguishable dot with no visible indication
 * more than one thing is there. Fans genuinely-overlapping points into a
 * small ring (a few degrees of jitter — imperceptible at whole-globe
 * scale, doesn't materially misrepresent the location) so each stays a
 * separate, clickable marker instead of disappearing into a stack. */
export function declusterMarkers(markers: GlobeMarker[]): GlobeMarker[] {
  const groups = new Map<string, GlobeMarker[]>();
  for (const m of markers) {
    const key = `${m.lat.toFixed(1)},${m.lon.toFixed(1)}`;
    const group = groups.get(key);
    if (group) group.push(m);
    else groups.set(key, [m]);
  }
  const result: GlobeMarker[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    const angleStep = (2 * Math.PI) / group.length;
    for (let i = 0; i < group.length; i++) {
      const m = group[i];
      result.push({ ...m, lat: m.lat + 3 * Math.sin(i * angleStep), lon: m.lon + 3 * Math.cos(i * angleStep) });
    }
  }
  return result;
}
