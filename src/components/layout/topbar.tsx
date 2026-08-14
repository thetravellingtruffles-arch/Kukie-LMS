"use client";

import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth/use-session";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { profile, signOut } = useSession();
  const displayName = profile?.fullName || profile?.email || "Signed in";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur lg:pl-8">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[17px] font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="relative hidden w-64 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search employees, stores…" className="pl-9" />
      </div>

      <button className="relative flex size-10 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:bg-surface-muted">
        <Bell className="size-4.5" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-rose" />
      </button>

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar>
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
          <div className="px-2.5 pb-2">
            <Badge variant="default">{profile?.role === "admin" ? "Admin" : "Trainer"}</Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
