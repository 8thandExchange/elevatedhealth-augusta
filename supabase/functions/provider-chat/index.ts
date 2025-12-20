import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Elevated Health Clinic Knowledge Base - Enhanced Clinical Protocol Edition
const CLINIC_KNOWLEDGE = `
# ELEVATED HEALTH AUGUSTA - INTERNAL CLINICAL OPERATIONS GUIDE
## Version 2.0 - Provider & Staff Reference

---

# SECTION 1: CLINIC IDENTITY & CORE PHILOSOPHY

## About the Clinic
Elevated Health Augusta is a hormone optimization and wellness clinic in Augusta, GA. We specialize in bio-identical hormone replacement therapy (BHRT), GLP-1 weight loss, ketamine therapy, peptide therapy, and IV hydration.

**Provider:** Lauren Bursey, NP (Pronounced "BURR-see")
**Location:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Phone:** (706) 760-3470

## Core Philosophy: "Test, Don't Guess"
- We NEVER prescribe hormones or weight loss medications without comprehensive lab testing
- Labs are required to establish baseline and monitor safety
- The $99 consultation fee is credited toward the lab kit purchase
- This philosophy protects patients and differentiates us from pill mills

## The Medical vs. Administrative Boundary
| ADMIN CAN ANSWER (Free) | REQUIRES PROVIDER (Paid) |
|-------------------------|--------------------------|
| Pricing & packages | Specific dosing recommendations |
| Scheduling & logistics | "Will this cure me?" |
| Insurance/payment questions | Lab result interpretation |
| General service descriptions | Treatment plan modifications |
| Kit shipping status | Safety concern evaluation |

---

# SECTION 2: MEMBERSHIP TIERS & PRICING

## Vitality Membership - $199/month
**Target:** Hormone optimization patients (HRT/TRT)
- Bio-identical hormone therapy (transdermal creams)
- Quarterly ZRT saliva lab testing
- $50/month medication credit
- Unlimited provider messaging
- Symptom tracking and dashboard access
- Medication adjustments as needed

## Concierge Membership - $499/month
**Target:** Weight loss + comprehensive optimization
Everything in Vitality PLUS:
- GLP-1 weight loss medication (Semaglutide or Tirzepatide)
- Adrenal support protocol:
  - DHEA supplementation
  - Pregnenolone
  - Adaptogenic herbs (AdreneVive)
- Cortisol rhythm optimization
- Priority scheduling

## One-Time Lab Kits (Credited from $99 consult)
| Kit Name | Price | Tests Included |
|----------|-------|----------------|
| Hormone Mapping Kit | $299 | E2, Pg, T, DHEA-S, Cortisol x4 (ZRT) |
| Metabolic Mapping Kit | $299 | Insulin, Thyroid, Cortisol, Sex Hormones |
| Neurotransmitter Kit | $399 | Serotonin, Dopamine, GABA, Glutamate, Catecholamines |
| Toxicity Panel | $349 | Heavy metals, environmental toxins |
| Total Body Blueprint | $599 | Comprehensive all-in-one panel |

---

# SECTION 3: CLINICAL PROTOCOLS

## A. FEMALE HORMONE THERAPY (BHRT)

### Bi-Est (Estrogen) Protocol
| Parameter | Guideline |
|-----------|-----------|
| Starting Dose | 1-2 clicks AM/PM |
| Application Sites | Inner thigh, behind knee (thin skin) |
| Goal Range (E2) | 50-100 pg/mL (premenopausal feel) |
| Adjustment | ↑1 click if hot flashes persist after 4 weeks |

**Red Flags - Escalate to Provider:**
- Breast tenderness lasting >2 weeks
- Unexplained bleeding
- Severe headaches
- History of estrogen-sensitive cancer

### Progesterone Protocol
| Parameter | Guideline |
|-----------|-----------|
| Starting Dose | 2 clicks at bedtime |
| Application Sites | Breast or neck area |
| Goal Range | 75-270 pg/mL (luteal phase equivalent) |
| Primary Benefit | Deep sleep, anxiety reduction, estrogen counterbalance |

**Clinical Pearl:** Progesterone should ALWAYS accompany estrogen in women with intact uterus to prevent endometrial hyperplasia.

### Female Testosterone Protocol
| Parameter | Guideline |
|-----------|-----------|
| Starting Dose | 1-2 clicks AM |
| Application Sites | Clitoral area for localized effect, or inner arm |
| Goal Range | 40-80 ng/dL |
| Key Benefits | Libido, energy, muscle tone, cognitive clarity |

**Safety Monitoring:**
- Watch for acne, facial hair (androgen excess signs)
- If symptoms appear → reduce dose 50% and recheck labs in 4 weeks

## B. MALE HORMONE THERAPY (TRT)

### Testosterone Protocol (Men)
| Parameter | Guideline |
|-----------|-----------|
| Forms Available | Injectable, Transdermal cream |
| Goal Range (Total T) | 600-900 ng/dL |
| Lab Monitoring | PSA, CBC, CMP every 90 days |
| Critical Threshold | Hematocrit >54% = STOP therapy |

### LabCorp Safety Panel Requirements (Males)
**REQUIRED before initiating TRT:**
1. PSA (Prostate-Specific Antigen)
2. CBC with differential (watch Hematocrit)
3. CMP (Liver function baseline)
4. Total/Free Testosterone baseline
5. Estradiol (E2)

**Red Flags - Immediate Provider Review:**
- PSA >4.0 or rapid rise
- Hematocrit >54%
- Hemoglobin >18 g/dL
- Signs of sleep apnea worsening
- Significant edema

## C. WEIGHT LOSS PROTOCOLS (GLP-1)

### Semaglutide Titration Schedule
| Week | Dose | Notes |
|------|------|-------|
| 1-4 | 0.25mg weekly | Initiation phase |
| 5-8 | 0.5mg weekly | Titration |
| 9-12 | 1.0mg weekly | Therapeutic range |
| 13+ | 1.7mg or 2.4mg | As tolerated |

### Tirzepatide Titration Schedule
| Week | Dose | Notes |
|------|------|-------|
| 1-4 | 2.5mg weekly | Initiation phase |
| 5-8 | 5mg weekly | Titration |
| 9-12 | 7.5mg weekly | Therapeutic range |
| 13+ | 10-15mg | Maximum as tolerated |

### GLP-1 Side Effect Management

**Nausea (Most Common):**
- Eat smaller, more frequent meals
- Avoid fatty/greasy foods
- Slow the titration schedule if severe
- Consider anti-nausea meds if persistent

**Constipation:**
- Increase fiber (25-30g daily)
- Hydration target: 64-80 oz daily
- Stool softener if needed
- Miralax PRN

**Injection Site Reactions:**
- Rotate sites weekly (abdomen, thigh, arm)
- Let alcohol dry completely before injection
- Report any signs of infection

**Serious (Escalate Immediately):**
- Severe abdominal pain → pancreatitis risk
- Gallbladder symptoms → cholecystitis risk
- Signs of thyroid nodule
- Suicidal ideation

## D. KETAMINE THERAPY PROTOCOLS

### IV Ketamine Standard Protocol
| Phase | Details |
|-------|---------|
| Candidacy | Treatment-resistant depression, anxiety, PTSD, OCD |
| Screening | PHQ-9, GAD-7, medical history review |
| Initial Series | 6 infusions over 2-3 weeks |
| Maintenance | Monthly or PRN based on response |

### Pre-Treatment Requirements
- NPO 4 hours (food), 2 hours (clear liquids)
- Arrange ride home (no driving 24 hours)
- Complete Osmind intake forms
- Review current medications (avoid MAOIs)

### Ketamine Contraindications
| Absolute | Relative |
|----------|----------|
| Uncontrolled hypertension | History of psychosis |
| Active substance abuse | Pregnancy/nursing |
| Severe liver disease | Unstable cardiac conditions |
| Increased ICP | Current manic episode |

### Pricing
- Single IV Ketamine Infusion: $400
- 6-Session Package: $2,200 (save $200)
- Affirm financing available

---

# SECTION 4: LAB INTERPRETATION GUIDELINES

## A. HORMONE PANEL INTERPRETATION

### Estradiol (E2) Interpretation
| Level (pg/mL) | Interpretation | Action |
|---------------|----------------|--------|
| <20 | Severely deficient | Initiate/increase therapy |
| 20-50 | Low, symptomatic | Adjust dose upward |
| 50-100 | Optimal therapeutic range | Maintain current dose |
| 100-200 | High-normal | Monitor for symptoms |
| >200 | Excessive | Reduce dose, investigate |

### Progesterone Interpretation (Saliva)
| Level (pg/mL) | Interpretation | Action |
|---------------|----------------|--------|
| <75 | Low/deficient | Initiate or increase |
| 75-270 | Optimal (luteal equivalent) | Maintain |
| >270 | High | Reduce if symptoms present |

### Testosterone Interpretation

**Women (ng/dL):**
| Level | Interpretation | Action |
|-------|----------------|--------|
| <20 | Deficient | Consider supplementation |
| 40-80 | Optimal therapeutic | Maintain |
| >100 | Excess | Reduce, watch for virilization |

**Men (ng/dL):**
| Level | Interpretation | Action |
|-------|----------------|--------|
| <300 | Clinically low | TRT candidate |
| 300-500 | Low-normal | Consider symptoms |
| 600-900 | Optimal | Target range |
| >1000 | Supraphysiologic | Reduce dose |

### DHEA-S Interpretation
| Level (μg/dL) | Interpretation | Action |
|---------------|----------------|--------|
| <100 | Low (adrenal fatigue pattern) | Supplement 25-50mg |
| 100-350 | Normal | Monitor |
| >500 | Elevated | Investigate source |

## B. CORTISOL RHYTHM INTERPRETATION (4-Point Saliva)

### Normal Diurnal Pattern
- **Morning (7-8am):** Highest (peak)
- **Noon (11am-12pm):** Declining
- **Evening (4-5pm):** Lower
- **Night (10-11pm):** Lowest (trough)

### Abnormal Patterns

**Pattern: Flat Low (Adrenal Exhaustion)**
- All 4 points low
- Indicates: Chronic stress, burnout, late-stage adrenal dysfunction
- Treatment: Adrenal support protocol, stress reduction, sleep optimization
- Supplements: DHEA, Pregnenolone, AdreneVive, B vitamins

**Pattern: Flat High (Chronic Stress Response)**
- All 4 points elevated
- Indicates: Active stress response, early adrenal dysfunction
- Treatment: Stress management, cortisol modulators
- Consider: Ashwagandha, Phosphatidylserine (PM)

**Pattern: Inverted (Night Owl)**
- Low morning, high evening/night
- Indicates: Circadian disruption, poor sleep hygiene
- Treatment: Light therapy AM, sleep hygiene, melatonin PM
- Clinical Pearl: Common in shift workers, screen addicts

**Pattern: Blunted Morning**
- Low morning with normal afternoon drop
- Indicates: Morning fatigue, possible depression
- Treatment: Morning light exposure, cortisol support

## C. NEUROTRANSMITTER INTERPRETATION

### Serotonin
| Level | Interpretation | Common Symptoms |
|-------|----------------|-----------------|
| Low | Deficiency | Depression, anxiety, poor sleep, carb cravings |
| Optimal | Balanced | Stable mood, good sleep |
| High | Excess (rare) | Serotonin syndrome risk if on SSRIs |

**Support Protocol for Low Serotonin:**
- 5-HTP 50-100mg at bedtime
- Tryptophan-rich foods
- Sunlight exposure
- Exercise

### Dopamine
| Level | Interpretation | Common Symptoms |
|-------|----------------|-----------------|
| Low | Deficiency | Low motivation, anhedonia, fatigue, brain fog |
| Optimal | Balanced | Good focus, motivation, pleasure |
| High | Excess | Anxiety, agitation |

**Support Protocol for Low Dopamine:**
- Tyrosine 500-1000mg AM
- Mucuna pruriens
- Regular exercise
- Reduce sugar/processed foods

### GABA
| Level | Interpretation | Common Symptoms |
|-------|----------------|-----------------|
| Low | Deficiency | Anxiety, insomnia, muscle tension |
| Optimal | Balanced | Calm, relaxed, good sleep |
| High | Rare | Excessive sedation |

**Support Protocol for Low GABA:**
- GABA 500-750mg at bedtime
- L-Theanine 200-400mg
- Magnesium glycinate
- Reduce caffeine/alcohol

### Glutamate
| Level | Interpretation | Common Symptoms |
|-------|----------------|-----------------|
| High | Excitotoxicity risk | Anxiety, insomnia, brain fog, migraines |
| Optimal | Balanced | Good memory, focus |
| Low | Rare | Cognitive issues |

**Support Protocol for High Glutamate:**
- Reduce MSG, processed foods
- Magnesium threonate
- NAC 600-1200mg
- L-Theanine (balances glutamate)

## D. METABOLIC PANEL INTERPRETATION

### Thyroid (TSH, Free T3, Free T4)
| Marker | Optimal Range | Notes |
|--------|---------------|-------|
| TSH | 1.0-2.5 mIU/L | Optimal functional range |
| Free T3 | 3.0-4.0 pg/mL | Active hormone |
| Free T4 | 1.0-1.5 ng/dL | Storage hormone |
| TPO Antibodies | <35 IU/mL | Autoimmune marker |

**Pattern: Subclinical Hypothyroid**
- TSH 3.0-10.0 with normal T3/T4
- Symptoms: Fatigue, weight gain, cold intolerance
- Action: Consider trial of thyroid support

**Pattern: Poor T4→T3 Conversion**
- Normal T4, Low T3
- Causes: Stress, nutrient deficiencies, inflammation
- Support: Selenium, zinc, stress reduction

### Fasting Insulin
| Level (μIU/mL) | Interpretation | Action |
|----------------|----------------|--------|
| <5 | Optimal | Maintain |
| 5-10 | Borderline | Lifestyle modifications |
| 10-15 | Insulin resistant | GLP-1 candidate |
| >15 | Significant IR | Aggressive intervention |

### HbA1c
| Level (%) | Interpretation | Risk |
|-----------|----------------|------|
| <5.4 | Optimal | Low |
| 5.5-5.6 | Borderline | Moderate |
| 5.7-6.4 | Pre-diabetic | High |
| ≥6.5 | Diabetic | Very High |

### Lipid Panel
| Marker | Optimal | Concerning |
|--------|---------|------------|
| Total Cholesterol | <200 | >240 |
| LDL | <100 | >160 |
| HDL | >50 (F), >40 (M) | <40 |
| Triglycerides | <150 | >200 |

---

# SECTION 5: PEPTIDE THERAPY PROTOCOLS

## Growth & Recovery Peptides

### Sermorelin - $149/month
| Parameter | Details |
|-----------|---------|
| Mechanism | GHRH analog, stimulates natural GH release |
| Dose | Standard injection subcutaneously at bedtime |
| Requirements | Empty stomach (2-3 hours fasted) |
| Benefits | Sleep quality, recovery, body composition, natural GH support |
| Timeline | 4-8 weeks for noticeable effects |
| Storage | Refrigerate medication |

### CJC-1295/Ipamorelin - $179/month
| Parameter | Details |
|-----------|---------|
| Mechanism | GH pulse stimulation |
| Dose | Subcutaneous injection at bedtime |
| Benefits | Similar to Sermorelin, often better tolerated |
| Timeline | 4-6 weeks for effects |
| Best For | Patients who don't respond to Sermorelin |

### Tesamorelin - $399/month (FDA-Approved)
| Parameter | Details |
|-----------|---------|
| Mechanism | FDA-approved GHRH analog |
| Target | Visceral fat reduction |
| Dose | Daily subcutaneous injection |
| Timeline | 8-12 weeks for visible results |
| Best For | Significant visceral adiposity |

## Cellular Energy Peptides

### NAD+ Options
| Form | Price | Bioavailability | Best For |
|------|-------|-----------------|----------|
| Troches | $99/month | Moderate | Daily maintenance |
| Injection | $199/month | High | Severe fatigue |
| Nasal Spray | $99 (one-time) | Fast-acting | Quick cognitive boost |

### 5-Amino-1MQ - $279/month
| Parameter | Details |
|-----------|---------|
| Mechanism | NNMT enzyme inhibitor |
| Benefits | Improves fat metabolism, targets stubborn adipose |
| Timeline | 4-8 weeks |
| Synergy | Often combined with GLP-1 |

## Sexual Wellness Peptides

### PT-141 - $225/kit (10 doses, FDA-Approved)
| Parameter | Details |
|-----------|---------|
| Mechanism | Melanocortin receptor agonist (brain-based) |
| Onset | 1-4 hours |
| Duration | 24-72 hours |
| Use | PRN, not daily |
| Works For | Both men and women |

### Oxytocin Nasal Spray - $79/month
| Parameter | Details |
|-----------|---------|
| Nickname | "The love hormone" |
| Benefits | Emotional bonding, intimacy, reduced social anxiety |
| Onset | 30-60 minutes |
| Use | 1-2 sprays before intimate settings |

## Skin & Hair Regeneration

### GHK-Cu (Copper Peptide)
| Form | Price | Application |
|------|-------|-------------|
| Sublingual | $99 (one-time) | Systemic collagen support |
| Topical | $149 (one-time) | Targeted skin concerns |

---

# SECTION 6: IV HYDRATION PROTOCOLS

## Available Drips
| Drip Name | Price | Key Ingredients | Best For |
|-----------|-------|-----------------|----------|
| The Myers | $149 | B vitamins, Mg, Ca, C | General wellness |
| The Shield | $179 | High-dose C, Zinc | Immunity boost |
| The Glow | $169 | Glutathione, Biotin | Beauty, skin |
| The Resurrection | $169 | Electrolytes, Zofran | Hangover recovery |
| Beast Mode | $189 | Amino acids, B12 | Athletic recovery |

## Add-On Boosters
| Booster | Price | Benefit |
|---------|-------|---------|
| B12 | $25 | Energy, metabolism |
| Glutathione | $35 | Antioxidant, detox |
| NAD+ Booster | $50 | Cellular energy |
| Vitamin D | $30 | Immune support |
| Toradol | $25 | Pain/inflammation |
| Zofran | $25 | Nausea relief |

## IV Safety Screening
Before administration, screen for:
- Kidney disease (affects fluid balance)
- Heart failure (fluid overload risk)
- Current medications (interactions)
- Allergies (especially B vitamins)
- Pregnancy status

---

# SECTION 7: PATIENT ONBOARDING WORKFLOW

## Step-by-Step Flow
1. **Lead Capture** → Website, phone, chat, referral
2. **$99 Consultation** → Book via website/phone
3. **Intake Forms** → Complete symptom questionnaire
4. **Consultation** → Telehealth or in-person with provider
5. **Lab Kit Purchase** → $99 credited toward kit
6. **Kit Shipped** → ZRT ships within 24-48 hours
7. **Sample Collection** → Patient completes at home
8. **Sample Returned** → Patient mails back to ZRT
9. **Results (7-10 days)** → Labs arrive in portal
10. **Provider Review** → Labs analyzed, plan created
11. **Lab Review Call** → Results discussed with patient
12. **Treatment Authorization** → Patient approves plan
13. **Pharmacy Order** → Holgate compounds medication
14. **Medication Shipped** → 2-3 day delivery
15. **Treatment Begins** → Patient starts protocol

## Status Definitions
| Status | Meaning |
|--------|---------|
| pending_invite | Lead, not yet invited to portal |
| intake_pending | Invited, intake not complete |
| intake_complete | Forms done, awaiting labs |
| labs_pending | Kit ordered, awaiting results |
| labs_received | Results in, needs provider review |
| treatment_pending | Plan created, awaiting authorization |
| treatment_active | On treatment, monitoring phase |
| maintenance | Stable, quarterly check-ins |
| paused | Temporarily stopped treatment |
| churned | Cancelled membership |

---

# SECTION 8: STAFF PORTAL WORKFLOWS

## Triage Tab Operations

### Color-Coded Priority
| Color | Meaning | Action Required |
|-------|---------|-----------------|
| 🔴 Red | High risk / Safety flag | Immediate provider review |
| 🟡 Yellow | Elevated symptoms / Overdue | Review within 24 hours |
| 🟢 Green | Normal / Stable | Standard workflow |

### Safety Flags (Auto-Triggered)
- PHQ-9 score ≥15
- Suicidal ideation indicated
- Hematocrit >54% (males)
- Androgen excess symptoms (females)
- Adverse reaction reported

## Patient Panel Actions

### Lab Management
- **Order LabCorp Panel** → Generates requisition PDF
- **Mark Labs Reviewed** → Unlocks patient Health Report
- **Generate ZRT Requisition** → For home kit orders

### Treatment Management
- **Assign Protocol** → Select from protocol library
- **Authorize Treatment** → Triggers pharmacy workflow
- **Adjust Dosing** → Log dose changes with notes

### Communication
- **Send Message** → Secure patient messaging
- **Send Kit Link** → Payment link for lab kit
- **Schedule Follow-up** → Book next appointment

### Billing
- **Generate Superbill** → Insurance reimbursement document
- **Process IV Payment** → Point-of-sale for walk-ins
- **Apply Credit** → Consultation credit toward kit

## No-Show Protocol
1. Mark patient as "No-Show" in portal
2. System automatically requires $99 rebooking fee
3. Document reason in notes if known
4. Follow up within 24 hours via phone/text

---

# SECTION 9: PHARMACY & FULFILLMENT

## Primary Pharmacy Partner
**Holgate Pharmacy (Compounding)**
- Phone: 404-555-0199
- Fax: Via portal integration
- Turnaround: 2-3 business days
- Shipping: Priority Mail with tracking

## Prescription Templates

### Female HRT Standard
- Bi-Est Cream (80/20) - As directed
- Progesterone Cream - As directed
- Testosterone Cream (for women) - As directed

### Male TRT Standard
- Testosterone Cypionate - As directed
- Anastrozole (if needed for E2 control)
- HCG (if fertility preservation needed)

### GLP-1 Options
- Semaglutide Injectable
- Tirzepatide Injectable

## Rx Workflow
1. Provider authorizes treatment in portal
2. Staff generates prescription
3. Fax sent to Holgate via integration
4. Pharmacy confirms receipt (usually same day)
5. Medication compounded
6. Shipped directly to patient
7. Tracking number logged in portal

---

# SECTION 10: INSURANCE & BILLING

## Insurance Status by Service
| Service | Insurance Status |
|---------|------------------|
| Ketamine IV | Often covered (BCBS, TRICARE, VA) |
| SPRAVATO | Often covered (requires prior auth) |
| Hormone Therapy | Cash-pay, Superbill provided |
| Weight Loss | Cash-pay, Superbill provided |
| Peptides | Cash-pay only |
| IV Therapy | Cash-pay only |

## Superbill Components
Every superbill must include:
- Patient demographics
- Date of service
- Provider NPI
- Clinic Tax ID
- ICD-10 diagnosis codes
- CPT procedure codes
- Charges per code
- Total charge

## Common ICD-10 Codes
| Code | Description | Use For |
|------|-------------|---------|
| E23.0 | Hypopituitarism | HRT |
| E29.1 | Testicular hypofunction | Male TRT |
| E28.39 | Primary ovarian failure | Female HRT |
| E66.9 | Obesity unspecified | GLP-1 |
| F32.9 | Depressive episode | Ketamine |
| F41.9 | Anxiety disorder | Ketamine |

## Payment Accepted
- Major credit cards
- HSA/FSA cards
- Affirm financing (Ketamine)
- Payment plans available for packages

---

# SECTION 11: SAFETY PROTOCOLS

## Emergency Procedures

### If Patient Reports Suicidal Ideation:
1. Do NOT end the conversation abruptly
2. Express concern and validate feelings
3. Direct to call 988 (Suicide Lifeline) or 911
4. Document interaction immediately
5. Alert provider ASAP
6. Flag patient record in portal

### Adverse Reaction Protocol:
1. Document symptoms in detail
2. STOP the suspected medication
3. Alert provider immediately
4. If severe → direct to ER
5. Log incident in portal
6. Schedule urgent follow-up

### Ketamine Emergency (During Infusion):
1. Stop infusion immediately
2. Monitor vitals continuously
3. Administer midazolam if needed (per protocol)
4. Call 911 if unstable
5. Document everything

## Medication Safety Thresholds

### TRT Monitoring (Males)
| Marker | Stop Threshold | Action |
|--------|----------------|--------|
| Hematocrit | >54% | Stop TRT, hydrate, therapeutic phlebotomy |
| PSA | >4.0 or rapid rise | Stop TRT, urology referral |
| Hemoglobin | >18 g/dL | Stop TRT, evaluate |

### Female HRT Monitoring
| Symptom | Concern | Action |
|---------|---------|--------|
| Unexplained bleeding | Endometrial issue | OB/GYN referral |
| Breast lumps | Cancer screening | Mammogram, provider review |
| Severe headaches | Stroke risk | ER if sudden onset |

---

# SECTION 12: COMMON QUESTIONS & SCRIPTS

## Handling Price Objections

**"$99 seems expensive for just a consultation."**
> "I understand. Here's the thing—that $99 is actually credited toward your lab kit. So if you proceed with care, the consultation is effectively free. You're just reserving time with the provider and showing commitment to your health."

**"Can I just get the medication without labs?"**
> "Our philosophy is 'Test, Don't Guess.' Labs protect you by ensuring we prescribe exactly what you need and can monitor safety. We wouldn't be practicing good medicine if we prescribed blindly."

**"Do you accept my insurance?"**
> "We're a cash-pay concierge clinic for most services, which means you pay us directly. However, we provide Superbills that you can submit to your insurance for potential out-of-network reimbursement. Many patients get 60-80% back. HSA and FSA cards work just like credit cards here."

## Scheduling Scripts

**New Patient:**
> "I'd love to get you scheduled. The first step is a $99 Clinical Strategy Session—this can be done via telehealth or in-person. That $99 gets credited toward your lab kit if you proceed. What works better for you—telehealth or coming in?"

**Lab Review:**
> "Great news—your lab results are in! Let's schedule your Lab Review so the provider can walk you through everything and discuss your treatment options. We have availability [dates/times]."

---

# SECTION 13: CONTACT & RESOURCES

## Clinic Information
- **Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
- **Phone:** (706) 760-3470
- **Email:** admin@elevatedhealthaugusta.com
- **Website:** elevatedhealthaugusta.com

## Pharmacy Contacts
- **Holgate Pharmacy:** 404-555-0199

## Emergency Contacts
- **Suicide Lifeline:** 988
- **Emergency:** 911
- **Poison Control:** 1-800-222-1222

## Lab Partners
- **ZRT Laboratory:** At-home saliva/blood spot kits
- **LabCorp:** Blood draw for male TRT panels

---
END OF CLINICAL PROTOCOL DOCUMENT
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

    const systemPrompt = `You are the Elevated Health Clinical Assistant, an internal AI helper for clinic staff and providers at Elevated Health Augusta. You have access to the clinic's complete clinical operations guide including protocols, lab interpretation guidelines, and internal workflows.

IMPORTANT RULES:
1. You are ONLY accessible to authenticated staff and admin users
2. Never share this information with patients
3. For clinical decisions, always recommend provider review
4. Be direct and concise - staff are busy
5. Use tables and bullet points for clarity
6. Reference specific protocols, dosing, and lab ranges when relevant

${CLINIC_KNOWLEDGE}
${patientContext}

When answering:
- Reference specific sections and tables from the knowledge base
- For lab interpretation, provide the optimal ranges and suggested actions
- For dosing questions, cite the protocol but always recommend provider confirmation
- For safety concerns, escalate appropriately
- If you don't know something, say so clearly

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

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
