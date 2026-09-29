import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { createOAuth2Client } from "@/lib/gmail/client";
import { encrypt } from "@/lib/crypto/encryption";
import { NextResponse, type NextRequest } from "next/server";

const STATE_COOKIE = "gmail_oauth_nonce";

function fail(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(`/app/settings?gmail_error=${reason}`, request.url)
  );
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  if (searchParams.get("error")) {
    return fail(request, "cancelled");
  }

  const code = searchParams.get("code");
  const rawState = searchParams.get("state");
  if (!code || !rawState) {
    return fail(request, "invalid_request");
  }

  let expertProfileId: string;
  let nonce: string;
  try {
    const decoded = JSON.parse(
      Buffer.from(rawState, "base64url").toString("utf8")
    );
    expertProfileId = decoded.expertProfileId;
    nonce = decoded.nonce;
  } catch {
    return fail(request, "invalid_state");
  }

  const cookieNonce = request.cookies.get(STATE_COOKIE)?.value;
  if (!cookieNonce || cookieNonce !== nonce) {
    return fail(request, "invalid_state");
  }

  const user = await getSessionUser();
  if (!user) {
    return fail(request, "not_signed_in");
  }

  // Re-verify ownership -- cheap, and closes a re-entrancy edge case.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("expert_profiles")
    .select("id")
    .eq("id", expertProfileId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!profile) {
    return fail(request, "not_found");
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // Happens if the user has already granted this exact scope set
      // before without prompt=consent forcing a fresh one. We always send
      // prompt=consent, so this should be rare -- but fail loudly rather
      // than silently keeping the profile "disconnected".
      return fail(request, "no_refresh_token");
    }

    let gmailEmail: string | null = null;
    if (tokens.id_token) {
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(
          "utf8"
        )
      );
      gmailEmail = payload.email ?? null;
    }
    if (!gmailEmail) {
      return fail(request, "no_email");
    }

    const admin = createAdminClient();
    const { error: upsertError } = await admin
      .from("gmail_connections")
      .upsert(
        {
          expert_profile_id: expertProfileId,
          gmail_email: gmailEmail,
          refresh_token_encrypted: encrypt(tokens.refresh_token),
          status: "active",
          last_error: null,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "expert_profile_id" }
      );

    if (upsertError) {
      console.error("gmail_connections upsert failed", upsertError);
      return fail(request, "save_failed");
    }

    const response = NextResponse.redirect(
      new URL("/app/settings?connected=1", request.url)
    );
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (err) {
    console.error("gmail oauth callback failed", err);
    return fail(request, "exchange_failed");
  }
}
