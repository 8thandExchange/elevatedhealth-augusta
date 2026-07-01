import { cn } from "@/lib/utils";

export interface ProcessTimelineStep {
  step: string;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: ProcessTimelineStep[];
  className?: string;
}

export function ProcessTimeline({ steps, className }: ProcessTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((item, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={item.step} className="relative flex gap-5 md:gap-8 pb-10 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[1.125rem] top-10 bottom-0 w-px bg-eha-line md:left-[1.375rem]"
                aria-hidden
              />
            )}
            <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full bg-eha-navy text-white">
              <span className="font-playfair text-sm md:text-base italic">{item.step}</span>
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="font-playfair text-lg md:text-xl text-eha-ink mb-2">{item.title}</h3>
              <p className="font-jost text-sm text-eha-slate leading-relaxed">{item.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
