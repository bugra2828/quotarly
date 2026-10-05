const PADDLE_API_BASE =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

// Cancels immediately rather than at period end — matches the "Cancel
// anytime" promise on the pricing page and avoids the extra state (pending
// cancellation vs. canceled) a Starter-only product doesn't need.
export async function cancelPaddleSubscription(subscriptionId: string): Promise<void> {
  const res = await fetch(`${PADDLE_API_BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ effective_from: "immediately" }),
  });

  if (!res.ok) {
    throw new Error(`Paddle cancel failed: ${res.status} ${await res.text()}`);
  }
}
