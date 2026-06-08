import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { markLabsReviewedForPatient } from "@/lib/labsWorkflow";
import { TestTube, CheckCircle, Loader2, User, Eye, Clock, Upload, AlertTriangle } from "lucide-react";

interface PendingResult {
  id: string;
  patient_id: string;
  collection_date: string;
  lab_source: string | null;
  parsed_from_pdf: boolean | null;
  created_at: string;
  correlation_alert: string | null;
  patient_name: string;
  patient_email: string | null;
  onboarding_status: string | null;
}

interface LabResultsQueueProps {
  onSelectPatient?: (patientId: string) => void;
}

const LabResultsQueue = ({ onSelectPatient }: LabResultsQueueProps) => {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [showBatchUpload, setShowBatchUpload] = useState(false);

  const loadPendingResults = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get patients with results_ready or labs_in_progress status
      const { data: patients, error: pError } = await supabase
        .from("patients")
        .select("id, full_name, email, onboarding_status")
        .in("onboarding_status", ["results_ready", "labs_in_progress"])
        .order("updated_at", { ascending: false })
        .limit(50);

      if (pError) throw pError;
      if (!patients || patients.length === 0) {
        setPendingResults([]);
        return;
      }

      // Get latest lab result for each patient
      const patientIds = patients.map(p => p.id);
      const { data: labs, error: lError } = await supabase
        .from("lab_results")
        .select("id, patient_id, collection_date, lab_source, parsed_from_pdf, created_at, correlation_alert")
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false });

      if (lError) throw lError;

      // Dedupe to latest per patient
      const latestByPatient = new Map<string, typeof labs[0]>();
      labs?.forEach(lab => {
        if (!latestByPatient.has(lab.patient_id)) {
          latestByPatient.set(lab.patient_id, lab);
        }
      });

      const results: PendingResult[] = patients.map(p => {
        const lab = latestByPatient.get(p.id);
        return {
          id: lab?.id || p.id,
          patient_id: p.id,
          collection_date: lab?.collection_date || "N/A",
          lab_source: lab?.lab_source || null,
          parsed_from_pdf: lab?.parsed_from_pdf || false,
          created_at: lab?.created_at || new Date().toISOString(),
          correlation_alert: lab?.correlation_alert || null,
          patient_name: p.full_name,
          patient_email: p.email,
          onboarding_status: p.onboarding_status,
        };
      });

      setPendingResults(results);
    } catch (err) {
      console.error("Error loading pending results:", err);
      toast.error("Failed to load pending lab results");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingResults();
  }, [loadPendingResults]);

  const handleMarkReviewed = async (result: PendingResult) => {
    setMarkingId(result.patient_id);
    try {
      const { error } = await markLabsReviewedForPatient(result.patient_id);
      if (error) throw new Error(error);

      // Send notification
      if (result.patient_email) {
        try {
          await supabase.functions.invoke("send-labs-reviewed-notification", {
            body: {
              patient_id: result.patient_id,
              patient_name: result.patient_name,
              patient_email: result.patient_email,
            },
          });
        } catch (e) {
          console.log("Notification not critical:", e);
        }
      }

      toast.success(`Labs marked reviewed for ${result.patient_name}`);
      setPendingResults(prev => prev.filter(r => r.patient_id !== result.patient_id));
    } catch (err: any) {
      toast.error(err.message || "Failed to mark reviewed");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-cormorant">
            <TestTube className="w-5 h-5 text-primary" />
            Lab Results Queue
            {pendingResults.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingResults.length}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowBatchUpload(!showBatchUpload)}>
              <Upload className="w-4 h-4 mr-1" />
              Batch Upload
            </Button>
            <Button size="sm" variant="ghost" onClick={loadPendingResults} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showBatchUpload && (
          <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
            <p className="text-sm font-medium">Lab PDF upload retired</p>
            <p className="text-xs text-muted-foreground">
              Enter LabCorp results from the patient chart using &quot;Add lab result&quot; — ZRT saliva parsing is no longer offered.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TestTube className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No pending lab reviews</p>
            <p className="text-xs mt-1">All results have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pendingResults.map((result) => (
              <div
                key={result.patient_id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{result.patient_name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {result.lab_source === "labcorp" ? "LabCorp" : result.lab_source === "zrt" ? "ZRT" : "Unknown"}
                      </Badge>
                      {result.parsed_from_pdf && (
                        <Badge variant="secondary" className="text-xs">AI Parsed</Badge>
                      )}
                      {result.correlation_alert && (
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.collection_date !== "N/A"
                          ? new Date(result.collection_date).toLocaleDateString()
                          : "No results yet"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onSelectPatient && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectPatient(result.patient_id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleMarkReviewed(result)}
                    disabled={markingId === result.patient_id}
                  >
                    {markingId === result.patient_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabResultsQueue;
