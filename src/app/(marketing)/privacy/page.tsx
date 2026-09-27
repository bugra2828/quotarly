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
            and score pitches, Resend to send them, DataForSEO to check
            whether a link landed, and a payment processor to handle
            billing. Each only sees what it needs to do its part.
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
