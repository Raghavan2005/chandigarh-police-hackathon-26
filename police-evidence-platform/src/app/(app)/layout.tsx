import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSession } from "@/lib/session";
import { getUnacknowledgedAlertCount } from "@/lib/alerts-server";

// Server-side check here is the authoritative one — middleware.ts only does
// a cheap cookie-presence redirect for UX (it can't touch the DB from the
// Edge runtime). This is the actual gate: no case data renders without a
// verified session. PS4_MVP_BUILD_PLAN.md §2 — "no unauthenticated path to
// any case data."
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const unacknowledgedAlertCount = await getUnacknowledgedAlertCount(session.userId, session.role);

  return (
    <div className="flex h-screen w-full overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* print:hidden lives directly on Sidebar's/Topbar's own root element
          (not a wrapper div around them) — a wrapper div here breaks the
          flex height-stretch chain from this container down to <aside>,
          since the wrapper itself isn't a flex container. That regression
          shipped with the original print-leak fix and only showed up on
          taller viewports (short/typical browser windows happened to hide
          it): the sidebar rendered only as tall as its own nav content
          instead of the full screen height, leaving a visible gap below it.
          The Puppeteer PDF export (report.pdf) navigates to the actual app
          page and prints it, so the app shell still has to be hidden in
          print media — otherwise it leaks into the exported PDF, which a
          real render originally caught and window.print() alone never
          surfaced since nobody had verified an actual printed/exported
          output before. */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Topbar session={{ name: session.name, role: session.role }} unacknowledgedAlertCount={unacknowledgedAlertCount} />
        <main className="flex-1 overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
