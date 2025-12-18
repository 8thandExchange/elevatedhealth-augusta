import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Elevated Health Clinic Knowledge Base
const CLINIC_KNOWLEDGE = `
# Elevated Health Augusta - Internal Operations Guide

## About the Clinic
Elevated Health Augusta is a hormone optimization and wellness clinic in Augusta, GA. We specialize in bio-identical hormone replacement therapy (BHRT), GLP-1 weight loss, ketamine therapy, peptide therapy, and IV hydration.

## Membership Tiers

### Vitality Membership - $199/month
- Bio-identical hormone therapy (transdermal creams)
- Quarterly ZRT saliva lab testing
- Unlimited provider messaging
- Symptom tracking and dashboard access
- Medication adjustments as needed
- All compounding pharmacy costs included

### Concierge Membership - $499/month
Everything in Vitality PLUS:
- GLP-1 weight loss medication (Semaglutide or Tirzepatide)
- Adrenal support protocol:
  - DHEA supplementation
  - Pregnenolone
  - Adaptogenic herbs
- Cortisol rhythm optimization
- Priority scheduling

## Hormone Protocols

### Female Hormone Therapy
**Bi-Est (Estrogen):**
- Typical starting dose: 1-2 clicks AM/PM
- Apply to inner thigh or behind knee (thin skin areas)
- Adjust based on symptom relief and lab values

**Progesterone:**
- Typical dose: 2 clicks at bedtime
- Apply to breast or neck area
- Promotes deep sleep, counterbalances estrogen

**Testosterone (for women):**
- Typical dose: 1-2 clicks AM
- Apply to clitoral area for localized effect
- Improves libido, energy, and muscle tone

### Male Hormone Therapy
**Testosterone (for men):**
- Typical starting dose varies by patient
- Requires LabCorp safety panels: PSA, CBC, CMP
- Monitor hematocrit closely (stop if >54%)

## Lab Testing Pathways

### ZRT Saliva Testing (Default for females)
- Hormone Mapping Kit: $299
- Tests: Estradiol, Progesterone, Testosterone, DHEA-S, Cortisol x4
- No fasting required
- Collect first thing in morning

### LabCorp Blood Testing (Required for)
- Male testosterone therapy (PSA, CBC, CMP required)
- Thyroid disorders (TSH, T3, T4 panel)
- Kidney/liver disease history (CMP safety panel)

## Weight Loss Protocols (GLP-1)

### Semaglutide Titration
- Week 1-4: 0.25mg weekly
- Week 5-8: 0.5mg weekly
- Week 9-12: 1.0mg weekly
- Week 13+: 1.7mg or 2.4mg as tolerated

### Tirzepatide Titration
- Week 1-4: 2.5mg weekly
- Week 5-8: 5mg weekly
- Week 9-12: 7.5mg weekly
- Week 13+: 10mg, 12.5mg, or 15mg as tolerated

### Managing GLP-1 Side Effects
- Nausea: Eat smaller meals, avoid fatty foods, slow titration
- Constipation: Increase fiber and water intake
- Injection site reactions: Rotate sites weekly

## Peptide Therapy

### Sermorelin (Growth Hormone)
- Dose: Inject subcutaneously at bedtime
- Empty stomach required (2-3 hours after eating)
- Benefits: Sleep, recovery, body composition
- Timeline: 4-8 weeks for noticeable effects

### NAD+ (Cellular Energy)
- Available as troche or injection
- Benefits: Mental clarity, energy, anti-aging
- Timeline: 1-2 weeks for effects

### PT-141 (Sexual Function)
- Works within 1-4 hours of dose
- Effects last 24-72 hours
- Use as needed, not daily

## Ketamine Therapy

### IV Ketamine Protocol
- Initial series: 6 infusions over 2-3 weeks
- Maintenance: Monthly or as needed
- Preparation: NPO 4 hours, clear liquids 2 hours
- Recovery: No driving for 24 hours post-treatment

### Pricing
- Single IV Ketamine Infusion: $450
- 6-Session Package: $2,400 ($400/session)

## IV Hydration Therapy

### Available Drips
- The Meyers: General wellness ($149)
- The Shield: Immunity support ($179)
- The Glow: Beauty/skin health ($169)
- The Resurrection: Hangover recovery ($169)
- Beast Mode: Athletic performance ($189)

### Boosters (Add-on)
- Vitamin B12: $25
- Glutathione: $35
- NAD+: $50

## Patient Onboarding Flow
1. Patient pays for Hormone Mapping Kit ($299) or Consultation ($99)
2. Intake form and symptom questionnaire completed
3. Lab kit shipped (ZRT) or LabCorp requisition sent
4. Patient completes testing, returns sample
5. Results arrive (7-10 days for ZRT)
6. Provider reviews labs and creates treatment plan
7. Patient authorizes treatment
8. Pharmacy ships medications (2-3 days)
9. Patient begins treatment

## Portal Workflow for Staff

### Triage Tab
- Shows patients pending review
- Color-coded by risk level (green/yellow/red)
- High symptom scores or safety flags = red

### Patient Panel Features
- View symptom trends and lab history
- Assign protocols and memberships
- Generate superbills for insurance
- Order LabCorp panels
- Send to pharmacy
- Message patient

### Key Actions
- "Mark Labs Reviewed" = Unlocks patient's Health Report
- "Authorize Treatment" = Triggers pharmacy order workflow
- "Flag as No-Show" = Requires $99 rebooking fee

## Insurance & Payment

### HSA/FSA
- We accept HSA and FSA cards
- Work just like credit cards at checkout
- Hormone therapy and weight loss are typically eligible

### Superbills
- Generated for insurance reimbursement
- Include ICD-10 diagnosis codes
- Include CPT procedure codes
- Patient submits to their insurance

## Pharmacy Partners
- Holgate Pharmacy (compounding): 404-555-0199
- Default for hormone compounds
- 2-3 day shipping typical

## Contact Information
- Clinic Address: Augusta, GA
- Phone: Available in clinic settings
- Email: admin@elevatedhealthaugusta.com
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated and has staff/admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has staff or admin role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Access denied. Staff or admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, context } = await req.json();

    // Build context about current patients if requested
    let patientContext = "";
    if (message.toLowerCase().includes("patient") || message.toLowerCase().includes("how many")) {
      // Query some patient statistics
      const { data: patientStats } = await supabaseClient
        .from("patients")
        .select("id, onboarding_status, membership_tier", { count: "exact" })
        .eq("is_archived", false);
      
      const total = patientStats?.length || 0;
      const active = patientStats?.filter(p => p.onboarding_status === "treatment_active").length || 0;
      const pending = patientStats?.filter(p => ["pending_invite", "intake_complete"].includes(p.onboarding_status || "")).length || 0;
      const vitalityMembers = patientStats?.filter(p => p.membership_tier === "vitality").length || 0;
      const conciergeMembers = patientStats?.filter(p => p.membership_tier === "concierge").length || 0;

      patientContext = `

## Current Patient Statistics (Live Data)
- Total Active Patients: ${total}
- Currently on Treatment: ${active}
- Pending Intake/Review: ${pending}
- Vitality Members: ${vitalityMembers}
- Concierge Members: ${conciergeMembers}
`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the Elevated Health Assistant, an internal AI helper for clinic staff and providers at Elevated Health Augusta. You have access to the clinic's complete operations guide and can answer questions about protocols, pricing, patient workflows, and clinic procedures.

IMPORTANT: You are ONLY accessible to authenticated staff and admin users. Never share sensitive operational details with patients.

${CLINIC_KNOWLEDGE}
${patientContext}

When answering questions:
1. Be direct and concise - staff are busy
2. Reference specific protocols, pricing, or procedures when relevant
3. If asked about a specific patient, explain what data you can see vs. what requires portal lookup
4. Format responses with clear headers and bullet points when helpful
5. For clinical questions, always recommend provider review for patient-specific decisions
6. If you don't know something specific, say so clearly

Current context from staff: ${context || "General question"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Provider chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
