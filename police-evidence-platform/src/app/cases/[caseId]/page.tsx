import { notFound } from "next/navigation";
import { caseById } from "@/lib/mock-data";
import { CaseInvestigationView } from "@/components/investigation/case-investigation-view";

export default async function CasePage(props: PageProps<"/cases/[caseId]">) {
  const { caseId } = await props.params;
  const caseData = caseById(caseId);

  if (!caseData) notFound();

  return <CaseInvestigationView caseData={caseData} />;
}
