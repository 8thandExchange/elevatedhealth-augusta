#!/usr/bin/env python3
"""One-off generator: writes supabase/migrations/<ts>_seed_clinical_protocol_drafts.sql"""
from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

OUT = Path(__file__).resolve().parent.parent / "supabase" / "migrations" / "20260509140000_seed_clinical_protocol_drafts.sql"


def notes(items: list[str]) -> str:
    arr = [{"note": n, "resolved": False, "resolved_at": None, "resolved_by": None} for n in items]
    return json.dumps(arr)


def body(
    indication: str,
    contraindications: list[str],
    exclusion_criteria: list[str],
    pre_administration_checks: list[str],
    dosing: dict,
    administration: list[str],
    monitoring_during: list[str],
    monitoring_post: list[str],
    patient_education: list[str],
    escalation_criteria: list[str],
    documentation_required: list[str],
    adverse: dict[str, list[str]],
) -> str:
    obj = {
        "indication": indication,
        "contraindications": contraindications,
        "exclusion_criteria": exclusion_criteria,
        "pre_administration_checks": pre_administration_checks,
        "dosing": dosing,
        "administration": administration,
        "monitoring_during": monitoring_during,
        "monitoring_post": monitoring_post,
        "patient_education": patient_education,
        "escalation_criteria": escalation_criteria,
        "documentation_required": documentation_required,
        "adverse_event_response": adverse,
    }
    return json.dumps(obj, ensure_ascii=False)


def md(title: str, sections: list[tuple[str, str]]) -> str:
    parts = [f"# {title}\n"]
    for h, t in sections:
        parts.append(f"## {h}\n\n{t.strip()}\n\n")
    return "".join(parts).strip()


