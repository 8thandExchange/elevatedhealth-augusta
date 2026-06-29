import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONSULT_JOURNEY_STAGES, getConsultJourneyStageIndex, type ConsultJourneyContext } from "@/lib/consultJourney";
import { patientGfeIsComplete, type GfeClearanceRow } from "@/lib/gfeClearance";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface ConsultJourneyProgressProps {
  context: ConsultJourneyContext;
  patientId?: string;
  className?: string;
  compact?: boolean;
}

/** Pre-visit funnel stepper shown on patient dashboard. */
export function ConsultJourneyProgress({ context, patientId, className, compact }: ConsultJourneyProgressProps) {
  const [gfeRows, setGfeRows] = useState<GfeClearanceRow[]>([]);
  const [loadingGfe, setLoadingGfe] = useState(!!patientId);

  const loadGfe = useCallback(async () => {
    if (!patientId) return;
    setLoadingGfe(true);
    try {
      const { data } = await supabase
        .from("gfe_clearances")
        .select("id, patient_id, service_category, clearance_source, status, approved_at, expires_at, exam_name, provider_name, sent_at, meeting_url, created_at")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(5);
      setGfeRows((data as GfeClearanceRow[]) ?? []);
    } finally {
      setLoadingGfe(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadGfe();
  }, [loadGfe]);

  const mergedContext: ConsultJourneyContext = {
    ...context,
    gfeRows: context.gfeRows ?? gfeRows,
  };
  const currentIdx = getConsultJourneyStageIndex(mergedContext);
  const visibleStages = CONSULT_JOURNEY_STAGES.filter((s) =>
    ["screening", "consents", "payment", "gfe", "schedule", "visit", "baseline_labs", "results_review", "program_consents", "enroll"].includes(s.id),
  );

  return (
    <div className={cn("mb-8", className)}>
      {loadingGfe && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Updating progress…
        </div>
      )}
      {!compact && patientGfeIsComplete(mergedContext.gfeRows ?? [], mergedContext.onboardingStatus) && (
        <p className="text-xs text-green-700 dark:text-green-300 mb-3">Good Faith Exam cleared — you can schedule your visit.</p>
      )}
      {!compact && (
        <h2 className="font-jost text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
          Your enrollment progress
        </h2>
      )}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStages.map((stage) => {
          const stageIdx = CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === stage.id);
          const done = currentIdx > stageIdx;
          const active = currentIdx === stageIdx || (stage.id === "gfe" && currentIdx === 4 && !done);

          return (
            <li
              key={stage.id}
              className={cn(
                "flex flex-1 items-start gap-2 rounded-lg border px-3 py-2 text-left",
                active && "border-accent/50 bg-accent/5",
                done && "border-green-600/30 bg-green-500/5",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  done && "bg-green-600 text-white",
                  active && !done && "bg-accent text-accent-foreground",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : visibleStages.indexOf(stage) + 1}
              </div>
              <div>
                <div className="text-sm font-medium leading-tight">{stage.label}</div>
                {!compact && (
                  <div className="text-xs text-muted-foreground mt-0.5">{stage.patientDescription}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ConsultJourneyProgress;
