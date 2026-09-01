import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";
import { AlertTriangle, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; className: string; icon: React.ElementType }
> = {
  AUTHENTIC: {
    label: "Authentic",
    className: "text-status-safe bg-status-safe-bg border-status-safe/30",
    icon: CheckCircle2,
  },
  MANIPULATED: {
    label: "Manipulated",
    className: "text-status-critical bg-status-critical-bg border-status-critical/30",
    icon: AlertTriangle,
  },
  AI_GENERATED: {
    label: "AI-Generated",
    className: "text-status-critical bg-status-critical-bg border-status-critical/30",
    icon: Sparkles,
  },
  INCONCLUSIVE: {
    label: "Inconclusive",
    className:
      "text-status-inconclusive bg-status-inconclusive-bg border-status-inconclusive/30",
    icon: HelpCircle,
  },
};

export function VerdictBadge({
  verdict,
  size = "md",
  className,
}: {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const cfg = VERDICT_CONFIG[verdict];
  const Icon = cfg.icon;
  const sizeCls =
    size === "lg"
      ? "text-sm px-3 py-1.5 gap-2"
      : size === "sm"
        ? "text-[11px] px-2 py-0.5 gap-1"
        : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium uppercase tracking-wide",
        cfg.className,
        sizeCls,
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} />
      {cfg.label}
    </span>
  );
}

export function verdictDotClass(verdict: Verdict) {
  switch (verdict) {
    case "AUTHENTIC":
      return "bg-status-safe";
    case "MANIPULATED":
    case "AI_GENERATED":
      return "bg-status-critical";
    case "INCONCLUSIVE":
      return "bg-status-inconclusive";
    default:
      return "bg-status-neutral";
  }
}
