import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  missing_email: "Enter your email.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <div className="press-texture relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 text-ink">
      <div className="relative w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <span className="font-display text-xl font-semibold tracking-tight">
            Quotarly
          </span>
        </Link>

        <div className="card-elevated-brand space-y-6 rounded-lg border border-rule bg-surface p-8">
          <div className="space-y-1 text-center">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              {sent ? "Check your email" : "Reset your password"}
            </h1>
            <p className="text-sm text-ink-soft">
              {sent
                ? "If that email has an account, we sent a link to reset the password."
                : "We'll email you a link to set a new password."}
            </p>
          </div>

          {error && (
            <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
              {ERROR_MESSAGES[error] ?? "Something went wrong."}
            </p>
          )}

          {!sent && (
            <form action={requestPasswordReset} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-rule bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand-solid px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
              >
                Send reset link
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="block text-center text-xs text-ink-soft underline"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
