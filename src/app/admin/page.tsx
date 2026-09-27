import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const { count: clientCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: inboundCount } = await supabase
    .from("inbound_emails")
    .select("*", { count: "exact", head: true });

  const { count: parsedCount } = await supabase
    .from("queries")
    .select("*", { count: "exact", head: true });

  const { count: sentCount } = await supabase
    .from("pitches")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent");

  const { count: failedCount } = await supabase
    .from("pitches")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");

  const stats = [
    { label: "Client accounts", value: clientCount ?? 0 },
    { label: "Inbound emails", value: inboundCount ?? 0 },
    { label: "Parsed queries", value: parsedCount ?? 0 },
    { label: "Pitches sent", value: sentCount ?? 0 },
    { label: "Failed pitches", value: failedCount ?? 0, alert: (failedCount ?? 0) > 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        System overview
      </h1>

      <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper p-5">
            <p
              className={`font-display text-2xl font-semibold ${
                s.alert ? "text-wire" : "text-ink"
              }`}
            >
              {s.value}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <Link href="/admin/clients" className="text-sm text-brand underline">
          View clients →
        </Link>
        <Link href="/admin/queries" className="text-sm text-brand underline">
          View journalist queries →
        </Link>
        <Link href="/admin/pitches" className="text-sm text-brand underline">
          View generated pitches →
        </Link>
      </div>
    </div>
  );
}
