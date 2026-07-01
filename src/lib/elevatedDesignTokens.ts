import { cn } from "@/lib/utils";

/** Figma-aligned Elevated Health marketing palette */
export const EHA_COLORS = {
  navy: "#123B52",
  clinical: "#2B6C94",
  sky: "#DDECF4",
  ice: "#F5FAFC",
  ink: "#10202B",
  slate: "#667A86",
  line: "#D8E3E8",
  success: "#2F7665",
  warning: "#B7791F",
} as const;

export const eha = {
  sectionLabel: "eha-section-label",
  card: "eha-card",
  sectionIce: "eha-section-ice",
  sectionSky: "eha-section-sky",
  sectionNavy: "eha-section-navy",
  textInk: "text-eha-ink",
  textSlate: "text-eha-slate",
  textClinical: "text-eha-clinical",
  borderLine: "border-eha-line",
  bgIce: "bg-eha-ice",
  bgSky: "bg-eha-sky",
  bgNavy: "bg-eha-navy",
} as const;

export function ehaSectionClass(variant: "ice" | "sky" | "white" | "navy" = "white", className?: string) {
  const base =
    variant === "ice"
      ? eha.sectionIce
      : variant === "sky"
        ? eha.sectionSky
        : variant === "navy"
          ? eha.sectionNavy
          : "bg-white";
  return cn(base, className);
}
