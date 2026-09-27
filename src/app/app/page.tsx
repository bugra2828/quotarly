import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: expertProfiles } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("owner_id", user.id);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("owner_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>

      <div className="rounded-md border border-rule bg-surface p-5 text-sm">
        <Row label="Signed in as" value={profile?.email ?? user.email ?? ""} />
        <Row label="Role" value={profile?.role ?? "client"} />
        <Row label="Expert profiles" value={String(expertProfiles?.length ?? 0)} />
        <Row
          label="Subscription"
          value={
            subscription ? (
              `${subscription.plan} (active)`
            ) : (
              <>
                None —{" "}
                <Link href="/pricing" className="text-brand underline">
                  view plans
                </Link>
              </>
            )
          }
        />
      </div>

      {!expertProfiles?.length ? (
        <div className="rounded-md border border-dashed border-rule p-6 text-center">
          <p className="mb-3 text-sm text-ink-soft">
            You haven&apos;t created an expert profile yet.
          </p>
          <Link
            href="/app/onboarding"
            className="inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            Create your profile
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {expertProfiles.map((ep) => (
              <li
                key={ep.id}
                className="rounded-md border border-rule bg-surface p-4 text-sm"
              >
                <p className="font-medium text-ink">{ep.display_name}</p>
                <p className="text-ink-soft">
                  {ep.job_title} {ep.company ? `@ ${ep.company}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex gap-6">
            <Link href="/app/approvals" className="text-sm text-brand underline">
              View pending approvals →
            </Link>
            <Link href="/app/backlinks" className="text-sm text-brand underline">
              View backlinks →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="flex justify-between border-b border-rule py-2 last:border-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink">{value}</span>
    </p>
  );
}
