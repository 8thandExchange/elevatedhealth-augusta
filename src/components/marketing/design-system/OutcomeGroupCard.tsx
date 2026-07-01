import { cn } from "@/lib/utils";

interface OutcomeGroupCardProps {
  title: string;
  therapyLabels: string[];
  summary: string;
  className?: string;
}

export function OutcomeGroupCard({ title, therapyLabels, summary, className }: OutcomeGroupCardProps) {
  return (
    <article className={cn("eha-card flex flex-col h-full p-6 space-y-3", className)}>
      <h3 className="font-playfair text-lg text-eha-ink">{title}</h3>
      {therapyLabels.length > 0 && (
        <p className="font-jost text-xs text-eha-clinical">{therapyLabels.join(" · ")}</p>
      )}
      <p className="font-jost text-sm text-eha-slate leading-relaxed flex-1">{summary}</p>
      <p className="font-jost text-xs text-eha-slate italic">
        Provider-reviewed · physician-guided · your provider determines fit
      </p>
    </article>
  );
}
