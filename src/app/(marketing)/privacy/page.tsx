import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Quotarly stores about you and why.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Privacy policy
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated September 2026.</p>

      <div className="mt-10 space-y-8 leading-7 text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            What we store
          </h2>
          <p className="mt-2">
            Your account email, the expert profile you give us (bio, topics,
            sample quotes, links), the drafts and pitches generated from it,
            and the backlinks Quotarly finds for your site. That's what
            powers the product — there isn't a separate marketing database
            of the same data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            What we don't do
          </h2>
          <p className="mt-2">
            We don't sell your data, and we don't use your bio or quotes to
            train models. Your profile is only ever used to draft your own
            pitches.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Who else touches it
          </h2>
          <p className="mt-2">
            We use Supabase to store your data, Anthropic's Claude to draft
            and score pitches, DataForSEO to check whether a link landed, and
            a payment processor to handle billing. Pitches send either
            through Resend or, if you've connected it, through your own
            Gmail account — see below. Each only sees what it needs to do
            its part.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Connecting your Gmail account
          </h2>
          <p className="mt-2">
            If you connect Gmail from your dashboard settings, Quotarly asks
            Google for a single, narrow permission:{" "}
            <span className="text-ink">send email on your behalf</span> (the{" "}
            <code className="text-ink">gmail.send</code> scope). We use this
            for exactly one thing — sending the pitches you approve from your
            own Gmail address instead of a shared one, so journalists see a
            real, recognizable sender.
          </p>
          <p className="mt-2">
            We never request access to read, search, or manage your inbox,
            and Google doesn&apos;t grant it to us — the{" "}
            <code className="text-ink">gmail.send</code> scope physically
            cannot see any mail already in your account. We store only an
            encrypted token that lets us send on your behalf; we never see
            your password.
          </p>
          <p className="mt-2">
            Disconnect at any time from your dashboard&apos;s Settings page,
            or by removing Quotarly&apos;s access directly at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-ink underline"
              target="_blank"
            >
              myaccount.google.com/permissions
            </a>
            . Either way, we delete the stored token immediately and future
            pitches fall back to sending from quotarly.com.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Deleting your account
          </h2>
          <p className="mt-2">
            Ask from your account settings or by emailing us, and we'll
            remove your profile, drafts, and pitch history. Records we're
            required to keep for billing are kept only as long as the law
            requires.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Questions
          </h2>
          <p className="mt-2">
            Reach us at{" "}
            <a href="mailto:hello@quotarly.com" className="text-ink underline">
              hello@quotarly.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