PROTOCOLS: list[dict] = [
    {
        "slug": "iv-myers-cocktail",
        "title": "IV Myers Cocktail Administration",
        "category": "iv",
        "service_type": ["iv_lounge"],
        "notes": [
            "Verify Myers formulation matches Henry Schein standard pre-mixed bag if you're using one, vs. compounded in-house",
            "Confirm 30-45 min infusion rate matches your preference; some clinicians push slower for first-time patients",
            "Vitamin C dose of 5g — verify G6PD screening expectation in your intake (high-dose IV C is contraindicated in G6PD deficiency)",
        ],
        "markdown": md(
            "IV Myers Cocktail Administration",
            [
                (
                    "Indication",
                    "Electrolyte repletion, vitamin supplementation, and general wellness support in appropriate adult patients per clinic criteria.",
                ),
                (
                    "Formulation & administration",
                    "Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline. Infuse over 30–45 minutes.",
                ),
                (
                    "Monitoring",
                    "Vital signs per IV lounge policy; observe for flushing, warmth, or phlebitis. Slow or pause infusion for chest tightness, nausea, or patient discomfort.",
                ),
            ],
        ),
        "structured": body(
            indication="Adult IV wellness / nutrient repletion per standing orders.",
            contraindications=["Known allergy to any component", "G6PD deficiency (high-dose IV vitamin C)", "Renal failure without nephrology clearance"],
            exclusion_criteria=["Unstable cardiovascular disease", "Active infection with fever"],
            pre_administration_checks=["Verify identity", "Two RN checks on bag labeling", "Patent IV access"],
            dosing={
                "medication": "Myers cocktail components as listed",
                "dose": "Per formulation above",
                "route": "IV infusion",
                "frequency": "Per order / membership benefit",
                "duration": "30–45 minutes",
            },
            administration=["Prime line", "Infuse per rate policy", "Dispose sharps per clinic SOP"],
            monitoring_during=["VS q15min first 30min", "Patient comfort"],
            monitoring_post=["Discharge instructions", "Adverse event reporting pathway"],
            patient_education=["Expected warmth/flush", "When to call clinic"],
            escalation_criteria=["Chest pain", "Severe nausea/vomiting", "Urticaria"],
            documentation_required=["IV flowsheet", "Lot numbers if applicable"],
            adverse={
                "mild": ["Slow infusion", "Cool compress"],
                "moderate": ["Provider notification", "Extended observation"],
                "severe": ["911", "Stop infusion", "Emergency protocol"],
            },
        ),
    },
    {
        "slug": "iv-nad-250mg",
        "title": "IV NAD+ 250mg Infusion",
        "category": "iv",
        "service_type": ["iv_lounge"],
        "notes": [
            "Verify NAD source — FCC compounded vs. commercial. Affects concentration and dilution math",
            "Some clinicians use Glutathione push at end of NAD+ — confirm if you want this in standard protocol or as add-on",
            "First-time patient slower start (90-120 min) — confirm threshold for 'first-time'",
        ],
        "markdown": md(
            "IV NAD+ 250mg Infusion",
            [
                ("Indication", "NAD+ repletion in appropriate candidates per clinic policy."),
                ("Dose & dilution", "NAD+ 250mg in 500mL normal saline. Infusion 60–90 minutes."),
                ("Side effects", "Chest tightness, flushing, nausea — slow rate or pause if intolerable. Consider B-complex pre-medication if prior flushing."),
            ],
        ),
        "structured": body(
            indication="NAD+ IV therapy 250mg session.",
            contraindications=["Pregnancy/lactation unless cleared", "Unstable angina"],
            exclusion_criteria=["Recent MI without clearance"],
            pre_administration_checks=["Baseline VS", "Pregnancy status if applicable"],
            dosing={"medication": "NAD+", "dose": "250mg", "route": "IV infusion", "frequency": "Per order", "duration": "60–90 min"},
            administration=["Dilute per pharmacy label", "Gradual rate titration per tolerance"],
            monitoring_during=["VS per IV lounge policy", "Symptom assessment q15–30min"],
            monitoring_post=["Post-infusion check", "Home instructions"],
            patient_education=["Flush/warmth common", "Report chest tightness immediately"],
            escalation_criteria=["Persistent chest pain", "Severe nausea"],
            documentation_required=["Infusion record", "Compound lot if applicable"],
            adverse={"mild": ["Pause infusion", "Slow rate"], "moderate": ["Provider eval"], "severe": ["911", "Stop infusion"]},
        ),
    },
    {
        "slug": "iv-nad-500mg",
        "title": "IV NAD+ 500mg Infusion",
        "category": "iv",
        "service_type": ["iv_lounge"],
        "notes": [
            "Confirm step-up requirement — should patients always do 250mg first, or is 500mg first-time acceptable for low-risk patients?",
            "Verify max dose ceiling — some clinicians cap at 500mg per session; others go to 750mg or 1g",
        ],
        "markdown": md(
            "IV NAD+ 500mg Infusion",
            [
                ("Indication", "Higher-dose NAD+ session for patients who have tolerated lower doses per clinic criteria."),
                ("Dose & duration", "NAD+ 500mg in 500mL normal saline. Infusion 90–120 minutes. Higher likelihood of infusion-related sensations than 250mg."),
                ("Prerequisite", "Prior tolerance of 250mg dose recommended before stepping up (physician to confirm exception policy)."),
            ],
        ),
        "structured": body(
            indication="NAD+ IV therapy 500mg session.",
            contraindications=["Same as 250mg pathway"],
            exclusion_criteria=["No prior NAD+ tolerance unless physician-approved exception"],
            pre_administration_checks=["Review prior NAD+ sessions", "VS baseline"],
            dosing={"medication": "NAD+", "dose": "500mg", "route": "IV infusion", "frequency": "Per order", "duration": "90–120 min"},
            administration=["Longer observation window", "Gradual titration"],
            monitoring_during=["VS q15min early", "Symptom log"],
            monitoring_post=["Extended observation if symptoms"],
            patient_education=["Expect stronger sensations vs 250mg"],
            escalation_criteria=["Chest pain", "Severe nausea", "Hypertensive response"],
            documentation_required=["Session note", "Titration details"],
            adverse={"mild": ["Pause/slow"], "moderate": ["Provider at bedside"], "severe": ["911"]},
        ),
    },
    {
        "slug": "iv-glutathione-push",
        "title": "IV Glutathione Push",
        "category": "iv",
        "service_type": ["iv_lounge"],
        "notes": [
            "Confirm dose preference — 1g standard, 2g for higher-need patients, or always 2g?",
            "Some clinicians require sulfa allergy screening (theoretical cross-reactivity, debated). Confirm your stance",
        ],
        "markdown": md(
            "IV Glutathione Push",
            [
                ("Indication", "Antioxidant support per clinic formulary."),
                ("Administration", "Glutathione 1–2g IV push over 5–10 minutes. May stand alone or follow NAD+/Myers per order."),
                ("Monitoring", "Observe for nausea, flushing, or injection-site discomfort."),
            ],
        ),
        "structured": body(
            indication="IV glutathione push.",
            contraindications=["Known hypersensitivity to glutathione product"],
            exclusion_criteria=[],
            pre_administration_checks=["Verify dose on order", "Patent IV"],
            dosing={"medication": "Glutathione", "dose": "1–2g per order", "route": "IV push", "frequency": "Per order", "duration": "5–10 min"},
            administration=["Slow push", "RN at bedside"],
            monitoring_during=["Continuous observation"],
            monitoring_post=["Post-push VS"],
            patient_education=["Metallic taste possible"],
            escalation_criteria=["Bronchospasm", "Anaphylaxis signs"],
            documentation_required=["Push time", "Dose"],
            adverse={"mild": ["Pause"], "moderate": ["Provider"], "severe": ["911", "epinephrine per ACLS if anaphylaxis"]},
        ),
    },
    {
        "slug": "bhrt-female-initiation-transdermal",
        "title": "Female BHRT Initiation (Compounded Transdermal)",
        "category": "hormone",
        "service_type": ["hormones", "hormones_women"],
        "notes": [
            "Bi-Est ratio — most common is 80:20 E3:E2, some prefer 50:50 or 90:10. Confirm your default",
            "Starting doses are conservative; some practices start higher based on symptom severity. Confirm your initiation strategy",
            "Progesterone — oral micronized vs. transdermal cream debate; this protocol uses cream. Confirm preference",
            "Testosterone for women — confirm whether this is added at initiation or only after E2/Progesterone optimization fails to resolve symptoms",
            "Verify lab-recheck cadence — 6-8 weeks is standard but some practices go 8-12 weeks for transdermal cream steady-state",
        ],
        "markdown": md(
            "Female BHRT Initiation (Compounded Transdermal)",
            [
                ("Indication", "Initiate based on labs and symptoms per consult-gated pathway."),
                ("Starting regimen (draft)", "Bi-Est (E2/E3) cream 2mg/g — apply 1mL daily. Progesterone cream 100mg/g — apply 1mL nightly (luteal-only if perimenopausal cycling; daily if postmenopausal). Testosterone cream 1mg/g — apply 0.25mL daily optional, lab-guided."),
                ("Follow-up", "Recheck labs at 6–8 weeks; adjust toward optimal range."),
            ],
        ),
        "structured": body(
            indication="Female BHRT initiation with compounded transdermal creams.",
            contraindications=["Undiagnosed vaginal bleeding", "Active estrogen-sensitive malignancy", "Known or suspected pregnancy"],
            exclusion_criteria=["Severe uncontrolled hypertension", "Active thromboembolic disease"],
            pre_administration_checks=["Review hormone panel", "Document symptom scores", "Contraception status if premenopausal"],
            dosing={
                "medication": "Bi-Est / Progesterone / Testosterone (optional)",
                "dose": "Per starting regimen above",
                "route": "Transdermal",
                "frequency": "Daily / luteal per cycling status",
                "duration": "Until follow-up",
            },
            administration=["Patient counseling on application sites", "Wash hands", "Rotate sites"],
            monitoring_during=["First-month symptom check-in per clinic"],
            monitoring_post=["6–8 week labs", "Dose titration per targets"],
            patient_education=["Transfer precautions", "When to call (clots, breast changes, mood)"],
            escalation_criteria=["New neurologic deficit", "Severe headache", "Chest pain"],
            documentation_required=["Signed order", "Consent", "Lab review note"],
            adverse={"mild": ["Local irritation"], "moderate": ["Dose adjustment"], "severe": ["Stop therapy", "ED referral"]},
        ),
    },
    {
        "slug": "male-trt-initiation-compounded-cypionate",
        "title": "Male TRT Initiation (Compounded Testosterone Cypionate)",
        "category": "hormone",
        "service_type": ["hormones", "hormones_men"],
        "notes": [
            "Starting dose 100-150mg weekly is conservative; some practices start at 200mg. Confirm your default",
            "IM vs. subQ — subQ is increasingly favored for steady levels but some patients prefer IM. Confirm default route",
            "Frequency — weekly is most common but some prescribe twice-weekly (50-75mg E3.5D) for tighter levels. Confirm",
            "Anastrozole — protocol explicitly says NOT prophylactic. Confirm this aligns with your approach (some clinicians disagree)",
            "Gonadorelin/HCG for fertility preservation — protocol does not include this at initiation. Confirm whether you offer fertility-sparing protocol as separate option or part of standard initiation",
            "Recheck cadence — 6 weeks for trough is standard. Confirm",
            "Hematocrit ceiling — protocol uses <50% as starting threshold and >54% as treatment-pause threshold. Confirm",
        ],
        "markdown": md(
            "Male TRT Initiation (Compounded Testosterone Cypionate)",
            [
                ("Eligibility (draft)", "Total T <300 ng/dL or symptomatic with low free T; hematocrit <50%; PSA appropriate for age; estradiol baseline documented."),
                ("Initiation", "Testosterone cypionate 100–150mg weekly IM or subQ per physician order."),
                ("Adjuncts", "Anastrozole only if estradiol elevated symptomatically — do not start prophylactically."),
                ("Monitoring", "Recheck labs at 6 weeks (trough); adjust dosing."),
            ],
        ),
        "structured": body(
            indication="Male testosterone replacement initiation.",
            contraindications=["Breast cancer", "Known or suspected prostate cancer", "Desire for fertility without fertility-sparing plan"],
            exclusion_criteria=["Hematocrit ≥50% at baseline", "Severe OSA untreated", "Uncontrolled HF"],
            pre_administration_checks=["PSA age-appropriate", "Hematocrit", "Exam including DRE per policy"],
            dosing={
                "medication": "Testosterone cypionate (compounded)",
                "dose": "100–150mg weekly initial (draft)",
                "route": "IM or subQ per policy",
                "frequency": "Weekly (or divided per policy)",
                "duration": "Ongoing with monitoring",
            },
            administration=["Injection teaching", "Sharps disposal"],
            monitoring_during=["Symptom response", "Polycythemia surveillance"],
            monitoring_post=["Trough labs at 6 weeks", "Hematocrit trend"],
            patient_education=["Acne/mood changes", "Fertility impact"],
            escalation_criteria=["Hct >54%", "Severe lower urinary symptoms", "Chest pain"],
            documentation_required=["Rx", "Monitoring plan", "Controlled substance log if applicable"],
            adverse={"mild": ["Acne management"], "moderate": ["Adjust AI if used"], "severe": ["Stop TRT", "Emergency care"]},
        ),
    },
    {
        "slug": "quarterly-hormone-monitoring-female",
        "title": "Quarterly Hormone Monitoring (Female)",
        "category": "monitoring",
        "service_type": ["hormones_women"],
        "notes": [
            "Quarterly is standard; some practices stretch to every 6 months once stable. Confirm cadence",
            "Verify symptom-tracking instrument — Greene Climacteric Scale, Menopause-Specific QoL, custom EHA tool, or informal review?",
            "Target ranges for E2, P4, T — confirm your preferred optimization ranges (these vary by practice)",
        ],
        "markdown": md(
            "Quarterly Hormone Monitoring (Female)",
            [
                ("Cadence", "Every 3 months: Hormone — Female panel."),
                ("Review", "Review symptom score; align dosing with labs and targets."),
            ],
        ),
        "structured": body(
            indication="Ongoing monitoring for female BHRT patients.",
            contraindications=[],
            exclusion_criteria=[],
            pre_administration_checks=["Order correct lab panel", "Patient fasting if required by lab"],
            dosing={"medication": "N/A", "dose": "N/A", "route": "N/A", "frequency": "Quarterly", "duration": "Ongoing"},
            administration=["Phlebotomy per standing order"],
            monitoring_during=["N/A"],
            monitoring_post=["Provider review within defined SLA"],
            patient_education=["Bring medication list"],
            escalation_criteria=["Critical lab values per lab policy"],
            documentation_required=["Lab results filed", "Provider note"],
            adverse={"mild": [], "moderate": [], "severe": []},
        ),
    },
    {
        "slug": "quarterly-hormone-monitoring-male",
        "title": "Quarterly Hormone Monitoring (Male)",
        "category": "monitoring",
        "service_type": ["hormones_men"],
        "notes": [
            "Confirm target Total T range (most practices target 700-1000 ng/dL trough, some go 800-1200)",
            "Free T target — is calculated free T sufficient or do you require equilibrium dialysis?",
            "Estradiol management threshold — what symptomatic E2 level triggers anastrozole consideration?",
            "PSA monitoring frequency for under-40 patients — confirm your stance",
        ],
        "markdown": md(
            "Quarterly Hormone Monitoring (Male)",
            [
                ("Cadence", "Every 3 months: Hormone — Male panel + CBC."),
                ("Annual", "PSA (40+), full thyroid per physician preference."),
            ],
        ),
        "structured": body(
            indication="Ongoing monitoring for male TRT patients.",
            contraindications=[],
            exclusion_criteria=[],
            pre_administration_checks=["Order panels", "Identify bleeding risk"],
            dosing={"medication": "N/A", "dose": "N/A", "route": "N/A", "frequency": "Quarterly + annual add-ons", "duration": "Ongoing"},
            administration=["Phlebotomy"],
            monitoring_during=[],
            monitoring_post=["Trough interpretation", "Hematocrit/PSA review"],
            patient_education=["Hydration before draw"],
            escalation_criteria=["Rapid Hct rise", "PSA velocity concern"],
            documentation_required=["Trend graphs in chart"],
            adverse={"mild": [], "moderate": [], "severe": []},
        ),
    },
    {
        "slug": "pt141-bremelanotide-initiation",
        "title": "PT-141 (Bremelanotide) Initiation",
        "category": "peptide",
        "service_type": ["peptides"],
        "notes": [
            "Starting dose 1.75mg matches FDA-approved Vyleesi. Some compounded protocols start at 0.5-1mg to assess tolerance. Confirm preference",
            "BP screening threshold — protocol requires SBP <140/DBP <90 at baseline. Confirm",
            "Nausea pre-medication — some practices offer ondansetron PRN. Confirm if you want this in standard protocol",
            "First-dose-in-clinic policy — some require initial dose administered in clinic for monitoring. Confirm whether you want this for all patients, only those with risk factors, or never required",
        ],
        "markdown": md(
            "PT-141 (Bremelanotide) Initiation",
            [
                ("Dosing (draft)", "1.75mg subQ as needed 30–45 minutes before intimacy. Max 1 dose per 24h; max 8 doses per month."),
                ("Counseling", "Nausea (~40%), flushing, headache. Contraindicated in uncontrolled HTN and significant CV disease per policy."),
            ],
        ),
        "structured": body(
            indication="PT-141 initiation for appropriate peptide-program patients.",
            contraindications=["Uncontrolled hypertension", "Significant cardiovascular disease", "Pregnancy"],
            exclusion_criteria=["BP ≥140/90 at visit"],
            pre_administration_checks=["BP", "Medication review (nitrates, etc.)"],
            dosing={
                "medication": "Bremelanotide (PT-141)",
                "dose": "1.75mg",
                "route": "SubQ",
                "frequency": "PRN per limits",
                "duration": "Per package education",
            },
            administration=["Injection training", "Storage handling"],
            monitoring_during=["First-dose monitoring if in-clinic policy"],
            monitoring_post=["Follow-up symptom survey"],
            patient_education=["Nausea precautions", "When not to use"],
            escalation_criteria=["Severe hypertension after dose", "Syncope"],
            documentation_required=["Consent", "BP log"],
            adverse={"mild": ["Antiemetic PRN if policy"], "moderate": ["Provider call"], "severe": ["911"]},
        ),
    },
    {
        "slug": "sermorelin-initiation",
        "title": "Sermorelin Initiation",
        "category": "peptide",
        "service_type": ["peptides"],
        "notes": [
            "Dose 200-300mcg nightly is common; some clinicians start at 100mcg for tolerance. Confirm",
            "5-on/2-off vs. daily dosing — pulsatility argument supports 5-on; convenience supports daily. Confirm preference",
            "IGF-1 target range — confirm your upper bound. Never going above age-adjusted normal is conservative; some target upper quartile, others mid-range",
            "Discontinuation criteria — IGF-1 above range, no symptomatic improvement at 12 weeks, or other? Confirm",
        ],
        "markdown": md(
            "Sermorelin Initiation",
            [
                ("Dosing (draft)", "200–300mcg subQ nightly at bedtime, 5 nights per week (off weekends) to preserve pulsatile response."),
                ("Labs", "Baseline IGF-1 required; recheck 8–12 weeks; target upper-quartile age-adjusted range, never above lab ULN."),
            ],
        ),
        "structured": body(
            indication="Sermorelin initiation in peptide program.",
            contraindications=["Active malignancy", "Pregnancy", "IGF-1 above ULN"],
            exclusion_criteria=["Diabetic retinopathy progression concern per endocrine"],
            pre_administration_checks=["Baseline IGF-1", "Sleep apnea symptoms screen"],
            dosing={
                "medication": "Sermorelin",
                "dose": "200–300mcg",
                "route": "SubQ",
                "frequency": "5 nights/week (draft)",
                "duration": "Through reassessment",
            },
            administration=["Rotate sites", "Reconstitution per pharmacy sheet"],
            monitoring_during=["Sleep quality symptoms"],
            monitoring_post=["IGF-1 at 8–12 weeks"],
            patient_education=["Injection technique video"],
            escalation_criteria=["Joint swelling", "Persistent headache"],
            documentation_required=["IGF trends", "Consent"],
            adverse={"mild": ["Transient flushing"], "moderate": ["Hold dose", "Provider"], "severe": ["Stop", "ED if neuro signs"]},
        ),
    },
    {
        "slug": "healing-stack-pda-tb500-initiation",
        "title": "Healing Stack Initiation (PDA + TB-500)",
        "category": "peptide",
        "service_type": ["peptides"],
        "notes": [
            "TB-500 IS ON FDA CATEGORY 2 LIST — verify FCC's current compliance position before this protocol is signed and executed against. If FCC pulls TB-500, this protocol becomes PDA-only",
            "PDA dose 500mcg PO daily is conservative; some practices start at 1mg. Confirm",
            "TB-500 dose 2.5mg weekly matches FCC's available vial size. Confirm",
            "Course length 4-8 weeks — confirm your default",
        ],
        "markdown": md(
            "Healing Stack Initiation (PDA + TB-500)",
            [
                ("Indication (draft)", "Tendon/ligament injury, post-surgical recovery, inflammatory tissue conditions per physician selection."),
                ("Regimen", "PDA (Pentadeca Arginate) 500mcg PO daily ongoing. TB-500 (Thymosin Beta-4) 2.5mg subQ once weekly for 4–8 week course."),
                ("Reassessment", "At 8 weeks; extend or discontinue based on response."),
            ],
        ),
        "structured": body(
            indication="Healing stack for soft-tissue recovery (draft).",
            contraindications=["Pregnancy", "Active malignancy", "TB-500 unavailable per pharmacy/legal"],
            exclusion_criteria=["Anticoagulation instability (physician judgment)"],
            pre_administration_checks=["Imaging/clinical documentation", "FCC formulary verification"],
            dosing={
                "medication": "PDA + TB-500",
                "dose": "500mcg daily PO + 2.5mg weekly subQ (draft)",
                "route": "PO + subQ",
                "frequency": "Per regimen",
                "duration": "4–8 weeks TB-500 course",
            },
            administration=["Teach subQ injection", "Oral adherence counseling"],
            monitoring_during=["Pain/function scores"],
            monitoring_post=["Week-4 and week-8 review"],
            patient_education=["Injection hygiene", "When to stop"],
            escalation_criteria=["New neurologic deficit", "Signs of infection"],
            documentation_required=["Consent", "Pharmacy release"],
            adverse={"mild": ["Injection site erythema"], "moderate": ["Hold TB-500"], "severe": ["Allergic reaction protocol"]},
        ),
    },
    {
        "slug": "compounded-semaglutide-initiation",
        "title": "Compounded Semaglutide Initiation",
        "category": "weight_loss",
        "service_type": ["weight_loss"],
        "notes": [
            "Escalation cadence (4-week intervals) matches FDA labeling for branded Wegovy. Some practices use 2-week or 3-week intervals. Confirm",
            "Max dose 2.4mg matches branded labeling. Some compounded protocols cap at 2mg. Confirm",
            "BMI threshold for initiation — protocol assumes BMI ≥27 with comorbidity or BMI ≥30. Confirm",
            "Mounjaro/Zepbound transition policy — what's your approach if patient wants to switch from compounded to brand or vice versa?",
            "Discontinuation criteria — typical practice continues indefinitely if tolerated and effective. Confirm or specify pause/cycling protocol",
        ],
        "markdown": md(
            "Compounded Semaglutide Initiation",
            [
                ("Titration (draft)", "0.25mg subQ weekly ×4 weeks → 0.5mg weekly weeks 5–8 → escalate toward 1mg+ if inadequate response and tolerated. Max 2.4mg weekly."),
                ("Pre-administration labs", "Comprehensive metabolic panel, fasting insulin, HbA1c, weight optimization panel per clinic."),
                ("Contraindications", "MEN2, personal/family history of medullary thyroid carcinoma — GLP-1 contraindicated."),
            ],
        ),
        "structured": body(
            indication="Medical weight loss with compounded semaglutide.",
            contraindications=["MTC or MEN2", "Pregnancy", "Personal/family history of MTC"],
            exclusion_criteria=["Type 1 diabetes", "Acute pancreatitis history"],
            pre_administration_checks=["BMI documentation", "Metabolic labs", "Contraception counseling"],
            dosing={
                "medication": "Semaglutide (compounded)",
                "dose": "Start 0.25mg weekly (draft titration)",
                "route": "SubQ",
                "frequency": "Weekly titration per table",
                "duration": "Ongoing",
            },
            administration=["Injection teaching", "GI side effect anticipatory guidance"],
            monitoring_during=["Weight", "BP", "GI symptoms"],
            monitoring_post=["Monthly check-ins per program"],
            patient_education=["Gallbladder symptoms", "Pancreatitis warning signs"],
            escalation_criteria=["Severe abdominal pain", "Persistent vomiting"],
            documentation_required=["Program consent", "Lab trends"],
            adverse={"mild": ["OTC antiemetics PRN"], "moderate": ["Hold dose", "Provider"], "severe": ["ED evaluation"]},
        ),
    },
    {
        "slug": "compounded-tirzepatide-initiation",
        "title": "Compounded Tirzepatide Initiation",
        "category": "weight_loss",
        "service_type": ["weight_loss"],
        "notes": [
            "Escalation cadence and max dose match Mounjaro/Zepbound labeling. Confirm",
            "Anti-emetic prophylaxis during first 2 weeks at each dose step — some practices offer ondansetron PRN. Confirm",
            "Compounded tirzepatide concentration varies by pharmacy; confirm FCC's current concentration and update dosing instructions accordingly",
            "Same brand-vs-compounded transition questions as semaglutide protocol",
            "Hypoglycemia risk — patients on other diabetes medications need closer monitoring. Confirm screening for concurrent diabetic medications",
        ],
        "markdown": md(
            "Compounded Tirzepatide Initiation",
            [
                ("Titration (draft)", "2.5mg subQ weekly ×4 weeks → 5mg weeks 5–8 → escalate in 2.5mg increments every 4 weeks if tolerated. Max 15mg weekly."),
                ("Labs", "Same pre-administration labs as semaglutide pathway."),
                ("Counseling", "GI side effects more common than semaglutide for some patients; hydration and meal-timing strategies."),
            ],
        ),
        "structured": body(
            indication="Medical weight loss with compounded tirzepatide.",
            contraindications=["MTC or MEN2", "Pregnancy"],
            exclusion_criteria=["Type 1 DM without endocrine co-management"],
            pre_administration_checks=["Diabetes medication inventory", "Renal function", "BMI documentation"],
            dosing={
                "medication": "Tirzepatide (compounded)",
                "dose": "Start 2.5mg weekly (draft)",
                "route": "SubQ",
                "frequency": "Weekly step-ups per table",
                "duration": "Ongoing",
            },
            administration=["Confirm concentration on vial label each fill"],
            monitoring_during=["Capillary glucose if on secretagogues/insulin"],
            monitoring_post=["Weight trends", "GI tolerability"],
            patient_education=["Hypoglycemia symptoms if on concurrent DM meds"],
            escalation_criteria=["Severe dehydration", "Pancreatitis suspicion"],
            documentation_required=["Pharmacy coordination note"],
            adverse={"mild": ["Antiemetic PRN"], "moderate": ["Dose hold"], "severe": ["911 if altered mental status with hypoglycemia"]},
        ),
    },
]


