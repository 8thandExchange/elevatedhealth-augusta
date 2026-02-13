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
  Target, Plus, ChevronDown, ChevronUp, Loader2, Save, X, Check,
  Calendar, TrendingUp, AlertCircle, Pencil, Trash2
} from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  description: string;
  target_date?: string;
  status: "active" | "achieved" | "modified" | "discontinued";
  progress_pct: number;
  notes?: string;
}

interface Intervention {
  id: string;
  type: string;
  description: string;
  frequency?: string;
  status: "active" | "completed" | "discontinued";
}

interface ProgressNote {
  date: string;
  note: string;
  author: string;
}

interface TreatmentPlan {
  id: string;
  patient_id: string;
  provider_id: string;
  title: string;
  service_line: string;
  status: string;
  start_date: string;
  target_end_date: string | null;
  goals: Goal[];
  interventions: Intervention[];
  progress_notes: ProgressNote[];
  review_frequency: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TreatmentPlanPanelProps {
  patientId: string;
  patientName: string;
  serviceLine?: string;
}

const TreatmentPlanPanel = ({ patientId, patientName, serviceLine = "hormone" }: TreatmentPlanPanelProps) => {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedServiceLine, setSelectedServiceLine] = useState(serviceLine);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetEndDate, setTargetEndDate] = useState("");
  const [reviewFrequency, setReviewFrequency] = useState("monthly");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [newProgressNote, setNewProgressNote] = useState("");

  useEffect(() => {
    if (patientId) loadPlans();
  }, [patientId]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("treatment_plans")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans((data as any[]) || []);
    } catch (error) {
      console.error("Error loading treatment plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedServiceLine(serviceLine);
    setStartDate(new Date().toISOString().split("T")[0]);
    setTargetEndDate("");
    setReviewFrequency("monthly");
    setGoals([]);
    setInterventions([]);
    setNewProgressNote("");
  };

  const startEditing = (plan: TreatmentPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setSelectedServiceLine(plan.service_line);
    setStartDate(plan.start_date);
    setTargetEndDate(plan.target_end_date || "");
    setReviewFrequency(plan.review_frequency || "monthly");
    setGoals(plan.goals || []);
    setInterventions(plan.interventions || []);
    setNewProgressNote("");
    setIsCreating(true);
  };

  const addGoal = () => {
    setGoals([...goals, {
      id: crypto.randomUUID(),
      description: "",
      status: "active",
      progress_pct: 0,
    }]);
  };

  const updateGoal = (idx: number, updates: Partial<Goal>) => {
    setGoals(goals.map((g, i) => i === idx ? { ...g, ...updates } : g));
  };

  const removeGoal = (idx: number) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const addIntervention = () => {
    setInterventions([...interventions, {
      id: crypto.randomUUID(),
      type: "medication",
      description: "",
      frequency: "",
      status: "active",
    }]);
  };

  const updateIntervention = (idx: number, updates: Partial<Intervention>) => {
    setInterventions(interventions.map((i, index) => index === idx ? { ...i, ...updates } : i));
  };

  const removeIntervention = (idx: number) => {
    setInterventions(interventions.filter((_, i) => i !== idx));
  };

  const savePlan = async () => {
    if (!title.trim()) {
      toast.error("Please enter a plan title");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const progressNotes = editingPlan?.progress_notes || [];
      if (newProgressNote.trim()) {
        progressNotes.push({
          date: new Date().toISOString(),
          note: newProgressNote.trim(),
          author: user.id,
        });
      }

      const planData = {
        patient_id: patientId,
        provider_id: user.id,
        title,
        service_line: selectedServiceLine,
        start_date: startDate,
        target_end_date: targetEndDate || null,
        review_frequency: reviewFrequency,
        goals: goals as unknown as Record<string, any>[],
        interventions: interventions as unknown as Record<string, any>[],
        progress_notes: progressNotes as unknown as Record<string, any>[],
        last_reviewed_at: new Date().toISOString(),
      };

      if (editingPlan?.id) {
        const { error } = await supabase
          .from("treatment_plans")
          .update(planData)
          .eq("id", editingPlan.id);
        if (error) throw error;
        toast.success("Treatment plan updated");
      } else {
        const { error } = await supabase
          .from("treatment_plans")
          .insert(planData);
        if (error) throw error;
        toast.success("Treatment plan created");
      }

      setIsCreating(false);
      setEditingPlan(null);
      resetForm();
      loadPlans();
    } catch (error: any) {
      toast.error(error.message || "Failed to save treatment plan");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlanStatus = async (planId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("treatment_plans")
        .update({ status })
        .eq("id", planId);
      if (error) throw error;
      toast.success(`Plan marked as ${status}`);
      loadPlans();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-300";
      case "achieved": return "bg-blue-100 text-blue-700 border-blue-300";
      case "on_hold": return "bg-amber-100 text-amber-700 border-amber-300";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-300";
      case "discontinued": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Creating/Editing View
  if (isCreating) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {editingPlan ? "Edit Treatment Plan" : "New Treatment Plan"} — {patientName}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setEditingPlan(null); resetForm(); }} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Plan Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., HRT Optimization Protocol" className="h-8 text-sm" />
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
              <Label className="text-xs text-muted-foreground">Review Frequency</Label>
              <Select value={reviewFrequency} onValueChange={setReviewFrequency}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Target End Date</Label>
              <Input type="date" value={targetEndDate} onChange={(e) => setTargetEndDate(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Treatment Goals</Label>
              <Button size="sm" variant="outline" onClick={addGoal} className="h-6 text-xs px-2">
                <Plus className="w-3 h-3 mr-1" /> Goal
              </Button>
            </div>
            <div className="space-y-2">
              {goals.map((goal, idx) => (
                <div key={goal.id} className="p-2 border rounded-lg bg-background space-y-2">
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={goal.description}
                      onChange={(e) => updateGoal(idx, { description: e.target.value })}
                      placeholder="Describe the treatment goal..."
                      className="text-xs resize-none min-h-[40px] flex-1"
                      rows={2}
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeGoal(idx)} className="h-6 w-6 p-0 text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={goal.status} onValueChange={(v) => updateGoal(idx, { status: v as Goal["status"] })}>
                      <SelectTrigger className="h-6 text-xs w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="achieved">Achieved</SelectItem>
                        <SelectItem value="modified">Modified</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 flex-1">
                      <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Progress</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={goal.progress_pct}
                        onChange={(e) => updateGoal(idx, { progress_pct: Number(e.target.value) })}
                        className="h-6 text-xs w-16"
                      />
                      <span className="text-[10px] text-muted-foreground">%</span>
                    </div>
                    <Input
                      type="date"
                      value={goal.target_date || ""}
                      onChange={(e) => updateGoal(idx, { target_date: e.target.value })}
                      className="h-6 text-xs w-32"
                      title="Target date"
                    />
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3 italic">No goals added yet</p>
              )}
            </div>
          </div>

          {/* Interventions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interventions</Label>
              <Button size="sm" variant="outline" onClick={addIntervention} className="h-6 text-xs px-2">
                <Plus className="w-3 h-3 mr-1" /> Intervention
              </Button>
            </div>
            <div className="space-y-2">
              {interventions.map((intervention, idx) => (
                <div key={intervention.id} className="p-2 border rounded-lg bg-background flex items-start gap-2">
                  <Select value={intervention.type} onValueChange={(v) => updateIntervention(idx, { type: v })}>
                    <SelectTrigger className="h-7 text-xs w-28 flex-shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="lab_monitoring">Lab Monitoring</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={intervention.description}
                    onChange={(e) => updateIntervention(idx, { description: e.target.value })}
                    placeholder="Description..."
                    className="h-7 text-xs flex-1"
                  />
                  <Input
                    value={intervention.frequency || ""}
                    onChange={(e) => updateIntervention(idx, { frequency: e.target.value })}
                    placeholder="Frequency"
                    className="h-7 text-xs w-24"
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeIntervention(idx)} className="h-7 w-7 p-0 text-destructive flex-shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {interventions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3 italic">No interventions added yet</p>
              )}
            </div>
          </div>

          {/* Progress Note */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Progress Note</Label>
            <Textarea
              value={newProgressNote}
              onChange={(e) => setNewProgressNote(e.target.value)}
              placeholder="Document progress, barriers, changes..."
              className="text-xs resize-none mt-1"
              rows={2}
            />
          </div>

          {/* Previous Progress Notes */}
          {editingPlan?.progress_notes && editingPlan.progress_notes.length > 0 && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Previous Notes</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {editingPlan.progress_notes.map((note, idx) => (
                  <div key={idx} className="text-xs p-2 bg-muted/50 rounded border">
                    <span className="text-muted-foreground">{format(new Date(note.date), "MMM d, yyyy")}:</span> {note.note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingPlan(null); resetForm(); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={savePlan} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              {editingPlan ? "Update Plan" : "Create Plan"}
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
            <Target className="w-4 h-4 text-primary" />
            Treatment Plans
            {plans.length > 0 && <Badge variant="secondary" className="text-xs">{plans.length}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => { resetForm(); setIsCreating(true); }} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" /> New Plan
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
          ) : plans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No treatment plans yet</p>
              <Button size="sm" variant="link" onClick={() => { resetForm(); setIsCreating(true); }} className="mt-1 text-xs">
                Create first treatment plan
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {plans.map(plan => {
                const activeGoals = (plan.goals || []).filter(g => g.status === "active").length;
                const achievedGoals = (plan.goals || []).filter(g => g.status === "achieved").length;
                const totalGoals = (plan.goals || []).length;

                return (
                  <div key={plan.id} className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {plan.service_line === "ketamine" ? "Ketamine" : plan.service_line === "weight_loss" ? "Weight Loss" : "HRT"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEditing(plan)} className="h-6 w-6 p-0">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {plan.status === "active" && (
                          <Button size="sm" variant="ghost" onClick={() => updatePlanStatus(plan.id, "completed")} className="h-6 w-6 p-0 text-green-600">
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-medium text-sm text-foreground">{plan.title}</h4>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(plan.start_date), "MMM d, yyyy")}
                      </span>
                      {totalGoals > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {achievedGoals}/{totalGoals} goals
                        </span>
                      )}
                      <span>{plan.review_frequency} review</span>
                    </div>

                    {/* Goal progress bars */}
                    {totalGoals > 0 && (
                      <div className="mt-2 space-y-1">
                        {(plan.goals || []).slice(0, 3).map((goal) => (
                          <div key={goal.id} className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  goal.status === "achieved" ? "bg-green-500" :
                                  goal.status === "discontinued" ? "bg-red-400" : "bg-primary"
                                }`}
                                style={{ width: `${goal.progress_pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{goal.progress_pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default TreatmentPlanPanel;
