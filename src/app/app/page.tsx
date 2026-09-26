import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <form action={signOut}>
          <button className="text-sm text-muted-foreground underline">
            Sign out
          </button>
        </form>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <p>
          <span className="text-muted-foreground">Signed in as:</span>{" "}
          {profile?.email ?? user.email}
        </p>
        <p>
          <span className="text-muted-foreground">Role:</span>{" "}
          {profile?.role ?? "client"}
        </p>
        <p>
          <span className="text-muted-foreground">Expert profiles:</span>{" "}
          {expertProfiles?.length ?? 0}
        </p>
      </div>

      {!expertProfiles?.length ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            You haven&apos;t created an expert profile yet.
          </p>
          <Link
            href="/app/onboarding"
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Create your profile
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {expertProfiles.map((ep) => (
            <li key={ep.id} className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{ep.display_name}</p>
              <p className="text-muted-foreground">
                {ep.job_title} {ep.company ? `@ ${ep.company}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
