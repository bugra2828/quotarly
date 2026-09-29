import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { buildGmailAuthUrl } from "@/lib/gmail/client";
import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

const STATE_COOKIE = "gmail_oauth_nonce";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const expertProfileId = request.nextUrl.searchParams.get("expert_profile_id");
  if (!expertProfileId) {
    return NextResponse.redirect(
      new URL("/app/settings?gmail_error=missing_profile", request.url)
    );
  }

  // Confirm this profile actually belongs to the signed-in user before
  // sending them to Google -- defends against a forged query param.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("expert_profiles")
    .select("id")
    .eq("id", expertProfileId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(
      new URL("/app/settings?gmail_error=not_found", request.url)
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const state = Buffer.from(
    JSON.stringify({ expertProfileId, nonce })
  ).toString("base64url");

  const response = NextResponse.redirect(buildGmailAuthUrl(state));
  response.cookies.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
