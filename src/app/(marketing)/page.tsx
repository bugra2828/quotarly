import { Fragment } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import {
  ArrowRight,
  Check,
  Clock,
  Inbox,
  Link2,
  ListChecks,
  Mail,
  PenLine,
  Quote,
  ShieldCheck,
  Target,
  Timer,
  TriangleAlert,
} from "lucide-react";

/** Stagger delay for a `data-reveal` element. */
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

// Score ring geometry for the hero's "Matched & drafted" step.
const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HERO_SCORE = 92;

const dispatch = [
  {
    time: "9:14 AM",
    label: "Received",
    color: "text-ink-soft",
    dot: "bg-ink-soft",
    body: (
      <div className="rounded-md border border-rule bg-paper/60 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-dispatch text-xs text-ink-soft">
            Retail Pulse
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-wire/10 px-2 py-0.5 font-dispatch text-[11px] text-wire">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Due in 2h
          </span>
        </div>
        <p className="mt-2 font-sans text-sm leading-6 text-ink">
          Looking for a founder who&apos;s scaled a support team past 50
          people.
        </p>
      </div>
    ),
  },
  {
    time: "9:16 AM",
    label: "Matched & drafted",
    color: "text-brand",
    dot: "bg-brand",
    body: (
      <div className="rounded-md border border-rule bg-paper/60 p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden="true">
              <circle
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--rule)"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - HERO_SCORE / 100)}
                className="motion-safe:animate-[score-fill_1s_ease-out_0.7s_backwards]"
                style={{ "--ring-c": RING_CIRCUMFERENCE } as React.CSSProperties}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-dispatch text-xs font-semibold text-ink">
              {HERO_SCORE}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Support ops", "Team scaling"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-rule px-2 py-0.5 font-sans text-[11px] text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 border-l-2 border-brand pl-3 font-sans text-sm leading-6 text-ink">
          &ldquo;The first thing that broke wasn&apos;t headcount, it was
          handoffs
          <span
            className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-brand motion-safe:animate-[caret-blink_1s_steps(1)_infinite]"
            aria-hidden="true"
          />
        </p>
      </div>
    ),
  },
  {
    time: "9:20 AM",
    label: "Sent",
    color: "text-ink",
    dot: "bg-ink",
    body: (
      <p className="flex items-center gap-2 font-sans text-sm text-ink-soft">
        <Check className="h-4 w-4 shrink-0 text-press" aria-hidden="true" />
        Cleared your bar, sent with 1h 54m to spare.
      </p>
    ),
  },
  {
    time: "3 days later",
    label: "Link live",
    color: "text-press",
    dot: "bg-press",
    body: (
      <div className="flex items-center justify-between gap-3 rounded-md border border-press/30 bg-press/[0.07] px-3 py-2">
        <span className="flex items-center gap-2 font-dispatch text-xs text-ink">
          <Link2 className="h-3.5 w-3.5 text-press" aria-hidden="true" />
          retailpulse.com
        </span>
        <span className="font-dispatch text-[11px] text-press">
          dofollow · DR 78
        </span>
      </div>
    ),
  },
];

// --- Section data ------------------------------------------------------

const valueProps = [
  {
    eyebrow: "What you get",
    lead: "Quotes placed in ",
    strong: "real articles from real journalists",
    tail: " — not paid directories.",
  },
  {
    eyebrow: "Where they come from",
    lead: "Queries from ",
    strong: "trusted, vetted journalist sources",
    tail: ", scored against your expertise.",
  },
  {
    eyebrow: "You stay in control",
    lead: "Auto-send what clears your bar, or ",
    strong: "approve every quote yourself",
    tail: ".",
  },
];

const before = [
  { icon: Inbox, text: "Hundreds of query emails a week to read by hand" },
  { icon: Timer, text: "Good fits spotted after the deadline already passed" },
  { icon: PenLine, text: "Every pitch written from scratch, on the clock" },
  { icon: TriangleAlert, text: "No idea which pitches actually turned into links" },
];

const after = [
  { icon: Target, text: "Every query scored against your exact expertise" },
  { icon: Timer, text: "Drafted and sent within minutes, deadline-aware" },
  { icon: PenLine, text: "Quotes written in your voice, from your own facts" },
  { icon: ShieldCheck, text: "Every published link checked daily and reported" },
];

