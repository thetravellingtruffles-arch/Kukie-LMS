import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlekgjvlzctihxysmjuo.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_0AjQPR2ZjylUKfilCFqNaA_DS5q9dQe";

// Routes reachable without a Kükie Academy login. Everything else redirects
// to /login. Keep this in sync with the public flows in
// src/middleware.ts's PUBLIC_ROUTE_PREFIXES comment.
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/auth", // /auth/confirm — Supabase email confirmation callback, hit before a session exists
  "/checkin", // employee self check-in from their own phone, no account
  "/course", // module delivery pages (present/assessment/workbook/etc.) —
             // viewed on shared in-store devices during training, no account
];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
