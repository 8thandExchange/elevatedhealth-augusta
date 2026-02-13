import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Pill, Plus, ChevronDown, ChevronUp, Loader2, Save, X,
  RefreshCw, AlertTriangle, Clock, Pencil, Trash2
} from "lucide-react";
import { format } from "date-fns";

interface Medication {
  id: string;
  patient_id: string;
  prescribed_by: string | null;
  medication_name: string;
  generic_name: string | null;
  dosage: string;
  route: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  status: string;
  pharmacy: string | null;
  refills_remaining: number;
  last_refill_date: string | null;
  next_refill_date: string | null;
  side_effects: string | null;
  notes: string | null;
  is_prn: boolean;
  service_line: string;
  created_at: string;
}

interface MedicationPanelProps {
  patientId: string;
  patientName: string;
}

const MedicationPanel = ({ patientId, patientName }: MedicationPanelProps) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscontinued, setShowDiscontinued] = useState(false);

  // Form state
  const [medicationName, setMedicationName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [route, setRoute] = useState("topical");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [refillsRemaining, setRefillsRemaining] = useState(0);
  const [nextRefillDate, setNextRefillDate] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrn, setIsPrn] = useState(false);
  const [selectedServiceLine, setSelectedServiceLine] = useState("hormone");

  useEffect(() => {
    if (patientId) loadMedications();
  }, [patientId]);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId)
        .order("status", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMedications((data as any[]) || []);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMedicationName(""); setGenericName(""); setDosage(""); setRoute("topical");
    setFrequency("daily"); setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(""); setPharmacy(""); setRefillsRemaining(0); setNextRefillDate("");
    setSideEffects(""); setNotes(""); setIsPrn(false); setSelectedServiceLine("hormone");
  };

  const startEditing = (med: Medication) => {
    setEditingMed(med);
    setMedicationName(med.medication_name);
    setGenericName(med.generic_name || "");
    setDosage(med.dosage);
    setRoute(med.route);
    setFrequency(med.frequency);
    setStartDate(med.start_date);
    setEndDate(med.end_date || "");
    setPharmacy(med.pharmacy || "");
    setRefillsRemaining(med.refills_remaining);
    setNextRefillDate(med.next_refill_date || "");
    setSideEffects(med.side_effects || "");
    setNotes(med.notes || "");
    setIsPrn(med.is_prn);
    setSelectedServiceLine(med.service_line || "hormone");
    setIsCreating(true);
  };

  const saveMedication = async () => {
    if (!medicationName.trim() || !dosage.trim()) {
      toast.error("Medication name and dosage are required");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const medData = {
        patient_id: patientId,
        prescribed_by: user.id,
        medication_name: medicationName,
        generic_name: genericName || null,
        dosage,
        route,
        frequency,
        start_date: startDate,
        end_date: endDate || null,
        pharmacy: pharmacy || null,
        refills_remaining: refillsRemaining,
        next_refill_date: nextRefillDate || null,
        side_effects: sideEffects || null,
        notes: notes || null,
        is_prn: isPrn,
        service_line: selectedServiceLine,
      };

      if (editingMed?.id) {
        const { error } = await supabase.from("medications").update(medData).eq("id", editingMed.id);
        if (error) throw error;
        toast.success("Medication updated");
      } else {
        const { error } = await supabase.from("medications").insert(medData);
        if (error) throw error;
        toast.success("Medication added");
      }

      setIsCreating(false);
      setEditingMed(null);
      resetForm();
      loadMedications();
    } catch (error: any) {
      toast.error(error.message || "Failed to save medication");
    } finally {
      setIsSaving(false);
    }
  };

  const updateMedStatus = async (medId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "discontinued") updates.end_date = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("medications").update(updates).eq("id", medId);
      if (error) throw error;
      toast.success(`Medication ${status}`);
      loadMedications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const recordRefill = async (medId: string) => {
    try {
      const med = medications.find(m => m.id === medId);
      if (!med) return;
      const { error } = await supabase.from("medications").update({
        last_refill_date: new Date().toISOString().split("T")[0],
        refills_remaining: Math.max(0, med.refills_remaining - 1),
      }).eq("id", medId);
      if (error) throw error;
      toast.success("Refill recorded");
      loadMedications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const activeMeds = medications.filter(m => m.status === "active");
  const inactiveMeds = medications.filter(m => m.status !== "active");

  // Creating/Editing View
  if (isCreating) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              {editingMed ? "Edit Medication" : "Add Medication"} — {patientName}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setEditingMed(null); resetForm(); }} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Medication Name *</Label>
              <Input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="e.g., Bi-Est Cream" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Generic Name</Label>
              <Input value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="e.g., Estradiol/Estriol" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dosage *</Label>
              <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 0.5mg/mL" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Route</Label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                  <SelectItem value="sublingual">Sublingual</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="intranasal">Intranasal</SelectItem>
                  <SelectItem value="iv">IV</SelectItem>
                  <SelectItem value="transdermal">Transdermal</SelectItem>
                  <SelectItem value="vaginal">Vaginal</SelectItem>
                  <SelectItem value="rectal">Rectal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As Needed (PRN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Service Line</Label>
              <Select value={selectedServiceLine} onValueChange={setSelectedServiceLine}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ketamine">Ketamine</SelectItem>
                  <SelectItem value="hormone">HRT</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Pharmacy</Label>
              <Input value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} placeholder="e.g., Empower Pharmacy" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Refills Remaining</Label>
              <Input type="number" min={0} value={refillsRemaining} onChange={(e) => setRefillsRemaining(Number(e.target.value))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Next Refill Date</Label>
              <Input type="date" value={nextRefillDate} onChange={(e) => setNextRefillDate(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPrn" checked={isPrn} onChange={(e) => setIsPrn(e.target.checked)} className="rounded border-input" />
            <Label htmlFor="isPrn" className="text-xs">PRN (as needed)</Label>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Side Effects</Label>
            <Input value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} placeholder="e.g., mild nausea" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className="text-xs resize-none" rows={2} />
          </div>

          <div className="flex justify-between pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingMed(null); resetForm(); }}>Cancel</Button>
            <Button size="sm" onClick={saveMedication} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              {editingMed ? "Update" : "Add Medication"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary" />
            Medications
            {activeMeds.length > 0 && <Badge variant="secondary" className="text-xs">{activeMeds.length} active</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => { resetForm(); setIsCreating(true); }} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Rx
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : medications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No medications recorded</p>
              <Button size="sm" variant="link" onClick={() => { resetForm(); setIsCreating(true); }} className="mt-1 text-xs">
                Add first medication
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {/* Active Medications */}
              {activeMeds.map(med => (
                <div key={med.id} className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{med.medication_name}</span>
                      {med.is_prn && <Badge variant="outline" className="text-[10px]">PRN</Badge>}
                      {med.refills_remaining === 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> No refills
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => recordRefill(med.id)} className="h-6 w-6 p-0" title="Record refill">
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEditing(med)} className="h-6 w-6 p-0">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateMedStatus(med.id, "discontinued")} className="h-6 w-6 p-0 text-destructive" title="Discontinue">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{med.dosage} — {med.route} — {med.frequency.replace(/_/g, " ")}</p>
                    {med.pharmacy && <p>Pharmacy: {med.pharmacy}</p>}
                    <div className="flex items-center gap-3">
                      <span>Started: {format(new Date(med.start_date), "MMM d, yyyy")}</span>
                      <span>Refills: {med.refills_remaining}</span>
                      {med.next_refill_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Next refill: {format(new Date(med.next_refill_date), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Discontinued toggle */}
              {inactiveMeds.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDiscontinued(!showDiscontinued)}
                    className="w-full text-xs text-muted-foreground"
                  >
                    {showDiscontinued ? "Hide" : "Show"} {inactiveMeds.length} discontinued medication{inactiveMeds.length > 1 ? "s" : ""}
                  </Button>
                  {showDiscontinued && inactiveMeds.map(med => (
                    <div key={med.id} className="p-3 rounded-lg border bg-muted/30 opacity-60">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground line-through">{med.medication_name}</span>
                          <Badge variant="outline" className="text-[10px] text-red-500 border-red-300">Discontinued</Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => updateMedStatus(med.id, "active")} className="h-6 text-xs px-2">
                          Reactivate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} — {med.route} — {format(new Date(med.start_date), "MMM d, yyyy")}
                        {med.end_date && ` to ${format(new Date(med.end_date), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default MedicationPanel;
