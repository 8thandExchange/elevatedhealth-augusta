import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const PAUBOX_SMTP_PASSWORD = Deno.env.get("PAUBOX_SMTP_PASSWORD");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema matching frontend
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[0-9+\(\)\-\s]+$/, "Phone number can only contain numbers and +()-").max(20, "Phone number must be less than 20 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters")
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing contact form submission...");
    
    const requestData = await req.json();
    console.log("Received data for:", requestData.name);

    // Validate input with zod
    const validatedData = contactSchema.parse(requestData);
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // Send email via Paubox HIPAA-compliant SMTP (port 465 with implicit TLS)
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
                  <div class="field-value">${validatedData.name}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value">
                    <a href="mailto:${validatedData.email}">${validatedData.email}</a>
                  </div>
                </div>
                
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value">
                    <a href="tel:${validatedData.phone}">${validatedData.phone}</a>
                  </div>
                </div>
                
                <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="message-box">${validatedData.message}</div>
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
        message: "Contact form submitted successfully"
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
        error: "Failed to send email",
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
