import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EvidenceThumbnail } from "@/components/shared/evidence-thumbnail";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { caseList } from "@/lib/mock-data";

export function RecentAlertsTable() {
  if (!caseList || caseList.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border-subtle hover:bg-transparent">
          <TableHead className="text-text-tertiary">Case</TableHead>
          <TableHead className="text-text-tertiary">Verdict</TableHead>
          <TableHead className="text-text-tertiary">Confidence</TableHead>
          <TableHead className="text-text-tertiary">Investigator</TableHead>
          <TableHead className="text-right text-text-tertiary">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {caseList.map((c) => (
          <TableRow key={c.id} className="border-border-subtle">
            <TableCell>
              <Link
                href={`/cases/${c.id}`}
                className="flex items-center gap-3 hover:underline"
              >
                <EvidenceThumbnail
                  src={c.thumbnail}
                  kind={c.evidenceKind}
                  verdict={c.verdict}
                  size={32}
                />
                <span className="flex flex-col">
                  <span className="font-mono text-xs text-text-tertiary">{c.id}</span>
                  <span className="text-sm text-text-primary">{c.title}</span>
                </span>
              </Link>
            </TableCell>
            <TableCell>
              <VerdictBadge verdict={c.verdict} size="sm" />
            </TableCell>
            <TableCell className="font-mono text-sm text-text-secondary tabular-nums">
              {c.confidence}%
            </TableCell>
            <TableCell className="text-sm text-text-secondary">{c.investigator}</TableCell>
            <TableCell className="text-right text-xs text-text-tertiary">
              {c.updatedRelative}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
