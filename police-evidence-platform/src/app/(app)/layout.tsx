import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSession } from "@/lib/session";

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

  return (
    <div className="flex h-screen w-full overflow-hidden print:block print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <div className="print:hidden">
          <Topbar session={{ name: session.name, role: session.role }} />
        </div>
        {/* The Puppeteer PDF export (report.pdf) navigates to the actual
            app page and prints it, so the app shell (sidebar/topbar) must
            be hidden in print media — otherwise it leaks into the exported
            PDF, which a real render caught and window.print() alone never
            surfaced since nobody had verified an actual printed/exported
            output before. */}
        <main className="flex-1 overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
