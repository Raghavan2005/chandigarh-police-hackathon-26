import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustodyRollupEntry } from "@/lib/vault-server";

/**
 * Evidence Vault Phase D (Docs/Plan for the feature) — one merged,
 * chronological custody timeline spanning this exhibit and every exhibit
 * in another case that matched it (sha256/near-duplicate). Vault-only:
 * the per-case Evidence tab intentionally still shows just its own
 * exhibit's custody trail, since that's the relevant scope from inside a
 * single investigation.
 */
export function CrossCaseCustodyRollup({
  entries,
  matchedExhibitCount,
}: {
  entries: CustodyRollupEntry[];
  matchedExhibitCount: number;
}) {
  return (
    <Card className="border-border-subtle bg-surface shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          <GitBranch className="size-4" />
          Cross-case chain of custody
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matchedExhibitCount === 0 ? (
          <p className="text-sm text-text-tertiary">
            No matching exhibit found in another case — only this exhibit&apos;s own custody history would ever
            appear here.
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            {matchedExhibitCount} matching exhibit{matchedExhibitCount === 1 ? "" : "s"} found in other cases, but
            no custody transfer has been recorded for this exhibit or any of them yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-text-tertiary">
              {entries.length} custody event{entries.length === 1 ? "" : "s"} across this exhibit and{" "}
              {matchedExhibitCount} matching exhibit{matchedExhibitCount === 1 ? "" : "s"} in other cases.
            </p>
            {entries.map((e) => (
              <div key={e.id} className="border-t border-border-subtle pt-2 text-xs text-text-tertiary">
                <span className="font-medium text-text-secondary">
                  {e.fromPerson} &rarr; {e.toPerson}
                </span>{" "}
                ({e.purpose}){e.location ? ` — ${e.location}` : ""} — logged by {e.recordedByName} (
                {new Date(e.occurredAt).toLocaleString()})
                {e.witness1Name && `; witness: ${e.witness1Name}`}
                {e.witness2Name && `, ${e.witness2Name}`}
                <div className="mt-0.5">
                  {e.isSourceExhibit ? (
                    <span className="text-text-tertiary">This exhibit</span>
                  ) : (
                    <Link href={`/cases/${e.caseId}`} className="text-accent-primary hover:underline">
                      Matched exhibit in case {e.caseId} — {e.caseTitle}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
