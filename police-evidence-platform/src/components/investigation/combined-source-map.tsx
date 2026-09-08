"use client";

import { useState } from "react";
import { Globe2, MapPinOff } from "lucide-react";
import { GlobeMapSvg } from "@/components/shared/globe-map";
import { MarkerPreview } from "@/components/shared/marker-preview";
import { projectLatLon, WorldMapSvg, WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT } from "@/components/shared/world-map";
import { declusterMarkers, sphericalCentroid, type GlobeMarker } from "@/lib/globe-projection";
import { parseWebSearchResult } from "@/lib/web-search-merge";
import type { Evidence } from "@/components/investigation/evidence-card";
import type { EvidencePropagation } from "@/lib/propagation-server";

const EXHIBIT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

/** Same gentle bow as the globe's arcPath, but toward the flat map's own
 * center — a flat map has no "far side," so this is purely cosmetic
 * (reads as a flight-path arc rather than a ruler-straight line). */
function flatArcPath(p1: { x: number; y: number }, p2: { x: number; y: number }): string {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const cy = midY - Math.abs(p2.x - p1.x) * 0.12;
  return `M ${p1.x},${p1.y} Q ${midX},${cy} ${p2.x},${p2.y}`;
}

/**
 * One shared globe for the whole case, instead of a separate map per
 * exhibit — plots every exhibit's own origin (where its file was actually
 * uploaded from, per the Geographic trace data), each exhibit in its own
 * color so they stay distinguishable on one view. Origins are numbered in
 * upload-timestamp order and connected by a dashed timeline path — "where
 * it started, and in what sequence" across the whole case, not just per
 * file.
 *
 * Fallback, for exhibits with no verified origin (no EXIF GPS, uploaded
 * from a private/local IP): plots that exhibit's web-search results'
 * server locations instead, so the map isn't just empty. This is a weaker
 * signal — a DNS lookup of the result's domain, which for CDN-fronted
 * sites (nearly everything on the open web) resolves to a CDN edge, not
 * the publisher's real location or anything about content spread — so
 * these render as hollow/dashed "unverified" pins, distinct from the solid
 * numbered origin pins, with that caveat spelled out in their own tooltip
 * and in the caption below the map. Never used to override or outrank a
 * real origin when one exists.
 */
