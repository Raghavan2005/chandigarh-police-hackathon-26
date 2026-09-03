import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { listInvestigations } from "@/lib/investigations-server";

/**
 * Investigations — groups cases believed connected to the same real-world
 * actor/campaign (Docs/Plan for the feature). Creating one is admin-only
 * (same gate as the global audit log); every authenticated investigator
 * can still view the list, same flat-visibility precedent Cases and the
 * Evidence Vault already use.
 */
export default async function InvestigationsPage() {
  const session = await getSession();
  const investigations = await listInvestigations();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Investigations</h1>
          <p className="text-sm text-text-tertiary">
            Cases linked because they&apos;re believed connected to the same actor or campaign — each link
            records who asserted it and why.
          </p>
        </div>
        {session?.role === "admin" && (
          <Link
            href="/investigations/new"
            className={buttonVariants({ size: "sm", className: "bg-accent-primary text-white hover:bg-accent-primary-hover" })}
          >
            <Plus className="size-4" />
            New Investigation
          </Link>
        )}
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            {investigations.length} investigation{investigations.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {investigations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-text-secondary">No investigations yet.</p>
              <p className="text-xs text-text-tertiary">
                {session?.role === "admin"
                  ? "Link two or more cases believed connected to start one."
                  : "An admin can link cases believed connected to start one."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-text-tertiary">Investigation</TableHead>
                  <TableHead className="text-text-tertiary">Status</TableHead>
                  <TableHead className="text-text-tertiary">Linked cases</TableHead>
                  <TableHead className="text-text-tertiary">Created by</TableHead>
                  <TableHead className="text-right text-text-tertiary">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigations.map((inv) => (
                  <TableRow key={inv.id} className="border-border-subtle">
                    <TableCell>
                      <Link href={`/investigations/${inv.id}`} className="flex flex-col hover:underline">
                        <span className="font-mono text-xs text-text-tertiary">{inv.id}</span>
                        <span className="text-sm text-text-primary">{inv.title}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-status-neutral/30 bg-surface-sunken px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-text-secondary tabular-nums">
                      {inv.linkedCaseCount} case{inv.linkedCaseCount === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{inv.createdByName}</TableCell>
                    <TableCell className="text-right text-xs text-text-tertiary">
                      {inv.createdAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
