import { ShieldX } from "lucide-react";
import { getSession } from "@/lib/session";
import { listRealCases } from "@/lib/cases-server";
import { NewInvestigationForm } from "@/components/investigation/new-investigation-form";

/**
 * Admin-only, same pattern as /audit/page.tsx's role check — creating an
 * investigation is a deliberate cross-case assertion, not a routine
 * investigator action (Docs/Plan for the feature, §6).
 */
export default async function NewInvestigationPage() {
  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects unauthenticated users before this renders.

  if (session.role !== "admin") {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface p-10 text-center">
          <ShieldX className="size-8 text-status-critical" />
          <h1 className="text-lg font-semibold text-text-primary">Admin access required</h1>
          <p className="max-w-sm text-sm text-text-tertiary">
            Linking cases into an investigation is restricted to admin accounts. Your role is{" "}
            <span className="font-mono text-text-secondary">{session.role}</span>.
          </p>
        </div>
      </div>
    );
  }

  const cases = await listRealCases();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">New Investigation</h1>
        <p className="text-sm text-text-tertiary">
          Link two or more cases believed connected to the same actor or campaign. The justification you give is
          recorded on each link, not just this page.
        </p>
      </div>
      <NewInvestigationForm cases={cases.map((c) => ({ id: c.id, title: c.title }))} />
    </div>
  );
}
