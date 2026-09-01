"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  Bell,
  FileBarChart,
  ScrollText,
  Settings,
  ShieldAlert,
} from "lucide-react";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    isActive: (p: string) => p === "/",
  },
  {
    href: "/cases",
    label: "Cases",
    icon: FolderKanban,
    isActive: (p: string) => p === "/cases" || p === "/cases/new",
  },
  {
    // No dedicated multi-case reports index yet — a report is per-case, so
    // this points at the case list (each case's own page links to its
    // report) rather than hardcoding one specific case's report the way
    // this used to point at the old mock demo case regardless of what real
    // cases actually exist.
    href: "/cases",
    label: "Reports",
    icon: FileBarChart,
    isActive: (p: string) => p.includes("/report"),
  },
  { href: "/cases", label: "Evidence Vault", icon: ShieldCheck, disabled: true },
  { href: "/", label: "Investigations", icon: ShieldAlert, disabled: true },
  { href: "/", label: "Alerts", icon: Bell, disabled: true },
  { href: "/audit", label: "Audit Log", icon: ScrollText, disabled: true },
  { href: "/", label: "Settings", icon: Settings, disabled: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-border-subtle px-4">
        <Image
          src="/Chandigarh_Police_Logo.png"
          alt="Chandigarh Police"
          width={36}
          height={36}
          className="shrink-0"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-text-primary">Pramana</p>
          <p className="text-[10px] text-text-tertiary">Chandigarh Police — Forensic Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map((item) => {
          const Icon = item.icon;

          if (!("isActive" in item)) {
            return (
              <div
                key={item.label}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md border-l-2 border-transparent px-2.5 py-2 text-sm text-text-disabled"
              >
                <Icon className="size-4" />
                {item.label}
                <span className="ml-auto rounded-sm bg-surface-raised px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-tertiary">
                  Soon
                </span>
              </div>
            );
          }

          const active = item.isActive(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary",
                active &&
                  "border-accent-primary bg-accent-dim text-text-primary",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
