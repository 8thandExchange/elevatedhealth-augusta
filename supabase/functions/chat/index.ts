import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    const systemPrompt = `You are a knowledgeable assistant for Elevated Health Augusta, a healthcare provider specializing in ketamine therapy and mental health services in Augusta, Georgia.

Key Information:
- Ketamine therapy is an evidence-based treatment for depression, anxiety, PTSD, and other mental health conditions
- We are located at 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Email: care@elevatedhealthaugusta.com

Services:
- IV Ketamine Therapy - safe, supervised ketamine infusion program
- SPRAVATO® (esketamine) nasal spray - FDA-approved for treatment-resistant depression
- Mental health treatment for depression, anxiety, PTSD, OCD, and treatment-resistant conditions
- Veterans and First Responders support programs
- Insurance coverage accepted including Blue Cross Blue Shield, TRICARE, and other major insurers

Business Hours:
- Monday-Friday: 9AM - 5PM
- Closed: Saturday-Sunday

What Makes Us Different:
- Science-backed approach with medical supervision
- Board-certified nurse practitioner (Lauren Bursey, NP-C)
- Specialized support for veterans, first responders, and their families
- Accepting most major insurance plans including Blue Cross Blue Shield
- Private treatment rooms for patient comfort
- Compassionate, personalized care

Answer questions professionally, warmly, and with empathy. If asked about booking, encourage them to call (706) 760-3470 or use the contact form on our website. Always maintain patient confidentiality and medical professionalism.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned status ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log("Successfully generated response");

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