const steps = [
  {
    n: "01",
    title: "Tell us your expertise",
    body: "Add your bio, topics and the page you want linked. Quotarly reads your site and drafts your profile — you fix what's off.",
    chips: ["5-min setup"],
  },
  {
    n: "02",
    title: "Queries get scored",
    body: "Every journalist query is scored against your profile. Anything below your bar is dropped silently.",
    chips: ["Expertise matched", "Noise filtered"],
  },
  {
    n: "03",
    title: "Quotes go out",
    body: "Matches get a quote drafted in your voice and sent before the deadline — or held for your approval.",
    chips: ["Your voice", "Deadline-aware"],
  },
  {
    n: "04",
    title: "Links get tracked",
    body: "Once the article publishes, Quotarly checks daily that your link is live and reports it to your dashboard.",
    chips: ["Live status", "Dofollow check"],
    highlight: true,
  },
];

// Illustrative filter: what happens to 1,000 incoming queries for a typical
// single-topic expert. Widths are relative to the first row.
const funnel = [
  { label: "Journalist queries received", n: 1000, width: 100 },
  { label: "Outside your expertise", sign: "−", n: 640, suffix: " out", width: 78 },
  { label: "Below your match bar", sign: "−", n: 230, suffix: " out", width: 64 },
  { label: "Deadline too close", sign: "−", n: 40, suffix: " out", width: 52 },
  { label: "Pitched for you", n: 90, width: 40, final: true },
];

const trackedLinks = [
  { site: "thegrowthbrief.com", title: "What actually breaks when support scales", dr: 71, status: "live" },
  { site: "founderweekly.co", title: "12 founders on their first ops hire", dr: 64, status: "live" },
  { site: "retailpulse.com", title: "The handoff problem in CX teams", dr: 78, status: "checking" },
];

const compareRows: { label: string; diy: string; agency: string; us: string }[] = [
  {
    label: "Price",
    diy: "Free, but hours of your week",
    agency: "$3,000+/mo retainer",
    us: "$149/mo, one plan",
  },
  {
    label: "Effort",
    diy: "Read every query, write every pitch",
    agency: "Briefings, calls, approvals",
    us: "5-min setup, optional review",
  },
  {
    label: "Speed",
    diy: "Whenever you get to the inbox",
    agency: "Business hours",
    us: "Minutes after a query lands",
  },
  {
    label: "Link tracking",
    diy: "Google yourself and hope",
    agency: "Monthly PDF report",
    us: "Checked daily, live on your dashboard",
  },
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
      "Flags anything it can't verify and holds it for review",
      "Tracks links across finance-specific outlets",
    ],
  },
  {
    title: "Marketing & real estate consultants",
    body: "High query volume, fast-moving deadlines, and a lot of overlap between consultants.",
    points: [
      "Scores you against competing angles, not just topic",
      "Keeps a running log of what you've already pitched",
      "Surfaces the outlets that actually publish quickly",
    ],
  },
];

// Mirrors the single plan sold on /pricing — keep the two in sync.
const plan = {
  name: "Quotarly Pro",
  price: 149,
  groups: [
    {
      title: "Matching",
      items: ["1 expert profile", "Every query scored against it", "Deadline-aware"],
    },
    {
      title: "Pitching",
      items: [
        "Up to 200 personalized pitches a month",
        "Written in your voice",
        "Auto-send or manual review",
      ],
    },
    {
      title: "Tracking",
      items: ["Live tracking dashboard", "Every link checked daily", "Dofollow status"],
    },
  ],
};

const faqs = [
  {
    q: "How does the matching actually work?",
    a: "Every incoming journalist query is scored against your profile — your bio, expertise topics, and the ones you've excluded. Only queries above your threshold get a drafted quote; everything else is silently skipped.",
  },
  {
    q: "Can I edit a quote before it's sent?",
    a: "By default, a quote sends automatically once it clears your match bar. Turn on manual review in your dashboard and every draft lands in your approval queue instead — editable, and nothing reaches a journalist until you approve it.",
  },
  {
    q: "What if the AI gets a fact wrong?",
    a: "Any claim it isn't confident about gets a [VERIFY] tag, and a draft with an unresolved tag can't be approved until you fix it.",
  },
  {
    q: "Is every quote guaranteed to get published?",
    a: "No — the journalist decides what runs. Quotarly's job is to get a strong, on-time answer in front of them for every query you actually fit, and to tell you the moment one turns into a live link.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from your account settings. Cancelling stops the next renewal; it doesn't refund the current period.",
  },
];

// --- Page ----------------------------------------------------------------

