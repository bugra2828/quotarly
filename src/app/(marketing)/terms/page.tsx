import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that govern using Quotarly.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Terms of service
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated September 2026.</p>

      <div className="mt-10 space-y-8 leading-7 text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            What you're subscribing to
          </h2>
          <p className="mt-2">
            Your plan sets how many expert profiles you can run and roughly
            how many pitches Quotarly drafts for you each month. We don't
            promise a specific number of backlinks — how many queries fit
            your expertise in a given month is outside anyone's control,
            ours included.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Approval is on you
          </h2>
          <p className="mt-2">
            Quotarly drafts quotes from the profile and bio you give it, but
            nothing is sent to a journalist until you approve it. You're
            responsible for checking that an approved quote is accurate
            before you approve it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Billing and cancellation
          </h2>
          <p className="mt-2">
            Plans renew monthly and you can cancel at any time from your
            account settings; cancelling stops the next renewal but doesn't
            refund the current billing period. Payments are handled by our
            payment processor, and your card details never touch our
            servers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Acceptable use
          </h2>
          <p className="mt-2">
            Don't use Quotarly to submit false credentials, impersonate
            someone else, or respond to a platform in a way that violates
            that platform's own terms. We can suspend an account that does.
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
