import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
} from "@/app/actions/auth";
import Link from "next/link";
import { PasswordField } from "./PasswordField";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    mode?: string;
    email?: string;
    confirm?: string;
  }>;
}) {
  const { error, mode, email, confirm } = await searchParams;
  const isSignup = mode === "signup";
  const signupStep = email ? "password" : "email";

  return (
    <div className="press-texture relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 text-ink">
      <div className="glow-field">
        <div
          className="glow-blob h-[380px] w-[380px] bg-brand"
          style={{ top: "-140px", left: "-120px" }}
        />
        <div
          className="glow-blob h-[320px] w-[320px] bg-press"
          style={{ bottom: "-140px", right: "-120px", opacity: 0.16 }}
        />
      </div>
      <div className="relative w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2.5">
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

        <div className="flex rounded-full border border-rule p-1 text-sm">
          <Link
            href="/login"
            className={`flex-1 rounded-full py-2 text-center font-medium transition-colors hover:opacity-90 ${
              !isSignup ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className={`flex-1 rounded-full py-2 text-center font-medium transition-colors hover:opacity-90 ${
              isSignup ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            Sign up
          </Link>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            {confirm
              ? "Check your email"
              : isSignup
                ? signupStep === "email"
                  ? "Create your account"
                  : "Set a password"
                : "Welcome back"}
          </h1>
          <p className="text-sm text-ink-soft">
            {confirm
              ? "We sent a confirmation link — click it to activate your account."
              : isSignup
                ? signupStep === "email"
                  ? "Start with your email."
                  : `For ${email}`
                : "Sign in with your email and password."}
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
            {error}
          </p>
        )}

        {!confirm && (
          <>
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-rule bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <span className="h-px flex-1 bg-rule" />
              or
              <span className="h-px flex-1 bg-rule" />
            </div>
          </>
        )}

        {confirm ? null : !isSignup ? (
          <form action={signInWithPassword} className="space-y-3">
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-full border border-rule bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <PasswordField name="password" placeholder="Password" />
            <button
              type="submit"
              className="w-full rounded-full bg-brand-solid px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Log in
            </button>
          </form>
        ) : signupStep === "email" ? (
          <form method="GET" action="/login" className="space-y-3">
            <input type="hidden" name="mode" value="signup" />
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-full border border-rule bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-brand-solid px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Continue
            </button>
          </form>
        ) : (
          <form action={signUpWithPassword} className="space-y-3">
            <input type="hidden" name="email" value={email} />
            <PasswordField name="password" placeholder="Password" />
            <PasswordField
              name="confirm_password"
              placeholder="Confirm password"
            />
            <p className="text-xs text-ink-soft">
              At least 10 characters, one uppercase letter, one number.
            </p>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-solid px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Create account
            </button>
            <Link
              href="/login?mode=signup"
              className="block text-center text-xs text-ink-soft underline"
            >
              Use a different email
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
