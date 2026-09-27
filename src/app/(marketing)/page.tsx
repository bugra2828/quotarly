import Link from "next/link";

const dispatch = [
  {
    time: "9:14 AM",
    label: "Received",
    body: "A retail-industry newsletter is looking for a founder who's scaled a support team past 50 people.",
  },
  {
    time: "9:16 AM",
    label: "Matched & drafted",
    body: "Scored against your profile, then written up in your voice from your bio and past quotes.",
  },
  {
    time: "9:20 AM",
    label: "Waiting on you",
    body: "The quote sits in your approval queue until you say send. Nothing goes out on its own.",
  },
];

const steps = [
  {
    title: "Onboarding",
    body: "Tell Quotarly your expertise, your tone, and the page you want linked. It reads your site to draft a first pass at your profile; you fix what's wrong.",
  },
  {
    title: "Match & draft",
    body: "Every query from HARO, Featured, SOS and Help A B2B Writer gets scored against your profile. The ones that clear your bar get a quote drafted in your voice.",
  },
  {
    title: "You approve, we send",
    body: "Nothing reaches a journalist without your yes. Approve, edit, or reject — then Quotarly sends it and tracks whether the link lands.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="grid gap-12 py-20 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
            Get quoted before the deadline passes.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
            Quotarly reads the journalist queries landing in HARO, Featured,
            SOS and Help A B2B Writer, matches the ones that fit your
            expertise, and drafts the quote in your voice. You approve it
            before anything goes out.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/how-it-works"
              className="rounded-sm bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              See how it works
            </Link>
            <Link
              href="/pricing"
              className="rounded-sm border border-rule px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              View pricing
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm text-ink-soft">One query, start to finish</p>
          <ol className="relative mt-4 space-y-6 border-l border-rule pl-6">
            {dispatch.map((item, i) => (
              <li
                key={item.label}
                className="motion-safe:animate-[fade-in-up_0.5s_ease-out_backwards]"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <p className="font-dispatch text-xs text-ink-soft">
                  {item.time}
                </p>
                <p className="mt-1 text-sm font-medium text-wire">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-ink-soft">
            Illustrative — this is what happens after you onboard.
          </p>
        </div>
      </section>

      <section className="border-t border-rule py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="border-l border-rule pl-6">
              <p className="font-dispatch text-sm text-ink-soft">
                {i + 1}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-rule py-20">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              No autopilot on your name.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Other tools send the quote the moment it's drafted. Quotarly
              holds it in your queue until you approve it — because a
              journalist is about to publish your name, not a template's.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              We won't show you fake numbers.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Quotarly is new. We'd rather tell you that than dress up this
              page with placements we haven't earned yet. Your dashboard
              shows your real pitches and real links from day one, nothing
              borrowed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-rule py-20 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to see what's out there for you?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
          Onboarding takes a few minutes. The first matches usually show up
          within a day.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
