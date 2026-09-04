"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Eye, Globe, Globe2, Loader2, Lock, MapPin, TriangleAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface WebSearchResultLocation {
  lat: number;
  lon: number;
  label: string;
}

export interface OriginLocation {
  lat: number;
  lon: number;
  label: string;
  source: "exif" | "ip-geo";
}

export interface MergedWebSearchResultItem {
  title: string;
  url: string;
  domain: string;
  snippet: string | null;
  foundBy: string[];
  location: WebSearchResultLocation | null;
}

export interface CachedWebSearchResult {
  query: string;
  results: MergedWebSearchResultItem[];
  providersRun: string[];
  ranAt: string;
}

/**
 * Opt-in only — never auto-loads a third-party page into an iframe. A real
 * case surfaced why: a blocked embed doesn't reliably fail blank. Some
 * sites (this happened with a CloudFront-fronted one) serve a real "403 /
 * request blocked" error page that loads successfully as far as the
 * iframe is concerned — no error event fires, and it renders as a
 * confusing foreign error page that looks like this app broke, not like
 * the destination refused the embed. Making this a deliberate click plus
 * an explicit "external content" label means an investigator seeing that
 * page knows it came from the destination site, not from here. Keyed by
 * URL from the parent so switching preview targets resets back to the
 * opt-in state instead of carrying over "loaded" from the previous one.
 */
function LinkPreviewFrame({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-subtle bg-surface-sunken px-4 text-center">
        <Eye className="size-5 text-text-tertiary" />
        <p className="max-w-sm text-[11px] text-text-tertiary">
          Preview not loaded yet. Some sites block embedding entirely or show their own error/access-denied page
          instead of the real content — that page belongs to the destination site, not this app.
        </p>
        <button type="button" onClick={() => setLoaded(true)} className={buttonVariants({ variant: "outline", size: "xs" })}>
          <Eye className="size-3.5" />
          Load preview
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 rounded-t-md border border-b-0 border-status-warning/30 bg-status-warning-bg px-2 py-1 text-[10px] text-status-warning">
        <TriangleAlert className="size-3 shrink-0" />
        External content from the destination site, not this app — its own errors/blocks can appear here.
      </p>
      <iframe src={url} title={title} className="h-[300px] w-full rounded-b-md border border-border-subtle bg-white" sandbox="allow-scripts allow-same-origin" />
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/**
 * Real multi-engine web search over this exhibit's own extracted text
 * (transcript/document text/AI description) — Google via Gemini grounding
 * (official), Brave and DuckDuckGo (real HTML-endpoint results, no key,
 * but unofficial — could break if either changes their markup). Real
 * merge/dedup by URL, each result tagged with which engine(s) found it.
 * Plus a best-effort domain-server geolocation map (DNS -> geoip-lite,
 * same offline database already used for evidence-sighting IP
 * geolocation) — most results resolve to a CDN edge, not the publisher's
 * actual location, disclosed rather than implied precise.
 */
export function WebSearchPanel({
  caseId,
  evidenceId,
  cached,
  sensitivityLevel,
}: {
  caseId: string;
  evidenceId: string;
  cached: CachedWebSearchResult | null;
  sensitivityLevel: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(cached?.query ?? "");
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [result, setResult] = useState<CachedWebSearchResult | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewResult, setPreviewResult] = useState<MergedWebSearchResultItem | null>(null);

  if (sensitivityLevel !== "standard") {
    return (
      <p className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-[11px] text-status-warning">
        <Lock className="size-3.5 shrink-0" />
        This evidence is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"} — web search is blocked
        to avoid sending its extracted text to external services.
      </p>
    );
  }

  async function handleSearch() {
    setStatus("running");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/web-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query.trim() ? { query: query.trim() } : {}),
    }).catch(() => null);

    if (!response) {
      setStatus("error");
      setErrorMessage("Could not reach the server — check your connection and try again.");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Web search failed.");
      return;
    }
    const data: CachedWebSearchResult = await response.json();
    setResult(data);
    setQuery(data.query);
    setStatus("idle");
    // The combined map at the top of this tab (combined-source-map.tsx) is
    // server-rendered from this same evidence row — without a refresh it
    // would keep showing stale (or no) markers for this exhibit until some
    // other action happened to trigger one.
    router.refresh();
  }

  const located = result ? result.results.filter((r) => r.location) : [];

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <p className="font-medium text-text-secondary">Web search (multi-engine)</p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Auto-fills from captions/AI description/reverse-image labels — edit before searching if you like"
          className="min-w-[220px] flex-1 rounded-md border border-border-subtle bg-surface px-2 py-1 text-text-primary outline-none focus:border-border-strong"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={status === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
        >
          {status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
          {status === "running" ? "Searching…" : result ? "Search again" : "Search the web"}
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      {!result && status !== "running" && (
        <p className="text-text-tertiary">
          No prior search yet — the box above auto-fills from this exhibit&apos;s captions/AI description/
          reverse-image-search labels (whichever exist) on first click. Run &ldquo;Investigate&rdquo; above to
          generate those automatically, or type your own query.
        </p>
      )}

      {result && (
        <>
          <p className="text-[10px] text-text-tertiary">
            Searched &ldquo;{result.query}&rdquo; via {result.providersRun.join(", ") || "no configured providers"} —{" "}
            {result.results.length} unique result{result.results.length === 1 ? "" : "s"}, as of{" "}
            {formatRelativeTime(result.ranAt)} ({new Date(result.ranAt).toLocaleString()}).
          </p>

          {located.length > 0 && (
            <p className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
              <Globe2 className="size-3 text-accent-primary" />
              {located.length} of {result.results.length} result{result.results.length === 1 ? "" : "s"} resolved to
              an approximate server location — plotted on the shared globe above, alongside every other exhibit.
            </p>
          )}
          {result.results.length > 0 && located.length === 0 && (
            <p className="text-[10px] text-text-tertiary">
              None of these {result.results.length} results&apos; domains resolved to a geolocatable server —
              nothing to show on a map, not an error.
            </p>
          )}

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {result.results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewResult(r)}
                className="flex flex-col items-start gap-1 rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-2 text-left transition-colors hover:border-border-strong hover:bg-surface"
              >
                <span className="line-clamp-2 w-full text-[11px] font-medium text-text-primary">{r.title}</span>
                <span className="w-full truncate text-[10px] text-text-tertiary">{r.domain}</span>
                <span className="flex flex-wrap gap-1">
                  {r.foundBy.map((label) => (
                    <span key={label} className="rounded-full border border-border-subtle px-1.5 py-0.5 text-[9px] text-text-tertiary">
                      {label}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <Dialog open={previewResult !== null} onOpenChange={(open) => !open && setPreviewResult(null)}>
        <DialogContent className="sm:max-w-2xl">
          {previewResult && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{previewResult.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2">
                  <span>{previewResult.domain}</span>
                  {previewResult.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {previewResult.location.label} (approx. server location)
                    </span>
                  )}
                  {previewResult.foundBy.map((label) => (
                    <span key={label} className="rounded-full border border-border-subtle px-1.5 py-0.5 text-[9px] text-text-tertiary">
                      {label}
                    </span>
                  ))}
                </DialogDescription>
              </DialogHeader>

              {previewResult.snippet && <p className="text-xs text-text-secondary">{previewResult.snippet}</p>}

              <LinkPreviewFrame key={previewResult.url} url={previewResult.url} title={previewResult.title} />

              <DialogFooter>
                <a
                  href={previewResult.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <ExternalLink className="size-3.5" />
                  Open original page
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
