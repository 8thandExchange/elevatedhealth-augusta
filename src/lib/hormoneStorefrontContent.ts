/**
 * Patient-facing hormone copy shared across storefront pages.
 * Men's TRT leads with compounded transdermal cream (Custom Pharmacy of Evans).
 * Staff formulary / Rx routing lives in pharmacyOrderFormulary.ts — not here.
 */

export const MENS_TRT_LEAD_COPY =
  "Our default is compounded transdermal testosterone cream — custom-dosed to your labs and shipped directly from Custom Pharmacy of Evans, minutes from our clinic.";

export const MENS_TRT_ALTERNATIVES_COPY =
  "For patients who prefer FDA-approved gels, sprays, or patches when available, we prescribe via standard e-Rx to your pharmacy of choice. You're not locked into one delivery method.";

export const MENS_TRT_MONITORING_COPY =
  "Your protocol is built from comprehensive LabCorp panels — testosterone, thyroid, and the markers your physician needs to dose safely. We monitor quarterly and adjust to keep you in optimal range, not just above the floor.";

export const MENS_TRT_SERVICES = [
  "Compounded testosterone cream (transdermal, daily)",
  "FDA-approved gels, sprays, or patches when preferred",
  "Comprehensive hormone labs (LabCorp)",
  "Quarterly monitoring and dose adjustment",
  "Supportive medications when clinically indicated",
] as const;

export const WOMENS_HRT_SERVICES = [
  "Bioidentical hormone replacement (BHRT)",
  "Compounded transdermal creams (Bi-Est, estradiol, progesterone)",
  "Testosterone for women when indicated",
  "Thyroid optimization when labs support it",
  "Comprehensive hormone labs (LabCorp)",
  "Quarterly monitoring and dose adjustment",
] as const;

export const HORMONE_PHARMACY_FOOTNOTE =
  "Prescriptions are filled by Custom Pharmacy of Evans — our local compounding partner — and ship directly to your door.";

export const HORMONES_GATEWAY_MENS_CARD =
  "TRT with compounded transdermal testosterone cream — custom-dosed to your labs and shipped to your door. Physician-led, LabCorp-driven.";

export const HORMONES_GATEWAY_LOCAL_COMPOUNDING =
  "Women's BHRT and men's TRT default to compounded transdermal creams from Custom Pharmacy of Evans — same city as our clinic. Custom-dosed to your labs; insulated from nationwide patch shortages.";
