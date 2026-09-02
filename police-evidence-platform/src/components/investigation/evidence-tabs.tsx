"use client";

import { useState } from "react";
import { FileDigit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { EvidenceCard } from "@/components/investigation/evidence-card";
import type { EvidenceKind } from "@/lib/types";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type Evidence = RealCase["evidence"][number];

const VERDICT_DOT: Record<string, string> = {
  AUTHENTIC: "bg-status-safe",
  MANIPULATED: "bg-status-critical",
  AI_GENERATED: "bg-status-critical",
  INCONCLUSIVE: "bg-status-inconclusive",
};

/**
 * Switches between a case's evidence items via tabs instead of stacking
 * every exhibit vertically — a case with several exhibits (e.g. an
 * extracted frame alongside its source video) previously forced scrolling
 * through every one to compare or reach a specific exhibit. A single
 * exhibit renders directly, no tab chrome for something with nothing to
 * switch between.
 */
export function EvidenceTabs({
  caseId,
  sensitivityLevel,
  evidence,
}: {
  caseId: string;
  sensitivityLevel: string;
  evidence: Evidence[];
}) {
  // Controlled, not `defaultValue` — `evidence` is ordered newest-first
  // (cases-server.ts), so evidence[0].id changes every time a new exhibit
  // is added, and Base UI's uncontrolled Tabs logs a real warning ("changing
  // the default value of an uncontrolled Tabs after being initialized")
  // whenever that prop shifts under an already-mounted instance — caught
  // live while testing the new "Add evidence" dialog, not by inspection.
  // Controlled state also lets a genuinely new upload jump the active tab
  // to it, instead of silently adding a tab nobody's looking at.
  //
  // Adjusted during render (React's documented pattern for "derive state
  // from a prop change"), not in a useEffect — setState-in-effect here
  // would cause an extra, avoidable render pass every time `evidence`
  // changes, which its own lint rule (react-hooks/set-state-in-effect)
  // correctly flags.
  const [activeId, setActiveId] = useState(() => evidence[0]?.id);
  const [prevEvidence, setPrevEvidence] = useState(evidence);
  if (evidence !== prevEvidence) {
    setPrevEvidence(evidence);
    if (evidence.length > prevEvidence.length || !evidence.some((e) => e.id === activeId)) {
      setActiveId(evidence[0]?.id); // newest upload sorts first
    }
  }

  if (evidence.length === 1) {
    return (
      <EvidenceCard
        caseId={caseId}
        sensitivityLevel={sensitivityLevel}
        evidence={evidence[0]}
        exhibitNumber={1}
        derivedFromLabel={null}
      />
    );
  }

  return (
    <Tabs value={activeId} onValueChange={(v) => setActiveId(v as string)}>
      <TabsList variant="line" className="border-b border-border-subtle">
        {evidence.map((ev, i) => {
          const isImage = ev.mimeType.startsWith("image/");
          const isVideo = ev.mimeType.startsWith("video/");
          const isAudio = ev.mimeType.startsWith("audio/");
          const kind: EvidenceKind = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";
          const Icon = KIND_ICON[kind] ?? FileDigit;
          const verdict = ev.fusionVerdict?.verdict;
          return (
            <TabsTrigger key={ev.id} value={ev.id} className="gap-1.5">
              <Icon className="size-3.5" />
              Exhibit {i + 1}
              {verdict && <span className={`size-1.5 rounded-full ${VERDICT_DOT[verdict] ?? VERDICT_DOT.INCONCLUSIVE}`} />}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {evidence.map((ev, i) => {
        const sourceIndex = ev.derivedFromEvidenceId ? evidence.findIndex((e) => e.id === ev.derivedFromEvidenceId) : -1;
        return (
          <TabsContent key={ev.id} value={ev.id} className="mt-4">
            <EvidenceCard
              caseId={caseId}
              sensitivityLevel={sensitivityLevel}
              evidence={ev}
              exhibitNumber={i + 1}
              derivedFromLabel={
                sourceIndex >= 0 && ev.derivedAtTimestampSeconds != null
                  ? `Exhibit ${sourceIndex + 1} at ${Math.floor(ev.derivedAtTimestampSeconds / 60)}:${Math.floor(ev.derivedAtTimestampSeconds % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : null
              }
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
