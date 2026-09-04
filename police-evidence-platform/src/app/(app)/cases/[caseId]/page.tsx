import { notFound } from "next/navigation";
import { caseById } from "@/lib/mock-data";
import { CaseInvestigationView } from "@/components/investigation/case-investigation-view";
import { RealCaseView } from "@/components/investigation/real-case-view";
import { getRealCase } from "@/lib/cases-server";
import { getRealCasePropagation } from "@/lib/propagation-server";

export default async function CasePage(props: PageProps<"/cases/[caseId]">) {
  const { caseId } = await props.params;

  // Real DB is checked first — a case created via /cases/new has no
  // fusion/pipeline data yet (Phase 2), so it renders through RealCaseView,
  // not the mock-fed investigation view. The curated demo cases
  // (CHD-2026-00124, CHD-2026-00131, etc.) only exist in mock-data.ts, so
  // they fall through to the existing mock path unchanged.
  const realCase = await getRealCase(caseId);
  if (realCase) {
    // Cross-case/corpus matches now render as a tab on this same page
    // (direct user request — a separate /propagation page meant losing
    // your place in the exhibit list every time). Fetched here rather
    // than lazily on tab switch since this is a Server Component and the
    // whole page is one request anyway; /cases/[id]/propagation itself
    // still exists unchanged for direct links.
    const propagation = await getRealCasePropagation(caseId);
    return <RealCaseView caseData={realCase} propagation={propagation} />;
  }

  const caseData = caseById(caseId);
  if (!caseData) notFound();

  return <CaseInvestigationView caseData={caseData} />;
}
