import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ACTIVATION] ${step}${detailsStr}`);
};

// Rate limiting: 10 requests per user per 5 minutes
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
};

// Stripe price IDs for memberships and add-ons
const PRICE_IDS = {
  // Base memberships
  metabolic: "price_1SZiXTEOtKRY99puR7PQUExU", // $399/mo Metabolic Membership
  vitality: "price_1SZickEOtKRY99pu7j2PtWZm", // $199/mo Vitality Membership
  // Hormone add-on tiers
  tier1: "price_1SZijiEOtKRY99puzJbPH0H0", // $75/mo Tier 1 - Single Hormone
  tier2: "price_1SZj9tEOtKRY99pujZd5xMd9", // $125/mo Tier 2 - Dual Hormone
  tier3: "price_1SZjAAEOtKRY99puFwqI2CTV", // $175/mo Tier 3 - Trifecta
};

const BASE_PRICES: Record<string, number> = {
  metabolic: 399,
  vitality: 199,
};

const ADDON_PRICES: Record<string, number> = {
  none: 0,
  tier1: 75,
  tier2: 125,
  tier3: 175,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Create client for auth verification
    const supabaseAuth = createClient(supabaseUrl!, supabaseAnonKey!);
    
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized: No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !userData.user) {
      logStep("ERROR: Invalid token", { error: authError?.message });
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId: userData.user.id });
    
    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Verify user has admin or staff role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    
    if (rolesError) {
      logStep("ERROR: Failed to fetch roles", { error: rolesError.message });
      return new Response(JSON.stringify({ error: "Failed to verify permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const hasPermission = roles?.some(r => r.role === "admin" || r.role === "staff" || r.role === "business_admin");
    if (!hasPermission) {
      logStep("ERROR: Insufficient permissions", { userId: userData.user.id, roles });
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    logStep("Authorization verified", { userId: userData.user.id, roles });

    // Rate limiting by user ID
    const rateLimitCheck = checkRateLimit(userData.user.id);
    if (!rateLimitCheck.allowed) {
      logStep("Rate limit exceeded", { userId: userData.user.id });
      return new Response(
        JSON.stringify({ 
          error: "Too many requests",
          message: "Please wait before generating another activation link",
          retryAfter: rateLimitCheck.retryAfter
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitCheck.retryAfter),
            ...corsHeaders 
          },
        }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    logStep("Resend key check", { hasKey: !!resendKey });

    const body = await req.json();
    const { 
      first_name, 
      phone, 
      base_membership = "metabolic", 
      addon_tier = "none",
      patient_email,
      patient_id,
      send_email = false,
    } = body;

    logStep("Request body received", { first_name, phone, base_membership, addon_tier, patient_email, send_email });

    if (!first_name) {
      throw new Error("Missing required field: first_name is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items based on selected membership and tier
    const lineItems: Array<{ price: string; quantity: number }> = [];

    // Add base membership
    const basePriceId = PRICE_IDS[base_membership as keyof typeof PRICE_IDS];
    if (!basePriceId) {
      throw new Error(`Invalid base membership: ${base_membership}`);
    }
    lineItems.push({ price: basePriceId, quantity: 1 });
    logStep("Added base membership", { base_membership, price_id: basePriceId });

    // Add hormone add-on tier if selected (not "none")
    if (addon_tier && addon_tier !== "none") {
      const addonPriceId = PRICE_IDS[addon_tier as keyof typeof PRICE_IDS];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        logStep("Added hormone addon tier", { addon_tier, price_id: addonPriceId });
      }
    }

    // Calculate total for email
    const basePrice = BASE_PRICES[base_membership] || 399;
    const addonPrice = ADDON_PRICES[addon_tier] || 0;
    const totalMonthly = basePrice + addonPrice;

    // Create Stripe Checkout session for subscription
    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email || undefined,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=activated`,
      cancel_url: `${origin}/`,
      metadata: {
        first_name,
        phone: phone || "",
        base_membership,
        addon_tier,
      },
    });

    logStep("Stripe Checkout session created", { sessionId: session.id, url: session.url });

    const paymentLink = session.url;
    let emailSent = false;

    // Send email if requested and we have the email
    if (send_email && patient_email && resendKey) {
      try {
        const resend = new Resend(resendKey);
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #2C3E50; }
              .content { background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
              .cta-button { display: inline-block; background: #2C3E50; color: white !important; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .price { font-size: 28px; font-weight: bold; color: #2C3E50; }
              .footer { text-align: center; color: #7F8C8D; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Elevated Health Augusta</div>
              </div>
              <div class="content">
                <h2>Hi ${first_name},</h2>
                <p>Great news! Lauren has reviewed and approved your hormone protocol.</p>
                <p>Your personalized membership is ready to activate:</p>
                <p class="price">$${totalMonthly}/month</p>
                <p>Click the secure button below to activate your membership and finalize your pharmacy order:</p>
                <div style="text-align: center;">
                  <a href="${paymentLink}" class="cta-button">Activate My Membership</a>
                </div>
                <p style="font-size: 14px; color: #7F8C8D;">If the button doesn't work, copy and paste this link into your browser:<br/>${paymentLink}</p>
              </div>
              <div class="footer">
                <p>Questions? Reply to this email or call us at (706) 710-2704</p>
                <p>Elevated Health Augusta<br/>3540 Wheeler Road, Suite 601<br/>Augusta, GA 30909</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: [patient_email],
          subject: "Elevated Health: Your Membership is Ready to Activate",
          html: emailHtml,
        });

        logStep("Email sent successfully", { emailResponse });
        emailSent = true;
      } catch (emailError) {
        logStep("Email send error", { error: String(emailError) });
        // Don't throw - we still want to return the link
      }
    }

    // Track the activation link in the database
    if (patient_email && paymentLink) {
      try {
        const { error: trackingError } = await supabase
          .from("activation_links")
          .insert({
            patient_id: patient_id || null,
            patient_name: first_name,
            patient_email: patient_email,
            patient_phone: phone || null,
            base_membership: base_membership,
            addon_tier: addon_tier,
            total_monthly: totalMonthly,
            stripe_checkout_url: paymentLink,
            status: "pending",
          });

        if (trackingError) {
          logStep("Failed to track activation link", { error: trackingError.message });
        } else {
          logStep("Activation link tracked in database");
        }
      } catch (trackError) {
        logStep("Error tracking activation", { error: String(trackError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
      email_sent: emailSent,
      message: "Activation link generated successfully."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
