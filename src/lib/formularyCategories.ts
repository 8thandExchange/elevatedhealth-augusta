export const FORMULARY_CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "iv_additive", label: "IV additive / push" },
  { value: "peptide", label: "Peptide (à la carte)" },
  { value: "peptide_stack", label: "Peptide stack (program)" },
  { value: "compounded_medication", label: "Compounded medication" },
  { value: "glp1", label: "GLP-1" },
  { value: "iv_supply", label: "IV supply" },
  { value: "medical_supply", label: "Medical supply" },
  { value: "consumable", label: "Consumable" },
  { value: "hormone", label: "Hormone" },
  { value: "program", label: "Program" },
  { value: "other", label: "Other" },
] as const;

export const FORMULARY_SUPPLIERS = [
  { value: "all", label: "All suppliers" },
  { value: "fcc", label: "FCC" },
  { value: "henry_schein", label: "Henry Schein" },
  { value: "empower", label: "Empower" },
  { value: "stericycle", label: "Stericycle" },
  { value: "labcorp", label: "LabCorp" },
  { value: "other", label: "Other" },
] as const;

export function categoryLabel(value: string): string {
  return FORMULARY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[$,]/g, ""));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}
