import Image from "next/image";
import { Bell, Command, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-canvas px-4 md:px-6">
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
      </div>
    </header>
  );
}
