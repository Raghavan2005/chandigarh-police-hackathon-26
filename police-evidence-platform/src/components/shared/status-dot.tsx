import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  critical: "bg-status-critical",
  warning: "bg-status-warning",
  safe: "bg-status-safe",
  inconclusive: "bg-status-inconclusive",
  neutral: "bg-status-neutral",
} as const;

export function StatusDot({
  status,
  className,
}: {
  status: keyof typeof STATUS_CLASS;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block size-2 rounded-full", STATUS_CLASS[status], className)}
    />
  );
}
