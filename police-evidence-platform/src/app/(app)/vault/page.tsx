import Link from "next/link";
import { EyeOff, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { cn } from "@/lib/utils";
import { listVaultEvidence } from "@/lib/vault-server";
import type { EvidenceKind, Verdict } from "@/lib/types";

const TYPE_OPTIONS: { value: EvidenceKind; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" },
];

const VERDICT_OPTIONS: { value: Verdict; label: string }[] = [
  { value: "AUTHENTIC", label: "Authentic" },
  { value: "MANIPULATED", label: "Manipulated" },
  { value: "AI_GENERATED", label: "AI-Generated" },
  { value: "INCONCLUSIVE", label: "Inconclusive" },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const FIELD_CLASS =
  "h-8 rounded-md border border-border-subtle bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-border-strong";

/**
 * Evidence Vault — cross-case, read-only exhibit index (the plan for this
 * feature: search by hash/case/verdict/type across every case, distinct
 * from the per-case Evidence tab). A plain GET form, no client JS: filters
 * live entirely in the URL's search params, so the page stays server-only.
 */
export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const type = firstParam(sp.type) as EvidenceKind | undefined;
  const verdict = firstParam(sp.verdict) as Verdict | undefined;
  const dateFrom = firstParam(sp.dateFrom);
  const dateTo = firstParam(sp.dateTo);
  const legalHoldOnly = firstParam(sp.legalHoldOnly) === "1";
  const expiringSoon = firstParam(sp.expiringSoon) === "1";
  const page = Number(firstParam(sp.page) ?? "1") || 1;

  const { items, total, pageSize } = await listVaultEvidence({
    q,
    type,
    verdict,
    dateFrom,
    dateTo,
    legalHoldOnly,
    expiringSoon,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = Boolean(q || type || verdict || dateFrom || dateTo || legalHoldOnly || expiringSoon);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (verdict) params.set("verdict", verdict);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (legalHoldOnly) params.set("legalHoldOnly", "1");
    if (expiringSoon) params.set("expiringSoon", "1");
    params.set("page", String(targetPage));
    return `/vault?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Evidence Vault</h1>
        <p className="text-sm text-text-tertiary">
          Every exhibit ever uploaded, across every case — search by case ID or SHA-256 hash. Read-only: edits
          (override, custody transfer, re-investigate, ...) still happen from the exhibit&apos;s own case page.
        </p>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs text-text-tertiary">
            Case ID or SHA-256
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="CHD-2026-00131 or a hash…"
            className={cn(FIELD_CLASS, "w-64")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-xs text-text-tertiary">
            Type
          </label>
          <select id="type" name="type" defaultValue={type ?? ""} className={FIELD_CLASS}>
            <option value="">Any</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="verdict" className="text-xs text-text-tertiary">
            Verdict
          </label>
          <select id="verdict" name="verdict" defaultValue={verdict ?? ""} className={FIELD_CLASS}>
            <option value="">Any</option>
            {VERDICT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dateFrom" className="text-xs text-text-tertiary">
            Uploaded from
          </label>
          <input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className={FIELD_CLASS} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dateTo" className="text-xs text-text-tertiary">
            Uploaded to
          </label>
          <input id="dateTo" name="dateTo" type="date" defaultValue={dateTo ?? ""} className={FIELD_CLASS} />
        </div>
        <label className="flex h-8 items-center gap-1.5 text-xs text-text-secondary">
          <input type="checkbox" name="legalHoldOnly" value="1" defaultChecked={legalHoldOnly} className="size-3.5" />
          Legal hold only
        </label>
        <label className="flex h-8 items-center gap-1.5 text-xs text-text-secondary">
          <input type="checkbox" name="expiringSoon" value="1" defaultChecked={expiringSoon} className="size-3.5" />
          Expiring &le;30d
        </label>
        <button
          type="submit"
          className="h-8 rounded-md bg-accent-primary px-3 text-sm font-medium text-white hover:bg-accent-primary-hover"
        >
          Search
        </button>
        {hasFilters && (
          <Link href="/vault" className="text-xs text-text-tertiary hover:text-text-primary hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            {total} exhibit{total === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-tertiary">
              No exhibits match these filters.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-text-tertiary">Exhibit</TableHead>
                    <TableHead className="text-text-tertiary">Case</TableHead>
                    <TableHead className="text-text-tertiary">Verdict</TableHead>
                    <TableHead className="text-text-tertiary">Uploaded by</TableHead>
                    <TableHead className="font-mono text-text-tertiary">SHA-256</TableHead>
                    <TableHead className="text-text-tertiary">Retention</TableHead>
                    <TableHead className="text-right text-text-tertiary">Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isImage = item.mimeType.startsWith("image/");
                    const isVideo = item.mimeType.startsWith("video/");
                    const isAudio = item.mimeType.startsWith("audio/");
                    const kind: EvidenceKind = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";
                    const Icon = KIND_ICON[kind];
                    const isSensitive = item.sensitivityLevel !== "standard";
                    return (
                      <TableRow key={item.id} className="border-border-subtle">
                        <TableCell>
                          <Link href={`/vault/${item.id}`} className="flex items-center gap-3 hover:underline">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-border-subtle bg-surface-sunken">
                              {isSensitive ? (
                                <EyeOff className="size-3.5 text-status-warning" />
                              ) : (
                                <Icon className="size-3.5 text-text-tertiary" />
                              )}
                            </div>
                            <span className="text-sm text-text-primary capitalize">{kind}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/cases/${item.caseId}`}
                            className="flex flex-col hover:underline"
                          >
                            <span className="font-mono text-xs text-text-tertiary">{item.caseId}</span>
                            <span className="text-sm text-text-secondary">{item.caseTitle}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          {item.verdict ? (
                            <VerdictBadge verdict={item.verdict} size="sm" />
                          ) : (
                            <span className="text-xs text-text-tertiary">Not analyzed</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">{item.uploadedByName}</TableCell>
                        <TableCell className="max-w-[180px] truncate font-mono text-xs text-text-tertiary" title={item.sha256}>
                          {item.sha256}
                        </TableCell>
                        <TableCell className="text-xs text-text-tertiary">
                          {item.legalHold ? (
                            <span className="inline-flex items-center gap-1 text-status-warning">
                              <Lock className="size-3" />
                              On hold
                            </span>
                          ) : item.retentionUntil ? (
                            new Date(item.retentionUntil).toLocaleDateString()
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-text-tertiary">
                          {item.uploadedAt.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link href={pageHref(page - 1)} className="hover:text-text-primary hover:underline">
                        Previous
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={pageHref(page + 1)} className="hover:text-text-primary hover:underline">
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
