import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TreatmentGoalPath } from "@/lib/treatmentArchitecture";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GoalPathCardProps {
  path: TreatmentGoalPath;
  therapyLabels?: string[];
  className?: string;
}

export function GoalPathCard({ path, therapyLabels = [], className }: GoalPathCardProps) {
  return (
    <article className={cn("eha-card flex flex-col h-full p-6", className)}>
      <p className="eha-section-label mb-2 text-[10px]">Your goal</p>
      <h3 className="font-playfair text-xl text-eha-ink mb-2">{path.goal}</h3>
      <p className="font-jost text-sm text-eha-slate leading-relaxed flex-1 mb-4">{path.summary}</p>
      {therapyLabels.length > 0 && (
        <p className="font-jost text-xs text-eha-slate mb-3">
          <span className="font-medium text-eha-ink">May include: </span>
          {therapyLabels.join(" · ")}
        </p>
      )}
      <p className="font-jost text-xs text-eha-slate/90 mb-4 italic">{path.providerNote}</p>
      <Button
        asChild
        variant="outline"
        className="font-jost w-fit mt-auto border-eha-line hover:bg-eha-sky/40"
      >
        <Link to={path.href}>
          {path.cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </article>
  );
}
