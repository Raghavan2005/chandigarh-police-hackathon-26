"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const STORAGE_KEY = "pramana:sidebar-visible";

// Sidebar visibility lives here, one level above both Sidebar and Topbar,
// because Topbar needs a way to bring the sidebar back once it's hidden —
// they're siblings, not parent/child, so the toggle state can't live in
// either one alone. Persisted to localStorage so a hidden sidebar stays
// hidden across reloads; deliberately no SSR-safe cookie plumbing for this
// since a one-frame flash back to "visible" on first paint is an acceptable
// tradeoff for a hackathon-scope preference toggle.
export function AppShell({
  session,
  unacknowledgedAlertCount,
  children,
}: {
  session: { name: string; role: string };
  unacknowledgedAlertCount: number;
  children: React.ReactNode;
}) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setSidebarVisible(stored === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, sidebarVisible ? "1" : "0");
  }, [sidebarVisible, hydrated]);

  return (
    <div className="flex h-screen w-full overflow-hidden print:block print:h-auto print:overflow-visible">
      {sidebarVisible && <Sidebar onHide={() => setSidebarVisible(false)} />}
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Topbar
          session={session}
          unacknowledgedAlertCount={unacknowledgedAlertCount}
          sidebarHidden={!sidebarVisible}
          onShowSidebar={() => setSidebarVisible(true)}
        />
        <main className="flex-1 overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
