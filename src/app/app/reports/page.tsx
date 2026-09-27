import { createClient } from "@/lib/supabase/server";
import { getMonthlyStats } from "@/lib/reports/monthly";
import { redirect } from "next/navigation";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expertProfiles } = await supabase
    .from("expert_profiles")
    .select("id, display_name")
    .eq("owner_id", user.id);

  const month = currentMonth();

  const statsByProfile = await Promise.all(
    (expertProfiles ?? []).map(async (ep) => ({
      profile: ep,
      stats: await getMonthlyStats(ep.id, month),
    }))
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Reports
      </h1>
      <p className="text-sm text-ink-soft">{formatMonth(month)}</p>

      {!expertProfiles?.length && (
        <p className="text-sm text-ink-soft">
          Create an expert profile to start seeing reports.
        </p>
      )}

      <ul className="space-y-4">
        {statsByProfile.map(({ profile, stats }) => (
          <li
            key={profile.id}
            className="rounded-md border border-rule bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{profile.display_name}</p>
              <a
                href={`/api/reports/pdf?profile=${profile.id}&month=${month}`}
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90"
              >
                Download PDF
              </a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-xl font-semibold">
                  {stats?.pitchesSent ?? 0}
                </p>
                <p className="text-xs text-ink-soft">Pitches sent</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold">
                  {stats?.backlinksWon ?? 0}
                </p>
                <p className="text-xs text-ink-soft">Backlinks won</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold">
                  {stats?.avgAuthority ?? "—"}
                </p>
                <p className="text-xs text-ink-soft">Avg. authority</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
