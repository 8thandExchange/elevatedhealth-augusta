-- STAGE consent v2 versions (generated from src/data/consents/*.ts; bodies byte-match).
-- glp1 v2 adds Section 11A (retatrutide investigational disclosure: not FDA-approved,
-- not 503A/503B compoundable per FDA, gated/provider-selected). research_peptide v2
-- removes the retatrutide carve-out.
--
-- Seeded INACTIVE + pending_review on purpose: the enforce_approved_before_active()
-- trigger requires legal sign-off before a version can serve. v1 stays active until a
-- separate "go-live" migration (physician/legal approval) flips v2 to approved + active.

INSERT INTO public.consent_versions (
  consent_type, version_label, title, body_markdown, body_hash,
  effective_from, effective_to, is_active, legal_review_status
)
SELECT
  'glp1', '2026-06-19-v2', 'GLP-1 / Weight Management Informed Consent', b.md,
  encode(extensions.digest(b.md, 'sha256'), 'hex'),
  '2026-06-19T00:00:00Z'::timestamptz, NULL::timestamptz, false, 'pending_review'
FROM ( SELECT $eha_cv_glp1_v2$
# GLP-1 / WEIGHT MANAGEMENT INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-06-19-v2
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES THE BENEFITS, RISKS, AND LIMITATIONS OF GLP-1 RECEPTOR AGONIST THERAPY AND RELATED MEDICATIONS USED FOR WEIGHT MANAGEMENT. THIS DOCUMENT INCLUDES INFORMATION ABOUT FDA BLACK BOX WARNINGS AND CONTRAINDICATIONS. YOU MUST CONFIRM YOU DO NOT HAVE CERTAIN MEDICAL CONDITIONS BEFORE THERAPY CAN BE INITIATED.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of weight management therapy from Elevated Health Augusta (the "Practice") using GLP-1 receptor agonists and related medications.
### 1.1 — Medications Covered
This consent covers, depending on my clinical needs and the recommendations of the clinical team:
- **Semaglutide** (the active ingredient in branded products including Ozempic®, Wegovy®, and Rybelsus®)
- **Tirzepatide** (the active ingredient in branded products including Mounjaro® and Zepbound®) — a dual GLP-1/GIP receptor agonist
- **Liraglutide** (the active ingredient in branded products including Saxenda® and Victoza®)
- Other GLP-1 receptor agonists or dual incretin agonists that may become available
Adjunctive medications may include:
- **Vitamin B12** (cyanocobalamin or methylcobalamin), often added to compounded preparations
- **Anti-nausea medications** (ondansetron or similar) for symptom management
- Other supportive medications as clinically indicated
### 1.2 — Compounded vs. Commercial Medications
I understand that:
- Semaglutide, tirzepatide, and liraglutide are available as FDA-approved commercial pharmaceutical products
- The Practice may prescribe compounded semaglutide or tirzepatide prepared by a state-licensed 503A compounding pharmacy. Compounded versions are NOT FDA-approved commercial products.
- Compounded preparations may include additional ingredients (such as B12) that are not present in commercial products
- The Practice will discuss with me whether compounded or commercial preparation is appropriate based on my clinical needs, cost considerations (the Practice does not bill insurance), and the regulatory landscape, which may change
- The FDA has, at various times, restricted compounding of these medications. The Practice will inform me if the regulatory status of compounded versions changes during my treatment
### 1.3 — Administration
GLP-1 medications are administered by subcutaneous injection, typically:
- Weekly (semaglutide, tirzepatide)
- Daily (liraglutide)
I will be trained on self-injection technique. I will inject in approved sites (abdomen, thigh, or upper arm), rotating sites as instructed.
---
## SECTION 2 — POTENTIAL BENEFITS
I understand that GLP-1 therapy may, but is not guaranteed to, provide the following benefits:
- Reduction in body weight (clinical trial average reductions: 10-15% for semaglutide, 15-20% for tirzepatide at maximum tolerated doses; individual results vary widely)
- Reduction in appetite and food cravings
- Improved blood sugar control and reduction in hemoglobin A1c (for patients with type 2 diabetes or prediabetes)
- Improvement in cardiovascular risk factors
- Possible reduction in cardiovascular event risk (established for some agents in patients with established cardiovascular disease)
- Improvement in obstructive sleep apnea (established for tirzepatide)
- Improvement in non-alcoholic fatty liver disease markers
- Other potential metabolic benefits
I understand that:
- Individual response varies significantly
- Weight regain is common after discontinuation; many patients regain a substantial portion of weight lost within 1-2 years of stopping
- Continued therapy may be required for sustained results
- The Practice has NOT guaranteed any specific weight loss outcome
---
## SECTION 3 — HOW GLP-1 MEDICATIONS WORK
GLP-1 receptor agonists work by:
- Slowing gastric emptying (food remains in the stomach longer)
- Increasing satiety (feeling of fullness)
- Reducing appetite and food-seeking behavior
- Improving insulin secretion in response to meals
- Reducing glucagon secretion
These mechanisms together produce reduced caloric intake and improved blood sugar control.
---
## SECTION 4 — FDA BLACK BOX WARNINGS (ATTESTATION REQUIRED)
### 4.1 — Thyroid C-Cell Tumor Warning
The FDA has issued a BLACK BOX WARNING for GLP-1 receptor agonists regarding the risk of thyroid C-cell tumors, including medullary thyroid carcinoma (MTC). This warning is based on findings in animal studies in which GLP-1 agonists caused thyroid C-cell tumors in rodents. Whether the same risk applies to humans is not established but cannot be ruled out.
### 4.2 — Absolute Contraindications
I understand that GLP-1 therapy is ABSOLUTELY CONTRAINDICATED — meaning it cannot be safely prescribed — in patients with:
- **Personal history of medullary thyroid carcinoma (MTC)**
- **Family history of medullary thyroid carcinoma (MTC) in any blood relative**
- **Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)**, a hereditary condition that predisposes to MTC and other tumors
- **Family history of Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)**
The Practice will NOT prescribe GLP-1 therapy to patients with any of these conditions.
### 4.3 — Mandatory Patient Attestation
**I attest, under penalty of providing false information that would invalidate this consent, that:**
- ☐ I have NO personal history of medullary thyroid carcinoma (MTC)
- ☐ I have NO family history (in any blood relative — parents, siblings, children, grandparents, aunts, uncles, cousins) of medullary thyroid carcinoma (MTC)
- ☐ I have NOT been diagnosed with Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)
- ☐ I have NO known family history of Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)
- ☐ I will notify the Practice immediately if I learn of any of these conditions in myself or my blood relatives during therapy
I understand that:
- The Practice is relying on the truthfulness of these attestations
- Knowingly providing false attestations may result in serious harm to me, including thyroid cancer
- I cannot hold the Practice liable for outcomes arising from therapy administered based on false attestations I have provided
### 4.4 — Other Conditions Requiring Special Consideration
GLP-1 therapy is also CONTRAINDICATED or requires special consideration in patients with:
- History of pancreatitis
- Severe gastroparesis (delayed stomach emptying) or other significant GI motility disorders
- Severe diabetic retinopathy (rapid blood sugar reduction may worsen retinopathy)
- History of pancreatic cancer
- Type 1 diabetes (these medications are not approved for type 1 diabetes)
- Active eating disorder, including anorexia nervosa or bulimia nervosa
- Pregnancy or planning pregnancy
- Breastfeeding
The Practice will review my medical history and may decline to prescribe if any of these conditions apply.
---
## SECTION 5 — OTHER SERIOUS RISKS (ATTESTATION REQUIRED)
### 5.1 — Pancreatitis
GLP-1 medications have been associated with cases of acute pancreatitis, including life-threatening cases. I understand that:
- Symptoms of pancreatitis include severe persistent abdominal pain (often radiating to the back), nausea, vomiting, and fever
- If I experience these symptoms, I will stop the medication immediately and seek emergency medical care
- I will inform the Practice promptly of any episode of pancreatitis
- A history of pancreatitis may preclude continued use of GLP-1 medications
### 5.2 — Gallbladder Disease
GLP-1 medications increase the risk of gallbladder disease, including gallstones and cholecystitis (gallbladder inflammation requiring surgical removal in some cases). Risk is higher with larger and more rapid weight loss.
### 5.3 — Severe Gastrointestinal Effects
Common GI side effects include nausea, vomiting, diarrhea, constipation, abdominal pain, and decreased appetite. These effects:
- Are usually most pronounced during the first weeks of therapy and after dose increases
- Often improve with continued therapy
- Can in some cases be severe enough to require dose reduction or discontinuation
- Can cause dehydration, electrolyte imbalances, and kidney injury in severe cases
I will report severe or persistent GI symptoms promptly.
### 5.4 — Kidney Effects
Severe vomiting, diarrhea, or dehydration during GLP-1 therapy can lead to acute kidney injury, including in some cases requiring hospitalization. Patients with pre-existing kidney disease are at higher risk. I will report any sign of significant dehydration (lightheadedness, reduced urination, severe thirst) promptly.
### 5.5 — Hypoglycemia (Low Blood Sugar)
GLP-1 therapy alone has a low risk of hypoglycemia, but the risk increases significantly if I am also taking insulin or sulfonylureas (e.g., glipizide, glyburide). If I have diabetes and am on these medications, my diabetes regimen may need adjustment when starting GLP-1 therapy.
### 5.6 — Suicidal Ideation and Mental Health Effects
The FDA is investigating reports of suicidal thoughts and behaviors in patients taking GLP-1 medications. While a causal relationship is not established, I understand:
- I will report any new or worsening depressed mood, anxiety, hopelessness, or thoughts of suicide or self-harm promptly
- I will not stop the medication without consulting the Practice unless I am in crisis, in which case I will call 988 (the Suicide and Crisis Lifeline) or go to the nearest emergency department
- If I have a history of significant depression, anxiety, suicidal ideation, or eating disorder, I will disclose this to the Practice
### 5.7 — Vision Changes (Tirzepatide)
Tirzepatide has been associated with reports of vision changes, including in some cases changes consistent with a condition called non-arteritic anterior ischemic optic neuropathy (NAION). I will report any sudden vision changes promptly.
### 5.8 — Aspiration Risk During Anesthesia
GLP-1 medications slow gastric emptying. If I am scheduled for surgery or any procedure requiring sedation or anesthesia, I will:
- Inform my surgeon and anesthesiologist that I am taking a GLP-1 medication
- Follow their pre-procedure instructions, which may include extended fasting or holding the medication for a period before the procedure
- The Practice will not be involved in coordinating pre-procedure medication management; this is between me and my surgical team
### 5.9 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the serious risks of GLP-1 therapy, including pancreatitis, gallbladder disease, severe GI effects, kidney effects, hypoglycemia risk, potential mental health effects, vision changes, and aspiration risk during anesthesia. I commit to reporting these symptoms promptly and to informing other healthcare providers of my GLP-1 therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — COMMON SIDE EFFECTS
I understand that most patients on GLP-1 therapy experience some side effects, including:
- Nausea (most common, particularly in early weeks)
- Vomiting
- Diarrhea
- Constipation
- Abdominal pain or discomfort
- Bloating, belching, gas
- Decreased appetite (often desired)
- Fatigue
- Headache
- Injection-site reactions (redness, itching, bruising)
- Hair thinning or loss (often related to rapid weight loss)
- Loss of muscle mass alongside fat (mitigated by adequate protein intake and resistance training)
- "Ozempic face" or "Ozempic body" — laxity of facial or body skin due to rapid weight loss
Most side effects improve with time or with dose adjustment. I will report side effects that are severe, persistent, or interfering with daily life.
---
## SECTION 7 — PREGNANCY AND BREASTFEEDING (ATTESTATION REQUIRED)
### 7.1 — Pregnancy
GLP-1 medications should NOT be used during pregnancy. Animal studies have shown adverse fetal effects. Human safety data is limited.
I understand:
- I will use reliable contraception during therapy if pregnancy is possible
- I will notify the Practice immediately if I become pregnant or am attempting to conceive
- Medications should generally be discontinued at least 2 months before attempting conception (longer for tirzepatide and other long-acting agents; the Practice will provide specific guidance)
### 7.2 — Breastfeeding
GLP-1 medications are not recommended during breastfeeding. I will notify the Practice if I am breastfeeding or planning to breastfeed.
### 7.3 — Section 7 Attestation
**I attest that I have read Section 7 in its entirety. I confirm that I am not currently pregnant and not currently breastfeeding. I will use reliable contraception during therapy if pregnancy is possible. I will notify the Practice immediately if I become pregnant, suspect I may be pregnant, or am planning to conceive.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 8 — ALTERNATIVES TO GLP-1 THERAPY
I understand that alternatives to GLP-1 therapy exist, including:
- **Lifestyle interventions:** dietary changes, exercise, behavioral therapy, structured weight loss programs
- **Other prescription weight-loss medications:** phentermine, bupropion/naltrexone, orlistat, others
- **Bariatric surgery:** for patients meeting clinical criteria; this requires specialty consultation outside the Practice
- **No treatment:** acceptance of current weight without pharmacological intervention
I have considered these alternatives and voluntarily choose GLP-1 therapy at this time.
---
## SECTION 9 — DURATION OF THERAPY AND DISCONTINUATION
I understand that:
- GLP-1 therapy is typically a long-term intervention; benefits diminish or reverse after discontinuation
- Most patients regain a substantial portion of weight lost within 1-2 years of stopping
- The Practice and I will discuss duration of therapy based on my goals, response, and tolerance
- If I choose to discontinue, the clinical team will recommend a tapering approach and support the transition
- Discontinuation may be required if I develop a contraindication, intolerance, or if therapy is no longer appropriate in the Practice's clinical judgment
---
## SECTION 10 — LIFESTYLE REQUIREMENTS (ATTESTATION REQUIRED)
### 10.1 — Nutrition Requirements
To minimize side effects and protect my health during therapy, I will:
- Consume adequate protein (typically 0.7-1.0 grams per pound of goal body weight, or as advised by the clinical team)
- Stay well-hydrated
- Eat smaller, more frequent meals during dose escalations
- Avoid high-fat, fried, or heavily processed foods, which worsen GI side effects
- Limit alcohol, which can worsen side effects and reduce effectiveness
### 10.2 — Exercise and Muscle Preservation
Rapid weight loss carries a risk of muscle loss. I will:
- Engage in regular resistance training (or as advised by the clinical team) to preserve muscle mass
- Maintain physical activity appropriate for my health status
### 10.3 — Lab Monitoring
I will complete baseline and periodic lab monitoring as recommended by the clinical team, which may include:
- Complete blood count and comprehensive metabolic panel
- Hemoglobin A1c
- Lipid panel
- Liver and kidney function
- Other tests as clinically indicated
I understand that completing required monitoring is a CONDITION of continued therapy. The Practice may decline to refill prescriptions if monitoring is not current.
### 10.4 — Section 10 Attestation
**I attest that I have read Section 10 in its entirety. I commit to the nutrition, exercise, and lab monitoring requirements described. I understand that these are conditions of therapy and that the Practice may decline to refill prescriptions if I am not meeting these requirements.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 11 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by notifying the Practice in writing or through the patient portal, or by discontinuing therapy.
---
## SECTION 11A — RETATRUTIDE: INVESTIGATIONAL TRIPLE AGONIST (ATTESTATION REQUIRED ONLY IF PRESCRIBED)
This section applies ONLY if my provider has specifically selected retatrutide for me. Retatrutide is NOT a routine or advertised offering of the Practice; it is provided only by individual physician decision after my assessment.
### 11A.1 — Investigational, Not FDA-Approved
I understand that retatrutide is an INVESTIGATIONAL triple hormone receptor agonist (GIP / GLP-1 / glucagon) currently in clinical trials. Unlike semaglutide and tirzepatide — whose active molecules are FDA-approved — retatrutide is NOT approved by the FDA for ANY use, for any person, at any dose. Outside of a clinical trial there is no FDA-approved source of retatrutide.
### 11A.2 — FDA Compounding Position
I understand that the FDA has stated that retatrutide does NOT qualify for the pharmacy compounding exemptions under sections 503A/503B of the Federal Food, Drug, and Cosmetic Act, and that the FDA has warned firms marketing compounded or "research" retatrutide. I understand that the Practice's decision to offer retatrutide is a physician clinical judgment that does not change this federal regulatory position, and that the regulatory or legal status of retatrutide may change at any time, which could require the Practice to discontinue it without notice.
### 11A.3 — Limited Safety Data and Class Risks
I understand that, because retatrutide is investigational, its long-term safety, full side-effect profile, and drug interactions are not fully characterized. It carries the GLP-1-class risks described elsewhere in this consent — including the thyroid C-cell tumor black box warning, the MTC/MEN 2 contraindications in Section 4, pancreatitis, and gallbladder disease — and may carry additional risks not yet known. Its glucagon-receptor activity may affect heart rate, blood pressure, and glucose differently than GLP-1-only or GLP-1/GIP agents.
### 11A.4 — Sourcing and Voluntary Choice
I understand that any retatrutide I receive will be obtained ONLY through the Practice's designated 503A compounding pharmacy, never from gray-market or "research-only" vendors. I have been offered FDA-approved or compounded alternatives (including semaglutide and tirzepatide) and the option of no pharmacologic treatment. Understanding its investigational status and the FDA's compounding position, I voluntarily choose to proceed with retatrutide if and only if my physician prescribes it.
### 11A.5 — Section 11A Attestation
**I attest that I have read Section 11A. I understand that retatrutide is investigational, not FDA-approved for any use, and not eligible for pharmacy compounding under the FDA's stated position; that its long-term safety is not established; and that I am choosing it voluntarily after being offered approved alternatives.**
☐ I attest to the above. (Required only if retatrutide is prescribed for me.)
---
## SECTION 12 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 4 (mandatory MTC/MEN 2 attestation), 5, 7, and 10
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
7. **The MTC/MEN 2 attestations I provided in Section 4 are truthful and accurate to the best of my knowledge**
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-06-19-v2
**Document hash (auto-captured):** _________________________________
---
*End of GLP-1 / Weight Management Informed Consent.*
$eha_cv_glp1_v2$ AS md ) b
WHERE NOT EXISTS (
  SELECT 1 FROM public.consent_versions
  WHERE consent_type = 'glp1' AND version_label = '2026-06-19-v2'
);

INSERT INTO public.consent_versions (
  consent_type, version_label, title, body_markdown, body_hash,
  effective_from, effective_to, is_active, legal_review_status
)
SELECT
  'research_peptide', '2026-06-19-v2', 'Research Peptide Therapy Informed Consent', b.md,
  encode(extensions.digest(b.md, 'sha256'), 'hex'),
  '2026-06-19T00:00:00Z'::timestamptz, NULL::timestamptz, false, 'pending_review'
FROM ( SELECT $eha_cv_rp_v2$
# RESEARCH PEPTIDE THERAPY INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-06-19-v2
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES A FORM OF MEDICAL TREATMENT THAT INVOLVES SUBSTANCES THAT ARE NOT APPROVED BY THE U.S. FOOD AND DRUG ADMINISTRATION. BY SIGNING THIS DOCUMENT, YOU ARE ACCEPTING RISKS AND LIMITATIONS THAT WOULD NOT APPLY TO TRADITIONAL FDA-APPROVED MEDICATIONS.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of research peptide therapy from Elevated Health Augusta (the "Practice"). Research peptides are short chains of amino acids that the Practice prescribes for purposes including, but not limited to, tissue repair, recovery, immune modulation, cognitive function, growth hormone modulation, and skin and connective tissue support.
### 1.1 — Substances Currently Offered
As of the date of this consent, the Practice currently offers the following research peptides under this consent framework:
- **BPC-157** (Body Protection Compound)
- **TB-500** (Thymosin Beta-4 fragment)
- **CJC-1295** (with or without DAC)
- **Ipamorelin**
- **Selank**
- **Thymosin Alpha-1**
- **GHK-Cu** (Copper Tripeptide) — sublingual and topical formulations preferred; injectable formulation only when clinically indicated
- **"Wolverine Stack"** — a combined protocol of BPC-157 and TB-500
The Practice also offers the following peptides that, while clinically related, do NOT require this consent because they are FDA-approved, not on the FDA Category 2 Bulk Substances list, or otherwise have a distinct regulatory status:
- Sermorelin
- Tesamorelin (FDA-approved for HIV-associated lipodystrophy; may be prescribed off-label for other indications, in which case the separate Off-Label Use Acknowledgment applies)
- NAD+ (all delivery methods)
- PT-141 (Bremelanotide, FDA-approved as Vyleesi for HSDD)
- Pentadeca Arginate (PDA)
### 1.2 — Class-Based Consent
I understand that this consent applies not only to the specific substances listed in Section 1.1, but to the **class** of research peptides — meaning substances with the following shared characteristics:
- Not approved by the FDA for human prescription use
- May appear on the FDA Category 2 Bulk Substances list, which identifies substances the FDA has flagged for safety review
- Compounded by a state-licensed 503A compounding pharmacy on a per-prescription basis
- Used for wellness, longevity, recovery, or quality-of-life indications rather than treatment of a specific FDA-recognized disease
This means that if the Practice adds a new research peptide to its formulary that shares this class profile, I will be notified and asked to acknowledge the addition through a brief Substance Addition Acknowledgment. I will NOT be required to re-sign this entire consent unless the new substance carries materially different risks not covered by this document.
If a new substance is added that has materially different risks — for example, novel cancer warnings, novel cardiac risks, or risks of a different class than those described below — I will be required to sign a new consent specific to that substance before receiving it.
### 1.3 — Substances I Will NOT Receive Under This Consent
I understand that this consent does NOT cover:
- Controlled substances of any schedule
- Anabolic-androgenic steroids
- Selective Androgen Receptor Modulators (SARMs)
- Substances on the FDA Difficult to Compound list
- Substances explicitly prohibited from compounding by the FDA. (Retatrutide, an investigational GLP-1-class agent, is NOT covered by this research-peptide consent; if a physician selects it, it is consented separately under the GLP-1 / Weight Management Informed Consent, which includes an investigational-status disclosure.)
- Any peptide or substance used for performance enhancement in athletic competition
---
## SECTION 2 — REGULATORY STATUS (ATTESTATION REQUIRED)
### 2.1 — Not FDA-Approved
I understand that the substances offered under this consent are NOT approved by the U.S. Food and Drug Administration ("FDA") for human prescription use for the indications for which I am being prescribed them. This means:
- The FDA has not reviewed and approved these substances for safety and efficacy at the doses I will receive
- These substances are not available as commercial pharmaceutical products
- They are prepared by a compounding pharmacy specifically for me under my prescription
- Standard pharmaceutical quality-control processes (FDA-approved manufacturing, batch testing for commercial release, etc.) do NOT apply to these substances in the same way they apply to FDA-approved medications
### 2.2 — FDA Category 2 Bulk Substances List
I understand that several of the substances offered under this consent (including but not limited to BPC-157, TB-500, CJC-1295, Ipamorelin, Selank, Thymosin Alpha-1, and GHK-Cu in its injectable form) appear on the FDA's Category 2 Bulk Substances list. This list identifies substances the FDA has flagged for further safety review.
I understand the practical implications of Category 2 status:
- The FDA may, at any time and without prior notice, prohibit compounding pharmacies from preparing these substances
- If the FDA prohibits compounding of a substance I am currently receiving, the Practice may be required to discontinue prescribing it
- The Practice will provide reasonable notice if a substance I am receiving is no longer available
- The Practice cannot guarantee continuous availability of any specific substance offered under this consent
### 2.3 — Off-Label and Unproven Indications
I understand that the indications for which I am being prescribed these substances are NOT FDA-recognized indications. The clinical evidence supporting their use varies and includes:
- Animal studies and preclinical research
- Small human studies, often unpublished or non-peer-reviewed
- Case reports and case series
- Anecdotal clinical experience
- Mechanism-of-action reasoning
I understand that this body of evidence does NOT meet the standard required for FDA approval, and that more rigorous studies may, in the future, reveal that some or all of these substances are not effective for the purposes for which they are being prescribed.
### 2.4 — Section 2 Attestation
**I attest that I have read Section 2 in its entirety. I understand that the substances I will receive under this consent are not FDA-approved, are or may be on the FDA Category 2 list, and may be prohibited from compounding at any time. I accept these regulatory realities as a condition of receiving this therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 3 — RISKS AND ADVERSE EVENTS (ATTESTATION REQUIRED)
### 3.1 — Common Side Effects
I understand that, like all bioactive substances, research peptides carry risks of adverse effects. Common reported side effects include, but are not limited to:
**Injection-site reactions:** redness, swelling, bruising, pain, itching, or local infection at the injection site. Infection is rare with proper technique but can be serious if it occurs.
**Systemic reactions:** flushing, headache, fatigue, dizziness, nausea, transient changes in heart rate or blood pressure.
**Allergic and immune reactions:** rash, hives, itching, sensitivity reactions. In rare cases, severe allergic reactions (anaphylaxis) may occur, which can be life-threatening if not treated immediately.
**Hormonal effects:** depending on the specific peptide, effects on appetite, blood sugar, insulin sensitivity, growth hormone levels, IGF-1 levels, cortisol levels, prolactin levels, or thyroid function. These effects may be desired or undesired depending on context.
**Mood and sleep changes:** alterations in mood, anxiety, sleep quality, or vivid dreams have been reported with certain peptides.
### 3.2 — Substance-Specific Risks
In addition to the class risks above, individual substances may carry additional risks:
**BPC-157, TB-500, GHK-Cu:** theoretical concern about effects on tumor growth, given their tissue-repair and angiogenic mechanisms. While clinical evidence of tumor promotion in humans is not established, patients with active or recent history of cancer should consult with their oncologist before using these substances. Long-term safety data is limited.
**CJC-1295, Ipamorelin (and other GHRH analogs and growth hormone secretagogues):** effects on insulin sensitivity, blood sugar, IGF-1 levels, and water retention. May worsen carpal tunnel syndrome. Theoretical effects on tumor growth via IGF-1 elevation. Patients with diabetes or prediabetes may experience changes in blood sugar control. Patients with active cancer or recent cancer history should consult with their oncologist.
**Selank, Thymosin Alpha-1:** effects on immune function. Patients with autoimmune conditions or immunosuppressive regimens should discuss with their treating physicians.
**Thymosin Alpha-1:** may interact with immunosuppressive medications.
### 3.3 — Unknown Long-Term Risks
I understand that, because these substances lack long-term human safety data:
- Risks that emerge only after years of use are NOT well characterized
- Effects on chronic disease risk (cardiovascular, oncologic, neurologic) are largely unknown
- Effects on fertility, pregnancy outcomes, and developing fetuses are largely unknown
- Drug-drug interactions with prescription and non-prescription substances are incompletely characterized
### 3.4 — Pregnancy, Breastfeeding, and Fertility
I understand that:
- The safety of these substances during pregnancy and breastfeeding is NOT established
- These substances should NOT be used during pregnancy or breastfeeding
- I will notify the Practice immediately if I become pregnant or am attempting to conceive while using these substances
- Effects on male fertility and sperm quality are largely unknown
- If pregnancy is a possibility, I will use reliable contraception while using these substances and for a reasonable period after discontinuation
### 3.5 — Athletic Competition and WADA Status
I understand that several substances offered under this consent — including but not limited to BPC-157, TB-500, CJC-1295, Ipamorelin, and other growth hormone secretagogues — are prohibited substances under the World Anti-Doping Agency (WADA) Code and the rules of most competitive athletic governing bodies.
If I am a competitive athlete subject to drug testing (including but not limited to NCAA, professional sports, Olympic-level competition, military fitness testing in certain circumstances, or other sanctioned competition), my use of these substances may result in a positive drug test, disqualification, suspension, and other sanctions by the relevant governing body. **The Practice does NOT prescribe these substances for performance enhancement in athletic competition, and I am NOT receiving them for that purpose.**
### 3.6 — Section 3 Attestation
**I attest that I have read Section 3 in its entirety. I understand the categories of risks described, including common side effects, substance-specific risks, unknown long-term risks, pregnancy and fertility considerations, and athletic-competition consequences. I have had the opportunity to ask questions about specific risks and to discuss my personal medical history with the clinical team.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 4 — NO GUARANTEE OF OUTCOME (ATTESTATION REQUIRED)
### 4.1 — No Guaranteed Benefit
I understand that:
- The Practice has NOT guaranteed that I will experience any specific benefit from these substances
- Individual response varies; some patients experience significant benefit, some experience modest benefit, and some experience no measurable benefit
- The benefits reported in clinical literature may not apply to my specific circumstance
- The Practice's clinical recommendations are based on best available evidence at the time of prescription, which evidence is limited and may change
### 4.2 — No Treatment of Diagnosed Disease
I understand that these substances are NOT being prescribed to treat or cure any FDA-recognized disease or condition. They are being prescribed for wellness, longevity, recovery, or quality-of-life indications. If I have a diagnosed medical condition that requires treatment, I understand that:
- Research peptides are NOT a substitute for evidence-based treatment of that condition
- I should continue to receive appropriate care for any diagnosed condition from qualified providers
- The Practice does NOT represent that these substances will treat, cure, or prevent any disease
### 4.3 — Section 4 Attestation
**I attest that I have read Section 4 in its entirety. I understand that no specific benefit has been guaranteed, that these substances are not being prescribed to treat any FDA-recognized disease, and that I should continue appropriate evidence-based care for any diagnosed conditions I have.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 5 — SOURCING AND COMPOUNDING (ATTESTATION REQUIRED)
### 5.1 — 503A Compounding Pharmacy Sourcing
I understand that all substances I receive under this consent will be compounded by a state-licensed 503A compounding pharmacy under prescription from the Practice. The Practice has identified the following partner pharmacies:
- **GC Scientific partner network (503A)** — primary for metabolic recomposition stack and advanced peptides routed through our GC account
- **Formulation Compounding Center (FCC)** — Lewisville, Texas — IV compounds, core peptide menu, and backup fulfillment
- **Custom Pharmacy of Evans** — Evans, Georgia — hormone preparations (not research peptides)
The Practice may use other state-licensed 503A compounding pharmacies as clinically appropriate or as availability requires.
I understand that:
- 503A compounding pharmacies are state-licensed and subject to state board of pharmacy oversight
- 503A pharmacies prepare medications for individual patients under specific prescriptions
- 503A pharmacies are NOT FDA-inspected manufacturing facilities, and the products they produce are NOT FDA-approved commercial pharmaceuticals
- Quality and consistency may vary among compounding pharmacies
### 5.2 — Gray Market Risk
I understand that "research peptides" are widely available on the internet from unregulated sources marketed as "for research purposes only" or "not for human consumption." I understand:
- I will NOT obtain my peptides from any source other than the compounding pharmacy designated by the Practice
- Gray-market peptide sources may contain incorrect dosages, contamination, or substances entirely different from what is labeled
- Self-sourcing from gray-market vendors is dangerous and may result in serious harm
- If I have used or am currently using peptides from gray-market sources, I will disclose this to the Practice
- The Practice will discontinue prescribing if it has reason to believe I am also self-sourcing from unregulated vendors
### 5.3 — Storage, Reconstitution, and Administration
I understand that proper storage, reconstitution, and administration of these substances is essential to safety and efficacy:
- I will follow all storage instructions (refrigeration, protection from light, etc.) as instructed by the clinical team
- I will follow reconstitution instructions exactly as provided, using only the bacteriostatic water or diluent supplied with the medication
- I will use sterile injection technique and dispose of needles in a sharps container
- I will NOT share medications, needles, or syringes with any other person
- I will contact the Practice immediately if I have questions about administration technique
### 5.4 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the regulatory status of compounded medications, the risks of gray-market self-sourcing, and the storage and administration requirements. I commit to obtaining my peptides only through the Practice's designated compounding pharmacy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — MONITORING AND DISCONTINUATION
### 6.1 — Lab Monitoring
I understand that the Practice may require baseline and periodic laboratory monitoring while I am using these substances, which may include:
- Complete blood count and metabolic panel
- Glucose, hemoglobin A1c, and insulin (for growth hormone secretagogues)
- IGF-1 (for growth hormone secretagogues)
- Liver function tests
- Other tests as clinically indicated based on the specific peptide and my medical history
I agree to complete required laboratory monitoring as a condition of continued therapy. Refusal to complete required monitoring may result in discontinuation of therapy.
### 6.2 — Adverse Event Reporting
I will report any of the following to the Practice promptly:
- New or worsening symptoms that may be related to therapy
- Severe injection-site reactions
- Signs of allergic reaction (rash, hives, difficulty breathing, swelling of face/tongue/throat)
- Any hospitalization or emergency department visit
- Any new diagnosis of cancer or other serious medical condition
- Any pregnancy or suspected pregnancy
- Any new medication, supplement, or recreational substance use
### 6.3 — Right to Discontinue
I understand that:
- I may discontinue therapy at any time, with or without notifying the Practice
- The Practice may discontinue prescribing if my clinical situation changes, if monitoring is not completed, if I fail to follow recommendations, or if continued therapy is no longer appropriate in the Practice's judgment
- The Practice may discontinue prescribing if a substance becomes unavailable, is prohibited by the FDA, or is no longer available from the compounding pharmacy
- I will be notified of any planned discontinuation and given appropriate guidance for tapering or transition
---
## SECTION 7 — ASSUMPTION OF RISK AND RELEASE (ATTESTATION REQUIRED)
### 7.1 — Assumption of Risk
Having read this consent and having had the opportunity to ask questions, I voluntarily assume the risks of receiving research peptide therapy, including but not limited to the risks described in Sections 2 through 5 of this consent and any risks that may emerge that are not currently known.
### 7.2 — Acknowledgment of Alternatives
I understand that alternatives to research peptide therapy exist, including:
- Lifestyle modifications (diet, exercise, sleep, stress management)
- FDA-approved medications for any FDA-recognized condition I may have
- No treatment
- Other evidence-based wellness interventions
I have considered these alternatives and voluntarily choose to receive research peptide therapy at this time.
### 7.3 — Release and Limitation of Liability
To the maximum extent permitted by Georgia law, I release the Practice, its owners, employees, contractors, and agents from liability for adverse outcomes arising from the inherent risks of research peptide therapy that have been disclosed in this consent and that occur in the absence of negligence on the Practice's part.
**This release does NOT apply to:**
- Negligent care
- Failure to follow established standards of care
- Intentional misconduct
- Gross negligence
- Any claim that cannot legally be waived under Georgia law
I understand that this release does NOT waive my rights to pursue claims based on negligence or other legally non-waivable grounds.
### 7.4 — Section 7 Attestation
**I attest that I have read Section 7 in its entirety. I voluntarily assume the disclosed risks of research peptide therapy. I understand that this consent does not release the Practice from liability for negligence or for any claim that cannot legally be waived under Georgia law.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 8 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by:
- Notifying the Practice in writing or through the patient portal
- Discontinuing therapy
Withdrawal of consent does NOT retroactively invalidate care already provided.
If the Practice adds a new substance to the research peptide formulary that shares the class profile described in Section 1.2, I will receive a Substance Addition Acknowledgment, which I may sign without re-executing this entire consent.
---
## SECTION 9 — QUESTIONS AND OPPORTUNITY TO DISCUSS
I have had the opportunity to ask questions about this consent and about research peptide therapy in general. The clinical team has answered my questions to my satisfaction. If I have additional questions after signing this consent, I understand I may contact the Practice at:
**Phone:** (706) 760-3470
**Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Patient Portal:** elevatedhealthaugusta.com
---
## SECTION 10 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 2, 3, 4, 5, and 7
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-06-19-v2
**Document hash (auto-captured):** _________________________________
---
*End of Research Peptide Therapy Informed Consent.*
$eha_cv_rp_v2$ AS md ) b
WHERE NOT EXISTS (
  SELECT 1 FROM public.consent_versions
  WHERE consent_type = 'research_peptide' AND version_label = '2026-06-19-v2'
);

