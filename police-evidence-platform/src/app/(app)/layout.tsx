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
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar session={{ name: session.name, role: session.role }} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
