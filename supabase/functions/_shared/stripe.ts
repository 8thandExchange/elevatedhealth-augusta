// Direct Stripe REST calls via fetch. Deliberately avoids the Stripe SDK so
// there is no esm.sh version to keep in sync with the repo's other functions.
const STRIPE_API = "https://api.stripe.com/v1";

function secret(): string {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("missing_stripe_env");
  return key;
}

type StripeBody = Record<string, string | number | undefined>;

function encode(body: StripeBody): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  return params.toString();
}

async function call(method: string, path: string, body?: StripeBody) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? encode(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `stripe_error:${res.status}:${data?.error?.message ?? "unknown"}`,
    );
  }
  return data;
}

export const stripe = {
  getPaymentIntent: (id: string) =>
    call("GET", `/payment_intents/${encodeURIComponent(id)}`),

  // One-time, single-use coupon scoped to the redemption. amount_off is in the
  // smallest currency unit (cents). duration=once means it applies to a single
  // invoice only, which is what caps the credit at the first month.
  createOnceCoupon: (amountOffCents: number, currency = "usd", name = "EHA onboarding lab credit") =>
    call("POST", "/coupons", {
      amount_off: amountOffCents,
      currency,
      duration: "once",
      max_redemptions: 1,
      name,
    }),

  deleteCoupon: (id: string) =>
    call("DELETE", `/coupons/${encodeURIComponent(id)}`),
};
