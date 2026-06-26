/**
 * create-customer-portal-session — patient billing self-service.
 *
 * Authenticated patients get a Stripe Billing Portal session to view invoices,
 * update their card, and cancel/manage their ELEVATED membership. We resolve the
 * Stripe customer from the patient's email (the same identity used at checkout).
 *
 * If the Stripe account has no Billing Portal configuration yet, we create a
 * sensible default one and retry, so this works without manual dashboard setup.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Not authenticated");

    // Resolve the patient row for this authenticated user.
    const { data: patient, error: patErr } = await supabase
      .from("patients")
      .select("id, email")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (patErr) throw patErr;

    const email = (patient?.email || userData.user.email || "").toLowerCase().trim();
    if (!email) throw new Error("No email on file for billing portal");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({
          error: "no_billing_account",
          message: "We couldn't find a billing account yet. It is created with your first payment.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const customerId = customers.data[0].id;
    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    const returnUrl = `${origin}/patient/dashboard`;

    const createSession = () =>
      stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });

    let session;
    try {
      session = await createSession();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Self-bootstrap a default portal configuration if none exists yet.
      if (msg.toLowerCase().includes("configuration")) {
        await stripe.billingPortal.configurations.create({
          business_profile: { headline: "Elevated Health Augusta — manage your membership" },
          features: {
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            customer_update: { enabled: true, allowed_updates: ["email", "address", "phone"] },
            subscription_cancel: { enabled: true, mode: "at_period_end" },
          },
        });
        session = await createSession();
      } else {
        throw err;
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
