import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface StorefrontSectionHeaderProps {
  label?: string;
  title: ReactNode;
  lead?: string;
  centered?: boolean;
  className?: string;
}

export function StorefrontSectionHeader({
  label,
  title,
  lead,
  centered = true,
  className,
}: StorefrontSectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "mb-14 max-w-3xl", centered && "mx-auto", className)}>
      {label ? <p className="section-label mb-4">{label}</p> : null}
      <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground leading-snug">{title}</h2>
      {lead ? (
        <p className="font-jost font-light text-base text-muted-foreground mt-4 leading-relaxed">{lead}</p>
      ) : null}
    </div>
  );
}
