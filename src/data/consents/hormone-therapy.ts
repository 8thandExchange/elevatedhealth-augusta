import type { ConsentDocument } from "./types";

/** Legal text v2026-05-15-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const hormoneTherapyConsent: ConsentDocument = {
  type: "hormone_therapy",
  version_label: "2026-05-15-v1",
  title: "Hormone Replacement Therapy Informed Consent",
  tier: 2,
  body_markdown: `
# HORMONE REPLACEMENT THERAPY INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-05-15-v1
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES THE BENEFITS, RISKS, AND ALTERNATIVES OF HORMONE REPLACEMENT THERAPY ("HRT"). BY SIGNING THIS DOCUMENT, YOU ARE CONSENTING TO RECEIVE HORMONE REPLACEMENT THERAPY FROM ELEVATED HEALTH AUGUSTA.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of hormone replacement therapy ("HRT") from Elevated Health Augusta (the "Practice"). HRT may include, depending on my clinical needs and the recommendations of the clinical team:
### 1.1 — Hormones I May Receive
**For male patients (Testosterone Replacement Therapy / "TRT"):**
- Compounded transdermal testosterone cream (daily application) — our standard men's TRT offering
- Testosterone gel or FDA-approved transdermal alternatives when clinically indicated and available
- Anastrozole or other aromatase inhibitors, if needed to manage estradiol levels during testosterone therapy
- Human Chorionic Gonadotropin (HCG) or related agents, if clinically indicated to preserve testicular function or fertility
- Enclomiphene citrate or other selective estrogen receptor modulators ("SERMs"), if clinically indicated as an alternative or adjunct to testosterone therapy
**For female patients (Bioidentical Hormone Replacement Therapy / "BHRT"):**
- Estradiol (bioidentical estrogen), administered as topical cream, transdermal patch, vaginal preparation, or compounded oral or sublingual preparations
- Estriol, alone or in combination with estradiol ("Bi-Est")
- Progesterone (bioidentical), administered orally, topically, or vaginally
- Testosterone (low-dose for female patients), administered as topical cream or compounded preparations
- DHEA, if clinically indicated
**For all patients:**
- Pregnenolone, if clinically indicated
- Thyroid hormone replacement (levothyroxine, liothyronine, or compounded T4/T3 combinations), if clinically indicated and supported by laboratory evidence
- Other hormonal agents that the clinical team and I agree are appropriate based on my clinical situation
### 1.2 — Compounded vs. Commercial Medications
I understand that:
- Some of the medications I may receive are FDA-approved commercial pharmaceutical products
- Other medications I may receive are compounded by a state-licensed 503A compounding pharmacy under prescription
- Compounded medications are NOT FDA-approved commercial products; they are prepared individually for me under prescription
- The Practice and I will discuss which form (commercial vs. compounded) is appropriate based on my clinical needs, insurance status (the Practice does not bill insurance, but I may have separate coverage for FDA-approved products), and personal preference
### 1.3 — Compounding Pharmacy Partners
The Practice works with the following 503A compounding pharmacies for hormone preparations:
- **Custom Pharmacy of Evans** — Evans, Georgia — primary for all hormone therapy: Bi-Est transdermal cream, oral micronized progesterone, women's low-dose testosterone cream, men's transdermal testosterone cream, and related preparations
- **Formulation Compounding Center (FCC)** — Lewisville, Texas — backup injectable and alternate formulations (troches, capsules) when clinically indicated
- **DrFirst Rcopia** — FDA-approved retail patches, gels, and brand testosterone when patient prefers commercial products
The Practice may use other state-licensed 503A compounding pharmacies as clinically appropriate or as availability requires.
### 1.4 — Administration Methods
Hormones may be administered by various routes including, but not limited to:
- Intramuscular or subcutaneous injection (self-administered at home after training)
- Topical creams, gels, or patches
- Vaginal preparations (for female patients receiving local estrogen therapy)
- Oral or sublingual preparations
- Subcutaneous pellet implantation (if offered)
The clinical team and I will determine the appropriate route based on my clinical needs, lifestyle, and preferences.
---
## SECTION 2 — POTENTIAL BENEFITS OF HRT
I understand that HRT may, but is not guaranteed to, provide the following benefits:
### 2.1 — For Patients Receiving Testosterone Therapy
- Improved energy and reduced fatigue
- Improved mood and reduced symptoms of depression in patients with documented low testosterone
- Improved libido and sexual function
- Improved muscle mass and reduced body fat
- Improved bone mineral density
- Improved exercise capacity
- Improvement in symptoms of hypogonadism
### 2.2 — For Patients Receiving Estrogen and/or Progesterone Therapy
- Relief of vasomotor symptoms (hot flashes, night sweats)
- Relief of genitourinary symptoms (vaginal dryness, urinary symptoms)
- Improvement in sleep quality
- Improvement in mood and reduction in mood lability associated with perimenopause and menopause
- Improvement in skin quality and elasticity
- Preservation of bone mineral density
- Potential cardiovascular benefits when started near the time of menopause (the "timing hypothesis"; benefits are most established for women under 60 or within 10 years of menopause onset)
- Reduction in risk of certain conditions, depending on individual circumstances
### 2.3 — For Patients Receiving Thyroid Replacement
- Resolution of hypothyroid symptoms (fatigue, cold intolerance, weight changes, cognitive symptoms)
- Normalization of thyroid laboratory markers
I understand that individual response to HRT varies significantly, and that the Practice has NOT guaranteed any specific benefit.
---
## SECTION 3 — GENERAL RISKS OF HRT (ATTESTATION REQUIRED)
### 3.1 — Risks Common Across Hormone Therapies
**Injection-site reactions** (for injected hormones): redness, pain, swelling, bruising, lump formation, or infection at the injection site. Infection is rare with proper technique but can be serious.
**Topical administration reactions:** skin irritation, redness, or rash at the application site. Possibility of transfer to others through skin contact (particularly important for testosterone applied topically — transfer to female partners or children can cause virilization in them).
**Allergic reactions:** rare but possible reactions to the active ingredient or to compounding excipients (carrier oils, preservatives, alcohol bases, etc.). Severe allergic reactions can be life-threatening if not treated immediately.
**Mood changes:** depending on the hormone and dose, may include mood elevation, irritability, anxiety, depression, emotional lability, or aggression. Significant mood changes should be reported to the Practice.
**Cardiovascular considerations:** hormones can affect cardiovascular risk factors. The relationship between HRT and cardiovascular disease is complex and depends on the patient's age, time since menopause (for women), baseline cardiovascular health, and the specific hormones used. Routine monitoring is required.
**Blood clot risk:** estrogen therapy, particularly oral estrogen, increases the risk of venous thromboembolism (blood clots). Risk is lower with transdermal preparations. Testosterone therapy may also affect coagulation.
**Liver effects:** oral hormones are metabolized through the liver and may affect liver function. Routine liver monitoring may be required.
**Effects on existing medical conditions:** HRT may worsen certain conditions (including but not limited to hormone-sensitive cancers, severe liver disease, severe heart disease, and uncontrolled hypertension). The clinical team will review my medical history before initiating therapy.
### 3.2 — Section 3 Attestation
**I attest that I have read Section 3 in its entirety. I understand the general risks of hormone replacement therapy, including injection-site and topical reactions, allergic reactions, mood changes, cardiovascular and blood clot considerations, liver effects, and effects on existing medical conditions. I have had the opportunity to discuss my personal medical history with the clinical team.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 4 — SPECIFIC RISKS OF TESTOSTERONE THERAPY (ATTESTATION REQUIRED)
If I am receiving testosterone therapy, I specifically understand and accept the following additional risks:
### 4.1 — Polycythemia (Elevated Red Blood Cell Count)
Testosterone therapy can increase red blood cell count, leading to polycythemia or erythrocytosis. Severe polycythemia increases the risk of blood clots, stroke, and heart attack. I will complete regular hematocrit monitoring. If my hematocrit exceeds the threshold established by the clinical team, dose reduction, dose interruption, or therapeutic phlebotomy (blood donation) may be required.
### 4.2 — Cardiovascular Risk
The relationship between testosterone therapy and cardiovascular events is the subject of ongoing scientific debate. Some studies have suggested increased cardiovascular risk; others have not. I understand that:
- Testosterone therapy may increase cardiovascular risk in certain patient populations
- The Practice will assess my cardiovascular risk before and during therapy
- I will report any chest pain, shortness of breath, palpitations, or other cardiovascular symptoms promptly
### 4.3 — Prostate Considerations
In male patients:
- Testosterone may stimulate growth of prostate tissue
- Testosterone is contraindicated in patients with active prostate cancer
- Testosterone therapy in patients with a history of prostate cancer requires consultation with their urologist or oncologist
- PSA (prostate-specific antigen) monitoring is required during therapy
- Lower urinary tract symptoms may worsen during therapy
### 4.4 — Fertility and Testicular Function
In male patients, testosterone therapy:
- Suppresses natural testosterone production
- Significantly reduces sperm production, often to infertile levels
- May cause testicular atrophy (shrinkage)
- Recovery of fertility after discontinuation is variable and not guaranteed
- If I intend to father children in the future, I should consult with a reproductive specialist about fertility preservation (sperm banking) BEFORE starting testosterone therapy. The Practice does not provide or facilitate fertility preservation services.
- HCG or SERM adjunct therapy may partially preserve testicular function and fertility but does not guarantee preservation
### 4.5 — Estrogen Conversion
Testosterone can convert to estradiol in the body via the aromatase enzyme. Elevated estradiol in male patients may cause:
- Breast tenderness or development of glandular breast tissue (gynecomastia)
- Fluid retention and edema
- Mood changes
- Erectile difficulties
If estradiol levels become elevated, the clinical team may recommend an aromatase inhibitor (such as anastrozole). I understand that excessive estradiol suppression carries its own risks, including bone loss, joint pain, and mood effects.
### 4.6 — Acne, Hair Changes, and Sweating
Testosterone therapy may cause:
- Acne, particularly on the back, chest, and shoulders
- Increased body hair growth
- Male pattern hair loss (if genetically predisposed)
- Increased sweating
- Voice deepening (rare at therapeutic doses; more common in female patients receiving testosterone)
### 4.7 — Risks for Female Patients Receiving Testosterone
For female patients receiving low-dose testosterone:
- Increased body hair growth (hirsutism) and facial hair
- Acne
- Voice deepening (may be permanent)
- Clitoral enlargement (may be permanent)
- Male pattern hair loss
- Menstrual irregularities
Therapeutic doses for female patients are MUCH lower than male doses. Even small overdoses can cause virilizing effects that may be permanent.
### 4.8 — Section 4 Attestation
**I attest that I have read Section 4 in its entirety. I understand the specific risks of testosterone therapy, including polycythemia, cardiovascular risk, prostate considerations (if applicable), fertility effects (if applicable), estrogen conversion, and virilizing effects (if applicable). I understand that some virilizing effects in female patients may be permanent.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 5 — SPECIFIC RISKS OF ESTROGEN AND PROGESTERONE THERAPY (ATTESTATION REQUIRED)
If I am receiving estrogen and/or progesterone therapy, I specifically understand and accept the following additional risks:
### 5.1 — Breast Cancer Risk
The relationship between hormone therapy and breast cancer is complex:
- Combined estrogen-progestin therapy has been associated with a modest increase in breast cancer risk with longer-term use
- Estrogen-alone therapy (for women without a uterus) has been associated with a smaller or neutral effect on breast cancer risk in some studies
- The absolute increase in risk is small but real
- The risk may differ between bioidentical/transdermal preparations and synthetic/oral preparations, though evidence is incomplete
- Regular breast cancer screening (mammography per age-appropriate guidelines) is required during therapy
- Therapy is contraindicated in patients with active or recent breast cancer
### 5.2 — Endometrial Cancer Risk
In female patients with an intact uterus:
- Unopposed estrogen therapy (estrogen without progesterone) significantly increases the risk of endometrial cancer
- Patients with a uterus must receive progesterone (or progestin) alongside estrogen
- Any unexpected vaginal bleeding during therapy must be reported promptly and may require evaluation
### 5.3 — Cardiovascular and Stroke Risk
- Oral estrogen increases risk of venous thromboembolism (blood clots, including deep vein thrombosis and pulmonary embolism)
- Transdermal estrogen has a lower thromboembolic risk than oral preparations
- Estrogen therapy may increase stroke risk, particularly in older women and women started on therapy more than 10 years after menopause
- Therapy is contraindicated in patients with active or recent thromboembolic disease
### 5.4 — Gallbladder Disease
Estrogen therapy, particularly oral estrogen, increases the risk of gallbladder disease and may worsen pre-existing gallbladder problems.
### 5.5 — Progesterone Side Effects
Progesterone therapy may cause:
- Drowsiness or sedation (particularly with oral micronized progesterone)
- Mood changes, including depressed mood
- Bloating and breast tenderness
- Breakthrough bleeding (which should be reported)
### 5.6 — Risks for Male Patients Receiving Estrogen-Related Therapy
If estrogen therapy is being used in male patients for any clinically indicated reason, additional risks include:
- Gynecomastia (breast tissue development)
- Reduced libido and sexual function
- Fertility effects
- Mood changes
### 5.7 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the specific risks of estrogen and progesterone therapy, including breast cancer risk, endometrial cancer risk (if applicable), cardiovascular and stroke risk, gallbladder disease, and side effects of progesterone.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — ALTERNATIVES TO HRT
I understand that alternatives to HRT exist, including:
- **Lifestyle modifications:** diet, exercise, stress management, sleep optimization, weight management
- **Non-hormonal medications:** certain antidepressants (SSRIs/SNRIs) for vasomotor symptoms, gabapentin, oxybutynin, and others
- **Non-hormonal therapies:** vaginal moisturizers and lubricants for genitourinary symptoms
- **Cognitive and behavioral interventions:** for sleep, mood, and symptom management
- **No treatment:** acceptance of symptoms without pharmacological intervention
- **Specialty referral:** to endocrinology, urology, gynecology, or other specialists if my clinical situation is complex
I have considered these alternatives and voluntarily choose to receive HRT at this time.
---
## SECTION 7 — RIGHT TO REFUSE OR DISCONTINUE
I understand that:
- I have the right to refuse any specific component of the recommended HRT regimen
- I may discontinue therapy at any time
- The Practice may discontinue prescribing if my clinical situation changes, if monitoring is not completed, if I develop a contraindication, or if continued therapy is no longer appropriate in the Practice's judgment
- Discontinuation of HRT may result in return of symptoms or other clinical effects; the clinical team will discuss appropriate tapering when feasible
---
## SECTION 8 — LAB MONITORING AND FOLLOW-UP (ATTESTATION REQUIRED)
### 8.1 — Required Baseline Labs
Before initiating HRT, I will complete baseline laboratory testing as recommended by the clinical team, which may include:
- Complete blood count
- Comprehensive metabolic panel including liver function
- Lipid panel
- Hormone levels (testosterone total and free, estradiol, progesterone, DHEA-S, SHBG, others as indicated)
- Thyroid panel (TSH, free T3, free T4, antibodies as indicated)
- Prostate-specific antigen (PSA), for male patients over age 40 or as clinically indicated
- Other tests based on my medical history and the specific therapy I will receive
### 8.2 — Required Ongoing Lab Monitoring
While receiving HRT, I will complete ongoing lab monitoring at intervals determined by the clinical team. Typical monitoring schedules include:
- First follow-up labs 6-12 weeks after initiation or dose change
- Regular monitoring thereafter (typically every 3-6 months in the first year, then every 6-12 months once stable)
- More frequent monitoring if clinically indicated
I understand that completing required lab monitoring is a CONDITION of continued therapy. The Practice may decline to refill prescriptions if monitoring is not current.
### 8.3 — Clinical Follow-Up
I will attend scheduled follow-up appointments (in-person or telehealth) with the clinical team. I will report new or worsening symptoms, side effects, or changes in my health status promptly.
### 8.4 — Section 8 Attestation
**I attest that I have read Section 8 in its entirety. I understand that baseline and ongoing lab monitoring is required and that completion of monitoring is a condition of continued therapy. I commit to attending follow-up appointments and reporting new or worsening symptoms.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 9 — MEDICATION SAFETY AND SHARING
I understand and agree that:
- I will NOT share my hormone medications with any other person under any circumstances
- I will store my medications safely, particularly testosterone (which can cause virilization in women and children through topical transfer or accidental administration)
- I will dispose of unused medication, needles, and syringes safely (sharps containers for needles)
- I will keep medications out of reach of children and pets
- For topical hormones, I will follow application site instructions to prevent transfer to others, including washing hands after application and covering the application site
---
## SECTION 10 — PREGNANCY, FERTILITY, AND BREASTFEEDING (ATTESTATION REQUIRED)
### 10.1 — Pregnancy Contraindication
I understand that:
- HRT is generally contraindicated during pregnancy
- Some hormones, particularly testosterone and unopposed estrogen, can cause serious harm to a developing fetus
- I will notify the Practice immediately if I become pregnant or am attempting to conceive while receiving HRT
### 10.2 — Breastfeeding
- Hormones may transfer to breast milk
- I will notify the Practice if I am breastfeeding or planning to breastfeed
### 10.3 — Contraception
For patients of reproductive potential:
- If pregnancy is possible and not desired, I will use reliable contraception during HRT
- I understand that testosterone therapy is NOT a reliable contraceptive in male or female patients
- I understand that HRT in female patients is NOT a reliable contraceptive
### 10.4 — Fertility Considerations
For male patients:
- Testosterone therapy significantly reduces fertility, often to infertile levels
- If I intend to father children, I should consult with a reproductive specialist about fertility preservation (sperm banking) BEFORE starting testosterone. The Practice does not provide or facilitate fertility preservation services.
For female patients:
- Estrogen and progesterone therapy may affect ovulation
- Effects on fertility vary; I should consult with a reproductive specialist if pregnancy is a goal
### 10.5 — Section 10 Attestation
**I attest that I have read Section 10 in its entirety. I understand that HRT is contraindicated during pregnancy, that hormones may transfer to breast milk, and that HRT affects fertility. I will notify the Practice of pregnancy, suspected pregnancy, or breastfeeding promptly. If applicable to my situation, I will use reliable contraception during therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 11 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by:
- Notifying the Practice in writing or through the patient portal
- Discontinuing therapy
If the Practice materially modifies its HRT protocols (for example, by adding new agents with materially different risk profiles), I may be asked to sign an updated consent before continuing therapy.
---
## SECTION 12 — QUESTIONS AND OPPORTUNITY TO DISCUSS
I have had the opportunity to ask questions about this consent and about hormone replacement therapy in general. The clinical team has answered my questions to my satisfaction.
**Phone:** (706) 760-3470
**Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Patient Portal:** elevatedhealthaugusta.com
---
## SECTION 13 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 3, 4, 5, 8, and 10
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-05-15-v1
**Document hash (auto-captured):** _________________________________
---
*End of Hormone Replacement Therapy Informed Consent.*
`.trim(),
  sections: [
    { id: "general_risks", title: "Section 3 — General Risks", requires_attestation: true },
    { id: "testosterone_risks", title: "Section 4 — Testosterone Risks", requires_attestation: true },
    { id: "estrogen_risks", title: "Section 5 — Estrogen Risks", requires_attestation: true },
    { id: "lab_monitoring", title: "Section 8 — Lab Monitoring", requires_attestation: true },
    { id: "pregnancy", title: "Section 10 — Pregnancy and Fertility", requires_attestation: true },
  ],
  expiration_months: 12,
  signing_method: "typed_name_with_section_attestation",
  effective_from: "2026-05-15T00:00:00Z",
};
