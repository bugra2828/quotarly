import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const clientIds = (clients ?? []).map((c) => c.id);

  const { data: expertProfiles } =
    clientIds.length > 0
      ? await supabase
          .from("expert_profiles")
          .select("id, owner_id, display_name, active")
          .in("owner_id", clientIds)
      : { data: [] };

  const { data: subscriptions } =
    clientIds.length > 0
      ? await supabase
          .from("subscriptions")
          .select("owner_id, plan, status")
          .in("owner_id", clientIds)
      : { data: [] };

  const expertIds = (expertProfiles ?? []).map((ep) => ep.id);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: backlinks } =
    expertIds.length > 0
      ? await supabase
          .from("backlinks")
          .select("expert_profile_id, first_seen_at")
          .in("expert_profile_id", expertIds)
          .gte("first_seen_at", startOfMonth.toISOString())
      : { data: [] };

  const subByOwner = new Map((subscriptions ?? []).map((s) => [s.owner_id, s]));
  const backlinksByExpert = new Map<string, number>();
  for (const b of backlinks ?? []) {
    backlinksByExpert.set(
      b.expert_profile_id,
      (backlinksByExpert.get(b.expert_profile_id) ?? 0) + 1
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Clients
      </h1>
      <p className="text-sm text-ink-soft">
        {clients?.length ?? 0} client accounts
      </p>

      <ul className="space-y-3">
        {clients?.map((c) => {
          const profiles = (expertProfiles ?? []).filter(
            (ep) => ep.owner_id === c.id
          );
          const sub = subByOwner.get(c.id);

          return (
            <li key={c.id} className="rounded-md border border-rule bg-surface p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">
                  {c.full_name || c.email}
                </span>
                <span
                  className={`font-dispatch rounded-full px-2.5 py-0.5 text-xs ${
                    sub?.status === "active"
                      ? "bg-press/15 text-press"
                      : "bg-ink-soft/15 text-ink-soft"
                  }`}
                >
                  {sub ? `${sub.plan} · ${sub.status}` : "no subscription"}
                </span>
              </div>
              <p className="mt-1 text-ink-soft">{c.email}</p>

              {profiles.length === 0 ? (
                <p className="mt-3 text-xs text-ink-soft">
                  No expert profile created yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {profiles.map((ep) => (
                    <li
                      key={ep.id}
                      className="flex items-center justify-between text-xs text-ink-soft"
                    >
                      <span>{ep.display_name}</span>
                      <span>
                        {backlinksByExpert.get(ep.id) ?? 0} link
                        {(backlinksByExpert.get(ep.id) ?? 0) === 1 ? "" : "s"}{" "}
                        this month
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {!clients?.length && (
        <p className="text-sm text-ink-soft">No client accounts yet.</p>
      )}
    </div>
  );
}
