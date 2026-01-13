import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOOKING-REMINDER] ${step}${detailsStr}`);
};

// Single calendar URL for all services
const BOOKING_CALENDAR_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Bvq4ZKUeVHmDYS8aU45o_2Z0oi4uHvILuZr2wqv6tKLPC71WABKyOSrbCwIjzKPqReipYFqST?gv=true";

// Service-specific email config (calendar URL is now the same for all)
const SERVICE_CONFIG: Record<string, { 
  calendarUrl: string; 
  title: string;
  specialistTitle: string;
}> = {
  ketamine: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Ketamine Therapy Consultation",
    specialistTitle: "Mental Wellness Specialist"
  },
  weight_loss: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Medical Weight Loss Consultation", 
    specialistTitle: "Weight Loss Specialist"
  },
  hormone: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Hormone Replacement Consultation",
    specialistTitle: "Hormone Specialist"
  },
  peptide: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Peptide Therapy Consultation",
    specialistTitle: "Peptide Specialist"
  },
  hair: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Hair Restoration Consultation",
    specialistTitle: "Hair Restoration Specialist"
  },
  sexual: {
    calendarUrl: BOOKING_CALENDAR_URL,
    title: "Sexual Wellness Consultation",
    specialistTitle: "Sexual Wellness Specialist"
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Booking reminder check started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const resend = new Resend(resendKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find bookings that:
    // 1. Have status 'pending' (paid but not yet booked on calendar)
    // 2. Have no calendar_booked_at (haven't scheduled yet)
    // 3. Were created more than 2 hours ago
    // 4. Haven't been reminded yet (booking_reminder_sent_at is null)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: unbookedConsultations, error: fetchError } = await supabaseClient
      .from("consultation_bookings")
      .select("*")
      .eq("status", "pending")
      .is("calendar_booked_at", null)
      .is("booking_reminder_sent_at", null)
      .lt("created_at", twoHoursAgo);

    if (fetchError) {
      logStep("Error fetching bookings", { error: fetchError });
      throw fetchError;
    }

    logStep("Found unbooked consultations", { count: unbookedConsultations?.length || 0 });

    if (!unbookedConsultations || unbookedConsultations.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No reminders needed",
        count: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const booking of unbookedConsultations) {
      const serviceType = booking.service_type || "hormone";
      const config = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.hormone;

      try {
        // Send reminder email
        await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: [booking.customer_email],
          subject: `Reminder: Schedule Your ${config.title}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #2C3E50; font-size: 28px; margin-bottom: 24px;">Don't Forget to Book Your Consultation! ⏰</h1>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Dear ${booking.customer_name || "Valued Patient"},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                We noticed you haven't scheduled your <strong>${config.title}</strong> yet. Your payment was received, and we're ready to help you on your wellness journey!
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${config.calendarUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Schedule Your Consultation Now
                </a>
              </div>
              
              ${booking.credit_code ? `
              <div style="background: linear-gradient(135deg, #F9F9F7 0%, #f0ebe3 100%); border: 2px solid #D4A017; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: #2C3E50; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your Credit Code (Don't Lose It!)</p>
                <p style="color: #D4A017; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">${booking.credit_code}</p>
                <p style="color: #718096; font-size: 14px; margin-top: 8px;">Worth $99 toward your treatment</p>
              </div>
              ` : ''}
              
              <h2 style="color: #2C3E50; font-size: 18px; margin-top: 32px;">What to Expect</h2>
              
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                <li><strong>45-minute consultation</strong> with our ${config.specialistTitle}</li>
                <li><strong>Personalized assessment</strong> of your health goals</li>
                <li><strong>Custom treatment recommendations</strong> tailored to you</li>
                <li><strong>No pressure</strong> – we're here to educate and support you</li>
              </ul>
              
              <div style="background: #fff3cd; border-left: 4px solid #D4A017; padding: 16px; margin: 24px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>Limited Availability:</strong> Our specialists book up quickly. We recommend scheduling within the next 48 hours to get your preferred time slot.
                </p>
              </div>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 32px;">
                Questions? Just reply to this email or call us at <strong>706-922-7958</strong>.
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                We look forward to meeting you!<br/>
                <strong>The Elevated Health Team</strong><br/>
                <span style="color: #718096;">Augusta, GA</span>
              </p>
            </div>
          `,
        });

        // Update the booking to mark reminder sent
        await supabaseClient
          .from("consultation_bookings")
          .update({ booking_reminder_sent_at: new Date().toISOString() })
          .eq("id", booking.id);

        logStep("Reminder sent", { email: booking.customer_email, bookingId: booking.id });
        sentCount++;
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Failed to send reminder", { email: booking.customer_email, error: errorMsg });
        errors.push(`${booking.customer_email}: ${errorMsg}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount,
      total: unbookedConsultations.length,
      errors: errors.length > 0 ? errors : undefined
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
