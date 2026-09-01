import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Case Details", "Upload Evidence", "Review & Submit"];

export function StepperHeader({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "active" : "pending";
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                  state === "done" &&
                    "border-accent-primary bg-accent-primary text-white",
                  state === "active" &&
                    "border-accent-primary text-accent-primary",
                  state === "pending" &&
                    "border-border-subtle text-text-tertiary",
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  state === "pending" ? "text-text-tertiary" : "text-text-primary",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1",
                  state === "done" ? "bg-accent-primary" : "bg-border-subtle",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
