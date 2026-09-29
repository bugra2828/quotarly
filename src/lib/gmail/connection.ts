import { createOAuth2Client } from "@/lib/gmail/client";
import { decrypt, encrypt } from "@/lib/crypto/encryption";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function getActiveGmailConnection(
  admin: AdminClient,
  expertProfileId: string
): Promise<{ gmailEmail: string; refreshToken: string } | null> {
  const { data } = await admin
    .from("gmail_connections")
    .select("gmail_email, refresh_token_encrypted")
    .eq("expert_profile_id", expertProfileId)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return null;

  return {
    gmailEmail: data.gmail_email,
    refreshToken: decrypt(data.refresh_token_encrypted),
  };
}

// Builds an OAuth2Client seeded with the connection's refresh token. If
// Google rotates the refresh token on use, re-encrypts and persists the new
// one -- fire-and-forget, never blocks the send.
export function buildGmailClient(
  admin: AdminClient,
  expertProfileId: string,
  refreshToken: string
) {
  const client = createOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });

  client.on("tokens", (tokens) => {
    if (!tokens.refresh_token) return;
    admin
      .from("gmail_connections")
      .update({
        refresh_token_encrypted: encrypt(tokens.refresh_token),
        updated_at: new Date().toISOString(),
      })
      .eq("expert_profile_id", expertProfileId)
      .then(undefined, (err) =>
        console.error("failed to persist rotated gmail refresh token", err)
      );
  });

  return client;
}
