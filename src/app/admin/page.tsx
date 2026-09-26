import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/app");
  }

  const { count: clientCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="text-sm text-muted-foreground">
        Total profiles in system: {clientCount ?? 0}
      </p>
      <div className="flex gap-4">
        <Link href="/admin/queries" className="text-sm underline">
          View journalist queries →
        </Link>
        <Link href="/admin/pitches" className="text-sm underline">
          View generated pitches →
        </Link>
      </div>
    </div>
  );
}
