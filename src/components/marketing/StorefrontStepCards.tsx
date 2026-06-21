import { cn } from "@/lib/utils";

export interface StorefrontStep {
  n: string;
  title: string;
  body: string;
}

export interface StorefrontStepCardsProps {
  steps: StorefrontStep[];
  className?: string;
  columns?: "2" | "4";
}

/** Numbered how-it-works cards — shared across storefront pages. */
export function StorefrontStepCards({ steps, className, columns = "4" }: StorefrontStepCardsProps) {
  const gridClass =
    columns === "2"
      ? "grid sm:grid-cols-2 gap-5"
      : "grid sm:grid-cols-2 lg:grid-cols-4 gap-5";

  return (
    <div className={cn(gridClass, className)}>
      {steps.map((s) => (
        <div key={s.n} className="premium-card p-5 md:p-8 h-full">
          <p className="step-number mb-4 md:mb-5">{s.n}</p>
          <h3 className="font-playfair text-xl text-foreground mb-3 leading-snug">{s.title}</h3>
          <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
