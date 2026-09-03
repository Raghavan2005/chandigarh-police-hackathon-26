"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AcknowledgeAlertButton({ alertId }: { alertId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    const response = await fetch(`/api/alerts/${alertId}/acknowledge`, { method: "POST" }).catch(() => null);
    setSubmitting(false);
    if (response?.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={submitting}
      className={cn(buttonVariants({ variant: "outline", size: "xs" }), "text-text-tertiary hover:text-text-primary")}
    >
      {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
      Acknowledge
    </button>
  );
}
