import { signInWithMagicLink } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Quotarly</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with a magic link sent to your email.
          </p>
        </div>

        {sent && (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Check your inbox — we sent you a sign-in link.
          </p>
        )}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signInWithMagicLink} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
          >
            Send magic link
          </button>
        </form>
      </div>
    </div>
  );
}
