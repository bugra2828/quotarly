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
    <div className="flex min-h-full flex-col bg-paper text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Quotarly
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
              className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
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
