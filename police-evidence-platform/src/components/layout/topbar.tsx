"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Command, LogOut, Search, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ session }: { session: { name: string; role: string } }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-canvas px-4 md:px-6 print:hidden">
      <div className="flex md:hidden items-center gap-2">
        <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={28} height={28} />
      </div>

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary" />
        <input
          placeholder="Search case ID, evidence hash…"
          className="h-8 w-full rounded-md border border-border-subtle bg-surface pl-8 pr-12 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-strong"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-border-subtle bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">
          <Command className="size-2.5" /> K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-raised hover:text-text-primary">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-status-critical" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-raised">
            <span className="flex size-6 items-center justify-center rounded-full bg-accent-dim text-accent-primary">
              <UserRound className="size-3.5" />
            </span>
            <span className="hidden text-left text-xs leading-tight sm:block">
              <span className="block font-medium text-text-primary">{session.name}</span>
              <span className="block capitalize text-text-tertiary">{session.role}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{session.name}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={signingOut}
              onClick={handleSignOut}
              className="text-status-critical"
            >
              <LogOut className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
