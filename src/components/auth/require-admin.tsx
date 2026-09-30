"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";

// Nav already hides admin-only sections from Trainers, but that alone
// doesn't stop someone from typing the URL directly — this is the
// client-side backstop. The real enforcement is still the RLS policies on
// each table (a Trainer session can't read/write admin-only data even if
// they reach the page), this just avoids showing them an empty/broken page.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading } = useSession();

  React.useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  if (loading || !profile || profile.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
