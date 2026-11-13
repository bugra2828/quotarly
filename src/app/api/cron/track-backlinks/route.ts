import { trackBacklinksForAllProfiles } from "@/lib/backlinks/tracker";
import { type NextRequest, NextResponse } from "next/server";

// Each profile fetches its pitched articles and runs Google searches, so a
// full pass can take minutes.
export const maxDuration = 300;

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when
// CRON_SECRET is set as a project env var — this rejects any other caller.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await trackBacklinksForAllProfiles();
  return NextResponse.json({ ok: true, ...result });
}
