import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getInvestigation, getInvestigationTimeline } from "@/lib/investigations-server";
import { listRealCases } from "@/lib/cases-server";
import { LinkCaseDialog } from "@/components/investigation/link-case-dialog";
import { UnlinkCaseDialog } from "@/components/investigation/unlink-case-dialog";
import { AddActorDialog } from "@/components/investigation/add-actor-dialog";
import { RemoveActorDialog } from "@/components/investigation/remove-actor-dialog";
import { InvestigationTimeline } from "@/components/investigation/investigation-timeline";

export default async function InvestigationDetailPage(props: {
  params: Promise<{ investigationId: string }>;
}) {
  const { investigationId } = await props.params;

  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects unauthenticated users before this renders.

  const investigation = await getInvestigation(investigationId);
  if (!investigation) notFound();
  const timeline = await getInvestigationTimeline(investigationId);

  const isAdmin = session.role === "admin";
  const activeLinks = investigation.cases.filter((c) => !c.unlinkedAt);
  const removedLinks = investigation.cases.filter((c) => c.unlinkedAt);
  const activeActors = investigation.actors.filter((a) => !a.removedAt);
  const removedActors = investigation.actors.filter((a) => a.removedAt);

  const allCases = isAdmin ? await listRealCases() : [];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div>
        <p className="font-mono text-xs text-text-tertiary">{investigation.id}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{investigation.title}</h1>
            {investigation.summary && <p className="mt-1 max-w-2xl text-sm text-text-tertiary">{investigation.summary}</p>}
            <p className="mt-1 text-xs text-text-tertiary">
              Created by {investigation.createdBy.name} — {investigation.createdAt.toLocaleString()}
            </p>
          </div>
          {isAdmin && (
            <LinkCaseDialog
              investigationId={investigation.id}
              cases={allCases.map((c) => ({ id: c.id, title: c.title }))}
              linkedCaseIds={activeLinks.map((l) => l.caseId)}
            />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Linked cases ({activeLinks.length})
        </p>
        {activeLinks.length === 0 ? (
          <p className="text-sm text-text-tertiary">No actively linked cases.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeLinks.map((link) => (
              <div key={link.id} className="flex items-start justify-between gap-3 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
                <div>
                  <Link href={`/cases/${link.case.id}`} className="hover:underline">
                    <span className="font-mono text-xs text-text-tertiary">{link.case.id}</span>{" "}
                    <span className="text-sm text-text-primary">{link.case.title}</span>
                  </Link>
                  <p className="mt-0.5 text-xs text-text-tertiary">FIR {link.case.firNumber}</p>
                  <p className="mt-1 text-xs text-text-secondary">{link.justification}</p>
                  <p className="mt-0.5 text-[11px] text-text-tertiary">
                    Linked by {link.linkedBy.name} — {link.linkedAt.toLocaleString()}
                  </p>
                </div>
                {isAdmin && <UnlinkCaseDialog investigationId={investigation.id} caseId={link.caseId} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {removedLinks.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-surface p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Previously linked ({removedLinks.length})
          </p>
          <div className="flex flex-col gap-3">
            {removedLinks.map((link) => (
              <div key={link.id} className="border-t border-border-subtle pt-3 text-xs text-text-tertiary first:border-t-0 first:pt-0">
                <span className="font-mono">{link.case.id}</span> — {link.case.title}
                <p className="mt-0.5">
                  Linked by {link.linkedBy.name} ({link.linkedAt.toLocaleString()}): {link.justification}
                </p>
                <p className="mt-0.5">
                  Unlinked by {link.unlinkedBy?.name ?? "—"} ({link.unlinkedAt?.toLocaleString()}): {link.unlinkReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Suspected actors ({activeActors.length})
          </p>
          <AddActorDialog investigationId={investigation.id} />
        </div>
        <p className="mb-3 text-xs text-text-tertiary">
          Working leads, not verified identities — each entry records who suspected the handle and why.
        </p>
        {activeActors.length === 0 ? (
          <p className="text-sm text-text-tertiary">No suspected actors tagged yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeActors.map((actor) => (
              <div key={actor.id} className="flex items-start justify-between gap-3 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="text-text-tertiary">{actor.platform}</span> — {actor.handle}
                  </p>
                  {actor.note && <p className="mt-0.5 text-xs text-text-secondary">{actor.note}</p>}
                  <p className="mt-0.5 text-[11px] text-text-tertiary">
                    Added by {actor.addedBy.name} — {actor.addedAt.toLocaleString()}
                  </p>
                </div>
                <RemoveActorDialog investigationId={investigation.id} actorId={actor.id} />
              </div>
            ))}
          </div>
        )}
        {removedActors.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Previously suspected ({removedActors.length})
            </p>
            {removedActors.map((actor) => (
              <p key={actor.id} className="text-xs text-text-tertiary">
                <span className="font-medium">{actor.platform}</span> — {actor.handle}: removed by{" "}
                {actor.removedBy?.name ?? "—"} ({actor.removedAt?.toLocaleString()}): {actor.removeReason}
              </p>
            ))}
          </div>
        )}
      </div>

      <InvestigationTimeline entries={timeline} />
    </div>
  );
}
