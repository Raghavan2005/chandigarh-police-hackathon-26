"use client";

import { useState } from "react";
import { Globe2, MapPinOff } from "lucide-react";
import { GlobeMapSvg } from "@/components/shared/globe-map";
import { projectLatLon, WorldMapSvg } from "@/components/shared/world-map";
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

interface MarkerHoverCard {
  x: number;
  y: number;
  title: string;
}

/** Same fix as the globe map (globe-map.tsx) and the case mind-map graph
 * (mindmap-graph.tsx) — a native SVG `<title>` tooltip on a marker here had
 * the same real, confirmed-live problem: an investigator hovering a
 * place-mention diamond got no popup at all. Replaced with a real floating
 * card keyed off the hover event's own coordinates. */
function MarkerHoverTooltip({ card }: { card: MarkerHoverCard }) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[280px] rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-xs text-text-primary shadow-lg"
      style={{ left: card.x + 14, top: card.y + 14 }}
    >
      {card.title}
    </div>
  );
}

/**
 * One shared globe for the whole case, instead of a separate map per
 * exhibit — plots every exhibit's own origin (where its file was actually
 * uploaded from, per the Geographic trace data) and every exhibit's web-
 * search result locations, each exhibit in its own color so they stay
 * distinguishable on one view. Origins are numbered in upload-timestamp
 * order and connected by a dashed timeline path — "where it started, and
 * in what sequence" across the whole case, not just per file.
 */
export function CombinedSourceMap({
  evidence,
  propagation,
}: {
  evidence: Evidence[];
  propagation: EvidencePropagation[];
}) {
  const [hover, setHover] = useState<MarkerHoverCard | null>(null);

  const originsByEvidenceId = new Map(
    propagation.map((p) => [p.evidenceId, p.sightings.find((s) => s.kind === "origin")] as const),
  );

  const exhibitsWithOrigin = evidence
    .map((ev, i) => ({ ev, exhibitNumber: i + 1, origin: originsByEvidenceId.get(ev.id) }))
    .filter((x) => x.origin?.location);
  // Chronological, not upload-array order — "where it started" means
  // ordered by when each exhibit's own sighting actually happened.
  exhibitsWithOrigin.sort((a, b) => a.origin!.timestamp.getTime() - b.origin!.timestamp.getTime());

  const markers: GlobeMarker[] = [];
  const legend: { exhibitNumber: number; mimeType: string; color: string; order: number }[] = [];

  exhibitsWithOrigin.forEach(({ ev, exhibitNumber, origin }, idx) => {
    const color = EXHIBIT_COLORS[idx % EXHIBIT_COLORS.length];
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
    });

    const searchResult = parseWebSearchResult(ev.webSearchResult);
    for (const r of searchResult?.results ?? []) {
      if (!r.location) continue;
      markers.push({
        key: `result-${ev.id}-${r.url}`,
        lat: r.location.lat,
        lon: r.location.lon,
        href: r.url,
        title: `Exhibit ${exhibitNumber} — ${r.domain} (${r.location.label}, approx. server location)`,
        variant: "result",
        color,
        groupId: ev.id,
      });
    }
  });

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-sunken/40 px-4 py-8 text-center">
        <MapPinOff className="size-6 text-text-tertiary" />
        <p className="max-w-md text-xs text-text-tertiary">
          Nothing to plot yet — needs a resolvable upload location (EXIF GPS or IP geolocation) for at least one
          exhibit. Run a web search on an exhibit to add its results here too.
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
              <span className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-surface" style={{ backgroundColor: l.color }}>
                {l.order}
              </span>
              Exhibit {l.exhibitNumber} ({l.mimeType})
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">3D globe (drag to rotate)</p>
          <GlobeMapSvg idPrefix="combined-source-map" initialCenterLat={center.lat} initialCenterLon={center.lon} markers={renderedMarkers} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">2D map (whole world at once, nothing hidden)</p>
          <WorldMapSvg idPrefix="combined-source-map-flat" heightClassName="h-[320px]">
            {/* Per-exhibit arcs: origin -> its own results only. */}
            {[...new Set(renderedMarkers.map((m) => m.groupId))].flatMap((groupId) => {
              const group = renderedMarkers.filter((m) => m.groupId === groupId);
              const origin = group.find((m) => m.variant === "origin");
              if (!origin) return [];
              const originPoint = projectLatLon(origin.lat, origin.lon);
              return group
                .filter((m) => m.variant === "result")
                .map((m) => {
                  const p = projectLatLon(m.lat, m.lon);
                  return (
                    <path key={`flat-arc-${m.key}`} d={flatArcPath(originPoint, p)} fill="none" stroke={m.color} strokeWidth={0.75} strokeOpacity={0.55} />
                  );
                });
            })}

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
                    r={isOrigin ? 7 : 4.5}
                    fill={m.color}
                    fillOpacity={isOrigin ? 1 : 0.85}
                    stroke="var(--surface)"
                    strokeWidth={1.25}
                    filter="url(#combined-source-map-flat-glow)"
                  />
                  {isOrigin && m.order != null && (
                    <text x={p.x} y={p.y} fill="var(--surface)" fontSize={8} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none">
                      {m.order}
                    </text>
                  )}
                  {/* Invisible, larger hit target — the base marker (down
                      to a 4.5px "result" dot) is a fiddly thing to hover
                      precisely; this widens the real hover area without
                      changing how the marker actually looks. */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    fill="transparent"
                    onMouseEnter={(e) => setHover({ x: e.clientX, y: e.clientY, title: m.title })}
                    onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                    onMouseLeave={() => setHover(null)}
                  />
                </>
              );
              return m.href ? (
                <a key={m.key} href={m.href} target="_blank" rel="noreferrer noopener" className="cursor-pointer transition-opacity hover:opacity-80">
                  {content}
                </a>
              ) : (
                <g key={m.key}>{content}</g>
              );
            })}
          </WorldMapSvg>
        </div>
      </div>
      {hover && <MarkerHoverTooltip card={hover} />}
    </div>
  );
}
