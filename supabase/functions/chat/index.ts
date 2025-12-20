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

    // If we're capturing lead info, save it to the database and trigger GoHighLevel
    if (captureLeadInfo && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Summarize the conversation
      const chatSummary = messages
        .filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join(" | ");
      
      const { data: leadData, error } = await supabase.from("chat_leads").insert({
        name: captureLeadInfo.name || null,
        email: captureLeadInfo.email || null,
        phone: captureLeadInfo.phone || null,
        interest: captureLeadInfo.interest || "general",
        chat_summary: chatSummary.substring(0, 500),
        source: "chatbot",
      }).select().single();

      if (error) {
        console.error("Error saving lead:", error);
      } else {
        console.log("Lead captured successfully:", leadData?.id);
        
        // Trigger GoHighLevel webhook
        try {
          const ghlResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-to-gohighlevel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: captureLeadInfo.name,
              email: captureLeadInfo.email,
              phone: captureLeadInfo.phone,
              interest: captureLeadInfo.interest || "general",
              chat_summary: chatSummary.substring(0, 500),
              source: 'website_chat',
              lead_id: leadData?.id
            })
          });
          
          if (ghlResponse.ok) {
            console.log("Lead sent to GoHighLevel successfully");
          } else {
            console.error("GoHighLevel webhook failed:", await ghlResponse.text());
          }
        } catch (ghlError) {
          console.error("Error sending to GoHighLevel:", ghlError);
        }
      }
    }

    const systemPrompt = `You are a warm, knowledgeable Care Coordination specialist for Elevated Health Augusta. You handle ADMINISTRATIVE questions only—you cannot provide medical advice.

## YOUR ROLE — IMPORTANT
You help visitors understand our process, pricing, and services. For medical questions, always direct them to our $99 Medical Consultation.

What you CAN help with:
- How our process works
- Pricing and payment options  
- Insurance questions
- General service information
- Scheduling guidance

What you CANNOT help with:
- Medical advice or recommendations
- Whether someone is a good candidate
- Dosing or medication questions
- Symptom interpretation

For medical questions, say: "That's a question for our medical team. The $99 Medical Consultation is where you'll get personalized guidance from a provider."

## SERVICES WE OFFER

### 1. KETAMINE THERAPY (Mental Wellness)
- For depression, anxiety, PTSD, OCD, treatment-resistant conditions
- IV Ketamine and SPRAVATO® (esketamine) available
- Special programs for Veterans and First Responders
- Insurance often accepted: Blue Cross Blue Shield, TRICARE

### 2. HORMONE REPLACEMENT THERAPY (HRT)
- Bioidentical hormones for men and women
- Transdermal creams (NOT pellets) for safe, adjustable dosing
- $299 Hormone Mapping (at-home saliva test + consultation)
- Monthly membership: $199-399/month

### 3. MEDICAL WEIGHT LOSS  
- GLP-1 medications (Semaglutide, Tirzepatide) with medical supervision
- Includes labs, monitoring, and provider access
- Semaglutide: $349-399/month
- Tirzepatide: $499-699/month

### 4. PEPTIDE THERAPY
- Sermorelin: $149/month
- NAD+: $99-199/month
- PT-141: $225 per kit

## THE $99 MEDICAL CONSULTATION — YOUR KEY CTA
When someone is interested in moving forward, guide them here:

"The $99 Medical Consultation is your next step. You'll meet with one of our providers who will review your health history, discuss your goals, and create a personalized plan. That $99 applies as a credit toward your first treatment, so it's really an investment in getting started."

## CLINIC INFO
- Location: 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Hours: Monday-Friday 9AM-5PM

## INSURANCE
- Ketamine/SPRAVATO: Often covered (BCBS, TRICARE, others)
- Hormone & Weight Loss: Typically cash-pay, superbills provided

## CONVERSATION STYLE
- Be warm, professional, and empathetic (not robotic)
- Keep responses under 3 sentences unless explaining something complex
- Use "we" and "our clinic" to build trust
- If they mention symptoms, acknowledge empathetically then redirect

## SAMPLE RESPONSES

"How do I get started?" → "The first step is our $99 Medical Consultation. You'll meet with a provider who will review your situation and create a personalized plan. That $99 applies as a credit toward treatment."

"How much does it cost?" → Give ranges, emphasize medical supervision value, mention the $99 consultation as the starting point.

"Do you take insurance?" → "Ketamine and SPRAVATO are often covered by insurers like BCBS and TRICARE. Hormone and weight loss services are typically cash-pay, but we provide superbills for potential reimbursement."

If they share symptoms: "I hear you—that sounds challenging. I can't give medical advice, but that's exactly what our $99 consultation is for. A provider will give you personalized guidance."`;

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
