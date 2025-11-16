import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const PAUBOX_SMTP_PASSWORD = Deno.env.get("PAUBOX_SMTP_PASSWORD");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Old mood quiz schema
const moodQuizResultSchema = z.object({
  treatment: z.string(),
  reason: z.string(),
  score: z.number(),
  insurance: z.string(),
  answers: z.array(z.string()),
});

// New HRT quiz schema
const hrtQuizDataSchema = z.object({
  symptoms: z.array(z.string()),
  age_range: z.string(),
  sex: z.string(),
  has_pcp: z.string(),
  recent_labs: z.string(),
  health_problems: z.string(),
  previous_hrt: z.string(),
  goals: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  created_at: z.string(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing quiz result submission...");
    
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));
    
    // Determine quiz type
    const quizType = requestData.type || 'mood';
    console.log("Quiz type:", quizType);
    
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
      // Handle HRT Quiz
      const validatedData = hrtQuizDataSchema.parse(requestData.data);
      console.log("Validated HRT data");
      
      emailSubject = "New Hormone Therapy Assessment Completed";
      emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #20B2AA; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .field { margin-bottom: 20px; }
              .field-label { font-weight: bold; color: #20B2AA; margin-bottom: 5px; }
              .field-value { background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
              .highlight { background-color: #E0F2F1; padding: 15px; border-left: 4px solid #20B2AA; margin: 20px 0; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New HRT Assessment Completed</h1>
              </div>
              <div class="content">
                <div class="highlight">
                  <div class="field-label" style="font-size: 18px;">Patient Contact Information:</div>
                  <div style="font-size: 16px; margin-top: 10px;">
                    <strong>Name:</strong> ${validatedData.first_name} ${validatedData.last_name}<br>
                    <strong>Email:</strong> ${validatedData.email}<br>
                    <strong>Phone:</strong> ${validatedData.phone}
                  </div>
                </div>

                <div class="field">
                  <div class="field-label">Demographics:</div>
                  <div class="field-value">
                    <strong>Age Range:</strong> ${validatedData.age_range}<br>
                    <strong>Sex:</strong> ${validatedData.sex}
                  </div>
                </div>

                <div class="field">
                  <div class="field-label">Symptoms Reported:</div>
                  <div class="field-value">
                    <ul style="margin: 5px 0; padding-left: 20px;">
                      ${validatedData.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <div class="field">
                  <div class="field-label">Goals for Hormone Therapy:</div>
                  <div class="field-value">${validatedData.goals || 'Not specified'}</div>
                </div>

                <div class="field">
                  <div class="field-label">Has Primary Care Provider:</div>
                  <div class="field-value">${validatedData.has_pcp}</div>
                </div>

                <div class="field">
                  <div class="field-label">Recent Labs (This Year):</div>
                  <div class="field-value">${validatedData.recent_labs}</div>
                </div>

                <div class="field">
                  <div class="field-label">Health Problems:</div>
                  <div class="field-value">${validatedData.health_problems}</div>
                </div>

                <div class="field">
                  <div class="field-label">Previous HRT Experience:</div>
                  <div class="field-value">${validatedData.previous_hrt}</div>
                </div>

                <div class="field">
                  <div class="field-label">Submission Time:</div>
                  <div class="field-value">${timestamp}</div>
                </div>
              </div>
              <div class="footer">
                <p>This assessment was submitted via the Elevated Health Augusta HRT page.</p>
                <p>Please follow up with the patient within 24 hours.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      // Handle Mood/Ketamine Quiz
      const validatedData = moodQuizResultSchema.parse(requestData.data || requestData);
      console.log("Validated mood quiz data");
      
      emailSubject = "New Quiz Completion - Treatment Path Recommendation";
      emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #27AE60; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .field { margin-bottom: 20px; }
              .field-label { font-weight: bold; color: #27AE60; margin-bottom: 5px; }
              .field-value { background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
              .highlight { background-color: #E8F5E9; padding: 15px; border-left: 4px solid #27AE60; margin: 20px 0; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Mood & Symptom Quiz Completed</h1>
              </div>
              <div class="content">
                <div class="highlight">
                  <div class="field-label" style="font-size: 18px;">Recommended Treatment Path:</div>
                  <div style="font-size: 20px; font-weight: bold; color: #27AE60; margin-top: 5px;">
                    ${validatedData.treatment}
                  </div>
                </div>

                <div class="field">
                  <div class="field-label">Reason for Recommendation:</div>
                  <div class="field-value">${validatedData.reason}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Total Score:</div>
                  <div class="field-value">${validatedData.score} points</div>
                </div>

                <div class="field">
                  <div class="field-label">Insurance Coverage:</div>
                  <div class="field-value">${validatedData.insurance}</div>
                </div>

                <div class="field">
                  <div class="field-label">Quiz Responses:</div>
                  <div class="field-value">
                    <ol style="margin: 5px 0; padding-left: 20px;">
                      ${validatedData.answers.map(answer => `<li>${answer}</li>`).join('')}
                    </ol>
                  </div>
                </div>

                <div class="field">
                  <div class="field-label">Submission Time:</div>
                  <div class="field-value">${timestamp}</div>
                </div>
              </div>
              <div class="footer">
                <p>This quiz was completed on the Elevated Health Augusta website.</p>
                <p>Response received: ${timestamp}</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    console.log("Sending email...");
    await client.send({
      from: "care@elevatedhealthaugusta.com",
      to: "booking@elevatedhealthaugusta.com",
      subject: emailSubject,
      content: "auto",
      html: emailContent,
    });

    console.log("Email sent successfully");
    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Quiz result sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending quiz result email:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof z.ZodError ? JSON.stringify(error.issues) : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
