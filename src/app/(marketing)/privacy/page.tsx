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
            <code className="text-ink">gmail.send</code> scope), plus your
            Google account email address so we can show you which account is
            connected.
          </p>

          <p className="mt-4 font-medium text-ink">
            What Google user data we access
          </p>
          <p className="mt-2">
            Only two things: (1) the ability to send an email through your
            Gmail account via the <code className="text-ink">gmail.send</code>{" "}
            scope, and (2) your Google account&apos;s email address (via the{" "}
            <code className="text-ink">openid</code> and{" "}
            <code className="text-ink">userinfo.email</code> scopes), used
            only to label the connection in your Settings page (e.g. &quot;Connected
            as you@gmail.com&quot;). We never request, and Google never grants us,
            any ability to read, search, list, or modify messages already in
            your mailbox — that data is physically outside what{" "}
            <code className="text-ink">gmail.send</code> can access.
          </p>

          <p className="mt-4 font-medium text-ink">
            How we use this data
          </p>
          <p className="mt-2">
            We use it for exactly one purpose: sending the specific pitch
            email you&apos;ve reviewed and approved (via the &quot;Approve &amp; send&quot;
            button in your dashboard), from your own Gmail address instead of
            a shared one, so journalists see a real, recognizable sender. We
            never use this access for any other purpose — not analytics, not
            advertising, not AI model training, not sending anything you
            haven&apos;t approved.
          </p>

          <p className="mt-4 font-medium text-ink">
            Who we share it with
          </p>
          <p className="mt-2">
            We don&apos;t share, transfer, sell, or disclose your Google
            account data, your Gmail connection, or any email sent through it
            with any third party. It is used solely within Quotarly&apos;s own
            systems to send your approved pitches. Our infrastructure
            providers (Supabase for the database, Vercel for hosting) store or
            process the encrypted token described below as part of running the
            service, under their own confidentiality and security
            obligations — they do not use it for any purpose of their own.
          </p>

          <p className="mt-4 font-medium text-ink">
            How we protect this data
          </p>
          <p className="mt-2">
            The OAuth refresh token that lets us send on your behalf is
            encrypted at rest (AES-256-GCM) in our database before it&apos;s ever
            stored, and is only decrypted in memory at the moment a pitch is
            sent. Access to decrypt it is restricted to the server-side send
            process — it&apos;s never exposed to the browser, to other users, or
            to any Quotarly staff member&apos;s regular tooling. We never see or
            store your Google account password.
          </p>

          <p className="mt-4 font-medium text-ink">
            Retention and deletion
          </p>
          <p className="mt-2">
            We keep the encrypted token only for as long as your Gmail
            connection stays active. You can disconnect at any time from your
            dashboard&apos;s Settings page, or by removing Quotarly&apos;s access
            directly at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-ink underline"
              target="_blank"
            >
              myaccount.google.com/permissions
            </a>
            . Either way, we delete the stored token immediately and
            permanently, and future pitches fall back to sending from
            quotarly.com. Deleting your Quotarly account (see below) also
            deletes any connected Gmail token immediately.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            AI use and Google Workspace data (Limited Use compliance)
          </h2>
          <p className="mt-2">
            The use of information received from Google Workspace APIs by
            Quotarly will adhere to the{" "}
            <a
              href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy"
              className="text-ink underline"
              target="_blank"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Quotarly&apos;s AI drafts
            pitches only from the expert profile, bio, and sample quotes you
            enter directly into your Quotarly dashboard — it never reads,
            processes, or has access to anything in your connected Gmail
            account, since the <code className="text-ink">gmail.send</code>{" "}
            scope only allows sending a message, not reading one. We do not
            use any data received from Google Workspace APIs — raw, derived,
            or aggregated — to train, improve, or develop any AI/ML models,
            foundational or otherwise.
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
