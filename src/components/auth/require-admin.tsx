"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";
import type { UserRole } from "@/lib/auth/use-session";

// Nav already hides sections a role can't see, but that alone doesn't stop
// someone from typing the URL directly — this is the client-side backstop.
// The real enforcement is still RLS + the app-layer scope filtering in
// useAccessScope() on each data query; this just avoids showing a broken or
// out-of-scope page.
export function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading } = useSession();

  const allowed = !!profile && !!profile.role && roles.includes(profile.role);

  React.useEffect(() => {
    if (loading || !profile) return;
    if (!allowed) {
      // Studio-only roles land on /studio, everyone else falls back to /dashboard.
      const fallback = profile.role === "studio_editor" ? "/studio" : "/dashboard";
      router.replace(fallback);
    }
  }, [loading, profile, allowed, router]);

  if (loading || !profile || !allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}

// Back-compat alias for the previous strict admin-only gate.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["admin"]}>{children}</RequireRole>;
}
