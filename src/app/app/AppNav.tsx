"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

const navLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "btn-raised-brand rounded-full bg-brand-solid px-4 py-1.5 font-medium text-white transition-colors hover:bg-brand-solid/90"
                : "rounded-full border border-rule px-4 py-1.5 font-medium text-ink-soft transition-colors hover:border-ink/40 hover:bg-surface hover:text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
      <form action={signOut}>
        <button className="btn-raised-wire rounded-full bg-wire/90 px-4 py-1.5 font-medium text-white transition-colors hover:bg-wire">
          Sign out
        </button>
      </form>
    </nav>
  );
}
