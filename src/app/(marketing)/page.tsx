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

const workflow = [
  {
    eyebrow: "Step 1",
    title: "Onboarding",
    body: "Tell Quotarly your expertise, your tone, and the page you want linked. It reads your site and drafts a first pass at your profile — you fix what's wrong.",
    reverse: false,
    mock: (
      <div className="space-y-3">
        <p className="font-dispatch text-xs text-ink-soft">Your profile</p>
        <p className="text-sm text-ink">Founder, B2B support software</p>
        <div className="flex flex-wrap gap-2">
          {["Customer support", "SaaS ops", "Team scaling"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-rule px-3 py-1 text-xs text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Step 2",
    title: "Match & score",
    body: "Every query from the journalist sources we monitor gets scored against your profile. Anything below your bar is dropped silently.",
    reverse: true,
    mock: (
      <div className="space-y-2">
        {[
          { name: "The Growth Brief", score: 92 },
          { name: "Founder Weekly", score: 74 },
          { name: "Retail Pulse", score: 31 },
        ].map((q) => (
          <div
            key={q.name}
            className="flex items-center justify-between border-b border-rule py-2 text-sm last:border-0"
          >
            <span className="text-ink-soft">{q.name}</span>
            <span
              className={`font-dispatch text-xs ${
                q.score >= 70 ? "text-press" : "text-ink-soft"
              }`}
            >
              {q.score}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Step 3",
    title: "Draft & approve",
    body: "Anything above your bar gets a quote drafted in your voice. It lands in your queue with the deadline attached — approve, edit, or reject.",
    reverse: false,
    mock: (
      <div className="space-y-3">
        <p className="text-sm leading-6 text-ink-soft">
          "The first thing that broke wasn't headcount, it was handoffs —
          tickets sat untouched between shifts."
        </p>
        <div className="flex gap-2">
          <span className="rounded-sm bg-brand px-3 py-1.5 text-xs font-medium text-white">
            Approve &amp; send
          </span>
          <span className="rounded-sm border border-rule px-3 py-1.5 text-xs font-medium text-ink-soft">
            Reject
          </span>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Step 4",
    title: "Track the link",
    body: "Once a journalist publishes, Quotarly checks daily whether your link showed up, whether it's still there, and reports it straight to your dashboard.",
    reverse: true,
    mock: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <span className="text-ink-soft">thegrowthbrief.com</span>
          <span className="text-press">live · dofollow</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-soft">founderweekly.co</span>
          <span className="text-ink-soft">checking…</span>
        </div>
      </div>
    ),
  },
];

const comparisonRows = [
  ["Matches queries to your exact expertise", true, false, "partial"],
  ["Drafts in your own voice", true, false, true],
  ["You approve before anything sends", true, true, false],
  ["Tracks whether the link actually landed", true, false, false],
  ["Deadline-aware", true, "partial", false],
];

const useCases = [
  {
    title: "SaaS & B2B founders",
    body: "Product and growth questions from trade newsletters and B2B outlets.",
    points: [
      "Matches on product category, not just keywords",
      "Drafts reference real metrics you've given it",
      "Fits outlets that cover your exact stage",
    ],
  },
  {
    title: "Finance & fintech experts",
    body: "Journalists asking for a licensed or experienced voice on markets, lending, or personal finance.",
    points: [
      "Excludes topics you're not credentialed for",
      "Flags anything it can't verify before you approve",
      "Tracks links across finance-specific outlets",
    ],
  },
  {
    title: "Marketing & real estate consultants",
    body: "High query volume, fast-moving deadlines, and a lot of overlap between consultants.",
    points: [
      "Scores you against competing angles, not just topic match",
      "Keeps a running log of what you've already pitched",
      "Surfaces the outlets that actually publish quickly",
    ],
  },
];

const faqs = [
  {
    q: "How does the matching actually work?",
    a: "Every incoming journalist query is scored against your profile — your bio, expertise topics, and the ones you've excluded. Only queries above your threshold get a drafted quote; everything else is silently skipped.",
  },
  {
    q: "Can I edit a quote before it's sent?",
    a: "Yes. Every draft is editable in your approval queue. Nothing reaches a journalist until you approve it, edited or as-is.",
  },
  {
    q: "Do you guarantee backlinks?",
    a: "No. How many queries fit your specific expertise in a given month isn't something anyone can guarantee. Quotarly shows you real numbers, not a promised count.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from your account settings. Cancelling stops the next renewal; it doesn't refund the current period.",
  },
  {
    q: "What if the AI gets a fact wrong?",
    a: "Any claim it isn't confident about gets a [VERIFY] tag, and a draft with an unresolved tag can't be approved until you fix it.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div className="glow-field">
          <div
            className="glow-blob h-[420px] w-[420px] bg-brand"
            style={{ top: "-120px", left: "-80px" }}
          />
          <div
            className="glow-blob h-[360px] w-[360px] bg-press"
            style={{ top: "80px", right: "-100px", opacity: 0.18 }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 lg:pt-28">
          <p className="font-dispatch text-xs text-ink-soft">
            Matched against trusted, vetted journalist sources
          </p>
          <div className="mt-6 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div>
              <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
                Get quoted before the deadline passes.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
                Quotarly reads the journalist queries landing from trusted
                media sources, matches the ones that fit your expertise, and
                drafts the quote in your voice. You approve it before
                anything goes out.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand/90"
                >
                  Get started
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-full border border-rule px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-xs text-ink-soft">
                No fake reviews · No autopilot · Cancel anytime
              </p>
            </div>

            <div className="rounded-md border border-rule bg-surface p-6">
              <p className="text-sm text-ink-soft">
                One query, start to finish
              </p>
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          What lands in your queue
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">
          A drafted quote, the journalist's question next to it, and a
          deadline. You read it, edit if you want, and decide.
        </p>

        <div className="mt-10 overflow-hidden rounded-md border border-rule">
          <div className="flex items-center gap-6 border-b border-rule bg-surface px-4 py-3 text-sm">
            <span className="border-b-2 border-brand pb-1 font-medium text-ink">
              Approvals
            </span>
            <span className="pb-1 text-ink-soft">Backlinks</span>
            <span className="pb-1 text-ink-soft">Reports</span>
            <span className="ml-auto font-dispatch text-xs text-ink-soft">
              quotarly.com/app/approvals
            </span>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-rule p-6 sm:border-r sm:border-b-0">
              <div className="flex items-center justify-between">
                <p className="font-dispatch text-xs text-ink-soft">
                  The Growth Brief
                </p>
                <p className="font-dispatch text-xs text-wire">4h left</p>
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
                <span className="rounded-sm bg-brand px-4 py-2 text-xs font-medium text-white">
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

      <section className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            From first query to a live backlink
          </h2>
          <div className="mt-14 space-y-16">
            {workflow.map((step) => (
              <div
                key={step.title}
                className={`grid items-center gap-10 sm:grid-cols-2 ${
                  step.reverse ? "sm:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p className="font-dispatch text-xs text-brand">
                    {step.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    {step.body}
                  </p>
                </div>
                <div className="rounded-md border border-rule bg-surface p-6">
                  {step.mock}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Doing it yourself vs. Quotarly
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div className="rounded-md border border-rule p-6">
              <p className="font-dispatch text-xs text-ink-soft">
                Doing it yourself
              </p>
              <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                <li>› Scanning every newsletter by hand for a fit</li>
                <li>› Writing each quote from scratch, on deadline</li>
                <li>› No way to know which links actually landed</li>
              </ul>
            </div>
            <div className="rounded-md border border-brand/40 bg-brand/[0.06] p-6">
              <p className="font-dispatch text-xs text-brand">
                With Quotarly
              </p>
              <ul className="mt-4 space-y-3 text-sm text-ink">
                <li>› Queries scored against your profile automatically</li>
                <li>› A drafted quote in your voice, ready to review</li>
                <li>› Every link checked daily and reported to you</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Quotarly vs. the alternatives
          </h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule text-left text-ink-soft">
                  <th className="py-3 pr-4 font-normal"> </th>
                  <th className="py-3 px-4 font-normal">Quotarly</th>
                  <th className="py-3 px-4 font-normal">Doing it yourself</th>
                  <th className="py-3 px-4 font-normal">Generic AI chatbot</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, a, b, c]) => (
                  <tr key={label as string} className="border-b border-rule">
                    <td className="py-3 pr-4 text-ink-soft">{label}</td>
                    <Cell value={a} />
                    <Cell value={b} />
                    <Cell value={c} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Who is Quotarly for?
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {useCases.map((uc) => (
              <div key={uc.title} className="rounded-md border border-rule p-6">
                <h3 className="font-display text-lg font-semibold">
                  {uc.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  {uc.body}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                  {uc.points.map((p) => (
                    <li key={p}>› {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Simple, fair pricing
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3">
            {[
              { name: "Starter", price: 149, note: "1 expert profile" },
              { name: "Pro", price: 199, note: "1 expert profile", featured: true },
              { name: "Agency", price: 499, note: "5 expert profiles" },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col bg-paper p-6 ${
                  plan.featured
                    ? "border-t-4 border-brand"
                    : "border-t-4 border-transparent"
                }`}
              >
                <p className="text-sm text-brand">
                  {plan.featured ? "Most chosen" : " "}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold">
                  {plan.name}
                </h3>
                <p className="mt-3 font-display text-3xl font-semibold">
                  ${plan.price}
                  <span className="text-sm font-normal text-ink-soft">
                    /mo
                  </span>
                </p>
                <p className="mt-2 text-sm text-ink-soft">{plan.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/pricing"
              className="text-sm font-medium text-brand hover:underline"
            >
              See full plan details
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-rule border-t border-b border-rule">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
                  {f.q}
                  <span className="ml-4 text-ink-soft group-open:hidden">
                    +
                  </span>
                  <span className="ml-4 hidden text-ink-soft group-open:inline">
                    −
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-rule bg-brand">
        <div className="glow-field">
          <div
            className="glow-blob h-[300px] w-[300px] bg-white"
            style={{ top: "-80px", left: "10%", opacity: 0.15 }}
          />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center text-white">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to see what's out there for you?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/80">
            Onboarding takes a few minutes. The first matches usually show up
            within a day.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-white/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <td className="py-3 px-4 text-press">Yes</td>;
  }
  if (value === false) {
    return <td className="py-3 px-4 text-ink-soft">—</td>;
  }
  return <td className="py-3 px-4 text-ink-soft">Partial</td>;
}
