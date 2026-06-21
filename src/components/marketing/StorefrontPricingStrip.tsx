import { cn } from "@/lib/utils";

export interface StorefrontPricingColumn {
  label: string;
  price: string;
  sub: string;
}

export interface StorefrontPricingStripProps {
  columns: StorefrontPricingColumn[];
  className?: string;
}

/** Three-column pricing strip (Pattern B) used on storefront pages. */
export function StorefrontPricingStrip({ columns, className }: StorefrontPricingStripProps) {
  return (
    <section className={cn("section-band-white border-y border-border", className)}>
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-5">
          {columns.map((c) => (
            <div key={c.label} className="premium-card-muted p-5 md:p-8 text-center">
              <p className="section-label mb-3">{c.label}</p>
              <p className="stat-display text-accent mb-2">{c.price}</p>
              <p className="font-jost text-xs text-muted-foreground leading-relaxed">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
