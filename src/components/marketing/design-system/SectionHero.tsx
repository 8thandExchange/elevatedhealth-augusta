import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeroProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  variant?: "ice" | "sky" | "navy" | "gradient";
  align?: "center" | "left";
  className?: string;
  compact?: boolean;
}

export function SectionHero({
  eyebrow,
  title,
  lead,
  children,
  variant = "ice",
  align = "center",
  className,
  compact = false,
}: SectionHeroProps) {
  const isNavy = variant === "navy";
  const isCenter = align === "center";

  const bgClass =
    variant === "navy"
      ? "eha-section-navy"
      : variant === "sky"
        ? "eha-section-sky"
        : variant === "gradient"
          ? "bg-gradient-to-b from-eha-sky/40 to-eha-ice"
          : "eha-section-ice";

  return (
    <section
      className={cn(
        bgClass,
        compact ? "py-12 lg:py-16" : "py-16 lg:py-24",
        "border-b border-eha-line/60",
        className,
      )}
    >
      <div
        className={cn(
          "container mx-auto px-6 lg:px-8 max-w-4xl",
          isCenter && "text-center",
        )}
      >
        {eyebrow && (
          <p className={cn("eha-section-label mb-4", isNavy && "text-eha-sky/80")}>
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-playfair text-4xl md:text-5xl lg:text-6xl leading-tight mb-6",
            isNavy ? "text-white" : "text-eha-ink",
          )}
        >
          {title}
        </h1>
        {lead && (
          <p
            className={cn(
              "font-jost text-lg md:text-xl leading-relaxed max-w-2xl mb-8",
              isCenter && "mx-auto",
              isNavy ? "text-white/80" : "text-eha-slate",
            )}
          >
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
