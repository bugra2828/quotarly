"use client";

import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { PADDLE_PRICE_IDS, type PlanId } from "@/lib/paddle/checkout";

let paddleInstance: Paddle | undefined;

async function getPaddle() {
  if (paddleInstance) return paddleInstance;
  paddleInstance = await initializePaddle({
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
        ? "sandbox"
        : "production",
  });
  return paddleInstance;
}

export function CheckoutButton({
  plan,
  userId,
  email,
  className,
  children,
}: {
  plan: PlanId;
  userId: string;
  email: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const paddle = await getPaddle();
    paddle?.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_IDS[plan], quantity: 1 }],
      customer: { email },
      customData: { user_id: userId },
    });
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading…" : children}
    </button>
  );
}
