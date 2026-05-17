import { cn } from "@/lib/utils";

/** Distinct Elevated Health therapy marks — not Lucide templates. */
export type TherapyMarkKey =
  | "resurrection"
  | "meyers"
  | "beast-mode"
  | "recovery"
  | "wellness"
  | "performance"
  | "immunity"
  | "glow"
  | "iv"
  | "default";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function MarkGraphic({ mark }: { mark: TherapyMarkKey }) {
  switch (mark) {
    case "resurrection":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.14}
            d="M6 20c3-4 7-6 10-6s7 2 10 6v2H6v-2z"
          />
          <path
            {...STROKE}
            d="M6 20c3-4 7-6 10-6s7 2 10 6M10 14l2-5 2 5M18 14l2-5 2 5"
          />
          <circle {...STROKE} cx="16" cy="9" r="2.25" />
        </>
      );
    case "meyers":
      return (
        <>
          <circle fill="currentColor" fillOpacity={0.12} cx="16" cy="16" r="9" />
          <path
            {...STROKE}
            d="M16 7v18M7 16h18M10.5 10.5l11 11M21.5 10.5l-11 11"
            opacity={0.85}
          />
          <circle fill="currentColor" cx="16" cy="16" r="2.2" />
        </>
      );
    case "beast-mode":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.16}
            d="M8 22L16 8l8 14H8z"
          />
          <path {...STROKE} d="M11 18h10M13.5 14h5" />
          <path {...STROKE} d="M16 8v3" opacity={0.7} />
        </>
      );
    case "recovery":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.14}
            d="M11 8h10a2 2 0 012 2v9a2 2 0 01-2 2H11a2 2 0 01-2-2V10a2 2 0 012-2z"
          />
          <path {...STROKE} d="M13 8V6a3 3 0 016 0v2M16 14v5" />
          <circle fill="currentColor" cx="16" cy="14" r="1.2" />
        </>
      );
    case "wellness":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.12}
            d="M16 5c5 4 7 7.5 7 11a7 7 0 11-14 0c0-3.5 2-7 7-11z"
          />
          <path {...STROKE} d="M12 17c1.5-2.5 2.5-4 4-4s2.5 1.5 4 4" />
        </>
      );
    case "performance":
      return (
        <>
          <rect fill="currentColor" fillOpacity={0.14} x="7" y="16" width="4" height="7" rx="1" />
          <rect fill="currentColor" fillOpacity={0.22} x="14" y="11" width="4" height="12" rx="1" />
          <rect fill="currentColor" fillOpacity={0.3} x="21" y="7" width="4" height="16" rx="1" />
          <path {...STROKE} d="M6 23h20" opacity={0.5} />
        </>
      );
    case "immunity":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.14}
            d="M16 4l8 3.2v6.8c0 4.8-3.2 8.2-8 10-4.8-1.8-8-5.2-8-10V7.2L16 4z"
          />
          <path {...STROKE} d="M13 15l2.2 2.2L19 12.5" />
        </>
      );
    case "glow":
      return (
        <>
          <path
            fill="currentColor"
            fillOpacity={0.16}
            d="M16 6l2.8 6.8L26 16l-7.2 3.2L16 26l-2.8-6.8L6 16l7.2-3.2L16 6z"
          />
          <circle {...STROKE} cx="16" cy="16" r="3.5" />
        </>
      );
    case "iv":
      return (
        <>
          <path {...STROKE} d="M11 7v14M21 7v14" />
          <path
            fill="currentColor"
            fillOpacity={0.18}
            d="M9 11h4v6H9a1 1 0 01-1-1v-4a1 1 0 011-1zm10 0h4a1 1 0 011 1v4a1 1 0 01-1 1h-4v-6z"
          />
          <path {...STROKE} d="M16 12v5" opacity={0.55} />
        </>
      );
    default:
      return (
        <path
          {...STROKE}
          d="M8 16c0-4 3.5-7 8-7s8 3 8 7-3.5 7-8 7-8-3-8-7z"
        />
      );
  }
}

export function resolveTherapyMarkKey(therapyName: string, category: string): TherapyMarkKey {
  const name = therapyName.trim().toLowerCase();
  if (name.includes("resurrection")) return "resurrection";
  if (name.includes("meyer")) return "meyers";
  if (name.includes("beast")) return "beast-mode";
  if (name.includes("shield")) return "immunity";
  if (name.includes("glow")) return "glow";

  const cat = category.trim();
  if (cat === "Recovery") return "recovery";
  if (cat === "Wellness") return "wellness";
  if (cat === "Performance") return "performance";
  if (cat === "Immunity") return "immunity";
  if (cat === "Glow") return "glow";
  return "default";
}

interface BrandTherapyMarkProps {
  therapyName: string;
  category: string;
  className?: string;
  size?: number;
}

export function BrandTherapyMark({
  therapyName,
  category,
  className,
  size = 30,
}: BrandTherapyMarkProps) {
  const mark = resolveTherapyMarkKey(therapyName, category);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("text-accent shrink-0", className)}
      aria-hidden
    >
      <MarkGraphic mark={mark} />
    </svg>
  );
}

/** @deprecated Use BrandTherapyMark — kept for hero badge */
export type BrandGlyphCategory =
  | "Recovery"
  | "Wellness"
  | "Performance"
  | "Immunity"
  | "Glow"
  | "IV"
  | "Default";

export function normalizeBrandGlyphCategory(raw: string): BrandGlyphCategory {
  const key = raw.trim();
  if (
    key === "Recovery" ||
    key === "Wellness" ||
    key === "Performance" ||
    key === "Immunity" ||
    key === "Glow"
  ) {
    return key;
  }
  return "Default";
}

export function BrandCategoryGlyph({
  category,
  className,
  size = 28,
}: {
  category: BrandGlyphCategory | string;
  className?: string;
  size?: number;
}) {
  const normalized = normalizeBrandGlyphCategory(category);
  const markMap: Record<BrandGlyphCategory, TherapyMarkKey> = {
    Recovery: "recovery",
    Wellness: "wellness",
    Performance: "performance",
    Immunity: "immunity",
    Glow: "glow",
    IV: "iv",
    Default: "default",
  };
  const mark = markMap[normalized];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("text-accent shrink-0", className)}
      aria-hidden
    >
      <MarkGraphic mark={mark} />
    </svg>
  );
}
