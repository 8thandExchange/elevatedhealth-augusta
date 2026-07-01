import { cn } from "@/lib/utils";

interface PriceBadgeProps {
  price: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl md:text-4xl",
} as const;

export function PriceBadge({ price, label, size = "md", className }: PriceBadgeProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {label && (
        <p className="font-jost text-[10px] uppercase tracking-[0.14em] text-eha-slate">{label}</p>
      )}
      <p className={cn("font-playfair text-eha-ink", sizeClasses[size])}>{price}</p>
    </div>
  );
}
