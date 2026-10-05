import { getSessionUser } from "@/lib/supabase/session";
import { CheckoutButton } from "./CheckoutButton";
import type { PlanId } from "@/lib/paddle/checkout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One plan: an expert profile pitched into up to 200 journalist queries a month.",
};

const PLAN: {
  id: PlanId;
  name: string;
  price: number;
  features: string[];
} = {
  id: "starter",
  name: "Starter",
  price: 149,
  features: [
    "1 expert profile",
    "Up to 200 personalized pitches a month",
    "Live tracking dashboard",
  ],
};

export default async function PricingPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Pricing
      </h1>
      <p className="mt-3 text-ink-soft">Cancel anytime. No setup fees.</p>

      <div className="mt-12 max-w-sm">
        <div className="card-elevated-brand flex flex-col rounded-md border-2 border-brand bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">{PLAN.name}</h2>
          <p className="mt-3 font-display text-3xl font-semibold">
            ${PLAN.price}
            <span className="text-sm font-normal text-ink-soft">/mo</span>
          </p>
          <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-soft">
            {PLAN.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          {user ? (
            <CheckoutButton
              plan={PLAN.id}
              userId={user.id}
              email={user.email!}
              className="mt-6 rounded-full bg-brand-solid px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Subscribe
            </CheckoutButton>
          ) : (
            <Link
              href="/login"
              className="mt-6 rounded-full bg-brand-solid px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
            >
              Log in to subscribe
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
