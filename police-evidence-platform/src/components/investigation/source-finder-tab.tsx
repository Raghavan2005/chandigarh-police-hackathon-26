import { FileDigit } from "lucide-react";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { WebSearchPanel } from "@/components/investigation/web-search-panel";
import { CombinedSourceMap } from "@/components/investigation/combined-source-map";
import { parseWebSearchResult } from "@/lib/web-search-merge";
import type { Evidence } from "@/components/investigation/evidence-card";
import type { EvidenceKind } from "@/lib/types";
import type { EvidencePropagation } from "@/lib/propagation-server";

/**
 * Case-level home for multi-engine web search — previously buried inside
 * each exhibit's own card alongside a dozen other panels. Pulled out to its
 * own tab (mirrors "Cross-case & corpus matches") because it answers a
 * different question than that tab does: cross-case/corpus matching is
 * internal (has this platform's own database seen this file before?), web
 * search is external (has the public internet seen it?) — "source finder"
 * as a name for that external-tracing half. Still one search box per
 * exhibit (each has its own extracted text/query), just listed together
 * instead of scattered across separate exhibit tabs.
 */
export function SourceFinderTab({
  caseId,
  sensitivityLevel,
  evidence,
  propagation,
}: {
  caseId: string;
  sensitivityLevel: string;
  evidence: Evidence[];
  propagation: EvidencePropagation[];
}) {
  if (evidence.length === 0) {
    return <p className="text-sm text-text-tertiary">No evidence on this case yet.</p>;
  }

  // Only exhibits that already have a real search result — run
  // "Investigate" on an exhibit (it chains a web search automatically) to
  // get it to show up here, instead of listing every exhibit with an empty
  // "no prior search yet" placeholder.
  const searched = evidence.filter((ev) => ev.webSearchResult);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-tertiary">
        Real search across the web (via Cognition Engine-grounded search), Brave, and DuckDuckGo — one exhibit at a time, using that
        exhibit&apos;s own captions/AI description/reverse-image-search labels as the starting query. Traces where
        this content appears on the public internet, separate from the cross-case/corpus tab&apos;s internal
        database matching.
      </p>
      <CombinedSourceMap evidence={evidence} propagation={propagation} />
      {searched.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          No exhibit has been searched yet — run &ldquo;Investigate&rdquo; on an exhibit in the Evidence tab (it runs
          a web search automatically), or open an exhibit&apos;s own web search there directly.
        </p>
      ) : (
        searched.map((ev) => {
          const exhibitNumber = evidence.indexOf(ev) + 1;
          const isImage = ev.mimeType.startsWith("image/");
          const isVideo = ev.mimeType.startsWith("video/");
          const isAudio = ev.mimeType.startsWith("audio/");
          const kind: EvidenceKind = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";
          const Icon = KIND_ICON[kind] ?? FileDigit;
          return (
            <div key={ev.id} className="rounded-lg border border-border-subtle bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4 text-text-tertiary" />
                <p className="text-sm text-text-primary">
                  <span className="font-medium">Exhibit {exhibitNumber}</span> — {ev.mimeType}
                </p>
              </div>
              <WebSearchPanel
                key={ev.webSearchResult?.ranAt.toISOString() ?? "none"}
                caseId={caseId}
                evidenceId={ev.id}
                cached={parseWebSearchResult(ev.webSearchResult)}
                sensitivityLevel={sensitivityLevel}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
