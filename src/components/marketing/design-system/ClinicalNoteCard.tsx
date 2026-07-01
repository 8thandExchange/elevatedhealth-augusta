import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface ClinicalNoteCardProps {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning" | "success";
  className?: string;
}

const variantStyles = {
  default: "border-eha-line bg-eha-ice/60",
  warning: "border-eha-warning/30 bg-eha-warning/5",
  success: "border-eha-success/30 bg-eha-success/5",
} as const;

export function ClinicalNoteCard({
  title,
  children,
  variant = "default",
  className,
}: ClinicalNoteCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 md:p-6",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex gap-3">
        <Info className="h-4 w-4 shrink-0 text-eha-clinical mt-0.5" aria-hidden />
        <div className="space-y-2 min-w-0">
          {title && <h4 className="font-playfair text-base text-eha-ink">{title}</h4>}
          <div className="font-jost text-sm text-eha-slate leading-relaxed [&_a]:text-eha-clinical [&_a]:underline-offset-4 [&_a]:hover:underline">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
