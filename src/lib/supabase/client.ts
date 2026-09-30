import { createBrowserClient } from "@supabase/ssr";

// Fallback values let this demo run on hosts (e.g. quick preview deployments)
// where NEXT_PUBLIC_* env vars weren't configured. This is the publishable
// anon key — safe to expose client-side; access is governed by RLS policies
// on the `kukie_academy_`-prefixed tables it can reach.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlekgjvlzctihxysmjuo.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_0AjQPR2ZjylUKfilCFqNaA_DS5q9dQe";

// Single browser client. This is a shared Supabase project across the Kukie
// product family (Kukie Home, Kukie Pro, Kukie Academy). All tables used
// here are prefixed `kukie_academy_` to stay isolated from Home/Pro schemas.
//
// Uses @supabase/ssr's browser client (cookie-based session storage, not
// localStorage) so the auth session is visible to src/middleware.ts and
// src/lib/supabase/server.ts — required for real route protection.
export const supabase = createBrowserClient(url, key);
