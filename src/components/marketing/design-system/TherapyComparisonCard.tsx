import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { PriceBadge } from "./PriceBadge";
import { ProviderGatedBadge } from "./ProviderGatedBadge";

interface TherapyComparisonCardProps {
  name: string;
  description: string;
  programPrice: string;
  badge?: string;
  fillPrice?: string | null;
  providerGated?: boolean;
  footnote?: ReactNode;
  highlighted?: boolean;
  className?: string;
}

export function TherapyComparisonCard({
  name,
  description,
  programPrice,
  badge,
  fillPrice,
  providerGated = false,
  footnote,
  highlighted = false,
  className,
}: TherapyComparisonCardProps) {
  return (
    <article
      className={cn(
        "eha-card flex flex-col h-full p-6 space-y-3",
        highlighted && "ring-2 ring-eha-clinical/30 border-eha-clinical/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {badge && (
          <p className="font-jost text-[10px] uppercase tracking-[0.14em] text-eha-clinical">{badge}</p>
        )}
        {providerGated && <ProviderGatedBadge />}
      </div>
      <h3 className="font-playfair text-xl text-eha-ink">{name}</h3>
      <p className="font-jost text-sm text-eha-slate leading-relaxed flex-1">{description}</p>
      <PriceBadge price={programPrice} label="ELEVATED GLP-1 program" size="sm" />
      {fillPrice ? (
        <p className="font-jost text-xs text-eha-slate">À la carte fill when not on program: {fillPrice}</p>
      ) : footnote ? (
        <p className="font-jost text-xs text-eha-slate">{footnote}</p>
      ) : providerGated ? (
        <p className="font-jost text-xs text-eha-slate">
          Available only when your physician selects it within the GLP-1 program — not self-serve online.
        </p>
      ) : null}
    </article>
  );
}
