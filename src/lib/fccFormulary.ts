// FCC FormuConnect 2026 Formulary
// Source: Formulation Compounding Center (info@formulationrx.com, 844-946-6690)
// Documents: docs/pharmacy/FCC_FormuConnect_Formulary_2026.pdf
// Portal: https://app.formuconnect.com/login (replaced fccrxportal.com Apr 12, 2026)
//
// "VARY" SKUs = strength/quantity selected at order entry inside FormuConnect.
// Prices in USD, wholesale pharmacy cost (NOT patient-facing retail).

export type FCCCategory =
  | "peptide_oral"
  | "peptide_injectable"
  | "topical_dermatology"
  | "hair_loss"
  | "wellness"
  | "lipotropic_vitamin"
  | "hormone_oral"
  | "hormone_topical"
  | "hormone_injectable"
  | "sexual_wellness"
  | "weight_management";

export interface FCCItem {
  sku: string;            // Single SKU or "VARY" or "3617/3624/3627/3628"
  name: string;           // Drug / formulation name
  strength: string;       // Concentration / dose
  quantity: string;       // Pack size
  price: string;          // Display price (single value or range)
  category: FCCCategory;
  notes?: string;
}

export const FCC_CATEGORY_LABELS: Record<FCCCategory, string> = {
  peptide_oral: "Anti-Aging / Peptides — Oral",
  peptide_injectable: "Anti-Aging / Peptides — Injectable & Nasal",
  topical_dermatology: "Anti-Aging / Topical Dermatology",
  hair_loss: "Hair Loss",
  wellness: "Wellness",
  lipotropic_vitamin: "Lipotropic / Vitamin Injectables",
  hormone_oral: "Hormone Therapy — Oral",
  hormone_topical: "Hormone Therapy — Topical / Vaginal Cream",
  hormone_injectable: "Hormone Therapy — Injectable",
  sexual_wellness: "Sexual Wellness",
  weight_management: "Weight Management",
};