export function CombinedSourceMap({
  evidence,
  propagation,
}: {
  evidence: Evidence[];
  propagation: EvidencePropagation[];
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const originsByEvidenceId = new Map(
    propagation.map((p) => [p.evidenceId, p.sightings.find((s) => s.kind === "origin")] as const),
  );

  const withOrigin = evidence
    .map((ev, i) => ({ ev, exhibitNumber: i + 1, color: EXHIBIT_COLORS[i % EXHIBIT_COLORS.length], origin: originsByEvidenceId.get(ev.id) }))
    .filter((x) => x.origin?.location);
  // Chronological, not upload-array order — "where it started" means
  // ordered by when each exhibit's own sighting actually happened.
  withOrigin.sort((a, b) => a.origin!.timestamp.getTime() - b.origin!.timestamp.getTime());
  const originExhibitIds = new Set(withOrigin.map((x) => x.ev.id));

  const markers: GlobeMarker[] = [];
  const legend: { exhibitNumber: number; mimeType: string; color: string; order: number | null }[] = [];

  withOrigin.forEach(({ ev, exhibitNumber, color, origin }, idx) => {
    const order = idx + 1;
    const loc = origin!.location!;
    legend.push({ exhibitNumber, mimeType: ev.mimeType, color, order });
    markers.push({
      key: `origin-${ev.id}`,
      lat: loc.lat,
      lon: loc.lon,
      href: null,
      title: `#${order} Exhibit ${exhibitNumber} started here — ${loc.label} (${loc.source === "exif" ? "EXIF GPS" : "IP geolocation, approx."})`,
      variant: "origin",
      color,
      groupId: ev.id,
      order,
      preview: {
        heading: `#${order} Exhibit ${exhibitNumber} — verified origin`,
        lines: [loc.label, loc.source === "exif" ? "EXIF GPS (exact)" : "IP geolocation (approx.)"],
      },
    });
  });

  evidence.forEach((ev, i) => {
    if (originExhibitIds.has(ev.id)) return;
    const color = EXHIBIT_COLORS[i % EXHIBIT_COLORS.length];
    const located = (parseWebSearchResult(ev.webSearchResult)?.results ?? []).filter((r) => r.location);
    if (located.length === 0) return;
    legend.push({ exhibitNumber: i + 1, mimeType: ev.mimeType, color, order: null });
    for (const r of located) {
      markers.push({
        key: `fallback-${ev.id}-${r.url}`,
        lat: r.location!.lat,
        lon: r.location!.lon,
        href: r.url,
        title: `Exhibit ${i + 1} — no verified upload origin. Nearest available signal: ${r.domain}'s server location (${r.location!.label}) — approximate CDN/hosting location only, not a confirmed origin or spread point.`,
        variant: "result",
        color,
        groupId: ev.id,
        preview: {
          heading: r.title,
          lines: [
            r.domain,
            r.publishedAt ? `Published/modified: ${new Date(r.publishedAt).toLocaleDateString()}` : "No declared publish date",
            `${r.location!.label} — approx. server location, unverified`,
          ],
        },
      });
    }
  });

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-sunken/40 px-4 py-8 text-center">
        <MapPinOff className="size-6 text-text-tertiary" />
        <p className="max-w-md text-xs text-text-tertiary">
          Nothing to plot yet — needs a resolvable upload location (EXIF GPS or IP geolocation) for at least one
          exhibit, or a web-search result with a resolvable server location as a fallback.
        </p>
      </div>
    );
  }

  const renderedMarkers = declusterMarkers(markers);
  const center = sphericalCentroid(markers);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Globe2 className="size-3.5 text-accent-primary" />
          {legend.length} exhibit{legend.length === 1 ? "" : "s"} plotted, numbered by when they started
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-tertiary">
          {legend.map((l) => (
            <span key={l.exhibitNumber} className="flex items-center gap-1">
              {l.order != null ? (
                <span className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-surface" style={{ backgroundColor: l.color }}>
                  {l.order}
                </span>
              ) : (
                <span
                  className="flex size-4 items-center justify-center rounded-full border border-dashed text-[8px] font-bold"
                  style={{ borderColor: l.color, color: l.color }}
                >
                  ~
                </span>
              )}
              Exhibit {l.exhibitNumber} ({l.mimeType}){l.order == null && " — unverified"}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-text-tertiary">
        Filled numbered pins are verified upload origins (EXIF GPS or IP geolocation). Hollow dashed &ldquo;~&rdquo;
        pins mean that exhibit had no verified origin — shown instead is the nearest available signal, a linked
        page&apos;s approximate server/CDN location, which is not a confirmed origin or spread point.
      </p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">3D globe (drag to rotate)</p>
          <GlobeMapSvg idPrefix="combined-source-map" initialCenterLat={center.lat} initialCenterLon={center.lon} markers={renderedMarkers} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">2D map (whole world at once, nothing hidden)</p>
          <WorldMapSvg idPrefix="combined-source-map-flat" heightClassName="h-[320px]">
            {/* Dashed timeline connecting every exhibit's origin in order. */}
            {legend.length > 1 &&
              legend.slice(1).map((l, i) => {
                const prevMarker = renderedMarkers.find((m) => m.variant === "origin" && m.order === legend[i].order);
                const currMarker = renderedMarkers.find((m) => m.variant === "origin" && m.order === l.order);
                if (!prevMarker || !currMarker) return null;
                const p1 = projectLatLon(prevMarker.lat, prevMarker.lon);
                const p2 = projectLatLon(currMarker.lat, currMarker.lon);
                return (
                  <path key={`flat-timeline-${l.order}`} d={flatArcPath(p1, p2)} fill="none" stroke="var(--text-tertiary)" strokeWidth={1} strokeDasharray="3 3" />
                );
              })}

            {renderedMarkers.map((m) => {
              const p = projectLatLon(m.lat, m.lon);
              const isOrigin = m.variant === "origin";
              const content = (
                <>
                  {isOrigin && (
                    <circle cx={p.x} cy={p.y} r={8} fill="none" stroke={m.color} strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r" values="8;17;8" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isOrigin ? 7 : 5}
                    fill={isOrigin ? m.color : "none"}
                    stroke={isOrigin ? "var(--surface)" : m.color}
                    strokeWidth={isOrigin ? 1.25 : 1.75}
                    strokeDasharray={isOrigin ? undefined : "2 1.5"}
                    filter="url(#combined-source-map-flat-glow)"
                  />
                  {isOrigin && m.order != null && (
                    <text x={p.x} y={p.y} fill="var(--surface)" fontSize={8} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none">
                      {m.order}
                    </text>
                  )}
                  <title>{m.title}</title>
                </>
              );
              const hoverHandlers = { onMouseEnter: () => setHoveredKey(m.key), onMouseLeave: () => setHoveredKey(null) };
              return m.href ? (
                <a
                  key={m.key}
                  href={m.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  {...hoverHandlers}
                >
                  {content}
                </a>
              ) : (
                <g key={m.key} {...hoverHandlers}>
                  {content}
                </g>
              );
            })}

            {(() => {
              const hoveredFlat = renderedMarkers.find((m) => m.key === hoveredKey && m.preview);
              if (!hoveredFlat?.preview) return null;
              const p = projectLatLon(hoveredFlat.lat, hoveredFlat.lon);
              return <MarkerPreview preview={hoveredFlat.preview} x={p.x} y={p.y} boundsWidth={WORLD_MAP_WIDTH} boundsHeight={WORLD_MAP_HEIGHT} />;
            })()}
          </WorldMapSvg>
        </div>
      </div>
    </div>
  );
}
