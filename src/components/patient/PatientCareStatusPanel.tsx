import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FlaskConical, ExternalLink, Loader2 } from "lucide-react";
import {
  patientGfeDisplayLabel,
  patientGfeIsComplete,
  pickActiveGfeClearance,
  pickPatientGfeDisplayRow,
  type GfeClearanceRow,
} from "@/lib/gfeClearance";
import { formatClinicDate } from "@/lib/clinicTime";

interface LabOrderRow {
  id: string;
  panel_slug: string;
  status: string;
  ordered_at: string;
}

const LAB_STATUS_LABEL: Record<string, string> = {
  ordered: "Order placed",
  requisition_sent: "Requisition sent",
  awaiting_draw: "Ready for your blood draw",
  sample_collected: "Sample collected",
  results_pending: "Results pending",
  results_received: "Results received",
  reviewed: "Reviewed by your care team",
  cancelled: "Cancelled",
};

const PANEL_LABEL: Record<string, string> = {
  "hormone-male": "Hormone Panel (Male)",
  "hormone-female": "Hormone Panel (Female)",
  "foundation-wellness": "Foundation Wellness Panel",
  "weight-optimization": "Weight Optimization Panel",
  "sexual-wellness": "Sexual Wellness Panel",
};

interface PatientCareStatusPanelProps {
  patientId: string;
  onboardingStatus?: string | null;
}

export function PatientCareStatusPanel({ patientId, onboardingStatus }: PatientCareStatusPanelProps) {
  const [gfeRows, setGfeRows] = useState<GfeClearanceRow[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gfeRes, labRes] = await Promise.all([
        supabase
          .from("gfe_clearances")
          .select(
            "id, patient_id, service_category, clearance_source, status, approved_at, expires_at, exam_name, provider_name, sent_at, meeting_url, created_at",
          )
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("lab_orders")
          .select("id, panel_slug, status, ordered_at")
          .eq("patient_id", patientId)
          .neq("status", "cancelled")
          .order("ordered_at", { ascending: false })
          .limit(3),
      ]);
      setGfeRows((gfeRes.data as GfeClearanceRow[]) ?? []);
      setLabOrders((labRes.data as LabOrderRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeGfe = pickActiveGfeClearance(gfeRows);
  const displayGfe = pickPatientGfeDisplayRow(gfeRows, onboardingStatus);
  const gfeComplete = patientGfeIsComplete(gfeRows, onboardingStatus);
  const gfeLabel = patientGfeDisplayLabel(gfeRows, onboardingStatus);
  const pendingRemote =
    !gfeComplete &&
    displayGfe?.status === "pending" &&
    displayGfe.clearance_source === "qualiphy" &&
    displayGfe.meeting_url;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading care status…
      </div>
    );
  }

  if (gfeRows.length === 0 && labOrders.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      {gfeRows.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Medical clearance (GFE)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge
              variant="outline"
              className={
                gfeComplete
                  ? "border-green-600/40 bg-green-500/10 text-green-800 dark:text-green-200"
                  : undefined
              }
            >
              {gfeLabel}
            </Badge>
            {activeGfe?.expires_at && (
              <p className="text-xs text-muted-foreground">
                Valid through {formatClinicDate(activeGfe.expires_at)}.
              </p>
            )}
            {!gfeComplete && displayGfe && (
              <p className="text-xs text-muted-foreground">
                Contact the clinic at (706) 760-3470 if you need a new clearance exam.
              </p>
            )}
            {pendingRemote && (
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={displayGfe!.meeting_url!} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Complete remote exam
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {labOrders.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Lab orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {labOrders.map((o) => (
              <div key={o.id} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <div className="font-medium">
                  {PANEL_LABEL[o.panel_slug] ?? o.panel_slug.replace(/-/g, " ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {LAB_STATUS_LABEL[o.status] ?? o.status} · {formatClinicDate(o.ordered_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PatientCareStatusPanel;
