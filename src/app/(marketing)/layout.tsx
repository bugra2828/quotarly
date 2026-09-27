import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="press-texture flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/75 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
              <rect width="28" height="28" rx="5" fill="var(--ink)" />
              <path
                d="M9.3 10c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0zm8.4 0c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0z"
                fill="var(--paper)"
              />
              <circle cx="21.5" cy="6.5" r="2.6" fill="var(--brand)" />
            </svg>
            <span className="font-display text-lg font-semibold tracking-tight">
              Quotarly
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
              href={user ? "/app" : "/login"}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              {user ? "Dashboard" : "Log in"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Quotarly.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <a href="mailto:hello@quotarly.com" className="hover:text-ink">
              hello@quotarly.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
