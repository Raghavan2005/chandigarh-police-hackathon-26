"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong";

export function NewInvestigationForm({ cases }: { cases: { id: string; title: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [justification, setJustification] = useState("");
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleCase(caseId: string) {
    setSelectedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId],
    );
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Title is required.");
      return;
    }
    if (selectedCaseIds.length === 0) {
      setStatus("error");
      setErrorMessage("Select at least one case to link.");
      return;
    }
    if (!justification.trim()) {
      setStatus("error");
      setErrorMessage("A justification for linking these cases is required.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch("/api/investigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        summary: summary.trim() || undefined,
        initialCaseIds: selectedCaseIds,
        justification: justification.trim(),
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not create the investigation — check your connection and try again.");
      return;
    }

    const created = await response.json();
    router.push(`/investigations/${created.id}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-title" className="text-text-secondary">
          Title
        </Label>
        <Input id="inv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. @InsiderWB fabricated-quote campaign" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-summary" className="text-text-secondary">
          Summary <span className="font-normal text-text-tertiary">(optional)</span>
        </Label>
        <textarea
          id="inv-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="What ties these cases together?"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-text-secondary">Cases to link</Label>
        {cases.length === 0 ? (
          <p className="text-xs text-text-tertiary">No cases exist yet — create at least two cases first.</p>
        ) : (
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-border-subtle p-2">
            {cases.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-surface-raised">
                <input
                  type="checkbox"
                  checked={selectedCaseIds.includes(c.id)}
                  onChange={() => toggleCase(c.id)}
                  className="size-4 rounded border-border-subtle"
                />
                <span className="font-mono text-xs text-text-tertiary">{c.id}</span>
                <span className="text-text-primary">{c.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-justification" className="text-text-secondary">
          Justification
        </Label>
        <textarea
          id="inv-justification"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={3}
          placeholder="Why are these cases believed connected? (e.g. same account/handle, same fabrication pattern)"
          className={TEXTAREA_CLASS}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={status === "submitting"}
        className="w-fit bg-accent-primary text-white hover:bg-accent-primary-hover"
      >
        {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Create investigation
      </Button>
    </div>
  );
}
