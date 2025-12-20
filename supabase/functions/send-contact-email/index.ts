import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAUBOX_SMTP_PASSWORD = Deno.env.get("PAUBOX_SMTP_PASSWORD");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: 5 requests per IP per 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
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

const escapeHtml = (str: string): string => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[0-9+\(\)\-\s]+$/, "Phone number can only contain numbers and +()-").max(20, "Phone number must be less than 20 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  _fax: z.string().optional() // Honeypot field - named to avoid browser autofill
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   req.headers.get("x-real-ip") || 
                   "unknown";
  
  const rateLimitCheck = checkRateLimit(clientIP);
  if (!rateLimitCheck.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: "Too many requests",
        message: "Please wait before submitting another message",
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

  try {
    console.log("Processing contact form submission...");
    
    const requestData = await req.json();
    console.log("Received data for:", requestData.name);

    const validatedData = contactSchema.parse(requestData);
    
    // Honeypot check - if filled, it's a bot
    if (validatedData._fax && validatedData._fax.length > 0) {
      console.log("Honeypot triggered - bot detected");
      // Return success to not alert the bot, but don't process
      return new Response(
        JSON.stringify({ success: true, message: "Message received" }), 
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Insert lead into database using service role (bypasses RLS)
    console.log("Inserting lead into chat_leads table...");
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("chat_leads")
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        chat_summary: validatedData.message,
        interest: "contact_form",
        source: "website_contact",
        status: "new"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert failed:", insertError);
      throw new Error(`Failed to save lead: ${insertError.message}`);
    }
    
    console.log("Lead saved successfully with ID:", insertData?.id);
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // Send email via Paubox HIPAA-compliant SMTP
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.paubox.com",
        port: 465,
        tls: true,
        auth: {
          username: "care@elevatedhealthaugusta.com",
          password: PAUBOX_SMTP_PASSWORD!,
        },
      },
    });

    await client.send({
      from: "care@elevatedhealthaugusta.com",
      to: "care@elevatedhealthaugusta.com",
      replyTo: validatedData.email,
      subject: "New Elevated Health Augusta Inquiry",
      content: "auto",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .field { margin-bottom: 20px; }
              .field-label { font-weight: bold; color: #1e40af; margin-bottom: 5px; }
              .field-value { background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
              .message-box { background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; min-height: 100px; white-space: pre-wrap; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
              a { color: #1e40af; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">Name:</div>
                  <div class="field-value">${escapeHtml(validatedData.name)}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value">
                    <a href="mailto:${escapeHtml(validatedData.email)}">${escapeHtml(validatedData.email)}</a>
                  </div>
                </div>
                
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value">
                    <a href="tel:${escapeHtml(validatedData.phone)}">${escapeHtml(validatedData.phone)}</a>
                  </div>
                </div>
                
                <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="message-box">${escapeHtml(validatedData.message)}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Submitted:</div>
                  <div class="field-value">${timestamp}</div>
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from the Elevated Health Augusta website contact form.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    await client.close();

    console.log("Email sent successfully via Paubox HIPAA-compliant SMTP");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully",
        leadId: insertData?.id
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Validation error",
          details: error.errors[0].message 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: "Failed to process contact form",
        message: error.message || "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