export default function Home() {
  return (
    <div className="font-sans">
      <ScrollReveal />
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="glow-field">
          <div
            className="glow-blob h-[520px] w-[520px] bg-brand"
            style={{ top: "-160px", left: "-120px" }}
          />
          <div
            className="glow-blob h-[420px] w-[420px] bg-press"
            style={{ top: "120px", right: "-120px", opacity: 0.16 }}
          />
        </div>

        <div className="relative mx-auto max-w-[88rem] px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>Journalist queries → quotes → backlinks</Eyebrow>
              <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Get{" "}
<span className="text-brand">quoted by journalists</span>{" "}
                without reading a single query
              </h1>
              <p className="mt-7 max-w-xl font-sans text-lg leading-8 text-ink-soft">
                Quotarly reads every journalist request from trusted sources,
                picks the ones that fit your expertise, and sends a quote in
                your voice before the deadline. You collect the backlinks.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-solid px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-solid/90"
                >
                  Start getting quoted
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-full border border-rule px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-ink"
                >
                  See how it works
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-6 text-sm text-ink-soft">
                {["Manual review optional", "Every link tracked daily", "Cancel anytime"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-press" aria-hidden="true" />
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <RoutingNetwork />
              <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span className="h-0.5 w-6 rounded bg-brand" aria-hidden="true" />
                  Matched and pitched
                </span>
                <span className="flex items-center gap-2 text-ink-soft">
                  <span className="h-0 w-6 border-t border-dashed border-ink-soft/50" aria-hidden="true" />
                  Filtered out
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-rule bg-surface/60">
        <div className="mx-auto grid max-w-[88rem] divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {valueProps.map((v) => (
            <div key={v.eyebrow} className="px-6 py-10">
              <Eyebrow>{v.eyebrow}</Eyebrow>
              <p className="mt-4 text-lg leading-7 text-ink-soft">
                {v.lead}
                <strong className="font-semibold text-ink">{v.strong}</strong>
                {v.tail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / after */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
        <Eyebrow>Why Quotarly</Eyebrow>
        <SectionTitle strong="Getting press" soft="without us," tail="and with us" />

        <div className="mt-8 grid gap-3 rounded-2xl border border-rule bg-rule/40 p-3 lg:grid-cols-2">
          {/* Before */}
          <div data-reveal="" style={delay(150)} className="flex flex-col rounded-xl bg-paper p-5 sm:p-6">
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 font-dispatch text-xs tracking-widest text-ink-soft uppercase">
              Before
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold">
              Chasing queries on your own
            </h3>

            <div className="relative mt-4 mb-10 rounded-lg border border-rule bg-surface">
              <div className="flex items-center justify-between border-b border-rule px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Mail className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                  Inbox
                </span>
                <span className="rounded-full bg-wire/15 px-2 py-0.5 font-dispatch text-[11px] text-wire">
                  142 unread
                </span>
              </div>
              {[
                ["Source digest — Morning edition", "47 new requests"],
                ["Source digest — Afternoon edition", "52 new requests"],
                ["Re: your pitch", "Thanks, but we've already filed"],
              ].map(([subject, preview], i) => (
                <div
                  key={subject}
                  className={`flex items-center justify-between gap-4 border-b border-rule px-4 py-3 last:border-0 ${
                    i === 2 ? "opacity-60" : ""
                  }`}
                >
                  <span className="truncate text-sm text-ink">{subject}</span>
                  <span className="shrink-0 truncate text-xs text-ink-soft">{preview}</span>
                </div>
              ))}
              <div className="absolute -right-2 -bottom-12 w-56 rounded-lg border border-wire/40 bg-paper p-3 shadow-2xl sm:-right-4">
                <p className="flex items-center gap-1.5 font-dispatch text-[11px] text-wire">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Deadline passed 3h ago
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  &ldquo;Founder who scaled support past 50 people…&rdquo;
                </p>
              </div>
            </div>

            <IconList items={before} tone="soft" />
          </div>

          {/* After */}
          <div data-reveal="" style={delay(300)} className="flex flex-col rounded-xl border border-brand/30 bg-brand/[0.07] p-5 sm:p-6">
            <span className="w-fit rounded-full bg-brand-solid px-3 py-1 font-dispatch text-xs tracking-widest text-white uppercase">
              After
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold">
              Getting quoted with Quotarly
            </h3>

            <div className="relative mt-4 mb-10 rounded-lg border border-rule bg-surface">
              <div className="flex items-center justify-between border-b border-rule px-4 py-3">
                <span className="text-sm font-medium text-ink">Matched queries</span>
                <span className="font-dispatch text-[11px] text-ink-soft">match score</span>
              </div>
              {[
                { outlet: "The Growth Brief", q: "Scaling a support team past 50", score: 92, state: "Sent" },
                { outlet: "Founder Weekly", q: "First ops hire mistakes", score: 81, state: "Sent" },
                { outlet: "Retail Pulse", q: "Holiday returns policy", score: 31, state: "Skipped" },
              ].map((r) => (
                <div
                  key={r.outlet}
                  className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-dispatch text-[11px] text-ink-soft">{r.outlet}</p>
                    <p className="truncate text-sm text-ink">{r.q}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-dispatch text-xs ${r.score >= 70 ? "text-press" : "text-ink-soft"}`}
                    >
                      {r.score}%
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        r.state === "Sent" ? "bg-press/15 text-press" : "bg-white/5 text-ink-soft"
                      }`}
                    >
                      {r.state}
                    </span>
                  </div>
                </div>
              ))}
              <div className="absolute -right-2 -bottom-12 flex w-56 items-center gap-2 rounded-lg border border-press/40 bg-paper p-3 shadow-2xl sm:-right-4">
                <Link2 className="h-4 w-4 shrink-0 text-press" aria-hidden="true" />
                <div>
                  <p className="font-dispatch text-[11px] text-press">Link live · DR 71</p>
                  <p className="text-xs text-ink-soft">thegrowthbrief.com</p>
                </div>
              </div>
            </div>

            <IconList items={after} tone="brand" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle strong="Four steps" soft="to your first live backlink" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((s, i) => (
              <div
                key={s.n}
                data-reveal=""
                style={delay(150 + i * 110)}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  s.highlight
                    ? "border-brand/40 bg-gradient-to-b from-brand/[0.12] to-transparent"
                    : "border-rule bg-surface/40"
                }`}
              >
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="absolute top-1/2 -right-6 hidden h-4 w-4 -translate-y-1/2 text-ink-soft/60 lg:block"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-md font-dispatch text-sm font-semibold ${
                    s.highlight ? "bg-brand-solid text-white" : "bg-brand/15 text-brand"
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{s.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.chips.map((c) => (
                    <span
                      key={c}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        s.highlight ? "bg-brand/15 text-brand" : "bg-white/5 text-ink"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One query, start to finish */}
      <section className="border-y border-rule bg-surface/60">
        <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-6 lg:px-10 py-12 lg:grid-cols-[1fr_1fr] lg:py-16">
          <div>
            <Eyebrow>One query, start to finish</Eyebrow>
            <SectionTitle strong="From a newsroom request" soft="to a live backlink" />
            <p data-reveal="" style={delay(160)} className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
              Quotarly watches journalist requests from trusted sources around
              the clock. When one fits{" "}
              <strong className="font-semibold text-ink">your expertise</strong>,
              it drafts a quote in your voice, sends it before the deadline and
              tracks the link until it goes live.
            </p>
          </div>
          <QueryTimeline />
        </div>
      </section>

      {/* Filtering + tracking */}
      <section>
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Built to be picky</Eyebrow>
              <SectionTitle strong="Only the queries you'd win" soft="ever get a pitch" />
            </div>
            <p className="max-w-xl text-lg leading-8 text-ink-soft">
              Spraying generic pitches burns your name with journalists.
              Quotarly drops everything outside your expertise or below your
              bar — so the pitches that do go out are ones worth reading.
            </p>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-rule bg-rule/40 p-3 lg:grid-cols-2">
            <div data-reveal="" style={delay(150)} className="rounded-xl bg-paper p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold">
                Most queries never reach you
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                Every query is scored on topic fit, your credentials and the
                time left. You only hear about the ones that clear all three.
              </p>
              <div className="mt-6 space-y-2">
                {funnel.map((row, i) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div
                        className={`min-w-[8.5rem] rounded-md px-3 py-2 text-sm font-medium ${
                          row.final ? "bg-brand-solid text-white" : "bg-brand/[0.12] text-ink"
                        }`}
                        data-reveal-bar=""
                        style={{ width: `${row.width}%`, "--reveal-delay": `${200 + i * 140}ms` } as CSSProperties}
                      >
                        {row.label}
                      </div>
                    </div>
                    <span
                      className={`w-20 shrink-0 text-right font-dispatch text-sm ${
                        row.final ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {row.sign}
                      <span data-count={row.n} data-count-delay={200 + i * 140}>
                        {row.n.toLocaleString("en-US")}
                      </span>
                      {row.suffix}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-ink-soft">
                Illustrative — a typical single-topic expert profile.
              </p>
            </div>

            <div data-reveal="" style={delay(300)} className="flex flex-col rounded-xl bg-paper p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold">
                You see every link you earn
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                The outlet, the article, the domain rating and whether the
                link is still live — checked daily.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: "Quotes sent", v: 38 },
                  { k: "Published", v: 9 },
                  { k: "Live links", v: 7 },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg border border-rule bg-surface p-4">
                    <p className="text-xs text-ink-soft">{s.k}</p>
                    <p className="mt-1 font-display text-2xl font-semibold">
                      <span data-count={s.v} data-count-delay={300}>{s.v}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-rule bg-surface">
                {trackedLinks.map((l) => (
                  <div
                    key={l.site}
                    className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-0"
                  >
                    <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 font-dispatch text-[10px] text-brand">
                      DR {l.dr}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{l.title}</p>
                      <p className="font-dispatch text-[11px] text-ink-soft">{l.site}</p>
                    </div>
                    <span
                      className={`shrink-0 text-xs ${
                        l.status === "live" ? "text-press" : "text-ink-soft"
                      }`}
                    >
                      {l.status === "live" ? "● live" : "checking…"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-ink-soft">
                Illustrative — the layout of your real backlinks dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Anatomy of a placement */}
      <section className="border-y border-rule bg-surface/60">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <Eyebrow>The result</Eyebrow>
          <SectionTitle strong="What a placement" soft="actually looks like" />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div data-reveal="" style={delay(150)}>
              <ArticleMock />
            </div>

            <div data-reveal="" style={delay(300)} className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-xl border border-rule bg-paper">
                <p className="border-b border-rule px-5 py-3 font-dispatch text-[11px] tracking-widest text-ink-soft uppercase">
                  The placement
                </p>
                <dl className="divide-y divide-rule text-sm">
                  {[
                    ["Outlet", <span key="o">retailpulse.com</span>],
                    ["Site quality", <span key="q">DR 78</span>],
                    [
                      "Link given",
                      <span key="l" className="text-brand underline underline-offset-2">
                        northdesk.io
                      </span>,
                    ],
                    ["Link type", <span key="t" className="text-press">dofollow</span>],
                    ["Where", <span key="w">In-body, under your quote</span>],
                    ["Match score", <span key="m">92% · support ops</span>],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-1 flex-col rounded-xl border border-brand/30 bg-brand/[0.08] p-5">
                <p className="font-dispatch text-[11px] tracking-widest text-brand uppercase">
                  The query it answered
                </p>
                <p className="mt-3 text-base leading-7 text-ink">
                  &ldquo;Looking for a founder who&apos;s scaled a support team
                  past 50 people. What broke first?&rdquo;
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5 text-xs">
                  <span className="rounded-full bg-wire/10 px-2.5 py-1 font-dispatch text-wire">
                    Due in 2h
                  </span>
                  <span className="rounded-full bg-press/15 px-2.5 py-1 font-dispatch text-press">
                    Pitched in 6 min
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 font-dispatch text-ink-soft">
                    Live 3 days later
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-ink-soft">
            Illustrative — a fictional outlet and expert, showing how a real
            placement is reported in your dashboard.
          </p>
        </div>
      </section>

      {/* Cost comparison */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
        <Eyebrow>Cost comparison</Eyebrow>
        <SectionTitle
          strong="How we compare"
          soft="to doing it yourself or hiring a PR agency"
        />
        <div data-reveal="" style={delay(150)} className="mt-8 overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[160px_1fr_1fr_1fr] overflow-hidden rounded-2xl border border-rule">
            <div className="border-b border-rule bg-surface/60" />
            <div className="border-b border-l border-rule bg-surface/60 px-6 py-5 font-dispatch text-xs tracking-widest text-ink-soft uppercase">
              Do it yourself
            </div>
            <div className="border-b border-l border-rule bg-surface/60 px-6 py-5 font-dispatch text-xs tracking-widest text-ink-soft uppercase">
              A PR agency
            </div>
            <div className="flex items-center gap-2 border-b border-white/15 bg-brand-solid px-6 py-5 font-dispatch text-xs font-semibold tracking-widest text-white uppercase">
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              Quotarly
            </div>
            {compareRows.map((r, i) => {
              const last = i === compareRows.length - 1;
              const b = last ? "" : "border-b";
              return (
                <Fragment key={r.label}>
                  <div className={`${b} border-rule px-6 py-5 text-sm font-medium text-ink`}>
                    {r.label}
                  </div>
                  <div className={`${b} border-l border-rule px-6 py-5 text-sm text-ink-soft`}>
                    {r.diy}
                  </div>
                  <div className={`${b} border-l border-rule px-6 py-5 text-sm text-ink-soft`}>
                    {r.agency}
                  </div>
                  <div
                    className={`${last ? "" : "border-b border-white/15"} bg-brand-solid px-6 py-5 text-sm font-semibold text-white`}
                  >
                    {r.us}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section className="border-t border-rule bg-surface/60">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <Eyebrow>Under the hood</Eyebrow>
          <SectionTitle strong="More than a pitch bot" soft="— built so nothing embarrassing goes out" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              index={0}
              icon={Target}
              title="Expertise profile"
              body="Your topics, credentials and the subjects you never want to be quoted on. Every query is scored against it."
            >
              <div className="w-full max-w-xs space-y-3">
                <p className="font-dispatch text-[11px] text-ink-soft">Quoted on</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Support ops", "Team scaling", "B2B SaaS", "Hiring"].map((t) => (
                    <span key={t} className="rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="pt-1 font-dispatch text-[11px] text-ink-soft">Never quoted on</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Legal advice", "Crypto"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-dashed border-rule px-2.5 py-1 text-xs text-ink-soft line-through"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index={1}
              icon={ListChecks}
              title="Approval queue"
              body="Prefer to read every quote first? Turn on manual review and drafts wait for you — editable, nothing sent until you approve."
            >
              <div className="w-full max-w-xs rounded-lg border border-rule bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-dispatch text-[11px] text-ink-soft">Founder Weekly</span>
                  <span className="font-dispatch text-[11px] text-wire">Due in 5h</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-ink">
                  &ldquo;Our first ops hire should have been a systems person,
                  not another manager…&rdquo;
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded bg-brand-solid px-2.5 py-1 text-[11px] font-medium text-white">
                    Approve &amp; send
                  </span>
                  <span className="rounded border border-rule px-2.5 py-1 text-[11px] text-ink-soft">
                    Edit
                  </span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index={2}
              icon={ShieldCheck}
              title="Fact guard"
              body="Anything the AI isn't sure about gets a [VERIFY] tag. A draft with an open tag can't be approved until you fix it."
            >
              <div className="w-full max-w-xs rounded-lg border border-rule bg-surface p-4">
                <p className="text-xs leading-5 text-ink">
                  &ldquo;We cut first-response time by{" "}
                  <span className="rounded bg-wire/15 px-1 font-dispatch text-[11px] text-wire">
                    [VERIFY] 40%
                  </span>{" "}
                  in one quarter.&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-rule pt-3">
                  <span className="text-[11px] text-ink-soft">1 tag to resolve</span>
                  <span className="cursor-not-allowed rounded bg-white/5 px-2.5 py-1 text-[11px] text-ink-soft/60">
                    Approve
                  </span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index={3}
              icon={Link2}
              title="Link monitor"
              body="Once an article runs, Quotarly checks daily that your link is there, still dofollow, and hasn't been quietly removed."
            >
              <div className="w-full max-w-xs overflow-hidden rounded-lg border border-rule bg-surface text-xs">
                {[
                  { site: "thegrowthbrief.com", s: "live", c: "text-press" },
                  { site: "founderweekly.co", s: "live", c: "text-press" },
                  { site: "opsjournal.com", s: "removed", c: "text-wire" },
                ].map((r) => (
                  <div
                    key={r.site}
                    className="flex items-center justify-between border-b border-rule px-3 py-2.5 last:border-0"
                  >
                    <span className="font-dispatch text-[11px] text-ink">{r.site}</span>
                    <span className={r.c}>● {r.s}</span>
                  </div>
                ))}
                <p className="bg-paper/60 px-3 py-2 font-dispatch text-[10px] text-ink-soft">
                  Last checked today, 06:00
                </p>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <SectionTitle strong="Built for experts" soft="journalists want to hear from" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {useCases.map((uc, i) => (
              <div key={uc.title} data-reveal="" style={delay(150 + i * 110)} className="rounded-xl border border-rule bg-surface/40 p-7">
                <h3 className="font-display text-xl font-semibold">{uc.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{uc.body}</p>
                <ul className="mt-4 space-y-2 border-t border-rule pt-4 text-sm text-ink">
                  {uc.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-press" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-rule bg-surface/60">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10 py-12 lg:py-16">
          <Eyebrow>Pricing</Eyebrow>
          <SectionTitle strong="One plan," soft="cheaper than one agency week" />
          <div data-reveal="" style={delay(150)} className="card-elevated-brand mt-8 grid overflow-hidden rounded-2xl border border-brand/40 bg-paper lg:grid-cols-[1fr_1.5fr]">
            <div className="flex flex-col border-b border-rule bg-gradient-to-b from-brand/[0.14] to-transparent p-7 sm:p-9 lg:border-r lg:border-b-0">
              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Everything Quotarly does, for one expert.
              </p>
              <p className="mt-8 font-display text-6xl font-semibold tracking-tight">
                ${plan.price}
                <span className="ml-1 text-base font-normal text-ink-soft">/month</span>
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-solid px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
              >
                Start getting quoted
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-4 text-center text-xs text-ink-soft">
                Cancel anytime · No setup fees
              </p>
            </div>
            <div className="grid content-center gap-8 p-7 sm:grid-cols-3 sm:p-9">
              {plan.groups.map((g) => (
                <div key={g.title}>
                  <p className="font-dispatch text-[11px] font-medium tracking-widest text-brand uppercase">
                    {g.title}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-ink">
                    {g.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-press" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <Link href="/pricing" className="text-sm font-medium text-brand hover:underline">
              See full plan details →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-rule">
        <div className="mx-auto grid max-w-[88rem] gap-12 px-6 lg:px-10 py-12 lg:grid-cols-[1fr_1.6fr] lg:py-16">
          <div>
            <SectionTitle strong="FAQs" />
            <p className="mt-5 text-sm leading-6 text-ink-soft">
              Something else on your mind? Email{" "}
              <a href="mailto:hello@quotarly.com" className="text-brand hover:underline">
                hello@quotarly.com
              </a>
              .
            </p>
          </div>
          <div className="divide-y divide-rule border-y border-rule">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-ink">
                  {f.q}
                  <span className="ml-4 text-ink-soft group-open:hidden">+</span>
                  <span className="ml-4 hidden text-ink-soft group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative isolate overflow-hidden border-t border-rule bg-brand-solid">
        <div className="glow-field">
          <div
            className="glow-blob h-[360px] w-[360px] bg-white"
            style={{ top: "-120px", left: "10%", opacity: 0.15 }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center text-white lg:py-20">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Your next press mention is already in someone&apos;s inbox
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">
            Onboarding takes a few minutes. The first matches usually show up
            within a day.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-medium text-brand-solid transition-colors hover:bg-white/90"
            >
              Start getting quoted
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Small building blocks ----------------------------------------------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p data-reveal="" className="font-dispatch text-xs font-medium tracking-[0.18em] text-brand uppercase">
      {children}
    </p>
  );
}

/** Two-tone heading: the key phrase in full ink, the rest dimmed. */
function SectionTitle({ strong, soft, tail }: { strong: string; soft?: string; tail?: string }) {
  return (
    <h2 data-reveal="" style={delay(80)} className="mt-2 font-display text-3xl leading-[1.1] font-semibold tracking-tight lg:text-4xl">
      {strong}
      {soft && <span className="text-ink-soft/60"> {soft}</span>}
      {tail && <> {tail}</>}
    </h2>
  );
}

function IconList({
  items,
  tone,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  tone: "soft" | "brand";
}) {
  return (
    <ul className="mt-auto grid gap-x-6 gap-y-2.5 xl:grid-cols-2">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-2.5 text-sm leading-6">
          <Icon
            className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "brand" ? "text-brand" : "text-ink-soft"}`}
            aria-hidden="true"
          />
          <span className={tone === "brand" ? "text-ink" : "text-ink-soft"}>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// --- Illustrations -------------------------------------------------------

// Positions are in a 600×500 box; the HTML cards sit on top of the SVG lines.
const NET_CENTER = { x: 300, y: 250 };
const netNodes = [
  { x: 95, y: 70, label: "SaaS newsletter", score: 92, match: true },
  { x: 300, y: 45, label: "National daily", score: 34 },
  { x: 505, y: 70, label: "Founder podcast", score: 81, match: true },
  { x: 70, y: 250, label: "Retail trade desk", score: 22 },
  { x: 530, y: 250, label: "Tech outlet", score: 88, match: true },
  { x: 95, y: 430, label: "Personal finance", score: 18 },
  { x: 300, y: 455, label: "HR magazine", score: 74, match: true },
  { x: 505, y: 430, label: "Travel blog", score: 9 },
];

function RoutingNetwork() {
  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-2xl" aria-hidden="true">
      <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full">
        {netNodes.map((n) => (
          <line
            key={n.label}
            x1={n.x}
            y1={n.y}
            x2={NET_CENTER.x}
            y2={NET_CENTER.y}
            stroke={n.match ? "var(--brand)" : "var(--ink-soft)"}
            strokeOpacity={n.match ? 0.9 : 0.3}
            strokeWidth={n.match ? 1.5 : 1}
            strokeDasharray={n.match ? undefined : "4 5"}
          />
        ))}
        <g className="motion-reduce:hidden">
          {netNodes
            .filter((n) => n.match)
            .map((n, i) => (
              <circle key={n.label} r="3.5" fill="var(--brand)">
                <animateMotion
                  dur="2.4s"
                  begin={`${i * 0.6}s`}
                  repeatCount="indefinite"
                  path={`M${n.x},${n.y} L${NET_CENTER.x},${NET_CENTER.y}`}
                />
              </circle>
            ))}
        </g>
      </svg>

      {netNodes.map((n) => (
        <div
          key={n.label}
          className={`absolute w-[29%] max-w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-2 ${
            n.match ? "border-brand/50 bg-paper shadow-lg shadow-brand/10" : "border-rule bg-paper/90 opacity-55"
          }`}
          style={{ left: `${(n.x / 600) * 100}%`, top: `${(n.y / 500) * 100}%` }}
        >
          <p className="truncate text-[10px] text-ink-soft sm:text-[11px]">{n.label}</p>
          <div className="mt-1 flex items-center justify-between gap-1">
            <span className="h-1 flex-1 rounded-full bg-rule">
              <span
                className={`block h-1 rounded-full ${n.match ? "bg-brand" : "bg-ink-soft/50"}`}
                style={{ width: `${n.score}%` }}
              />
            </span>
            <span
              className={`font-dispatch text-[10px] ${n.match ? "text-brand" : "text-ink-soft"}`}
            >
              {n.score}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute top-1/2 left-1/2 w-[34%] max-w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-brand/60 bg-surface p-3 text-center shadow-2xl shadow-brand/25">
        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand-solid font-display text-sm font-semibold text-white">
          You
        </span>
        <p className="mt-2 font-dispatch text-[10px] tracking-widest text-brand uppercase">
          Your profile
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink-soft">Support ops · SaaS</p>
      </div>
    </div>
  );
}

function ArticleMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-paper">
      <div className="flex items-center gap-3 border-b border-rule bg-surface px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="min-w-0 flex-1 truncate rounded-md bg-paper px-3 py-1 font-dispatch text-[11px] text-ink-soft">
          https://retailpulse.com/cx/the-handoff-problem
        </span>
        <span className="hidden shrink-0 rounded-full border border-brand/50 px-2.5 py-0.5 text-[11px] text-brand sm:inline">
          View article ↗
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <p className="font-dispatch text-[11px] tracking-widest text-ink-soft uppercase">
          Customer experience
        </p>
        <h3 className="mt-2 font-display text-xl leading-tight font-semibold sm:text-2xl">
          The handoff problem: why support teams break at 50 people
        </h3>
        <p className="mt-2 text-xs text-ink-soft">Updated Nov 3, 2026 · 6 min read</p>

        <div
          className="mt-4 h-24 rounded-lg border border-rule sm:h-28"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, color-mix(in srgb, var(--brand) 45%, transparent), transparent 55%), radial-gradient(circle at 80% 75%, color-mix(in srgb, var(--press) 30%, transparent), transparent 50%), linear-gradient(135deg, var(--surface), var(--paper))",
          }}
          aria-hidden="true"
        />

        <p className="mt-5 text-sm leading-7 text-ink-soft">
          Most teams assume growing pains come from hiring too slowly. The
          founders we spoke to described something else entirely.
        </p>
        <blockquote className="mt-4 rounded-r-lg border-l-2 border-brand bg-brand/[0.08] py-3 pr-4 pl-4 text-sm leading-7 text-ink">
          &ldquo;The first thing that broke wasn&apos;t headcount, it was
          handoffs — tickets sat untouched between shifts,&rdquo; says Dana
          Reyes, founder of{" "}
          <span className="font-medium text-brand underline underline-offset-2">Northdesk</span>.
          <span className="mt-2 flex items-center gap-1.5 font-dispatch text-[11px] text-press">
            <Link2 className="h-3 w-3" aria-hidden="true" />
            Your quote · your link
          </span>
        </blockquote>
        <div className="mt-5 space-y-2" aria-hidden="true">
          <span className="block h-2 w-full rounded bg-white/5" />
          <span className="block h-2 w-11/12 rounded bg-white/5" />
          <span className="block h-2 w-3/4 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  index,
  icon: Icon,
  title,
  body,
  children,
}: {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div data-reveal="" style={delay(150 + index * 110)} className="flex flex-col rounded-xl border border-rule bg-paper p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <Icon className="h-5 w-5 shrink-0 text-ink-soft" />
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-surface/60 px-3 py-6">
        {children}
      </div>
    </div>
  );
}

function QueryTimeline() {
  return (
    <div data-reveal="" data-reveal-play="" className="card-elevated-brand rounded-xl border border-rule bg-surface p-5 sm:p-6">
      <p className="font-sans text-sm font-medium text-ink-soft">
        One query, start to finish
      </p>
      <ol className="mt-5">
        {dispatch.map((item, i) => {
          const isLast = i === dispatch.length - 1;
          return (
            <li
              key={item.label}
              className="flex gap-4 motion-safe:animate-[fade-in-up_0.5s_ease-out_backwards]"
              style={{ animationDelay: `${300 + i * 450}ms` }}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                />
                {!isLast && <span className="my-1 w-px flex-1 bg-rule" />}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <p className="flex items-baseline gap-2">
                  <span className={`font-sans text-sm font-semibold ${item.color}`}>
                    {item.label}
                  </span>
                  <span className="font-dispatch text-[11px] text-ink-soft">
                    {item.time}
                  </span>
                </p>
                <div className="mt-2">{item.body}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-ink-soft">
        Illustrative — this is what happens after you onboard.
      </p>
    </div>
  );
}
