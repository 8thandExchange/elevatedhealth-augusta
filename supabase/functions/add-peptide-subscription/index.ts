import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveMemberCouponForCheckout } from "../_shared/member-discount.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-PEPTIDE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin/staff authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check if user has admin or staff role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasAccess = hasClinicStaffRole((roles ?? []).map((r) => String(r.role)));
    if (!hasAccess) throw new Error("Unauthorized: clinic staff role required");
    logStep("Authorization verified");

    const { patient_email, price_id, peptide_type, is_recurring } = await req.json();
    logStep("Request body", { patient_email, price_id, peptide_type, is_recurring });

    if (!patient_email || !price_id) {
      throw new Error("Missing required fields: patient_email, price_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Resolve ELEVATED member 20% discount. Peptides are à la carte (never a
    // bundled program medication), so any active member is eligible. We look up
    // the patient by email to read their membership state server-side.
    const { data: patientRow } = await supabaseClient
      .from("patients")
      .select("id")
      .eq("email", patient_email)
      .maybeSingle();
    const discount = await resolveMemberCouponForCheckout(
      supabaseClient,
      patientRow?.id ?? null,
      "peptide",
      { stripe },
    );
    logStep("Member discount resolved", {
      patient_id: patientRow?.id ?? null,
      applied_discount: discount.applied_discount,
    });

    // Find customer in Stripe
    const customers = await stripe.customers.list({ email: patient_email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    // À la carte peptides are sold as their own discounted checkout — never merged
    // into the patient's membership subscription (which would co-mingle billing and
    // prevent a clean peptide-only member discount). Active members get 20% off via
    // the ELEVATED member coupon; if the coupon is ever invalid we retry without it
    // so a checkout can never hard-fail on the discount.
    const baseParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : patient_email,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: is_recurring ? "subscription" : "payment",
      success_url: `${origin}/provider/dashboard?${is_recurring ? "peptide_added" : "peptide_purchased"}=true`,
      cancel_url: `${origin}/provider/dashboard`,
      metadata: {
        peptide_type: peptide_type ?? "",
        patient_email,
        applied_discount: discount.applied_discount,
      },
    };

    let session;
    if (discount.discounts && discount.discounts.length > 0) {
      try {
        session = await stripe.checkout.sessions.create({ ...baseParams, discounts: discount.discounts });
      } catch (couponErr) {
        logStep("Coupon application failed, retrying at full price", {
          message: couponErr instanceof Error ? couponErr.message : String(couponErr),
        });
        session = await stripe.checkout.sessions.create({
          ...baseParams,
          metadata: { ...baseParams.metadata, applied_discount: "none" },
        });
      }
    } else {
      session = await stripe.checkout.sessions.create(baseParams);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
