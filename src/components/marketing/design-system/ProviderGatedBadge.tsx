import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface ProviderGatedBadgeProps {
  className?: string;
  label?: string;
}

export function ProviderGatedBadge({
  className,
  label = "Physician-selected",
}: ProviderGatedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-eha-warning/30 bg-eha-warning/10 px-2.5 py-1",
        "font-jost text-[10px] font-medium uppercase tracking-[0.12em] text-eha-warning",
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
