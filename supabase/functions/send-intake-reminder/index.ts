import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for patients with incomplete intake...");

    // Find patients who:
    // 1. Have onboarding_status = 'account_created'
    // 2. Created more than 24 hours ago
    // 3. Haven't completed intake (intake_completed = false or null)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: patients, error: fetchError } = await supabase
      .from("patients")
      .select("id, full_name, email, created_at, onboarding_status, primary_program")
      .eq("onboarding_status", "account_created")
      .or("intake_completed.is.null,intake_completed.eq.false")
      .lt("created_at", twentyFourHoursAgo)
      .gt("created_at", fortyEightHoursAgo) // Don't spam patients older than 48 hours
      .not("email", "is", null);

    if (fetchError) {
      console.error("Error fetching patients:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${patients?.length || 0} patients needing intake reminder`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const patient of patients || []) {
      if (!patient.email) continue;

      try {
        const programText = patient.primary_program === 'ketamine' 
          ? 'mental wellness journey'
          : 'wellness transformation';

        await resend.emails.send({
          from: "Réveil <noreply@stripe.reveil.health>",
          to: [patient.email],
          subject: "Don't forget to complete your health profile!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F9F9F7;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="font-family: Georgia, serif; font-size: 28px; color: #2C3E50; margin: 0;">
                    Réveil
                  </h1>
                </div>

                <!-- Main Content -->
                <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
                  <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0;">
                    Hi ${patient.full_name},
                  </h2>
                  
                  <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We noticed you haven't completed your medical intake form yet. Our provider team is ready to review your profile and create your personalized protocol – we just need a few more details from you.
                  </p>

                  <div style="background: linear-gradient(135deg, #D4A017 0%, #C5A059 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <p style="color: white; font-size: 16px; margin: 0 0 16px 0;">
                      Complete your intake in just 5-10 minutes
                    </p>
                    <a href="https://reveil.health/patient/intake" 
                       style="display: inline-block; background: white; color: #D4A017; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Continue My Intake →
                    </a>
                  </div>

                  <p style="color: #5D6D7E; font-size: 14px; line-height: 1.6; margin: 0;">
                    Once you complete your intake, our medical team will review your health profile within 24-48 hours and reach out with your personalized ${programText} plan.
                  </p>
                </div>

                <!-- Need Help -->
                <div style="text-align: center; margin-top: 24px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #E5E5E5;">
                  <p style="color: #5D6D7E; font-size: 14px; margin: 0;">
                    Need help? Reply to this email or call us at<br>
                    <strong style="color: #2C3E50;">(706) 426-7383</strong>
                  </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
                  <p style="margin: 0;">
                    Réveil<br>
                    7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Reminder sent to ${patient.email}`);
        results.push({ email: patient.email, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send reminder to ${patient.email}:`, emailError);
        results.push({ email: patient.email, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        patientsChecked: patients?.length || 0,
        remindersSent: results.filter(r => r.success).length,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in intake reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
