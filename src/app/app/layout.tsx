import Link from "next/link";
import { signOut } from "@/app/actions/auth";

const navLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/approvals", label: "Approvals" },
  { href: "/app/backlinks", label: "Backlinks" },
  { href: "/app/reports", label: "Reports" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="press-texture flex min-h-full flex-col bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/75 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 28 28" aria-hidden="true">
              <rect width="28" height="28" rx="5" fill="var(--ink)" />
              <path
                d="M9.3 10c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0zm8.4 0c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0z"
                fill="var(--paper)"
              />
              <circle cx="21.5" cy="6.5" r="2.6" fill="var(--brand)" />
            </svg>
            <span className="font-display text-base font-semibold tracking-tight">
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
            <form action={signOut}>
              <button className="text-sm text-ink-soft underline transition-colors hover:text-ink">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
