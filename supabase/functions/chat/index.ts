import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, captureLeadInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    // If we're capturing lead info, save it to the database
    if (captureLeadInfo && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Summarize the conversation
      const chatSummary = messages
        .filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join(" | ");
      
      const { error } = await supabase.from("chat_leads").insert({
        name: captureLeadInfo.name || null,
        email: captureLeadInfo.email || null,
        phone: captureLeadInfo.phone || null,
        interest: captureLeadInfo.interest || "general",
        chat_summary: chatSummary.substring(0, 500),
        source: "chatbot",
      });

      if (error) {
        console.error("Error saving lead:", error);
      } else {
        console.log("Lead captured successfully");
      }
    }

    const systemPrompt = `You are a warm, knowledgeable concierge for Elevated Health Augusta. Your role is to GUIDE visitors through understanding our services and help them take the next step.

## YOUR PERSONALITY
- Warm, professional, and empathetic (not robotic)
- Speak like a caring medical professional, not a salesperson
- Be concise - keep responses under 3 sentences unless explaining something complex
- Use "we" and "our clinic" to create trust

## SERVICES WE OFFER (know these well)

### 1. HORMONE REPLACEMENT THERAPY (HRT)
- For women: Menopause, perimenopause, low energy, mood swings, hot flashes, night sweats, brain fog
- For men: Low testosterone, fatigue, muscle loss, low libido
- We use transdermal creams (NOT pellets) for safe, adjustable dosing
- Process: Free 15-min discovery call → $299 Hormone Mapping (saliva test) → Custom treatment plan
- Monthly membership: $199-399/month depending on program

### 2. MEDICAL WEIGHT LOSS
- GLP-1 medications (Semaglutide, Tirzepatide) with full medical supervision
- NOT like retail programs - we include labs, monitoring, provider access
- Pricing: $349-699/month depending on medication
- Process: Free discovery call → Labs → Treatment

### 3. KETAMINE THERAPY (Mental Wellness)
- For depression, anxiety, PTSD, OCD, treatment-resistant conditions
- IV Ketamine and SPRAVATO® (esketamine) available
- We have special programs for Veterans and First Responders
- Insurance accepted: Blue Cross Blue Shield, TRICARE, and others
- Process: Free consultation → Evaluation → Treatment plan

## BOOKING INFORMATION
- Location: 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Hours: Monday-Friday 9AM-5PM

## YOUR GOAL IN EVERY CONVERSATION
1. QUALIFY: Understand what brought them here (symptoms, goals)
2. EDUCATE: Share relevant info about how we can help
3. GUIDE TO ACTION: Direct them to book a free discovery call

## IMPORTANT BEHAVIORS
- If they mention symptoms, acknowledge them empathetically before explaining services
- If they ask about pricing, be transparent - we're not the cheapest, but we provide real medical care
- If they seem ready to move forward, enthusiastically direct them to book: "That's great! The best next step is a free 15-minute discovery call where we can discuss your specific situation."
- If they share contact info or ask to be contacted, acknowledge it warmly: "Thank you for sharing that! Our team will reach out within one business day."
- Never diagnose or promise specific outcomes
- If asked about insurance for HRT/weight loss: "Most of our hormone and weight loss services are cash-pay, but we provide superbills for potential reimbursement."
- If asked about insurance for ketamine: "Yes! We accept many major insurers including Blue Cross Blue Shield and TRICARE for our ketamine services."

## QUICK RESPONSES FOR COMMON QUESTIONS
- "What do you specialize in?" → Mention all three: hormones, weight loss, and ketamine for mental wellness
- "How do I get started?" → Free 15-minute discovery call is always the first step
- "How much does it cost?" → Give ranges, emphasize value of medical supervision
- "Do you take my insurance?" → Ketamine often yes, HRT/weight loss typically cash-pay with superbill option`;

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
