import { signInWithMagicLink } from "@/app/actions/auth";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="press-texture flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
              <rect width="28" height="28" rx="5" fill="var(--ink)" />
              <path
                d="M9.3 10c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0zm8.4 0c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1 2.5 2.3 2.6-.3 1.1-1.1 2-2.3 2.3l.3 1.1c1.9-.4 3.3-2 3.3-4.2v-1.3c0-1.4-1.1-2.5-2.5-2.5.2 0-.3 0-.5 0z"
                fill="var(--paper)"
              />
              <circle cx="21.5" cy="6.5" r="2.6" fill="var(--brand)" />
            </svg>
            <span className="font-display text-xl font-semibold tracking-tight">
              Quotarly
            </span>
          </Link>
          <p className="text-sm text-ink-soft">
            Sign in with a magic link sent to your email.
          </p>
        </div>

        {sent && (
          <p className="rounded-md border border-press/40 bg-press/10 p-3 text-sm text-press">
            Check your inbox — we sent you a sign-in link.
          </p>
        )}
        {error && (
          <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
            {error}
          </p>
        )}

        <form action={signInWithMagicLink} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-brand px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            Send magic link
          </button>
        </form>
      </div>
    </div>
  );
}
