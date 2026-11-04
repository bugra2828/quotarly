import { headers } from "next/headers";

// The request headers here are set by src/proxy.ts, which already verified
// the session with supabase.auth.getClaims() for this exact request and always
// overwrites these two headers -- a client can never inject them. Reading them
// here avoids every page/action re-verifying the same session a second time.
export async function getSessionUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const h = await headers();
  const id = h.get("x-user-id");
  if (!id) return null;
  return { id, email: h.get("x-user-email") ?? "" };
}
