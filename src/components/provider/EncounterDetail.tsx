import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { EncounterAuditLogEntry, PatientEncounter } from "@/data/encounters/types";
import { ENCOUNTER_TYPE_LABELS } from "@/data/encounters/types";
import { EncounterForm } from "@/components/provider/EncounterForm";
import { createAmendment } from "@/lib/encounters/encounter-helpers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EncounterDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encounter: PatientEncounter | null;
  patientId: string;
  isAdmin: boolean;
  onAfterAmendment?: (newEncounter: PatientEncounter) => void;
}

export function EncounterDetail({
  open,
  onOpenChange,
  encounter,
  patientId,
  isAdmin,
  onAfterAmendment,
}: EncounterDetailProps) {
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditRows, setAuditRows] = useState<EncounterAuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadAudit = async (encounterId: string) => {
    setAuditLoading(true);
    try {
      const { data, error } = await supabase
        .from("encounter_audit_log")
        .select("*")
        .eq("encounter_id", encounterId)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      setAuditRows((data ?? []) as EncounterAuditLogEntry[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load audit log");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAmend = async () => {
    if (!encounter?.id) return;
    try {
      const next = await createAmendment(encounter.id);
      onAfterAmendment?.(next);
      onOpenChange(false);
      toast.success("Amendment draft created — continue editing below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create amendment");
    }
  };

  if (!encounter) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">
              {ENCOUNTER_TYPE_LABELS[encounter.encounter_type as keyof typeof ENCOUNTER_TYPE_LABELS] ?? encounter.encounter_type}{" "}
              <Badge variant="outline" className="ml-2 align-middle">
                {encounter.status}
              </Badge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {format(new Date(encounter.encounter_date), "MMM d, yyyy h:mm a")}
            </p>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[70vh] pr-3">
            <EncounterForm patientId={patientId} encounterId={encounter.id} mode="view" />
          </ScrollArea>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            {encounter.status === "signed" && (
              <Button type="button" onClick={() => void handleAmend()}>
                Create Amendment
              </Button>
            )}
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAuditOpen(true);
                  void loadAudit(encounter.id);
                }}
              >
                View Audit Log
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-playfair">Audit log</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {auditLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <ul className="text-sm space-y-2">
                {auditRows.map((r) => (
                  <li key={r.id} className="border-b border-border/40 pb-2">
                    <span className="font-medium">{r.action}</span>{" "}
                    <span className="text-muted-foreground">
                      {format(new Date(r.occurred_at), "MMM d, yyyy HH:mm:ss")}
                    </span>
                    <div className="text-xs text-muted-foreground truncate">User: {r.user_id}</div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
