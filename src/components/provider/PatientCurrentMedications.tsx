import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PatientCurrentMedication } from "@/data/encounters/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

interface PatientCurrentMedicationsProps {
  patientId: string;
}

export function PatientCurrentMedications({ patientId }: PatientCurrentMedicationsProps) {
  const [rows, setRows] = useState<PatientCurrentMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [route, setRoute] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [eha, setEha] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("patient_current_medications")
      .select("*")
      .eq("patient_id", patientId)
      .eq("active", true)
      .order("added_at", { ascending: false });
    if (error) console.error(error);
    else setRows((data ?? []) as PatientCurrentMedication[]);
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [patientId]);

  const add = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("patient_current_medications").insert({
        patient_id: patientId,
        medication_name: name.trim(),
        dose: dose.trim() || null,
        frequency: frequency.trim() || null,
        route: route.trim() || null,
        prescribed_by: prescribedBy.trim() || null,
        is_eha_prescribed: eha,
        added_by_user_id: user.id,
      });
      if (error) throw error;
      toast.success("Medication added");
      setOpen(false);
      setName("");
      setDose("");
      setFrequency("");
      setRoute("");
      setPrescribedBy("");
      setEha(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    const { error } = await supabase.from("patient_current_medications").update({ active: false }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked inactive");
      await load();
    }
  };

  const ehaRows = rows.filter((r) => r.is_eha_prescribed);
  const otherRows = rows.filter((r) => !r.is_eha_prescribed);

  const block = (title: string, list: PatientCurrentMedication[]) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground">None listed.</p>
      ) : (
        <ul className="space-y-1">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-1 text-xs">
              <span>
                <span className="font-medium text-foreground">{r.medication_name}</span>
                {r.dose && <span className="text-muted-foreground"> {r.dose}</span>}
                {r.frequency && <span className="text-muted-foreground"> · {r.frequency}</span>}
              </span>
              <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => void deactivate(r.id)}>
                Inactive
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Current medications</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="text-sm space-y-3 min-h-[4rem]">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            {block("Prescribed by EHA", ehaRows)}
            {block("Other", otherRows)}
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-playfair">Add medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Dose</Label>
                <Input value={dose} onChange={(e) => setDose(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Route</Label>
              <Input value={route} onChange={(e) => setRoute(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Prescribed by</Label>
              <Input value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="eha-med" checked={eha} onCheckedChange={(v) => setEha(v === true)} />
              <Label htmlFor="eha-med" className="text-sm font-normal cursor-pointer">
                EHA-prescribed
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !name.trim()} onClick={() => void add()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
