import { cn } from "@/lib/utils";

/** Serif monogram marks for IV drips — intentionally not Lucide-style line icons. */
export function resolveTherapyMonogram(therapyName: string, category: string): string {
  const name = therapyName.trim().toLowerCase();

  if (name.includes("resurrection")) return "R";
  if (name.includes("meyer")) return "M";
  if (name.includes("beast")) return "B";
  if (name.includes("shield")) return "S";
  if (name.includes("glow") || name.includes("beauty")) return "G";
  if (name.includes("nad")) return "N";
  if (name.includes("immunity") || name.includes("immune")) return "I";

  switch (category.trim()) {
    case "Recovery":
      return "R";
    case "Wellness":
      return "W";
    case "Performance":
      return "P";
    case "Immunity":
      return "I";
    case "Glow":
      return "G";
    default:
      return "E";
  }
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
  size = 56,
}: BrandTherapyMarkProps) {
  const letter = resolveTherapyMonogram(therapyName, category);
  const fontSize = Math.round(size * 0.46);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-primary/30 bg-primary text-primary-foreground shadow-inner",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-playfair italic font-medium leading-none select-none"
        style={{ fontSize }}
      >
        {letter}
      </span>
    </div>
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
  const letter =
    normalized === "IV"
      ? "IV"
      : normalized === "Default"
        ? "E"
        : normalized.charAt(0);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-playfair italic font-medium text-accent",
        className
      )}
      style={{ fontSize: Math.round(size * 0.55), lineHeight: 1 }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
