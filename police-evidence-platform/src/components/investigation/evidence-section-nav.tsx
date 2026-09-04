export interface EvidenceSection {
  id: string;
  label: string;
}

/**
 * Plain anchor links, not a JS scroll handler — a single exhibit with
 * captions + splice detection + reverse-image search + web search etc. can
 * get long, and this is the cheapest fix: real per-card in-page navigation,
 * no scroll-spy/observer logic needed. Sticks to the top of the scrolling
 * <main> (see (app)/layout.tsx) while its own card is in view, then yields
 * to the next card's nav — plain CSS `sticky`, not manual scroll tracking.
 */
export function EvidenceSectionNav({ sections }: { sections: EvidenceSection[] }) {
  if (sections.length < 2) return null;

  return (
    <nav className="sticky top-0 z-10 -mx-4 -mt-4 mb-1 flex flex-wrap gap-1 border-b border-border-subtle bg-surface/95 px-4 py-1.5 backdrop-blur">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
