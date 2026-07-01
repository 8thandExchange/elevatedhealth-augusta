import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PriceBadge } from "./PriceBadge";

interface TreatmentCardProps {
  title: string;
  description: string;
  href: string;
  cta?: string;
  price?: string;
  priceLabel?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  subLinks?: { label: string; href: string }[];
  className?: string;
}

export function TreatmentCard({
  title,
  description,
  href,
  cta = "Learn more",
  price,
  priceLabel,
  badge,
  footer,
  subLinks,
  className,
}: TreatmentCardProps) {
  return (
    <article className={cn("eha-card flex flex-col h-full p-6 md:p-8", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-playfair text-xl md:text-2xl text-eha-ink">{title}</h2>
        {badge}
      </div>
      <p className="font-jost text-sm text-eha-slate leading-relaxed flex-1 mb-5">{description}</p>
      {price && (
        <div className="mb-4">
          <PriceBadge price={price} label={priceLabel} size="sm" />
        </div>
      )}
      {subLinks && subLinks.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 text-xs font-jost">
          {subLinks.map((sub) => (
            <Link key={sub.href} to={sub.href} className="text-eha-clinical hover:underline">
              {sub.label}
            </Link>
          ))}
        </div>
      )}
      {footer}
      <Button
        asChild
        variant="outline"
        className="font-jost w-fit mt-auto border-eha-line text-eha-ink hover:bg-eha-sky/40 hover:border-eha-clinical/40"
      >
        <Link to={href}>
          {cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </article>
  );
}
