

# Complete Plan: Secure Public Intake + Personalized Welcome Emails

## Overview

This plan addresses three requirements:
1. **Secure Public Intake Form** - Token-based intake without patient login
2. **Fix Contact Info** - Update wrong address and phone number in emails
3. **Personalized Email Content** - Tailor welcome emails to patient's service interests

---

## Part 1: Contact Information Fixes

### Current (Wrong)

| Field | Wrong Value |
|-------|-------------|
| Address | 3523 Walton Way Ext, Suite A \| Augusta, GA 30909 |
| Phone | (706) 426-6862 |

### Correct Values (from SITE_CONFIG)

| Field | Correct Value |
|-------|---------------|
| Address | 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809 |
| Phone | (706) 760-3470 |

---

## Part 2: Service-Specific Email Content

Instead of generic "Hormone Therapy journey", emails will display content tailored to the patient's interests:

### Service Content Map

| Service Interest | Email Heading | Description |
|------------------|---------------|-------------|
| **ketamine** | "Mental Wellness & Ketamine Therapy" | Focus on mental health support, breakthrough treatment |
| **hormone** | "Hormone Optimization" | Focus on energy, vitality, balance |
| **weight_loss** | "Metabolic Health & Weight Loss" | Focus on GLP-1 therapy, sustainable results |
| **general** | "Personalized Wellness" | General wellness journey |
| **Multiple interests** | Combined list | "your Hormone Optimization and Weight Loss journey" |

### Email Personalization Logic

```typescript
// Build service description from all interests
const serviceDescriptions: Record<string, { name: string; tagline: string }> = {
  ketamine: {
    name: "Mental Wellness & Ketamine Therapy",
    tagline: "breakthrough mental health support"
  },
  hormone: {
    name: "Hormone Optimization",
    tagline: "restored energy and vitality"
  },
  weight_loss: {
    name: "Weight Loss & Metabolic Health",
    tagline: "sustainable, medically-guided weight management"
  },
  general: {
    name: "Personalized Wellness",
    tagline: "your optimal health goals"
  }
};

// Combine multiple interests into readable list
// e.g., ["hormone", "weight_loss"] → "Hormone Optimization and Weight Loss"
```

---

## Part 3: Secure Public Intake Form

### Database Changes

Add intake token columns to patients table:

```sql
ALTER TABLE public.patients
ADD COLUMN intake_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN intake_token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

CREATE INDEX idx_patients_intake_token 
ON public.patients(intake_token) 
WHERE intake_token IS NOT NULL;
```

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PublicIntake.tsx` | Public intake form (no auth required) |
| `supabase/functions/submit-public-intake/index.ts` | Validate token + save intake data |

### Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│  1. Staff adds patient with "Send Welcome Email" checked            │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Patient record created with:                                    │
│     • intake_token = UUID                                          │
│     • intake_token_expires_at = 7 days from now                    │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Welcome email sent with personalized content:                   │
│     • Service-specific messaging (ketamine/hormone/weight loss)    │
│     • Correct address: 7013 Evans Town Center Blvd, Suite 203      │
│     • Correct phone: (706) 760-3470                                │
│     • "Complete Intake" button → /intake?token=abc123              │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Patient clicks link → Public intake form (no login)            │
│     • Token validated via edge function                            │
│     • Patient name pre-filled                                      │
│     • Collects: DOB, address, allergies, symptoms, history         │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Intake submitted:                                               │
│     • Data saved to patient's medical_history                      │
│     • Token invalidated (one-time use)                             │
│     • onboarding_status → "intake_complete"                        │
│     • Provider notification sent                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify/Create

### Modified Files

| File | Changes |
|------|---------|
| `supabase/functions/add-existing-patient/index.ts` | 1. Fix address/phone, 2. Add service-specific content, 3. Generate intake token, 4. Update email CTA link |
| `src/App.tsx` | Add public `/intake` route |

### New Files

| File | Description |
|------|-------------|
| `src/pages/PublicIntake.tsx` | Branded public intake form with token validation |
| `supabase/functions/submit-public-intake/index.ts` | Token validation + data save + provider notification |
| Database migration | Add intake_token columns + index |

---

## Updated Email Template Preview

```html
<h2>Welcome, {firstName}!</h2>

<p>We're excited to have you as part of the Elevated Health family. 
Your account has been created and you're ready to begin your 
<strong>Mental Wellness & Ketamine Therapy</strong> journey with us.</p>

<!-- For ketamine patients: -->
<p>Our ketamine therapy program offers breakthrough treatment for 
depression, anxiety, and PTSD. Our medical team will guide you 
through every step of your healing journey.</p>

<!-- For hormone patients: -->
<p>Our hormone optimization program is designed to restore your 
energy, vitality, and overall well-being through personalized 
bioidentical hormone therapy.</p>

<!-- CTA Button -->
<a href="https://elevatedhealthaugusta.com/intake?token={token}">
  Complete Your Medical Intake
</a>

<!-- Footer with CORRECT info -->
<p>Elevated Health Augusta</p>
<p>7013 Evans Town Center Blvd, Suite 203 | Evans, GA 30809</p>
<p>(706) 760-3470 | booking@elevatedhealthaugusta.com</p>
```

---

## Public Intake Form Sections

The intake form will collect:

1. **Personal Information**
   - Date of Birth
   - Preferred Phone (verify/update)
   - Shipping Address (for medications)

2. **Medical History**
   - Current medications
   - Allergies
   - Previous surgeries
   - Family history (cardiac, mental health)

3. **Service-Specific Questions**
   - **Ketamine**: PHQ-9, GAD-7, mental health history, current treatments
   - **Hormone**: Symptom checklist, energy/libido/sleep scores
   - **Weight Loss**: Current weight, goal weight, previous attempts, medications

4. **Safety Screening**
   - Pregnancy status
   - Cardiac conditions
   - Substance use history (for ketamine)

5. **Consent & Acknowledgment**
   - HIPAA acknowledgment
   - Treatment consent

---

## Security Measures

| Measure | Implementation |
|---------|----------------|
| **UUID Token** | Cryptographically random, unguessable |
| **7-Day Expiry** | Token expires if not used within a week |
| **One-Time Use** | Token invalidated after successful submission |
| **No PHI in URL** | Only opaque token in URL, no patient data |
| **Rate Limiting** | Edge function includes abuse prevention |
| **Input Validation** | Zod schema validation on all form fields |

---

## Summary of Changes

| Task | Description |
|------|-------------|
| 1 | Fix address to `7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809` |
| 2 | Fix phone to `(706) 760-3470` |
| 3 | Add service-specific email content based on interests |
| 4 | Support multiple interests (e.g., "Hormone and Weight Loss") |
| 5 | Add intake_token columns to patients table |
| 6 | Create public intake form page |
| 7 | Create token validation edge function |
| 8 | Update email CTA to point to public intake with token |
| 9 | Send provider notification when intake is completed |

