import { createClient } from "@/lib/supabase/server";
import { buildCheckoutUrl, type PlanId } from "@/lib/lemonsqueezy/checkout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three ways to run Quotarly, from a single expert profile to a five-profile agency plan.",
};

const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  featured?: boolean;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    features: ["1 expert profile", "~50 personalized pitches a month"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    featured: true,
    features: [
      "1 expert profile",
      "150+ personalized pitches a month",
      "Live tracking dashboard",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 499,
    features: ["5 expert profiles", "Priority support"],
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Pricing
      </h1>
      <p className="mt-3 text-ink-soft">Cancel anytime. No setup fees.</p>

      <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col bg-paper p-6 ${
              plan.featured ? "border-t-4 border-wire" : "border-t-4 border-transparent"
            }`}
          >
            <p
              className={`text-sm ${plan.featured ? "text-wire" : "text-ink-soft"}`}
            >
              {plan.featured ? "Most chosen" : " "}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {plan.name}
            </h2>
            <p className="mt-3 font-display text-3xl font-semibold">
              ${plan.price}
              <span className="text-sm font-normal text-ink-soft">/mo</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-soft">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            {user ? (
              <a
                href={buildCheckoutUrl(plan.id, user.id, user.email!)}
                className="mt-6 rounded-sm bg-ink px-4 py-2 text-center text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Subscribe
              </a>
            ) : (
              <Link
                href="/login"
                className="mt-6 rounded-sm bg-ink px-4 py-2 text-center text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Log in to subscribe
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
