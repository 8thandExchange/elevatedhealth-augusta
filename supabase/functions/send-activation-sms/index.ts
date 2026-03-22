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
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
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

// Simplified Stripe price IDs
const PRICE_IDS = {
  semaglutide: "price_1SlZnwEOtKRY99puaBhrh2iB", // $399/mo
  tirzepatide: "price_1SlZnyEOtKRY99puE9JNOrTR", // $499/mo
  vitality: "price_1Sga64EOtKRY99pu6NpP45Qq", // $249/mo
  hormoneAddon: "price_1SmMlOEOtKRY99puBAxTpw99", // $149/mo
};

const BASE_PRICES: Record<string, number> = {
  semaglutide: 399,
  tirzepatide: 499,
  vitality: 249,
};

const HORMONE_ADDON_PRICE = 149;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabaseAuth = createClient(supabaseUrl!, supabaseAnonKey!);
    
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
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
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
      base_membership = "semaglutide", 
      include_hormone_addon = false,
      patient_email,
      patient_id,
      send_email = false,
    } = body;

    logStep("Request body received", { first_name, phone, base_membership, include_hormone_addon, patient_email, send_email });

    if (!first_name) {
      throw new Error("Missing required field: first_name is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items based on selected membership
    const lineItems: Array<{ price: string; quantity: number }> = [];

    // Add base membership
    const basePriceId = PRICE_IDS[base_membership as keyof typeof PRICE_IDS];
    if (!basePriceId) {
      throw new Error(`Invalid base membership: ${base_membership}`);
    }
    lineItems.push({ price: basePriceId, quantity: 1 });
    logStep("Added base membership", { base_membership, price_id: basePriceId });

    // Add hormone add-on if selected
    if (include_hormone_addon) {
      lineItems.push({ price: PRICE_IDS.hormoneAddon, quantity: 1 });
      logStep("Added hormone addon", { price_id: PRICE_IDS.hormoneAddon });
    }

    // Calculate total for email
    const basePrice = BASE_PRICES[base_membership] || 399;
    const addonPrice = include_hormone_addon ? HORMONE_ADDON_PRICE : 0;
    const totalMonthly = basePrice + addonPrice;

    // Create Stripe Checkout session for subscription
    const origin = req.headers.get("origin") || "https://reveil.health";
    
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
        include_hormone_addon: String(include_hormone_addon),
      },
    });

    logStep("Stripe Checkout session created", { sessionId: session.id, url: session.url });

    const paymentLink = session.url;
    let emailSent = false;

    // Send email if requested
    if (send_email && patient_email && resendKey) {
      try {
        const resend = new Resend(resendKey);
        
        const membershipName = base_membership === "tirzepatide" 
          ? "Tirzepatide Membership" 
          : base_membership === "vitality"
          ? "Vitality Membership"
          : "Semaglutide Membership";
        
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
              .breakdown { background: white; border-radius: 8px; padding: 15px; margin: 15px 0; }
              .footer { text-align: center; color: #7F8C8D; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Réveil</div>
              </div>
              <div class="content">
                <h2>Hi ${first_name},</h2>
                <p>Great news! Your personalized treatment plan is ready.</p>
                
                <div class="breakdown">
                  <p><strong>${membershipName}:</strong> $${basePrice}/mo</p>
                  ${include_hormone_addon ? `<p><strong>Hormone Add-On:</strong> +$${HORMONE_ADDON_PRICE}/mo</p>` : ''}
                </div>
                
                <p class="price">Total: $${totalMonthly}/month</p>
                <p>Click the secure button below to activate your membership:</p>
                <div style="text-align: center;">
                  <a href="${paymentLink}" class="cta-button">Activate My Membership</a>
                </div>
                <p style="font-size: 14px; color: #7F8C8D;">If the button doesn't work, copy and paste this link into your browser:<br/>${paymentLink}</p>
              </div>
              <div class="footer">
                <p>Questions? Call us at (706) 426-7383</p>
                <p>Réveil<br/>7013 Evans Town Center Blvd, Suite 203<br/>Evans, GA 30809</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Réveil <noreply@stripe.reveil.health>",
          to: [patient_email],
          subject: "Réveil: Your Membership is Ready to Activate",
          html: emailHtml,
        });

        logStep("Email sent successfully", { emailResponse });
        emailSent = true;
      } catch (emailError) {
        logStep("Email send error", { error: String(emailError) });
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
            addon_tier: include_hormone_addon ? "hormone_addon" : "none",
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