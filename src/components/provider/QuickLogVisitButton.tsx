import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Syringe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickLogVisitButtonProps {
  patientId: string;
  patientName?: string;
  membershipTier?: string | null;
  onLogged?: () => void;
}

const SERVICES = [
  "Testosterone Cypionate Injection",
  "Estradiol Injection",
  "BPC-157 Injection",
  "CJC-1295 / Ipamorelin Injection",
  "GHK-Cu Injection",
  "Tesamorelin Injection",
  "B12 / Lipotropic Injection",
  "Lab Draw",
  "Other",
];

export const QuickLogVisitButton = ({ patientId, patientName, membershipTier, onLogged }: QuickLogVisitButtonProps) => {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState(SERVICES[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("membership_visit_log").insert({
      patient_id: patientId,
      service,
      notes: notes || null,
      administered_by: userData.user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not log visit: " + error.message);
      return;
    }
    toast.success("Visit logged. No charge — covered by membership.");
    setOpen(false);
    setNotes("");
    onLogged?.();
  };

  const isMember = !!membershipTier && membershipTier !== "inactive";

  return (
    <>
      <Button
        size="sm"
        variant={isMember ? "default" : "outline"}
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Syringe className="h-4 w-4" />
        Log Visit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Membership Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {patientName && (
              <p className="text-sm text-muted-foreground">
                Patient: <strong>{patientName}</strong>
                {isMember && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                    {membershipTier} member — no charge
                  </span>
                )}
              </p>
            )}
            <div>
              <Label>Service</Label>
              <select
                className="w-full mt-1 border border-input rounded-md px-3 py-2 bg-background"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Site, dose, observations..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickLogVisitButton;
