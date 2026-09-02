"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, SearchCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CachedReverseImageSearchResult } from "@/lib/reverse-image-search";

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
 * Real reverse-image search (Cloud Vision Web Detection) — was an honest
 * "not available in this build, no live search API wired in" placeholder
 * until real GCP credentials existed. The result is cached server-side
 * (`ReverseImageSearchResult`, direct user request — reopening a case
 * shouldn't force a fresh, billed external lookup every time) and passed
 * in as `cached`, so this renders the last real result immediately without
 * requiring a click. Every render still shows exactly when that lookup
 * actually ran, and "Re-run" always does a genuine fresh call — a cached
 * result is presented honestly as "as of <time>," never implied to be
 * freshly re-checked on every page load.
 */
export function ReverseImageSearchPanel({
  caseId,
  evidenceId,
  cached,
}: {
  caseId: string;
  evidenceId: string;
  cached: CachedReverseImageSearchResult | null;
}) {
  const [status, setStatus] = useState<"idle" | "searching" | "done" | "not-configured" | "error">(
    cached ? "done" : "idle",
  );
  const [result, setResult] = useState<CachedReverseImageSearchResult | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSearch() {
    setStatus("searching");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reverse-image-search`, {
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setStatus("error");
      setErrorMessage("Could not reach the server — check your connection and try again.");
      return;
    }
    if (response.status === 501) {
      setStatus("not-configured");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Reverse-image search failed.");
      return;
    }

    const data: CachedReverseImageSearchResult = await response.json();
    setResult(data);
    setStatus("done");
  }

  // No result at all yet (never run, or the first run isn't back) — the
  // simple full-width states. Once a result exists (even stale, from a
  // previous run), it stays on screen through a re-run/error/not-configured
  // transition instead of being replaced by these — see below.
  if (!result) {
    if (status === "not-configured") {
      return (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-2 text-[11px] text-text-tertiary">
          Reverse-image search isn&apos;t configured on this deployment (no GCP credentials set) — a real live-search
          capability, not built by default since it requires a billed external service, unlike the rest of this
          platform.
        </p>
      );
    }
    if (status === "error") {
      return (
        <div className="flex flex-col gap-1.5">
          <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-xs text-status-critical">
            <AlertTriangle className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
          <button type="button" onClick={handleSearch} className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}>
            Retry
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={handleSearch}
        disabled={status === "searching"}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
      >
        {status === "searching" ? <Loader2 className="size-3.5 animate-spin" /> : <SearchCheck className="size-3.5" />}
        {status === "searching" ? "Searching the web for this image…" : "Run reverse-image search"}
      </button>
    );
  }

  const hasAnyMatch =
    result && (result.fullMatches.length > 0 || result.partialMatches.length > 0 || result.pagesWithMatches.length > 0);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-text-secondary">Reverse-image search (Cloud Vision Web Detection)</p>
          {result?.ranAt && (
            <p className="text-[10px] text-text-tertiary">
              Results as of {formatRelativeTime(result.ranAt)} ({new Date(result.ranAt).toLocaleString()}) — not
              re-checked automatically.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={status === "searching"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
        >
          {status === "searching" && <Loader2 className="size-3 animate-spin" />}
          Re-run
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          Re-run failed: {errorMessage} (showing the last successful result below.)
        </p>
      )}
      {status === "not-configured" && (
        <p className="rounded-md border border-dashed border-border-subtle px-2.5 py-1.5 text-text-tertiary">
          Re-run unavailable — credentials were removed since the cached result below was fetched.
        </p>
      )}

      {result && result.labels.length > 0 && (
        <div className="rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-1.5">
          <p className="mb-1 text-[11px] font-medium text-text-tertiary">What the model sees in this image</p>
          <div className="flex flex-wrap gap-1">
            {result.labels.map((l, i) => (
              <span
                key={i}
                className="rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[10px] text-text-secondary"
                title={`${Math.round(l.score * 100)}% confidence`}
              >
                {l.description} <span className="text-text-tertiary">{Math.round(l.score * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!hasAnyMatch && (
        <p className="text-text-tertiary">No exact or visually-similar matches found in Google&apos;s index.</p>
      )}

      {result && result.fullMatches.length > 0 && (
        <ResultGroup
          title={`Exact matches found online (${result.fullMatches.length})`}
          urls={result.fullMatches}
          caseId={caseId}
          evidenceId={evidenceId}
        />
      )}
      {result && result.partialMatches.length > 0 && (
        <ResultGroup
          title={`Visually similar images (${result.partialMatches.length})`}
          urls={result.partialMatches}
          caseId={caseId}
          evidenceId={evidenceId}
        />
      )}
      {result && result.pagesWithMatches.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-medium text-text-tertiary">
            Pages referencing this image ({result.pagesWithMatches.length})
          </p>
          <ul className="flex flex-col gap-1">
            {result.pagesWithMatches.slice(0, 8).map((p, i) => (
              <li key={i}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 truncate text-accent-primary hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  {p.pageTitle || p.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result && result.webEntities.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-medium text-text-tertiary">What Google&apos;s index associates with this image</p>
          <div className="flex flex-wrap gap-1">
            {result.webEntities.slice(0, 8).map((e, i) => (
              <span key={i} className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] text-text-secondary">
                {e.description}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `fullMatches`/`partialMatches` are already direct image URLs (that's
 * literally what Vision API's Web Detection returns for these two fields,
 * unlike `pagesWithMatches`, which points at a web page, not an image) —
 * real thumbnails, not a second API call or a guess. Some hosts block
 * hotlinking, so each thumbnail falls back to fetching through our own
 * server (which doesn't trigger the same referrer/CORS checks a direct
 * browser request does), and only shows a plain link if even that fails.
 */
function ResultGroup({
  title,
  urls,
  caseId,
  evidenceId,
}: {
  title: string;
  urls: string[];
  caseId: string;
  evidenceId: string;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-text-tertiary">{title}</p>
      <div className="flex flex-wrap gap-2">
        {urls.slice(0, 12).map((url, i) => (
          <ImageResultThumbnail key={i} url={url} caseId={caseId} evidenceId={evidenceId} />
        ))}
      </div>
    </div>
  );
}

function ImageResultThumbnail({ url, caseId, evidenceId }: { url: string; caseId: string; evidenceId: string }) {
  // "direct" -> real hotlink to the source; on failure, "proxied" -> real
  // server-side fetch (see the proxy route); on failure, "broken" -> plain
  // link. Two independent real attempts, not a single guess.
  const [stage, setStage] = useState<"direct" | "proxied" | "broken">("direct");
  const proxyUrl = `/api/cases/${caseId}/evidence/${evidenceId}/reverse-image-search/proxy?url=${encodeURIComponent(url)}`;

  if (stage === "broken") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        title={url}
        className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-subtle bg-surface-sunken p-1 text-center text-[9px] text-text-tertiary hover:border-border-strong"
      >
        <ExternalLink className="size-3.5 shrink-0" />
        Preview blocked
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      title={url}
      className="block size-20 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-surface-sunken hover:border-border-strong"
    >
      {/* Real external URL from Vision API's own response (or our own
          server-side proxy of it) — not a static/local asset next/image
          can address. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stage === "direct" ? url : proxyUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-full object-cover"
        onError={() => setStage((s) => (s === "direct" ? "proxied" : "broken"))}
      />
    </a>
  );
}
