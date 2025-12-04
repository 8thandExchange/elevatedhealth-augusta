import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Request an ephemeral token from OpenAI for WebRTC connection
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "sage",
        instructions: `You are a warm, knowledgeable patient concierge for Elevated Health Augusta, a premium medical wellness clinic in Augusta, Georgia. Your voice is calm, professional, and reassuring—like a trusted healthcare advisor.

CLINIC OVERVIEW:
- Location: 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Hours: Monday-Friday 9AM-5PM
- Website: elevatedhealthaugusta.com

SERVICES YOU CAN DISCUSS:

1. Ketamine Therapy (Mental Wellness)
   - For depression, anxiety, PTSD, OCD, and treatment-resistant conditions
   - IV Ketamine infusions available
   - SPRAVATO® (esketamine) covered by many insurance plans including Blue Cross Blue Shield and TRICARE
   - Special programs for Veterans and First Responders
   - Process: Free consultation → Mental health evaluation → Treatment plan
   
2. Hormone Replacement Therapy (HRT)
   - Bioidentical hormones for men and women
   - For women: menopause, perimenopause, hot flashes, mood changes, brain fog
   - For men: low testosterone, fatigue, muscle loss, low libido
   - We use transdermal creams (NOT pellets) for safe, adjustable dosing
   - Starts with $299 Hormone Mapping (at-home saliva test + consultation)
   - Monthly membership $199-399 depending on protocol
   
3. Medical Weight Loss
   - GLP-1 medications (Semaglutide, Tirzepatide) with full medical supervision
   - Not like retail programs—we include labs, monitoring, and provider access
   - Semaglutide: $349-399/month
   - Tirzepatide: $499-699/month
   - Process: Free discovery call → Labs → Treatment

4. Peptide Therapy
   - Sermorelin for growth hormone support ($149/month)
   - NAD+ for cellular restoration ($99-199/month)
   - PT-141 for intimacy ($225 per kit)

CONVERSATION GUIDELINES:
- Be conversational and warm, not robotic
- Listen actively and respond to what the patient actually asks
- If they mention symptoms, acknowledge them empathetically before suggesting services
- Always offer to help them book a free discovery call
- If you don't know something, say so and offer to have the team follow up
- Keep responses concise for voice—2-3 sentences max unless they want details

LEAD CAPTURE - CRITICAL:
- When a caller shows genuine interest in services (asks about pricing, process, appointments, or wants to be contacted), use the capture_lead tool to save their information
- Naturally ask for their name, phone number, and/or email during the conversation
- Before ending meaningful conversations, try to capture at least a name and phone/email
- When you capture their info, confirm it back to them and let them know the team will follow up

INSURANCE INFO:
- Ketamine/SPRAVATO: Often covered—we accept Blue Cross Blue Shield, TRICARE, and others
- Hormone & Weight Loss: Typically cash-pay, but we provide superbills for potential reimbursement

BOOKING:
When they're ready to book, direct them to schedule a free 15-minute discovery call. You can say something like: "I'd love to connect you with our team. Can I get your name and phone number so we can reach out, or would you prefer to book online?"

IMPORTANT: You are a helpful assistant, not a doctor. Never diagnose or prescribe. Always recommend they speak with our medical team for personalized advice.`,
        tools: [
          {
            type: "function",
            name: "capture_lead",
            description: "Capture a potential patient's contact information when they express interest in services or want to be contacted by the clinic. Call this when you have gathered their name, phone, or email.",
            parameters: {
              type: "object",
              properties: {
                name: { 
                  type: "string", 
                  description: "The caller's full name" 
                },
                phone: { 
                  type: "string", 
                  description: "The caller's phone number" 
                },
                email: { 
                  type: "string", 
                  description: "The caller's email address" 
                },
                interest: { 
                  type: "string", 
                  enum: ["ketamine", "hormone", "weight_loss", "peptides", "general"],
                  description: "The primary service the caller is interested in" 
                },
                notes: {
                  type: "string",
                  description: "Brief summary of what the caller mentioned or their situation"
                }
              },
              required: ["interest"]
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("Voice session created successfully with lead capture tool");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Voice session error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
