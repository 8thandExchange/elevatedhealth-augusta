import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const PAUBOX_SMTP_PASSWORD = Deno.env.get("PAUBOX_SMTP_PASSWORD");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const moodQuizResultSchema = z.object({
  treatment: z.string(),
  reason: z.string(),
  score: z.number(),
  insurance: z.string(),
  answers: z.array(z.string()),
});

const hrtQuizDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  age_range: z.string(),
  gender: z.string(),
  symptoms: z.array(z.string()),
  symptom_duration: z.string(),
  past_hrt: z.string(),
  past_hrt_details: z.string().optional(),
  medical_conditions: z.string().optional(),
  current_medications: z.string().optional(),
  primary_goal: z.string(),
  insurance: z.string(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const quizType = requestData.type || 'mood';
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });

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

    let emailContent: string;
    let emailSubject: string;

    if (quizType === 'hrt') {
      const validatedData = hrtQuizDataSchema.parse(requestData.data);

      // Save to database
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseClient.from('hrt_quiz_submissions').insert({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          age_range: validatedData.age_range,
          gender: validatedData.gender,
          symptoms: validatedData.symptoms,
          symptom_duration: validatedData.symptom_duration,
          past_hrt: validatedData.past_hrt,
          past_hrt_details: validatedData.past_hrt_details,
          medical_conditions: validatedData.medical_conditions,
          current_medications: validatedData.current_medications,
          primary_goal: validatedData.primary_goal,
          insurance: validatedData.insurance,
        });
      } catch (dbError) {
        console.error("Database save error:", dbError);
      }
      
      emailSubject = "New Hormone Therapy Assessment Completed";
      emailContent = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #20B2AA;">New HRT Assessment</h1>
              <p><strong>Name:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Phone:</strong> ${validatedData.phone}</p>
              <p><strong>Age:</strong> ${validatedData.age_range}</p>
              <p><strong>Gender:</strong> ${validatedData.gender}</p>
              <p><strong>Symptoms:</strong> ${validatedData.symptoms.join(', ')}</p>
              <p><strong>Duration:</strong> ${validatedData.symptom_duration}</p>
              <p><strong>Past HRT:</strong> ${validatedData.past_hrt}</p>
              ${validatedData.past_hrt_details ? `<p><strong>HRT Details:</strong> ${validatedData.past_hrt_details}</p>` : ''}
              ${validatedData.medical_conditions ? `<p><strong>Medical Conditions:</strong> ${validatedData.medical_conditions}</p>` : ''}
              ${validatedData.current_medications ? `<p><strong>Medications:</strong> ${validatedData.current_medications}</p>` : ''}
              <p><strong>Goal:</strong> ${validatedData.primary_goal}</p>
              <p><strong>Insurance:</strong> ${validatedData.insurance}</p>
              <p><strong>Time:</strong> ${timestamp}</p>
            </div>
          </body>
        </html>
      `;
    } else {
      const validatedData = requestData.data ? 
        moodQuizResultSchema.parse(requestData.data) : 
        moodQuizResultSchema.parse(requestData);
      
      emailSubject = "New wellness pathway quiz result";
      emailContent = `<html><body><h1>${validatedData.treatment}</h1><p>${validatedData.reason}</p></body></html>`;
    }

    await client.send({
      from: "care@elevatedhealthaugusta.com",
      to: "booking@elevatedhealthaugusta.com",
      subject: emailSubject,
      content: "auto",
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Quiz result sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof z.ZodError ? JSON.stringify(error.issues) : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
