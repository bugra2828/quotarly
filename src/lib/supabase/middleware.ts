import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Never trust a client-supplied value for these -- always strip them
  // first, then only re-add them below once we've actually verified the
  // session. Downstream pages/actions read them instead of calling
  // the session again for the same request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-email");

  const cookiesToApply: {
    name: string;
    value: string;
    options: CookieOptions;
  }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToApply.push(...cookiesToSet);
        },
      },
    }
  );

  // IMPORTANT: avoid writing logic between createServerClient and getClaims().
  // A simple mistake could make it very hard to debug session refresh issues.
  //
  // getClaims() verifies the JWT signature locally against the cached JWKS and
  // refreshes an expired session, so a normal request makes no call to Supabase
  // Auth. The tradeoff is that a revoked session stays valid here until its
  // access token expires.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) {
    requestHeaders.set("x-user-id", user.sub);
    requestHeaders.set("x-user-email", user.email ?? "");
  }

  // /auth/gmail/* are OAuth handshake routes a signed-in user is meant to
  // hit (connecting/reconnecting a Gmail account) -- excluded from the
  // "signed-in users get bounced off auth pages" rule below.
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    (request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/auth/gmail"));
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/admin");

  let response: NextResponse;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    response = NextResponse.redirect(url);
  } else if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  cookiesToApply.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );

  return response;
}
