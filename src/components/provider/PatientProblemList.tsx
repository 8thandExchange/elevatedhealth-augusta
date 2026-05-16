import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PatientProblem } from "@/data/encounters/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface PatientProblemListProps {
  patientId: string;
}

export function PatientProblemList({ patientId }: PatientProblemListProps) {
  const [rows, setRows] = useState<PatientProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [problem, setProblem] = useState("");
  const [icd10, setIcd10] = useState("");
  const [onset, setOnset] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("patient_problem_list")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "active")
      .order("noted_at", { ascending: false });
    if (error) console.error(error);
    else setRows((data ?? []) as PatientProblem[]);
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
    if (!user || !problem.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("patient_problem_list").insert({
        patient_id: patientId,
        problem: problem.trim(),
        icd10_code: icd10.trim() || null,
        onset_date: onset.trim() || null,
        noted_by_user_id: user.id,
      });
      if (error) throw error;
      toast.success("Problem added");
      setOpen(false);
      setProblem("");
      setIcd10("");
      setOnset("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resolve = async (id: string) => {
    const { error } = await supabase
      .from("patient_problem_list")
      .update({ status: "resolved", resolved_date: new Date().toISOString().slice(0, 10) })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked resolved");
      await load();
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Problem list</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="text-sm min-h-[4rem]">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active problems.</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-1 text-xs">
                <span>
                  <span className="font-medium text-foreground">{r.problem}</span>
                  {r.icd10_code && <span className="text-muted-foreground"> ({r.icd10_code})</span>}
                </span>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => void resolve(r.id)}>
                  Resolved
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-playfair">Add problem</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Problem</Label>
              <Input value={problem} onChange={(e) => setProblem(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>ICD-10 (optional)</Label>
              <Input value={icd10} onChange={(e) => setIcd10(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Onset date (optional)</Label>
              <Input type="date" value={onset} onChange={(e) => setOnset(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !problem.trim()} onClick={() => void add()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
