import { createAdminClient } from "@/lib/supabase/admin";
import { getMonthlyStats } from "@/lib/reports/monthly";
import { sendMonthlyReportReadyNotification } from "@/lib/email/notify";
import { type NextRequest, NextResponse } from "next/server";

function previousMonth() {
  const now = new Date();
  now.setUTCMonth(now.getUTCMonth() - 1);
  return now.toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const month = previousMonth();
  const monthLabel = formatMonth(month);

  const { data: profiles } = await supabase
    .from("expert_profiles")
    .select("id, owner_id")
    .eq("active", true);

  let sent = 0;

  for (const profile of profiles ?? []) {
    const stats = await getMonthlyStats(supabase, profile.id, month);
    if (!stats || (stats.pitchesSent === 0 && stats.backlinksWon === 0)) {
      continue;
    }

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profile.owner_id)
      .single();

    if (!ownerProfile?.email) continue;

    await sendMonthlyReportReadyNotification({
      toEmail: ownerProfile.email,
      monthLabel,
      pitchesSent: stats.pitchesSent,
      backlinksWon: stats.backlinksWon,
    }).catch(() => {});

    sent++;
  }

  return NextResponse.json({ ok: true, month, notified: sent });
}
