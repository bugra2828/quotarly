import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Quotarly turns journalist queries into quotes you approve, and quotes into backlinks it tracks for you.",
};

const stages = [
  {
    title: "Onboarding",
    swatch: "bg-brand",
    body: "You give Quotarly your site, your bio, the topics you'll talk about and the ones you won't, and a few quotes that sound like you. It reads your site and drafts a first pass at your profile — you correct anything it got wrong.",
  },
  {
    title: "Match & draft",
    swatch: "bg-press",
    body: "Quotarly watches the queries coming in from the journalist sources we monitor. Each one is scored against your profile. Anything below your bar is dropped silently — no noise in your inbox. Anything above it gets a quote drafted in your voice, built from your bio and past answers.",
  },
  {
    title: "We send, you're in control",
    swatch: "bg-wire",
    body: "By default, a quote that clears your bar goes out the moment it's drafted — fast enough to beat the deadline. Prefer to read every one first? Turn on manual review in your dashboard and nothing sends until you approve it.",
  },
  {
    title: "Track the link",
    swatch: "bg-press",
    body: "Once a journalist publishes, Quotarly checks daily whether your link showed up, whether it's still there, and whether it's the kind of link that actually helps your site's authority. You see it in your dashboard, not in a monthly PDF.",
  },
];

const timeline = [
  {
    period: "Day one",
    body: "Onboarding, plus a first read of what's currently moving through the journalist sources we monitor in your topics.",
  },
  {
    period: "First week",
    body: "Matching quotes start going out as relevant queries come in. How many depends entirely on how much journalists are asking about your specific expertise that week.",
  },
  {
    period: "Ongoing",
    body: "Quotes go out before their deadlines. Quotarly checks published articles daily and adds confirmed links to your dashboard as they appear.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        How it works
      </h1>
      <p className="mt-4 text-ink-soft">
        Four stages — review is optional, everything else runs on its own.
      </p>

      <div className="mt-14 space-y-12">
        {stages.map((stage, i) => (
          <div key={stage.title}>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-[3px] font-dispatch text-sm font-medium text-white ${stage.swatch}`}
            >
              {i + 1}
            </span>
            <h2 className="mt-3 font-display text-xl font-semibold">
              {stage.title}
            </h2>
            <p className="mt-2 leading-7 text-ink-soft">{stage.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 border-t border-rule pt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          What to expect, and when
        </h2>
        <div className="mt-8 space-y-8">
          {timeline.map((row) => (
            <div key={row.period} className="sm:flex sm:gap-8">
              <p className="font-dispatch text-sm text-ink-soft sm:w-32 sm:flex-none">
                {row.period}
              </p>
              <p className="mt-1 leading-7 text-ink-soft sm:mt-0">
                {row.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
