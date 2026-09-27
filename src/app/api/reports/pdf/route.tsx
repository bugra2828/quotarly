import { createClient } from "@/lib/supabase/server";
import { getMonthlyStats } from "@/lib/reports/monthly";
import { MonthlyReportDocument } from "@/lib/reports/pdf-document";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? currentMonth();
  const profileId = searchParams.get("profile");

  let expertProfileId = profileId;
  if (!expertProfileId) {
    const { data: profiles } = await supabase
      .from("expert_profiles")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1);
    expertProfileId = profiles?.[0]?.id ?? null;
  }

  if (!expertProfileId) {
    return NextResponse.json(
      { error: "no expert profile found" },
      { status: 404 }
    );
  }

  const stats = await getMonthlyStats(expertProfileId, month);
  if (!stats) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <MonthlyReportDocument stats={stats} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotarly-report-${month}.pdf"`,
    },
  });
}
