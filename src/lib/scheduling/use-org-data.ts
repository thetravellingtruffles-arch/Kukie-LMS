"use client";

import * as React from "react";
import { fetchRegions, fetchStores, fetchTrainers } from "@/lib/org/queries";
import type { OrgRegion, OrgStore, OrgTrainer } from "@/lib/types";

/**
 * Loads the real (Supabase-backed) Regions/Stores/Trainers once, for the
 * scheduling feature (sign-up form, calendar, session dialog). Replaces the
 * old synchronous mock DATA.regions/DATA.stores/TRAINERS — these are real,
 * persisted records managed on the /organization page, and start empty
 * until an admin adds them.
 */
export function useOrgData() {
  const [regions, setRegions] = React.useState<OrgRegion[]>([]);
  const [stores, setStores] = React.useState<OrgStore[]>([]);
  const [trainers, setTrainers] = React.useState<OrgTrainer[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [r, s, t] = await Promise.all([fetchRegions(), fetchStores(), fetchTrainers()]);
      setRegions(r);
      setStores(s);
      setTrainers(t);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { regions, stores, trainers, loading, refresh };
}
