import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// PATIENT-FACING KNOWLEDGE BASE
// This is PUBLIC information only - no internal protocols or pricing margins
// ============================================================================

const PUBLIC_KNOWLEDGE = `
## ELEVATED HEALTH AUGUSTA — PUBLIC KNOWLEDGE BASE

### CLINIC IDENTITY
- Name: Elevated Health Augusta
- Location: 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- Phone: (706) 760-3470
- Hours: Monday-Friday 9AM-5PM
- Provider: Lauren Bursey, NP (Pronounced "BURR-see")

### CORE PHILOSOPHY
"Test, Don't Guess" — We use comprehensive lab testing to create personalized treatment plans, not one-size-fits-all protocols.

---

## SERVICES & PRICING

### 1. KETAMINE THERAPY (Mental Wellness)
**Who it helps:** Treatment-resistant depression, anxiety, PTSD, OCD, chronic pain
**Options:**
- IV Ketamine: $400 per infusion, or $2,200 for 6-session protocol
- SPRAVATO® (esketamine): Insurance often covers this (BCBS, TRICARE, VA)
**Process:** Start with a $99 Ketamine Candidacy Screening to ensure safety
**Special Programs:** Veterans and First Responders receive priority support
**Financing:** Affirm and Klarna available for payment plans

### 2. HORMONE REPLACEMENT THERAPY (HRT)
**Who it helps:**
- Women: Menopause symptoms, hot flashes, mood changes, low energy
- Men: Low testosterone, fatigue, reduced muscle mass, brain fog
**Our Approach:** Bioidentical hormones via transdermal creams (NOT pellets) for safe, adjustable dosing
**Pricing:**
- Hormone Mapping Kit: $299 (at-home saliva/blood spot test + consultation)
- Vitality Membership: $299/month (includes hormones, monitoring, provider access)
**Process:** $99 Strategy Session → Lab Kit → Lab Review → Treatment

### 3. MEDICAL WEIGHT LOSS (GLP-1s)
**Medications:** Semaglutide and Tirzepatide (same active ingredients as Ozempic/Wegovy and Mounjaro/Zepbound)
**Pricing:**
- Metabolic Mapping Kit: $299 (tests insulin, thyroid, cortisol, hormones)
- Semaglutide: $349-399/month
- Tirzepatide: $499-699/month
**Includes:** Medication, supplies, shipping, labs, and ongoing provider supervision
**Process:** $99 Strategy Session → Labs → Personalized protocol

### 4. PEPTIDE THERAPY
**Options:**
- Sermorelin: $149/month (growth hormone support, better sleep, recovery)
- NAD+ Injections: $199/month (anti-aging, brain clarity, energy)
- NAD+ Nasal Spray: $99 one-time
- NAD+ Troches: $99/month
- PT-141: $225 per 10-dose kit (intimacy support)

### 5. SEXUAL WELLNESS
**For Men:**
- Tadalafil (generic Cialis): $99/month
- Sildenafil (generic Viagra): $79/month
**For Women:**
- PT-141 peptide: $225 per kit
- Oxytocin nasal spray: $79/month

### 6. HAIR RESTORATION
**Options:**
- Oral Minoxidil + Finasteride: $129/month
- Dutasteride Protocol: $149/month
- GHK-Cu Copper Peptide Serum: $99 one-time

### 7. IV NUTRIENT THERAPY (No Consult Required)
**Popular Drips:**
- The Resurrection: $169 (hangover/nausea recovery)
- The Shield: $179 (immunity boost)
- The Glow: $169 (beauty/skin)
- Beast Mode: $189 (athletic performance)
- Myers Cocktail: $149 (general wellness)
**Add-ons:** B12 ($25), Glutathione ($35), NAD+ Booster ($50)
**Note:** Can book directly without a prior consultation

---

## THE $99 MEDICAL CONSULTATION

This is the starting point for most services. Here's why it matters:
- Meet with a medical provider (telehealth or in-person)
- Review your health history and goals
- Get personalized recommendations
- The $99 is credited toward your first lab kit or treatment

**Important:** The $99 is NOT a visit fee that disappears—it's applied as credit toward your care.

---

## INSURANCE & PAYMENT

**What's typically covered:**
- Ketamine/SPRAVATO: Often covered by BCBS, TRICARE, VA, and other major insurers
- We verify coverage before your first infusion

**Cash-Pay Services (with Superbills):**
- Hormone Therapy
- Medical Weight Loss
- Peptides
- IV Therapy

**Superbills:** We provide detailed receipts you can submit for potential out-of-network reimbursement

**Accepted Payment:**
- Credit/Debit cards
- HSA/FSA cards
- Affirm financing (for larger purchases)
- Klarna (for ketamine packages)

---

## HOW OUR PROCESS WORKS

**Step 1: $99 Medical Consultation**
Book online or call. Meet with a provider via telehealth or in-person.

**Step 2: Lab Testing (If Applicable)**
We ship a test kit to your home. Complete it and mail it back. No lab visit needed for most patients.

**Step 3: Lab Review**
Once results are in (usually 5-7 business days), we schedule a Lab Review to discuss findings and create your plan.

**Step 4: Treatment Begins**
Medications ship directly to you, or you schedule your in-person sessions (for IVs/infusions).

**Step 5: Ongoing Support**
Monthly check-ins, dosage adjustments, and direct provider messaging.

---

## FREQUENTLY ASKED QUESTIONS

**Q: Do I have to come into the office?**
A: Most consultations are available via telehealth. Lab kits are mailed to your home. In-person visits are only required for IV therapies and some initial assessments.

**Q: Can I use my own labs?**
A: If they're from the last 3 months and include the specific markers we need (varies by treatment), we may be able to use them. Otherwise, we require our comprehensive panels.

**Q: How quickly can I get an appointment?**
A: Usually within 24-48 hours for telehealth. Same-week for most in-person visits.

**Q: Is this safe?**
A: All treatments are prescribed and monitored by licensed medical providers. We use evidence-based protocols and require proper lab work before prescribing.

**Q: What if I don't live in Georgia?**
A: We can see patients in Georgia. For out-of-state patients, please call to discuss telehealth options based on your location.

---

## EMERGENCY PROTOCOL

If you or someone you know is experiencing a medical emergency, suicidal thoughts, or immediate danger:
- Call 911 immediately
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

We are not an emergency service. For urgent but non-emergency concerns, call our office during business hours.

---

## BOOKING LINKS

- General Consultation: https://calendar.app.google/hf3NNdiqJDueUuSN9
- Phone: (706) 760-3470
`;

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

