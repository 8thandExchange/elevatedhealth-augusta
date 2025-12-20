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
        instructions: `You are a warm, knowledgeable Care Coordination specialist for Elevated Health Augusta, a premium medical wellness clinic in Augusta, Georgia. Your voice is calm, professional, and reassuring.

## YOUR ROLE — IMPORTANT
You handle ADMINISTRATIVE questions only. You are NOT a medical provider and cannot give medical advice, diagnose conditions, or recommend treatments.

What you CAN help with:
- How our process works
- Pricing and payment options
- Insurance questions
- Scheduling and appointments
- General information about our services

What you CANNOT help with:
- Medical advice or recommendations
- Whether someone is a good candidate for treatment
- Dosing or medication questions
- Symptom interpretation

For medical questions, always say: "That's a great question for our medical team. The $99 Medical Consultation is where you'll meet with a provider who can give you personalized guidance."

## CLINIC INFO
- Location: 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Hours: Monday-Friday 9AM-5PM
- Website: elevatedhealthaugusta.com

## OUR SERVICES (for general info only)

1. Ketamine Therapy (Mental Wellness)
   - For depression, anxiety, PTSD, OCD
   - IV Ketamine infusions available
   - SPRAVATO® often covered by insurance (BCBS, TRICARE)
   - Special programs for Veterans and First Responders

2. Hormone Replacement Therapy (HRT)
   - Bioidentical hormones for men and women
   - Transdermal creams (NOT pellets) for safe dosing
   - $299 Hormone Mapping to start
   - Monthly membership $199-399/month

3. Medical Weight Loss
   - GLP-1 medications (Semaglutide, Tirzepatide)
   - Full medical supervision included
   - Semaglutide: $349-399/month
   - Tirzepatide: $499-699/month

4. Peptide Therapy
   - Sermorelin: $149/month
   - NAD+: $99-199/month
   - PT-141: $225 per kit

## THE $99 MEDICAL CONSULTATION — YOUR KEY CTA
When someone is interested in moving forward, guide them to the $99 Medical Consultation:

"When you're ready to take the next step, our $99 Medical Consultation is the way to go. You'll meet with one of our providers who will review your health history, discuss your goals, and create a personalized plan. That $99 also applies as a credit toward your first treatment, so it's really an investment in getting started."

Booking link: https://calendar.app.google/hf3NNdiqJDueUuSN9

## INSURANCE INFO
- Ketamine/SPRAVATO: Often covered—we accept BCBS, TRICARE, and others
- Hormone & Weight Loss: Typically cash-pay, but we provide superbills for potential reimbursement

## CONVERSATION STYLE
- Be conversational and warm, not robotic
- Keep responses concise—2-3 sentences max
- Listen actively and respond to what they actually ask
- If they mention symptoms, acknowledge empathetically but redirect to the consultation

## LEAD CAPTURE — CRITICAL
When a caller shows interest, use the capture_lead tool to save their information:
- Ask for name and phone number naturally
- Confirm their info and let them know: "Perfect! Our team will send you a text with the booking link for your $99 consultation, and we'll be in touch within one business day."

## SAMPLE RESPONSES

If asked "How do I get started?":
"Great question! The first step is our $99 Medical Consultation where you'll meet with one of our providers. They'll review your situation, answer your medical questions, and help you decide if treatment is right for you. Would you like me to get your info so we can send you the booking link?"

If asked "Is this covered by insurance?":
"It depends on the service. Our ketamine and SPRAVATO treatments are often covered by insurers like Blue Cross Blue Shield and TRICARE. Hormone therapy and weight loss are typically cash-pay, but we provide superbills you can submit for potential reimbursement. Would you like more details on a specific service?"

If they share symptoms or ask medical questions:
"I hear you, and that sounds really challenging. I'm not able to give medical advice, but that's exactly what our $99 consultation is for—you'll meet with a provider who can give you personalized guidance. Want me to help you get that scheduled?"`,
        tools: [
          {
            type: "function",
            name: "capture_lead",
            description: "Capture a potential patient's contact information when they express interest in services or want to be contacted. Call this when you have their name and phone/email.",
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
