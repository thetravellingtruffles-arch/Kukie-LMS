"use client";

import * as React from "react";
import { useSession } from "@/lib/auth/use-session";
import { fetchAccessibleStoreIds } from "./queries";

export interface AccessScope {
  role: string | null;
  /** "all" = no filtering needed (admin/vp). Array = the exact store ids this user may see. */
  storeIds: "all" | string[];
  loading: boolean;
}

/**
 * Resolves what the signed-in user is allowed to see on performance/
 * compliance pages. Use alongside fetchOrgSnapshot() + scopeSnapshot() from
 * @/lib/rollups to filter every dashboard consistently.
 */
export function useAccessScope(): AccessScope {
  const { profile, loading: sessionLoading } = useSession();
  const [storeIds, setStoreIds] = React.useState<"all" | string[]>("all");
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    if (sessionLoading) return;
    if (!profile) {
      setStoreIds([]);
      setResolved(true);
      return;
    }
    fetchAccessibleStoreIds(profile.role)
      .then(setStoreIds)
      .catch(() => setStoreIds([]))
      .finally(() => setResolved(true));
  }, [sessionLoading, profile]);

  return { role: profile?.role ?? null, storeIds, loading: sessionLoading || !resolved };
}
