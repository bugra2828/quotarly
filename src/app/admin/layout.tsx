import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/queries", label: "Queries" },
  { href: "/admin/pitches", label: "Pitches" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/app");

  return (
    <div className="press-texture flex min-h-full flex-col bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/75 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 28 28" aria-hidden="true">
              <rect width="28" height="28" rx="5" fill="var(--ink)" />
              <path
                d="M9.3 10c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0zm8.4 0c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0z"
                fill="var(--paper)"
              />
              <circle cx="21.5" cy="6.5" r="2.6" fill="var(--brand)" />
            </svg>
            <span className="font-display text-base font-semibold tracking-tight">
              Quotarly <span className="text-ink-soft">Admin</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="text-sm text-ink-soft underline transition-colors hover:text-ink"
            >
              Exit admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