export const FCC_FORMULARY: FCCItem[] = [
  // ───────── Peptide Oral ─────────
  { sku: "3129", name: "5-Amino 1MQ Capsules", strength: "25mg", quantity: "30 Capsules", price: "$62", category: "peptide_oral" },
  { sku: "3130", name: "5-Amino 1MQ Capsules", strength: "50mg", quantity: "30 Capsules", price: "$96", category: "peptide_oral" },
  { sku: "3131", name: "5-Amino 1MQ Capsules", strength: "100mg", quantity: "30 Capsules", price: "$189", category: "peptide_oral" },
  { sku: "3789", name: "5-Amino 1MQ Iodide RDT", strength: "50mg", quantity: "30 RDTs", price: "$98", category: "peptide_oral" },
  { sku: "3132", name: "5-Amino 1MQ Iodide Troches", strength: "50mg", quantity: "30 Troches", price: "$95", category: "peptide_oral" },
  { sku: "3737", name: "GHK-Cu Acetate Sublingual TT", strength: "0.2mg", quantity: "30 Tablets", price: "$35", category: "peptide_oral" },
  { sku: "3771", name: "GHK-Cu Acetate Sublingual TT", strength: "0.2mg", quantity: "90 Tablets", price: "$72", category: "peptide_oral" },
  { sku: "3773", name: "GHK-Cu / Biotin Sublingual TT", strength: "0.2mg/1mg", quantity: "30 Tablets", price: "$42", category: "peptide_oral" },
  { sku: "3772", name: "GHK-Cu / Biotin Sublingual TT", strength: "0.2mg/1mg", quantity: "90 Tablets", price: "$70", category: "peptide_oral" },
  { sku: "3774", name: "GHK-Cu / Pyridoxine Troches", strength: "0.2mg/10mg", quantity: "30 Troches", price: "$40", category: "peptide_oral" },
  { sku: "3775", name: "GHK-Cu / Pyridoxine Troches", strength: "0.2mg/10mg", quantity: "90 Troches", price: "$75", category: "peptide_oral" },
  { sku: "3512", name: "Glutathione Troches", strength: "200mg", quantity: "30 Troches", price: "$60", category: "peptide_oral" },
  { sku: "3550", name: "Larazotide Capsules", strength: "0.25mg", quantity: "30 caps", price: "$54", category: "peptide_oral" },
  { sku: "3551", name: "Larazotide Capsules", strength: "0.25mg", quantity: "60 caps", price: "$95", category: "peptide_oral" },
  { sku: "3552", name: "Larazotide Capsules", strength: "0.5mg", quantity: "30 caps", price: "$95", category: "peptide_oral" },
  { sku: "3554", name: "Larazotide Capsules", strength: "0.5mg", quantity: "60 caps", price: "$165", category: "peptide_oral" },
  { sku: "2877", name: "Lipotropic Capsules (MIC + B12 + Cr)", strength: "150/250/30/1/0.2mg", quantity: "30 caps", price: "$38.50", category: "peptide_oral" },
  { sku: "3104", name: "Methylene Blue Capsules", strength: "15mg", quantity: "30 Capsules", price: "$55", category: "peptide_oral" },
  { sku: "3105", name: "Methylene Blue Capsules", strength: "25mg", quantity: "30 Capsules", price: "$75", category: "peptide_oral" },
  { sku: "3538", name: "Methylene Blue Capsules", strength: "45mg", quantity: "30 Capsules", price: "$119", category: "peptide_oral" },
  { sku: "3122", name: "NAD+ Acid-Resistant Capsules", strength: "100mg", quantity: "30 Capsules", price: "$90", category: "peptide_oral" },
  { sku: "3123", name: "NAD+ Acid-Resistant Capsules", strength: "150mg", quantity: "30 Capsules", price: "$120", category: "peptide_oral" },
  { sku: "3547", name: "NAD+ RDT", strength: "200mg", quantity: "30 RDTs", price: "$185", category: "peptide_oral" },
  { sku: "3121", name: "NAD+ Troches", strength: "25mg", quantity: "30 Troches", price: "$40", category: "peptide_oral" },
  { sku: "3787", name: "Oxandrolone Capsules", strength: "12mg", quantity: "30 Capsules", price: "$50", category: "peptide_oral" },
  { sku: "3788", name: "Oxandrolone Capsules", strength: "25mg", quantity: "30 Capsules", price: "$85", category: "peptide_oral" },
  { sku: "3786", name: "Oxandrolone Capsules", strength: "50mg", quantity: "30 Capsules", price: "$170", category: "peptide_oral" },
  { sku: "2902", name: "Pentadeca Arginate Capsules", strength: "1000mcg", quantity: "30 Capsules", price: "$65", category: "peptide_oral" },
  { sku: "2901", name: "Pentadeca Arginate Capsules", strength: "500mcg", quantity: "30 Capsules", price: "$39", category: "peptide_oral" },
  { sku: "3106", name: "Rapamycin Capsules", strength: "0.75mg", quantity: "12 Capsules", price: "$43", category: "peptide_oral" },
  { sku: "3107", name: "Rapamycin Capsules", strength: "1.35mg", quantity: "12 Capsules", price: "$43", category: "peptide_oral" },
  { sku: "3108", name: "Rapamycin Capsules", strength: "2.7mg", quantity: "12 Capsules", price: "$43", category: "peptide_oral" },
  { sku: "3109", name: "Rapamycin Capsules", strength: "5.4mg", quantity: "12 Capsules", price: "$59", category: "peptide_oral" },
  { sku: "3521", name: "Sermorelin Acetate RDT", strength: "0.5mg", quantity: "30 RDTs", price: "$65", category: "peptide_oral" },
  { sku: "3520", name: "Sermorelin Acetate Sublingual", strength: "0.5mg", quantity: "30 Tablets", price: "$55", category: "peptide_oral" },
  { sku: "3522", name: "Sermorelin Acetate Troches", strength: "0.5mg", quantity: "30 Troches", price: "$55", category: "peptide_oral" },
  { sku: "2891", name: "Sermorelin/DHEA Sublingual", strength: "0.3mg/25mg", quantity: "30 RDTs", price: "$55", category: "peptide_oral" },
  { sku: "2892", name: "Sermorelin/DHEA Sublingual", strength: "0.5mg/25mg", quantity: "30 RDTs", price: "$67", category: "peptide_oral" },
  { sku: "2893", name: "Sermorelin/DHEA Sublingual", strength: "1mg/25mg", quantity: "30 RDTs", price: "$110", category: "peptide_oral" },
  { sku: "2888", name: "Sermorelin/DHEA Troches", strength: "0.3mg/25mg", quantity: "30 Troches", price: "$55", category: "peptide_oral" },
  { sku: "2889", name: "Sermorelin/DHEA Troches", strength: "0.5mg/25mg", quantity: "30 Troches", price: "$67", category: "peptide_oral" },
  { sku: "2890", name: "Sermorelin/DHEA Troches", strength: "1mg/25mg", quantity: "30 Troches", price: "$110", category: "peptide_oral" },
  { sku: "2894", name: "Sermorelin/Oxytocin Troche", strength: "1mg/10IU", quantity: "30 Troches", price: "$95", category: "peptide_oral" },
  { sku: "3819", name: "SLU-PP-332 Capsules", strength: "250mcg", quantity: "60 Capsules", price: "$60", category: "peptide_oral" },
  { sku: "3820", name: "SLU-PP-332 Capsules", strength: "250mcg", quantity: "120 Capsules", price: "$115", category: "peptide_oral" },
  { sku: "38821", name: "SLU-PP-332 Capsules", strength: "250mcg", quantity: "180 Capsules", price: "$165", category: "peptide_oral" },
  { sku: "3110", name: "Tesofensine Capsules", strength: "0.25mg", quantity: "30 Capsules", price: "$79", category: "peptide_oral" },
  { sku: "3111", name: "Tesofensine Capsules", strength: "0.5mg", quantity: "30 Capsules", price: "$119", category: "peptide_oral" },
  { sku: "3112", name: "Tesofensine Capsules", strength: "1mg", quantity: "30 Capsules", price: "$238", category: "peptide_oral" },

  // ───────── Peptide Injectable / Nasal ─────────
  { sku: "3791", name: "Levocarnitine Injection", strength: "200mg/mL", quantity: "10mL Vial", price: "$38", category: "peptide_injectable" },
  { sku: "3792", name: "Levocarnitine Injection", strength: "500mg/mL", quantity: "10mL Vial", price: "$40", category: "peptide_injectable" },
  { sku: "3640", name: "NAD+ Injection (10x2mL)", strength: "50mg/mL", quantity: "20mL", price: "$150", category: "peptide_injectable" },
  { sku: "3120", name: "NAD+ Injection (2x10mL)", strength: "100mg/mL", quantity: "20mL", price: "$131", category: "peptide_injectable" },
  { sku: "3560", name: "NAD+ Injection (10x1mL)", strength: "200mg/mL", quantity: "10mL", price: "$200", category: "peptide_injectable" },
  { sku: "3115", name: "NAD+ Injection", strength: "1mg/mL", quantity: "5mL Vial", price: "$35", category: "peptide_injectable" },
  { sku: "3116", name: "NAD+ Injection (2x5mL)", strength: "1mg/mL", quantity: "10mL", price: "$68", category: "peptide_injectable" },
  { sku: "3117", name: "NAD+ Injection (3x5mL)", strength: "1mg/mL", quantity: "15mL", price: "$78", category: "peptide_injectable" },
  { sku: "3118", name: "NAD+ Injection (4x5mL)", strength: "1mg/mL", quantity: "20mL", price: "$91", category: "peptide_injectable" },
  { sku: "3839", name: "NAD+ Injection", strength: "200mg/mL", quantity: "10mL Vial", price: "$87", category: "peptide_injectable" },
  { sku: "3503", name: "NAD+ Injection", strength: "50mg/mL", quantity: "10mL Vial", price: "$45", category: "peptide_injectable" },
  { sku: "3677", name: "NAD+ Injection", strength: "50mg/mL", quantity: "30mL Vial", price: "$65", category: "peptide_injectable" },
  { sku: "3119", name: "NAD+ Injection", strength: "100mg/mL", quantity: "10mL Vial", price: "$70", category: "peptide_injectable" },
  { sku: "3639", name: "NAD+ Injection (5x2mL)", strength: "50mg/mL", quantity: "10mL", price: "$85", category: "peptide_injectable" },
  { sku: "3114", name: "NAD+ Nasal Spray", strength: "300mg/mL", quantity: "15mL", price: "$155", category: "peptide_injectable" },
  { sku: "3113", name: "NAD+ Nasal Spray", strength: "50mg/mL", quantity: "30mL", price: "$55", category: "peptide_injectable" },
  { sku: "3511", name: "Pentadeca Arginate Injection", strength: "2mg/mL", quantity: "7.5mL Vial", price: "$50", category: "peptide_injectable" },
  { sku: "3675", name: "Selank Acetate (TP-7) Nasal Spray", strength: "7500mcg/mL", quantity: "6mL", price: "$89", category: "peptide_injectable" },
  { sku: "2884", name: "Sermorelin Injection", strength: "1mg/mL", quantity: "6mL Vial", price: "$38", category: "peptide_injectable" },
  { sku: "2885", name: "Sermorelin Injection", strength: "1.5mg/mL", quantity: "6mL Vial", price: "$49", category: "peptide_injectable" },
  { sku: "3502", name: "PT-141 (Bremelanotide) Injection", strength: "2mg/mL", quantity: "10mL Vial", price: "$95", category: "peptide_injectable" },
  { sku: "3811", name: "SS-31 (Elamipretide) Injection", strength: "16mg/mL", quantity: "5mL Vial", price: "$185", category: "peptide_injectable" },
  { sku: "2896", name: "Tesamorelin Injection", strength: "5mg/mL", quantity: "3mL Vial", price: "$200", category: "peptide_injectable" },
  { sku: "2897", name: "Tesamorelin Injection (2x3mL)", strength: "5mg/mL", quantity: "6mL", price: "$325", category: "peptide_injectable" },
  { sku: "3812", name: "Thymosin Beta-4 Acetate Injection", strength: "2.5mg/mL", quantity: "4mL Vial", price: "$48", category: "peptide_injectable" },
  { sku: "3813", name: "Thymosin Beta-4 Acetate Injection", strength: "2.5mg/mL", quantity: "8mL (2x4mL)", price: "$85", category: "peptide_injectable" },

  // ───────── Hormone Topical / Vaginal Cream ─────────
  { sku: "VARY", name: "Bi-Est (E2/E3) 50/50 or 80/20 Topical Cream", strength: "1–10mg/mL", quantity: "30g / 90g", price: "$27 / $63", category: "hormone_topical" },
  { sku: "VARY", name: "Estradiol (E2) Vaginal Cream", strength: "0.1–2mg/g", quantity: "30g / 90g PERL", price: "$40 / $110", category: "hormone_topical" },
  { sku: "VARY", name: "Estradiol (E2) Topical Cream", strength: "0.1–20mg/mL", quantity: "30g / 90g UnoDose", price: "$40 / $110", category: "hormone_topical" },
  { sku: "VARY", name: "Estriol (E3) Vaginal Cream", strength: "0.1–5mg/mL", quantity: "30g / 90g PERL", price: "$40 / $110", category: "hormone_topical" },
  { sku: "VARY", name: "Progesterone Topical Cream", strength: "10–200mg/mL", quantity: "30g / 90g UnoDose", price: "$24 / $63", category: "hormone_topical" },
  { sku: "VARY", name: "Testosterone Topical Cream", strength: "1–200mg/mL", quantity: "30g / 90g UnoDose", price: "$24 / $63", category: "hormone_topical", notes: "Réveil male protocol: 100 / 150 / 200mg fixed" },

  // ───────── Hormone Oral ─────────
  { sku: "VARY", name: "Anastrozole Capsules", strength: "0.5mg / 1mg", quantity: "30 / 90 caps", price: "$21.50 / $54", category: "hormone_oral" },
  { sku: "VARY", name: "Bi-Est Sublingual RDT", strength: "1–10mg", quantity: "30 / 90 RDTs", price: "$28 / $66", category: "hormone_oral" },
  { sku: "VARY", name: "Bi-Est Troches", strength: "1–10mg", quantity: "30 / 90 Troches", price: "$27 / $66", category: "hormone_oral" },
  { sku: "VARY", name: "Bi-Est SR Capsules", strength: "1–10mg", quantity: "30 / 90 caps", price: "$24 / $59", category: "hormone_oral" },
  { sku: "2595/2596", name: "Clomiphene Capsules", strength: "25mg", quantity: "30 / 90 caps", price: "$23 / $63", category: "hormone_oral" },
  { sku: "2597/2598", name: "Clomiphene Capsules", strength: "50mg", quantity: "30 / 90 caps", price: "$28 / $72", category: "hormone_oral" },
  { sku: "3846/3546", name: "DHEA Capsules (IR)", strength: "25mg / 50mg", quantity: "30 caps", price: "$24", category: "hormone_oral" },
  { sku: "2583–2590", name: "DHEA Capsules (SR)", strength: "40–100mg", quantity: "30 / 90 caps", price: "$28 / $75", category: "hormone_oral" },
  { sku: "2591/3795/2592", name: "Enclomiphene Citrate", strength: "12.5mg", quantity: "30 / 45 / 90 caps", price: "$43 / $75 / $115", category: "hormone_oral" },
  { sku: "2593/3794/2594", name: "Enclomiphene Citrate", strength: "25mg", quantity: "30 / 45 / 90 caps", price: "$55 / $105 / $150", category: "hormone_oral" },
  { sku: "3817/3818", name: "Enclomiphene Citrate", strength: "50mg", quantity: "30 / 60 caps", price: "$115 / $215", category: "hormone_oral" },
  { sku: "VARY", name: "Estradiol IR Capsules", strength: "0.5–2mg", quantity: "30 / 90 caps", price: "$22 / $59", category: "hormone_oral" },
  { sku: "VARY", name: "Estriol SR Capsules", strength: "0.5–2mg", quantity: "30 / 90 caps", price: "$22 / $59", category: "hormone_oral" },
  { sku: "VARY", name: "Liothyronine (T3) IR Capsules", strength: "1mcg–300mcg", quantity: "30 / 90 caps", price: "$32 / $82", category: "hormone_oral" },
  { sku: "VARY", name: "T3/T4 Combination IR Capsules", strength: "Varies", quantity: "30 / 90 caps", price: "$33 / $84", category: "hormone_oral" },
  { sku: "VARY", name: "Progesterone IR Capsules", strength: "12.5–225mg", quantity: "30 / 90 caps", price: "$24 / $63", category: "hormone_oral" },
  { sku: "VARY", name: "Progesterone SR Capsules", strength: "12.5–300mg", quantity: "30 / 90 caps", price: "$24 / $63", category: "hormone_oral" },
  { sku: "VARY", name: "Progesterone Sublingual RDT", strength: "25–200mg", quantity: "30 / 90 RDTs", price: "$24 / $63", category: "hormone_oral" },
  { sku: "VARY", name: "Progesterone Troches", strength: "25–200mg", quantity: "30 / 90 Troches", price: "$24 / $63", category: "hormone_oral" },
  { sku: "VARY", name: "Testosterone Sublingual RDT", strength: "2.5–200mg", quantity: "30 / 90 RDTs", price: "$24 / $63", category: "hormone_oral" },
  { sku: "VARY", name: "Testosterone Troches", strength: "1–200mg", quantity: "30 / 90 Troches", price: "$24 / $63", category: "hormone_oral" },

  // ───────── Hormone Injectable ─────────
  { sku: "3869", name: "Estradiol Hemihydrate (Sesame Oil)", strength: "5mg/mL", quantity: "5mL Vial", price: "$35", category: "hormone_injectable" },
  { sku: "3501", name: "Gonadorelin Acetate Injection", strength: "0.2mg/mL", quantity: "5mL Vial", price: "$50", category: "hormone_injectable" },
  { sku: "3676", name: "Gonadorelin Acetate Nasal Spray", strength: "0.15mg/mL", quantity: "30mL", price: "$60", category: "hormone_injectable" },
  { sku: "2789", name: "Nandrolone Decanoate (Grapeseed)", strength: "200mg/mL", quantity: "4mL Vial", price: "$40", category: "hormone_injectable" },
  { sku: "2714/2722/3637/3638", name: "Progesterone Injection (Grapeseed/Sesame)", strength: "100mg/mL", quantity: "10mL / 3x10mL", price: "$57 / $90–$95", category: "hormone_injectable" },
  { sku: "3532–2828", name: "Testosterone Cypionate (Grapeseed)", strength: "20–200mg/mL", quantity: "1mL / 5mL", price: "$22–$25 / $27–$37", category: "hormone_injectable" },
  { sku: "3801–3804", name: "Testosterone Cypionate (MCT)", strength: "25–200mg/mL", quantity: "5mL Vial", price: "$28", category: "hormone_injectable" },
  { sku: "3699/2804/2805", name: "Testosterone Cyp / Anastrozole (Grapeseed)", strength: "200mg/0.5mg/mL", quantity: "2x1mL / 5mL / 2x5mL", price: "$30 / $40 / $76", category: "hormone_injectable" },
  { sku: "3828", name: "Testosterone Cyp + Prop (MCT)", strength: "175mg + 25mg/mL", quantity: "2x5mL", price: "$40", category: "hormone_injectable" },
  { sku: "2830–2837", name: "Testosterone Propionate (Grapeseed)", strength: "25–200mg/mL", quantity: "5mL / 2x5mL", price: "$37 / $76", category: "hormone_injectable" },

  // ───────── Lipotropic / Vitamin (relevant to IV lounge) ─────────
  { sku: "3725", name: "Amino Mix (Arg/Cit/Lys/Pro)", strength: "100/50/50/50mg/mL", quantity: "30mL (3x10mL)", price: "$65", category: "lipotropic_vitamin" },
  { sku: "3727", name: "Calcium Chloride Injection", strength: "100mg/mL", quantity: "30mL Vial", price: "$37", category: "lipotropic_vitamin" },
  { sku: "2837", name: "Glutathione Injection", strength: "200mg/mL", quantity: "10mL Vial", price: "$33", category: "lipotropic_vitamin" },
  { sku: "3516", name: "Glutathione Injection", strength: "200mg/mL", quantity: "30mL Vial", price: "$85", category: "lipotropic_vitamin" },
  { sku: "2868", name: "Lipotropic A (MIC)", strength: "25/50/50mg/mL", quantity: "10mL Vial", price: "$34", category: "lipotropic_vitamin" },
  { sku: "3866", name: "Lipotropic B (MIC + B12)", strength: "25/50/50/1mg/mL", quantity: "4mL Vial", price: "$20", category: "lipotropic_vitamin" },
  { sku: "2869", name: "Lipotropic B (MIC + B12)", strength: "25/50/50/1mg/mL", quantity: "10mL Vial", price: "$36", category: "lipotropic_vitamin" },
  { sku: "3728", name: "Lipo B6 (MIC + B12 + B6)", strength: "25/50/50/1/0.25mg/mL", quantity: "30mL (3x10mL)", price: "$45", category: "lipotropic_vitamin" },
  { sku: "2870", name: "Lipotropic C (MIC + Carnitine + B1 + B5)", strength: "Multi", quantity: "10mL Vial", price: "$39.50", category: "lipotropic_vitamin" },
  { sku: "3742", name: "Lipotropic MB (MIC + Methyl-B12)", strength: "25/50/50/1mg/mL", quantity: "30mL Vial", price: "$44", category: "lipotropic_vitamin" },
  { sku: "2871", name: "Lipotropic Super B (full stack)", strength: "Multi", quantity: "10mL Vial", price: "$49", category: "lipotropic_vitamin" },
  { sku: "2872", name: "Lipotropic Super B (full stack)", strength: "Multi", quantity: "30mL Vial", price: "$59", category: "lipotropic_vitamin" },
  { sku: "3729", name: "Magnesium Chloride IV Injection", strength: "200mg/mL", quantity: "30mL Vial", price: "$34", category: "lipotropic_vitamin" },
  { sku: "3730", name: "Magnesium Chloride IV Injection", strength: "300mg/mL", quantity: "30mL Vial", price: "$38", category: "lipotropic_vitamin" },
  { sku: "2866", name: "Methylcobalamin Injection", strength: "1mg/mL", quantity: "5mL Vial", price: "$25", category: "lipotropic_vitamin" },
  { sku: "2867", name: "Methylcobalamin Injection", strength: "1mg/mL", quantity: "10mL Vial", price: "$28", category: "lipotropic_vitamin" },
  { sku: "3835", name: "Methylcobalamin Injection", strength: "25mg/mL", quantity: "5mL Vial", price: "$55", category: "lipotropic_vitamin" },
  { sku: "3679", name: "Methylcobalamin Injection", strength: "5mg/mL", quantity: "30mL Vial", price: "$85", category: "lipotropic_vitamin" },
  { sku: "3735", name: "Myers Cocktail (full)", strength: "Multi", quantity: "10mL Vial", price: "$58", category: "lipotropic_vitamin" },
  { sku: "3736", name: "Myers Cocktail (full)", strength: "Multi", quantity: "3x10mL", price: "$160", category: "lipotropic_vitamin" },
  { sku: "3732", name: "Taurine Injection", strength: "50mg/mL", quantity: "30mL Vial", price: "$55", category: "lipotropic_vitamin" },
  { sku: "3733", name: "Vita B Mix (B1/B2/B3/B5/B6)", strength: "100/2/100/2/2mg/mL", quantity: "30mL Vial", price: "$68", category: "lipotropic_vitamin" },
  { sku: "3559", name: "Vitamin D3 (Sesame Oil)", strength: "100,000 IU/mL", quantity: "10mL Vial", price: "$70", category: "lipotropic_vitamin" },
  { sku: "3558", name: "Vitamin D3 (Sesame Oil)", strength: "50,000 IU/mL", quantity: "10mL Vial", price: "$60", category: "lipotropic_vitamin" },
  { sku: "3731", name: "Zinc Sulfate IV Injection", strength: "10mg/mL", quantity: "10mL Vial", price: "$30", category: "lipotropic_vitamin" },

  // ───────── Sexual Wellness (top picks) ─────────
  { sku: "3076", name: "Oxytocin Nasal Spray", strength: "100IU/0.1mL", quantity: "15mL", price: "$72", category: "sexual_wellness" },
  { sku: "3073", name: "Oxytocin Nasal Spray", strength: "10IU/0.1mL", quantity: "15mL", price: "$39", category: "sexual_wellness" },
  { sku: "3074", name: "Oxytocin Nasal Spray", strength: "25IU/0.1mL", quantity: "15mL", price: "$50", category: "sexual_wellness" },
  { sku: "3075", name: "Oxytocin Nasal Spray", strength: "50IU/0.1mL", quantity: "15mL", price: "$60", category: "sexual_wellness" },
  { sku: "3141", name: "PT-141 / Oxytocin Nasal Spray", strength: "5mg/250IU", quantity: "10mL", price: "$115", category: "sexual_wellness" },
  { sku: "3644", name: "PT-141 / Oxytocin Nasal Spray", strength: "5mg/250IU/mL", quantity: "6mL", price: "$70", category: "sexual_wellness" },
  { sku: "2903", name: "Scream Cream (Sild/Arg/Pap)", strength: "2/1/5%", quantity: "30g PERL", price: "$39", category: "sexual_wellness" },
  { sku: "2904", name: "Scream Cream + Testosterone", strength: "2/1/5/0.1%", quantity: "30g PERL", price: "$45", category: "sexual_wellness" },
  { sku: "2936/2942", name: "Sildenafil Capsules", strength: "25–175mg", quantity: "30 caps", price: "$26", category: "sexual_wellness" },
  { sku: "2943/2956", name: "Sildenafil Troches", strength: "25–175mg", quantity: "15 / 30 Troches", price: "$20 / $26", category: "sexual_wellness" },
  { sku: "2905–2909", name: "Tadalafil Capsules", strength: "5–30mg", quantity: "30 caps", price: "$23", category: "sexual_wellness" },
  { sku: "2920–2929", name: "Tadalafil Sublingual RDT", strength: "5–75mg", quantity: "15 / 30 RDTs", price: "$19 / $25", category: "sexual_wellness" },
  { sku: "2910–2919", name: "Tadalafil Troches", strength: "5–75mg", quantity: "15 / 30 Troches", price: "$19 / $25", category: "sexual_wellness" },

  // ───────── Weight Management ─────────
  { sku: "3556", name: "AOD-9604 / Oxytocin Troche", strength: "0.5mg/25IU", quantity: "30 Troches", price: "$80", category: "weight_management" },
  { sku: "3557", name: "AOD-9604 RDT", strength: "0.5mg", quantity: "30 RDTs", price: "$90", category: "weight_management" },
  { sku: "3555", name: "AOD-9604 / Naltrexone Cream", strength: "600mcg/1mg/mL", quantity: "30g", price: "$95", category: "weight_management" },
  { sku: "2874/3568/3567", name: "Bupropion/Naltrexone/Cr SR Caps", strength: "90/8mg/200mcg", quantity: "30 / 70 / 120 SR", price: "$37 / $90 / $130", category: "weight_management" },
  { sku: "3574/3575/3576", name: "Bupropion/Phentermine/Naltrexone SR", strength: "60/20/7.5mg", quantity: "30 / 60 / 90 SR", price: "$40 / $55 / $75", category: "weight_management" },
  { sku: "3518/3606", name: "LDN Capsules", strength: "1mg", quantity: "30 / 90 caps", price: "$27.50 / $70", category: "weight_management" },
  { sku: "2790/2791", name: "LDN Capsules", strength: "1.5mg", quantity: "30 / 90 caps", price: "$27.50 / $70", category: "weight_management" },
  { sku: "2792/2793", name: "LDN Capsules", strength: "3mg", quantity: "30 / 90 caps", price: "$27.50 / $70", category: "weight_management" },
  { sku: "2794/2795", name: "LDN Capsules", strength: "4.5mg", quantity: "30 / 90 caps", price: "$27.50 / $70", category: "weight_management" },
  { sku: "3807/3808", name: "LDN Capsules", strength: "8mg", quantity: "30 / 90 caps", price: "$27.50 / $70", category: "weight_management" },
  { sku: "3136", name: "Phentermine/Topiramate/Cr SR", strength: "15/40mg/1mg", quantity: "30 SR", price: "$37", category: "weight_management" },
  { sku: "3586/3568/3567", name: "Phentermine/Topiramate/Cr SR", strength: "25/40mg/1mg", quantity: "30 / 60 / 90 SR", price: "$40 / $65 / $90", category: "weight_management" },
  // Semaglutide sublingual triturates
  { sku: "2496", name: "Semaglutide Triturates", strength: "145mcg", quantity: "28 TT", price: "$25", category: "weight_management" },
  { sku: "2497", name: "Semaglutide Triturates", strength: "145mcg", quantity: "56 TT", price: "$45", category: "weight_management" },
  { sku: "3590", name: "Semaglutide Triturates", strength: "145mcg", quantity: "84 TT", price: "$65", category: "weight_management" },
  { sku: "3591", name: "Semaglutide Triturates", strength: "145mcg", quantity: "168 TT", price: "$125", category: "weight_management" },
  { sku: "2494", name: "Semaglutide Triturates", strength: "36mcg", quantity: "28 TT", price: "$25", category: "weight_management" },
  { sku: "2495", name: "Semaglutide Triturates", strength: "36mcg", quantity: "56 TT", price: "$35", category: "weight_management" },
  { sku: "3589", name: "Semaglutide Triturates", strength: "36mcg", quantity: "84 TT", price: "$50", category: "weight_management" },
  { sku: "3851", name: "Semaglutide Triturates", strength: "1mg", quantity: "30 TT", price: "$105", category: "weight_management" },
  { sku: "3854", name: "Semaglutide Triturates", strength: "1.5mg", quantity: "30 TT", price: "$105", category: "weight_management" },
  { sku: "3645", name: "Semaglutide Triturates", strength: "2mg", quantity: "30 TT", price: "$105", category: "weight_management" },
  { sku: "3853", name: "Semaglutide Triturates", strength: "3mg", quantity: "30 TT", price: "$150", category: "weight_management" },
  { sku: "3649", name: "Semaglutide Triturates", strength: "4mg", quantity: "30 TT", price: "$190", category: "weight_management" },
  { sku: "3650", name: "Semaglutide Triturates", strength: "6mg", quantity: "30 TT", price: "$255", category: "weight_management" },
  // Tirzepatide sublingual triturates
  { sku: "2503", name: "Tirzepatide Triturates", strength: "0.4mg", quantity: "28 TT", price: "$45", category: "weight_management" },
  { sku: "2504", name: "Tirzepatide Triturates", strength: "0.4mg", quantity: "56 TT", price: "$70", category: "weight_management" },
  { sku: "2505", name: "Tirzepatide Triturates", strength: "0.4mg", quantity: "84 TT", price: "$95", category: "weight_management" },
  { sku: "2506", name: "Tirzepatide Triturates", strength: "0.4mg", quantity: "112 TT", price: "$120", category: "weight_management" },
  { sku: "2507", name: "Tirzepatide Triturates", strength: "0.4mg", quantity: "140 TT", price: "$135", category: "weight_management" },
  { sku: "3651", name: "Tirzepatide Triturates", strength: "2mg", quantity: "30 TT", price: "$95", category: "weight_management" },
  { sku: "3653", name: "Tirzepatide Triturates", strength: "3mg", quantity: "30 TT", price: "$140", category: "weight_management" },
  { sku: "3652", name: "Tirzepatide Triturates", strength: "4mg", quantity: "30 TT", price: "$185", category: "weight_management" },
  { sku: "3654", name: "Tirzepatide Triturates", strength: "5mg", quantity: "30 TT", price: "$245", category: "weight_management" },
  { sku: "3850", name: "Tirzepatide Triturates", strength: "7mg", quantity: "30 TT", price: "$275", category: "weight_management" },
  // GLP-1 injectables
  { sku: "2482", name: "Retatrutide / B6 Injection", strength: "10mg/10mg/mL", quantity: "1mL", price: "$195", category: "weight_management" },
  { sku: "2483", name: "Retatrutide / B6 Injection", strength: "10mg/10mg/mL", quantity: "2mL", price: "$285", category: "weight_management" },
  { sku: "2484", name: "Retatrutide / B6 Injection", strength: "10mg/10mg/mL", quantity: "3mL", price: "$350", category: "weight_management" },
  { sku: "2478", name: "Retatrutide / B6 Injection", strength: "24mg/10mg/mL", quantity: "1mL", price: "$280", category: "weight_management" },
  { sku: "2485", name: "Retatrutide / B6 Injection", strength: "24mg/10mg/mL", quantity: "2mL", price: "$375", category: "weight_management" },
  { sku: "2486", name: "Retatrutide / B6 Injection", strength: "24mg/10mg/mL", quantity: "3mL", price: "$600", category: "weight_management" },
  { sku: "3834", name: "Retatrutide / B6 Injection", strength: "24mg/10mg/mL", quantity: "4mL", price: "$600", category: "weight_management" },
  { sku: "2488", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "1mL", price: "$35", category: "weight_management" },
  { sku: "2490", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "3mL", price: "$105", category: "weight_management" },
  { sku: "2489", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "2mL", price: "$70", category: "weight_management" },
  { sku: "2491", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "4mL", price: "$131", category: "weight_management" },
  { sku: "2493", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "6mL", price: "$190", category: "weight_management" },
  { sku: "3602", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "8mL", price: "$240", category: "weight_management" },
  { sku: "3604", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "10mL", price: "$285", category: "weight_management" },
  { sku: "3605", name: "Semaglutide / B6 Injection", strength: "2.5mg/10mg/mL", quantity: "12mL", price: "$320", category: "weight_management" },
  { sku: "2498", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "1mL", price: "$85", category: "weight_management" },
  { sku: "2499", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "2mL", price: "$145", category: "weight_management" },
  { sku: "2500", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "3mL", price: "$190", category: "weight_management" },
  { sku: "2501", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "4mL", price: "$240", category: "weight_management" },
  { sku: "2502", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "5mL", price: "$285", category: "weight_management" },
  { sku: "3594", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "10mL", price: "$400", category: "weight_management" },
  { sku: "3507", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "12mL", price: "$480", category: "weight_management" },
  { sku: "3595", name: "Tirzepatide / B6 Injection", strength: "12.5mg/10mg/mL", quantity: "15mL", price: "$600", category: "weight_management" },

  // ───────── Hair Loss (selected) ─────────
  { sku: "3096", name: "Dutasteride Capsules", strength: "2.5mg", quantity: "30 caps", price: "$19", category: "hair_loss" },
  { sku: "3776", name: "Dutasteride Capsules", strength: "5mg", quantity: "30 caps", price: "$22", category: "hair_loss" },
  { sku: "3623", name: "Mg / Finasteride / Cys / Fe / B12 Caps", strength: "375/3/113/65/1mg", quantity: "30 caps", price: "$65", category: "hair_loss" },
  { sku: "3090/3091", name: "Minoxidil Capsules", strength: "2.5mg", quantity: "30 / 90 caps", price: "$12 / $17", category: "hair_loss" },
  { sku: "3092/3093", name: "Minoxidil Capsules", strength: "5mg", quantity: "30 / 90 caps", price: "$12 / $17", category: "hair_loss" },
  { sku: "3617/3624/3627/3628", name: "Minoxidil + Finasteride Caps", strength: "2.5–5mg / 1mg", quantity: "30 / 90 caps", price: "$28–30 / $70–75", category: "hair_loss" },
  { sku: "3763/3764/3765", name: "GHK-Cu Topical Solution", strength: "0.25%", quantity: "30 / 60 / 90mL", price: "$45 / $70 / $100", category: "hair_loss" },
  { sku: "3768/3769/3770", name: "GHK-Cu Topical Solution", strength: "0.5%", quantity: "30 / 60 / 90mL", price: "$55 / $90 / $118", category: "hair_loss" },
  { sku: "3137", name: "GHK-Cu / Biotin Foam", strength: "0.25%/1%", quantity: "30mL Foam", price: "$65", category: "hair_loss" },
  { sku: "3139", name: "GHK-Cu / Biotin Foam", strength: "0.5%/1%", quantity: "30mL Foam", price: "$72", category: "hair_loss" },
  { sku: "3100/3753/3754", name: "Min/Fin/Tret/Fluoc/Vit-E Solution", strength: "5/0.25/0.01/0.01%/10IU", quantity: "30 / 60 / 90mL", price: "$46 / $78 / $98", category: "hair_loss" },

  // ───────── Wellness ─────────
  { sku: "3539", name: "Ivermectin Capsules", strength: "6mg", quantity: "24 caps", price: "$35", category: "wellness" },
  { sku: "3540", name: "Ivermectin Capsules", strength: "6mg", quantity: "30 caps", price: "$40", category: "wellness" },
  { sku: "3541", name: "Ivermectin Capsules", strength: "6mg", quantity: "60 caps", price: "$75", category: "wellness" },
  { sku: "3542", name: "Ivermectin Capsules", strength: "12mg", quantity: "24 caps", price: "$48", category: "wellness" },
  { sku: "3543", name: "Ivermectin Capsules", strength: "12mg", quantity: "30 caps", price: "$60", category: "wellness" },
  { sku: "3544", name: "Ivermectin Capsules", strength: "12mg", quantity: "60 caps", price: "$100", category: "wellness" },
  { sku: "3838", name: "Leucovorin Calcium Suspension", strength: "25mg/mL", quantity: "60mL", price: "$107", category: "wellness" },
  { sku: "3863", name: "Leucovorin Calcium Capsules", strength: "25mg", quantity: "60 caps", price: "$110", category: "wellness" },
  { sku: "3829", name: "Mebendazole Capsules", strength: "100mg", quantity: "30 caps", price: "$38", category: "wellness" },
  { sku: "3830", name: "Mebendazole Capsules", strength: "100mg", quantity: "60 caps", price: "$68", category: "wellness" },
  { sku: "3548", name: "Naltrexone / Melatonin / Oxytocin Troche", strength: "4/4mg/40IU", quantity: "30 Troches", price: "$40", category: "wellness" },
  { sku: "3549", name: "Naltrexone / Melatonin / Oxytocin Troche", strength: "4/4mg/40IU", quantity: "60 Troches", price: "$70", category: "wellness" },
];

export const FCC_PORTAL_URL = "https://app.formuconnect.com/login";
export const FCC_LEGACY_PORTAL_SUNSET = "2026-04-12";
