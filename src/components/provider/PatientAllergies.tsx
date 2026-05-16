import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AllergySeverity, PatientAllergy } from "@/data/encounters/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

function severityVariant(s: AllergySeverity | null): "default" | "secondary" | "destructive" | "outline" {
  if (s === "severe") return "destructive";
  if (s === "moderate") return "default";
  return "secondary";
}

interface PatientAllergiesProps {
  patientId: string;
}

export function PatientAllergies({ patientId }: PatientAllergiesProps) {
  const [rows, setRows] = useState<PatientAllergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [allergen, setAllergen] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState<AllergySeverity>("unknown");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("patient_allergies")
      .select("*")
      .eq("patient_id", patientId)
      .eq("active", true)
      .order("noted_at", { ascending: false });
    if (error) console.error(error);
    else setRows((data ?? []) as PatientAllergy[]);
  };

  useEffect(() => {
    let c = false;
    void (async () => {
      setLoading(true);
      await load();
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [patientId]);

  const add = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !allergen.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("patient_allergies").insert({
        patient_id: patientId,
        allergen: allergen.trim(),
        reaction: reaction.trim() || null,
        severity,
        noted_by_user_id: user.id,
      });
      if (error) throw error;
      toast.success("Allergy added");
      setOpen(false);
      setAllergen("");
      setReaction("");
      setSeverity("unknown");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    const { error } = await supabase.from("patient_allergies").update({ active: false }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked inactive");
      await load();
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Allergies</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="text-sm space-y-2 min-h-[4rem]">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-xs">No active allergies recorded.</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-1">
                <span>
                  <span className="font-medium">{r.allergen}</span>
                  {r.reaction && <span className="text-muted-foreground"> — {r.reaction}</span>}{" "}
                  {r.severity && (
                    <Badge variant={severityVariant(r.severity)} className="ml-1 text-[10px] px-1 py-0">
                      {r.severity}
                    </Badge>
                  )}
                </span>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => void deactivate(r.id)}>
                  Inactive
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-playfair">Add allergy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Allergen</Label>
              <Input value={allergen} onChange={(e) => setAllergen(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Reaction</Label>
              <Input value={reaction} onChange={(e) => setReaction(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as AllergySeverity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["mild", "moderate", "severe", "unknown"] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !allergen.trim()} onClick={() => void add()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
