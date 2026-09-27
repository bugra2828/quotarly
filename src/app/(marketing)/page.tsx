import Link from "next/link";

const dispatch = [
  {
    time: "9:14 AM",
    label: "Received",
    color: "text-ink-soft",
    body: "A retail-industry newsletter is looking for a founder who's scaled a support team past 50 people.",
  },
  {
    time: "9:16 AM",
    label: "Matched & drafted",
    color: "text-press",
    body: "Scored against your profile, then written up in your voice from your bio and past quotes.",
  },
  {
    time: "9:20 AM",
    label: "Waiting on you",
    color: "text-wire",
    body: "The quote sits in your approval queue until you say send. Nothing goes out on its own.",
  },
];

const steps = [
  {
    title: "Onboarding",
    swatch: "bg-ink",
    body: "Tell Quotarly your expertise, your tone, and the page you want linked. It reads your site to draft a first pass at your profile; you fix what's wrong.",
  },
  {
    title: "Match & draft",
    swatch: "bg-press",
    body: "Every query from HARO, Featured, SOS and Help A B2B Writer gets scored against your profile. The ones that clear your bar get a quote drafted in your voice.",
  },
  {
    title: "You approve, we send",
    swatch: "bg-wire",
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

        <div className="rounded-sm bg-paper/60 p-6 shadow-[0_1px_0_var(--rule)]">
          <p className="text-sm text-ink-soft">One query, start to finish</p>
          <ol className="tape-edge relative mt-4 space-y-6 pl-6">
            {dispatch.map((item, i) => (
              <li
                key={item.label}
                className="motion-safe:animate-[fade-in-up_0.5s_ease-out_backwards]"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <p className="font-dispatch text-xs text-ink-soft">
                  {item.time}
                </p>
                <p className={`mt-1 text-sm font-medium ${item.color}`}>
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
            <div key={step.title}>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-[3px] font-dispatch text-sm font-medium text-paper ${step.swatch}`}
              >
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">
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
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          What lands in your queue
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">
          A drafted quote, the journalist's question next to it, and a
          deadline. You read it, edit if you want, and decide.
        </p>

        <div className="mt-10 overflow-hidden rounded-md border border-rule">
          <div className="flex items-center gap-2 border-b border-rule bg-paper/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-wire" />
            <span className="h-2.5 w-2.5 rounded-full bg-press" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            <span className="ml-3 font-dispatch text-xs text-ink-soft">
              quotarly.com/app/approvals
            </span>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-rule p-6 sm:border-r sm:border-b-0">
              <div className="flex items-center justify-between">
                <p className="font-dispatch text-xs text-ink-soft">
                  The Growth Brief
                </p>
                <p className="font-dispatch text-xs text-wire">
                  4h left
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink">
                "Looking for a founder who's scaled a support team past 50
                people — what actually broke first?"
              </p>
            </div>

            <div className="p-6">
              <p className="font-dispatch text-xs text-ink-soft">
                Your drafted quote
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                "The first thing that broke wasn't headcount, it was
                handoffs — tickets sat untouched between shifts until we
                gave every queue a single owner."
              </p>
              <div className="mt-5 flex gap-3">
                <span className="rounded-sm bg-ink px-4 py-2 text-xs font-medium text-paper">
                  Approve &amp; send
                </span>
                <span className="rounded-sm border border-rule px-4 py-2 text-xs font-medium text-ink-soft">
                  Reject
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Illustrative — the layout of your real approval queue.
        </p>
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

      <section className="-mx-6 mt-4 bg-ink px-6 py-20 text-center text-paper">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to see what's out there for you?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-paper/70">
            Onboarding takes a few minutes. The first matches usually show up
            within a day.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded-sm bg-wire px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-wire/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
