"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type UserRole = "admin" | "trainer";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

interface SessionState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

// Client-side "who am I" hook. Middleware already enforces that protected
// routes can't be reached without a session, but pages still need this to
// know the signed-in user's role (to hide admin-only UI, show their name,
// and let them sign out).
export function useSession(): SessionState & { signOut: () => Promise<void>; refresh: () => Promise<void> } {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadProfile = React.useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("kukie_academy_user_profiles")
      .select("id, email, full_name, role")
      .eq("id", u.id)
      .maybeSingle();
    if (data) {
      setProfile({ id: data.id, email: data.email, fullName: data.full_name, role: data.role as UserRole });
    } else {
      setProfile(null);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      await loadProfile(data.user);
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  const refresh = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    await loadProfile(data.user);
  }, [loadProfile]);

  return { user, profile, loading, signOut, refresh };
}