def emit_protocol_block(p: dict, idx: int) -> str:
    tag = f"p{idx}"
    md_body = p["markdown"]
    struct = p["structured"]
    notes_json = notes(p["notes"])
    slug = p["slug"]
    title = p["title"].replace("'", "''")
    category = p["category"]
    st = "ARRAY[" + ",".join(f"'{s}'::text" for s in p["service_type"]) + "]::text[]"

    # dollar-quote tags must not appear in body
    assert "$" not in md_body and "$" not in struct and "$" not in notes_json

    return dedent(
        f"""
    DO ${tag}$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('{slug}', '{title}', '{category}', {st}, true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          ${tag}_md${md_body}${tag}_md$,
          ${tag}_js${struct}${tag}_js$::jsonb,
          ${tag}_nt${notes_json}${tag}_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END ${tag}$;
    """
    )


def main() -> None:
    parts = [
        dedent(
            """\
        -- Seed 13 clinical protocol drafts (system-authored).
        -- Safe to re-run: uses ON CONFLICT(slug) on protocols and only inserts
        -- version 1 when current_version_id is still NULL (preserves edits if
        -- a version was already linked).

        BEGIN;
        """
        )
    ]
    for i, p in enumerate(PROTOCOLS, start=1):
        parts.append(emit_protocol_block(p, i))
    parts.append(
        dedent(
            """
        COMMIT;

        -- ============================================================================
        -- VERIFICATION (run in Supabase SQL Editor)
        -- ============================================================================
        -- SELECT count(*) FROM public.clinical_protocols;                     -- expect 13
        -- SELECT count(*) FROM public.clinical_protocol_versions;           -- expect >=13 (more if edited)
        -- SELECT status, count(*) FROM public.clinical_protocol_versions GROUP BY 1;
        --
        -- Sample joined row:
        -- SELECT p.slug, p.title, v.version_number, v.status, v.body_structured->'indication' AS indication
        -- FROM public.clinical_protocols p
        -- JOIN public.clinical_protocol_versions v ON v.id = p.current_version_id
        -- WHERE p.slug = 'iv-myers-cocktail';
        """
        )
    )
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
