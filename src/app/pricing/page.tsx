import { createClient } from "@/lib/supabase/server";
import { buildCheckoutUrl, type PlanId } from "@/lib/lemonsqueezy/checkout";
import Link from "next/link";

const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    features: ["1 expert profile", "~50 personalized pitches / month"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 200,
    features: [
      "1 expert profile",
      "150+ personalized pitches / month",
      "Live tracking dashboard",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 500,
    features: ["5 expert profiles", "Priority support"],
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Cancel anytime. No setup fees.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-xl border p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>

            {user ? (
              <a
                href={buildCheckoutUrl(plan.id, user.id, user.email!)}
                className="mt-6 rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white"
              >
                Subscribe
              </a>
            ) : (
              <Link
                href="/login"
                className="mt-6 rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white"
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
