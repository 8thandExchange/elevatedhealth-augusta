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
- Location: 3670 Wheeler Road, Suite 101, Augusta, GA 30909
- Phone: (706) 760-3470
- Hours: Monday-Friday 8am-5pm
- Website: elevatedhealthaugusta.com

SERVICES YOU CAN DISCUSS:

1. KETRA™ Ketamine Therapy - For treatment-resistant depression, anxiety, PTSD
   - Supervised IV ketamine infusions ($450-600 per session)
   - Spravato (esketamine) covered by most insurance
   - Mental health intake and PHQ-9/GAD-7 assessments
   
2. Hormone Replacement Therapy (HRT)
   - Bioidentical hormones for men and women
   - Treats menopause, perimenopause, low testosterone
   - Starts with $299 Hormone Mapping (at-home saliva test + consultation)
   - Monthly membership $199-399 depending on protocol
   
3. Medical Weight Loss
   - GLP-1 medications (Semaglutide, Tirzepatide)
   - Semaglutide: $349-399/month
   - Tirzepatide: $499-699/month
   - Includes medication, provider monitoring, and support

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
- Collect their name and phone number naturally when appropriate for follow-up

BOOKING:
When they're ready to book, direct them to schedule a free 15-minute discovery call. You can say something like: "I'd love to connect you with our team. Can I get your name and phone number so we can reach out, or would you prefer to book online?"

IMPORTANT: You are a helpful assistant, not a doctor. Never diagnose or prescribe. Always recommend they speak with our medical team for personalized advice.`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("Voice session created successfully");

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