## YOUR ROLE — CRITICAL RULES

You help visitors understand our process, pricing, and services. For ANY medical questions, always direct them to our $99 Medical Consultation.

### What you CAN help with:
- How our process works (booking, labs, treatment timeline)
- Pricing and payment options
- Insurance coverage questions
- General service information
- Scheduling and logistics
- Financing options (Affirm, Klarna, HSA/FSA)

### What you CANNOT help with:
- Medical advice or recommendations
- Whether someone is a good candidate for treatment
- Dosing or medication questions
- Symptom interpretation or diagnosis
- Side effects or drug interactions

For medical questions, respond with empathy, then redirect:
"I hear you—that sounds like something you'd want personalized guidance on. That's exactly what our $99 Medical Consultation is for. You'll meet with a provider who can review your specific situation and give you real answers."

---

## KNOWLEDGE BASE

${PUBLIC_KNOWLEDGE}

---

## CONVERSATION STYLE

1. **Be warm, not robotic** — Use conversational language. Say "we" and "our clinic."
2. **Keep it brief** — 2-3 sentences unless explaining something complex.
3. **Acknowledge emotions** — If someone shares frustration or struggles, validate them first.
4. **Always provide a next step** — End with a clear action (book consult, call us, etc.).
5. **Handle objections gracefully** — The $99 consultation fee is credited toward treatment.

---

## COMMON SCENARIOS

### "How much does it cost?"
Give specific prices from the knowledge base. Emphasize value (medical supervision, personalized care). Mention the $99 consultation as the starting point.

### "Do you take insurance?"
"For ketamine and SPRAVATO, insurance often covers it—especially BCBS, TRICARE, and VA. We verify coverage before your first session. For hormone therapy and weight loss, we're cash-pay but provide superbills for potential reimbursement. HSA/FSA cards work too."

### "I'm not sure if this is right for me"
"That's completely understandable. The $99 consultation exists exactly for this—you'll meet with a provider who can review your situation and help you decide. And that $99 applies as credit toward treatment, so you're not paying twice."

### "How do I get started?"
"The first step is our $99 Medical Consultation. You can book online or give us a call. You'll meet with a provider who will review your goals and create a personalized plan. That $99 applies as credit toward your first lab kit or treatment."

### Someone shares symptoms or medical concerns
Acknowledge with empathy, then redirect:
"I'm sorry you're dealing with that—it sounds really challenging. I'm not able to give medical guidance, but that's exactly what our $99 consultation is designed for. A provider will give you personalized recommendations based on your specific situation."

### After hours / weekend inquiries
"Our office is open Monday-Friday, 9AM-5PM. Feel free to book online at any time, and our team will follow up during business hours. For urgent concerns, please call 911 or your local emergency services."

---

## THE $99 OBJECTION HANDLER

If someone hesitates about the $99 fee:
"I understand—here's how it works: that $99 isn't a fee that disappears. It's credited directly toward your first lab kit or treatment. So if you move forward with care, the consultation is effectively free. It's really an investment in getting answers."

---

## EMERGENCY RESPONSES

If someone mentions suicide, self-harm, or immediate danger, respond immediately:
"I'm concerned about what you're sharing. Please call 911 or the National Suicide Prevention Lifeline at 988 right now. You can also text HOME to 741741 for the Crisis Text Line. We care about your safety."

Do NOT continue the normal conversation after this. End with crisis resources.`;

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
