import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Replaces Next.js's bare default 404 (which otherwise renders unstyled,
 * with none of the sidebar/design-system chrome) for notFound() calls
 * inside the (app) group — e.g. a case ID that doesn't exist on
 * /cases/:id, /cases/:id/report, /cases/:id/propagation.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface p-10 text-center">
        <SearchX className="size-8 text-text-tertiary" />
        <h1 className="text-lg font-semibold text-text-primary">Not found</h1>
        <p className="max-w-sm text-sm text-text-tertiary">
          This case (or page) doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link href="/cases" className={buttonVariants({ size: "sm", className: "mt-2" })}>
          Back to cases
        </Link>
      </div>
    </div>
  );
}
