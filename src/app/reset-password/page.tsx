import { updatePassword } from "@/app/actions/auth";
import { PasswordField } from "@/app/login/PasswordField";
import Link from "next/link";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
              Set a new password
            </h1>
          </div>

          {error && (
            <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
              {error}
            </p>
          )}

          <form action={updatePassword} className="space-y-3">
            <PasswordField name="password" label="New password" placeholder="Password" />
            <PasswordField
              name="confirm_password"
              label="Confirm password"
              placeholder="Confirm password"
            />
            <p className="text-xs text-ink-soft">
              At least 10 characters, one uppercase letter, one number.
            </p>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-solid px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Update password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
