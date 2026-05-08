import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEMAGLUTIDE_PRICES = {
  member:    { priceId: "price_1TUs38EOtKRY99puPpc6SFMs", amount: 19900, label: "$199/mo (Elevated Member)" },
  nonmember: { priceId: "price_1TUs3AEOtKRY99puDOseqLDZ", amount: 24900, label: "$249/mo (Non-Member)" },
};

const log = (step: string, details?: unknown) =>
  console.log(`[SEMAGLUTIDE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name, patientId } = await req.json();
    log("Request", { email, patientId });

    // Look up elevated_membership_status
    let isElevatedMember = false;
    let lookupQuery = supabaseClient.from("patients").select("elevated_membership_status, email");
    const { data: patient } = patientId
      ? await lookupQuery.eq("id", patientId).maybeSingle()
      : email
        ? await lookupQuery.eq("email", email).maybeSingle()
        : { data: null };

    if (patient?.elevated_membership_status === "active") {
      isElevatedMember = true;
    }

    const priceConfig = isElevatedMember ? SEMAGLUTIDE_PRICES.member : SEMAGLUTIDE_PRICES.nonmember;
    log("Routing", { isElevatedMember, price: priceConfig.label });

    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [{ price: priceConfig.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/payment-success?type=semaglutide`,
      cancel_url: `${origin}/weight-loss`,
      metadata: {
        service_type: "semaglutide_membership",
        patient_name: name || "",
        patient_email: email || "",
        patient_id: patientId || "",
        elevated_member: isElevatedMember ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          service_type: "semaglutide_membership",
          patient_name: name || "",
          elevated_member: isElevatedMember ? "true" : "false",
        },
      },
    });

    if (email) {
      await supabaseClient.from("consultation_bookings").insert({
        customer_email: email,
        customer_name: name || null,
        service_type: "semaglutide_membership",
        status: "pending_payment",
        stripe_session_id: session.id,
        notes: `Semaglutide — ${priceConfig.label}`,
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
