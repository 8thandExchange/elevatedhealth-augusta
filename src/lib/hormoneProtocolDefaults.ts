/**
 * EHA standard hormone protocols — simplified defaults staff should lead with.
 * Escalation routes exist but are not on the public menu.
 */

export type HormoneSex = "female" | "male";

export interface HormoneProtocolLine {
  compound: string;
  route: string;
  defaultDose: string;
  supplier: "custom_pharmacy_evans" | "fcc" | "drfirst";
  publicDefault: boolean;
  escalationOnly?: boolean;
  rationale: string;
}

export interface StandardHormoneProtocol {
  sex: HormoneSex;
  programKey: "hrt" | "trt";
  title: string;
  lines: HormoneProtocolLine[];
  escalationPaths: string[];
}

export const STANDARD_FEMALE_BHRT: StandardHormoneProtocol = {
  sex: "female",
  programKey: "hrt",
  title: "EHA Standard BHRT",
  lines: [
    {
      compound: "Bi-Est (E2/E3)",
      route: "Transdermal cream",
      defaultDose: "80:20 or 50:50 — titrate from 0.5–1 mg/day estradiol equivalent",
      supplier: "custom_pharmacy_evans",
      publicDefault: true,
      rationale: "Custom dosing; insulated from patch shortages; local Evans pharmacy.",
    },
    {
      compound: "Progesterone",
      route: "Oral micronized capsule at bedtime",
      defaultDose: "100–200 mg HS when uterus intact",
      supplier: "custom_pharmacy_evans",
      publicDefault: true,
      rationale: "Endometrial protection + sleep; preferred over progesterone cream.",
    },
    {
      compound: "Testosterone (women)",
      route: "Low-dose transdermal cream",
      defaultDose: "0.5–1 mg/g — micro-dose only if labs/symptoms support",
      supplier: "custom_pharmacy_evans",
      publicDefault: false,
      escalationOnly: true,
      rationale: "Add-on for vitality/libido — not every patient needs this on day one.",
    },
  ],
  escalationPaths: [
    "FDA estradiol patch/gel via DrFirst Rcopia (patient prefers retail)",
    "Bi-Est troches/sublingual (FCC or Custom Pharmacy) — absorption issues",
    "Pellets (Custom Pharmacy) — shared decision; hard to adjust once placed",
  ],
};

export const STANDARD_MALE_TRT: StandardHormoneProtocol = {
  sex: "male",
  programKey: "trt",
  title: "EHA Standard TRT",
  lines: [
    {
      compound: "Testosterone cream (men's dose)",
      route: "Topical cream, applied daily",
      defaultDose: "Compounded testosterone cream — physician-titrated to target total testosterone",
      supplier: "custom_pharmacy_evans",
      publicDefault: true,
      rationale: "Stable daily levels without injection peaks/troughs; EHA standard for men's TRT. Injectable (cypionate) TRT is not offered.",
    },
    {
      compound: "Anastrozole",
      route: "Oral capsule",
      defaultDose: "0.25–0.5 mg 2×/week when E2 elevated",
      supplier: "custom_pharmacy_evans",
      publicDefault: false,
      escalationOnly: true,
      rationale: "Ancillary — only when clinically indicated by labs.",
    },
    {
      compound: "HCG or gonadorelin",
      route: "SubQ injection",
      defaultDose: "Per fertility-preservation protocol",
      supplier: "custom_pharmacy_evans",
      publicDefault: false,
      escalationOnly: true,
      rationale: "When patient wants fertility or testicular volume on TRT.",
    },
  ],
  escalationPaths: [
    "Testosterone cream (Custom Pharmacy) — needle-averse patients",
    "Enclomiphene monotherapy (Custom Pharmacy) — fertility-first, not classic TRT",
    "FDA AndroGel/Testim via DrFirst — brand preference / superbill",
    "Pellets (Custom Pharmacy) — patient request only; we do not lead with these",
  ],
};

export const HORMONE_PROTOCOLS = [STANDARD_FEMALE_BHRT, STANDARD_MALE_TRT] as const;

export function protocolForSex(sex: HormoneSex): StandardHormoneProtocol {
  return sex === "female" ? STANDARD_FEMALE_BHRT : STANDARD_MALE_TRT;
}
