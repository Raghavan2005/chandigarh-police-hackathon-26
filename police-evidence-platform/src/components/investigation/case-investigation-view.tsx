"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvidenceViewer } from "@/components/investigation/evidence-viewer";
import { FaceMatchPanel } from "@/components/investigation/face-match-panel";
import { PipelinePanel } from "@/components/investigation/pipeline-panel";
import { VerdictPanel } from "@/components/investigation/verdict-panel";
import { CaseMetaPanel } from "@/components/investigation/case-meta-panel";
import { FusionPanel } from "@/components/investigation/fusion-panel";
import { usePipeline } from "@/lib/use-pipeline";
import { pipelineSteps, faceMatches, faceMatchesByCase, fusionSignals, fusionSignalsByCase } from "@/lib/mock-data";
import type { CaseSummary } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { FileDown, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export function CaseInvestigationView({ caseData }: { caseData: CaseSummary }) {
  const pipeline = usePipeline(true);
  const manipulationDone =
    pipeline.states[pipelineSteps.findIndex((s) => s.id === "manipulation")] ===
    "done";
  const osintState =
    pipeline.states[pipelineSteps.findIndex((s) => s.id === "osint")];
  const osintScanning = osintState === "running";
  const osintDone = osintState === "done";
  const showFaceMatch =
    caseData.evidenceKind === "video" || caseData.evidenceKind === "image";
  const faceSource = caseData.thumbnail;
  const matches = faceMatchesByCase[caseData.id] ?? faceMatches;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-text-tertiary">{caseData.id}</p>
          <h1 className="text-xl font-semibold text-text-primary">{caseData.title}</h1>
          {caseData.summary && (
            <p className="mt-1 max-w-2xl text-sm text-text-tertiary">{caseData.summary}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cases/${caseData.id}/propagation`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <GitBranch className="size-4" />
            Propagation graph
          </Link>
          <Link
            href={`/cases/${caseData.id}/report`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <FileDown className="size-4" />
            Report
          </Link>
        </div>
      </div>

      <Tabs defaultValue="investigation">
        <TabsList variant="line" className="border-b border-border-subtle">
          <TabsTrigger value="investigation">Investigation</TabsTrigger>
          <TabsTrigger value="fusion">Evidence Fusion</TabsTrigger>
        </TabsList>

        <TabsContent value="investigation" className="mt-4">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr_280px]">
            <div className="flex min-w-0 flex-col gap-5">
              <EvidenceViewer caseData={caseData} heatmapReady={manipulationDone} />
              {showFaceMatch && (
                <FaceMatchPanel
                  faceSource={faceSource}
                  matches={matches}
                  scanning={osintScanning}
                  done={osintDone}
                />
              )}
            </div>

            <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-4">
              <PipelinePanel
                caseData={caseData}
                states={pipeline.states}
                activeIndex={pipeline.activeIndex}
                running={pipeline.running}
                onRestart={pipeline.restart}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <VerdictPanel caseData={caseData} ready={pipeline.complete} />
              <CaseMetaPanel caseData={caseData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fusion" className="mt-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-5">
            <FusionPanel
              signals={fusionSignalsByCase[caseData.id] ?? fusionSignals}
              verdict={caseData.verdict}
              confidence={caseData.confidence}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
