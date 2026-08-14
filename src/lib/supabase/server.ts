import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlekgjvlzctihxysmjuo.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_0AjQPR2ZjylUKfilCFqNaA_DS5q9dQe";

// Server-side Supabase client for Server Components / Route Handlers /
// Server Actions. Reads and writes the auth cookie set by middleware.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — middleware refreshes the
          // session cookie on the next request, so this is safe to ignore.
        }
      },
    },
  });
}
