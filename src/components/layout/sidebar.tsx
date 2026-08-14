"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav-config";
import { KukieLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/use-session";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useSession();
  const isAdmin = profile?.role === "admin";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <KukieLogo dark />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              <div className="px-2.5 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-active text-sidebar-active-foreground"
                          : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="size-[17px] shrink-0" strokeWidth={2} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-[12px] bg-white/[0.04] p-3">
          <p className="text-[11px] font-semibold text-sidebar-foreground">Kükie Academy Framework</p>
          <p className="mt-1 text-[11px] leading-snug text-sidebar-muted">
            Module 001 sets the standard every future module reuses.
          </p>
        </div>
      </div>
    </aside>
  );
}
