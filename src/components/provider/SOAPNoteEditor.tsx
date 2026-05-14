import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, FileCheck, X, Loader2, Stethoscope, Brain, ClipboardList, Pill } from "lucide-react";

interface SOAPNoteEditorProps {
  patientId: string;
  patientName: string;
  serviceLine?: string;
  existingNote?: any | null;
  onSaved: () => void;
  onCancel: () => void;
}

interface Template {
  id: string;
  name: string;
  service_line: string;
  encounter_type: string;
  template_data: Record<string, any>;
}

const SOAPNoteEditor = ({
  patientId,
  patientName,
  serviceLine = "hormone",
  existingNote,
  onSaved,
  onCancel,
}: SOAPNoteEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeSection, setActiveSection] = useState("subjective");

  // Form state
  const [encounterDate, setEncounterDate] = useState(existingNote?.encounter_date || new Date().toISOString().split("T")[0]);
  const [encounterType, setEncounterType] = useState(existingNote?.encounter_type || "follow_up");
  const [selectedServiceLine, setSelectedServiceLine] = useState(existingNote?.service_line || serviceLine);
  const [subjective, setSubjective] = useState<Record<string, any>>(existingNote?.subjective || {});
  const [objective, setObjective] = useState<Record<string, any>>(existingNote?.objective || {});
  const [assessment, setAssessment] = useState<Record<string, any>>(existingNote?.assessment || {});
  const [plan, setPlan] = useState<Record<string, any>>(existingNote?.plan || {});
  const [vitals, setVitals] = useState<Record<string, any>>(existingNote?.vitals || {});
  const [icd10Codes, setIcd10Codes] = useState<string>(existingNote?.icd10_codes?.join(", ") || "");
  const [cptCodes, setCptCodes] = useState<string>(existingNote?.cpt_codes?.join(", ") || "");

  useEffect(() => {
    loadTemplates();
  }, []);

  // Auto-load template when service line or encounter type changes (only for new notes)
  useEffect(() => {
    if (!existingNote && templates.length > 0) {
      const match = templates.find(
        t => t.service_line === selectedServiceLine && t.encounter_type === encounterType
      );
      if (match) applyTemplate(match);
    }
  }, [selectedServiceLine, encounterType, templates]);

  const loadTemplates = async () => {
    const { data } = await supabase.from("soap_templates").select("*");
    if (data) setTemplates(data as Template[]);
  };

  const applyTemplate = (template: Template) => {
    const td = template.template_data;
    if (td.subjective && Object.keys(subjective).length === 0) setSubjective(td.subjective);
    if (td.objective && Object.keys(objective).length === 0) setObjective(td.objective);
    if (td.assessment && Object.keys(assessment).length === 0) setAssessment(td.assessment);
    if (td.plan && Object.keys(plan).length === 0) setPlan(td.plan);
  };

  const updateField = (section: string, key: string, value: any) => {
    const setters: Record<string, Function> = {
      subjective: setSubjective,
      objective: setObjective,
      assessment: setAssessment,
      plan: setPlan,
      vitals: setVitals,
    };
    setters[section]?.((prev: Record<string, any>) => ({ ...prev, [key]: value }));
  };

  const saveNote = async (signAfterSave = false) => {
    if (signAfterSave) setIsSigning(true);
    else setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const noteData = {
        patient_id: patientId,
        provider_id: user.id,
        encounter_date: encounterDate,
        encounter_type: encounterType,
        service_line: selectedServiceLine,
        status: signAfterSave ? "signed" : "draft",
        signed_at: signAfterSave ? new Date().toISOString() : null,
        subjective,
        objective,
        assessment,
        plan,
        vitals,
        icd10_codes: icd10Codes.split(",").map(c => c.trim()).filter(Boolean),
        cpt_codes: cptCodes.split(",").map(c => c.trim()).filter(Boolean),
      };

      if (existingNote?.id) {
        const { error } = await supabase
          .from("soap_notes")
          .update(noteData)
          .eq("id", existingNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("soap_notes")
          .insert(noteData);
        if (error) throw error;
      }

      toast.success(signAfterSave ? "Note signed & locked" : "Draft saved");
      onSaved();
    } catch (error: any) {
      console.error("Error saving SOAP note:", error);
      toast.error(error.message || "Failed to save note");
    } finally {
      setIsSaving(false);
      setIsSigning(false);
    }
  };

  const renderFieldGroup = (section: string, data: Record<string, any>) => {
    return Object.entries(data).map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const isBoolean = typeof value === "boolean";
      const isNumber = typeof value === "number" || key.includes("score") || key.includes("rating");

      if (isBoolean) {
        return (
          <div key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateField(section, key, e.target.checked)}
              className="rounded border-input"
              id={`${section}-${key}`}
            />
            <Label htmlFor={`${section}-${key}`} className="text-xs">{label}</Label>
          </div>
        );
      }

      if (isNumber || key.includes("score")) {
        return (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input
              type="number"
              value={value ?? ""}
              onChange={(e) => updateField(section, key, e.target.value ? Number(e.target.value) : null)}
              className="h-8 text-sm"
            />
          </div>
        );
      }

      // Default: textarea for longer fields, input for short ones
      const isLongField = ["hpi", "review_of_systems", "clinical_impression", "treatment_protocol", "monitoring_plan", "safety_plan", "physical_exam", "lab_review", "mental_status_exam", "treatment_response", "dietary_recommendations", "exercise_plan", "weight_history", "diet_history", "psychiatric_history"].includes(key);

      return (
        <div key={key} className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          {isLongField ? (
            <Textarea
              value={value ?? ""}
              onChange={(e) => updateField(section, key, e.target.value)}
              className="text-sm resize-none min-h-[60px]"
              rows={3}
            />
          ) : (
            <Input
              value={value ?? ""}
              onChange={(e) => updateField(section, key, e.target.value)}
              className="h-8 text-sm"
            />
          )}
        </div>
      );
    });
  };

  const sectionIcons = {
    subjective: <Brain className="w-4 h-4" />,
    objective: <Stethoscope className="w-4 h-4" />,
    assessment: <ClipboardList className="w-4 h-4" />,
    plan: <Pill className="w-4 h-4" />,
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            {existingNote ? "Edit SOAP Note" : "New SOAP Note"} — {patientName}
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Encounter metadata */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={encounterDate}
              onChange={(e) => setEncounterDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Service Line</Label>
            <Select value={selectedServiceLine} onValueChange={setSelectedServiceLine}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hormone">HRT</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={encounterType} onValueChange={setEncounterType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial Eval</SelectItem>
                <SelectItem value="follow_up">Follow-Up</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="telehealth">Telehealth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Vitals bar */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Vitals</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: "blood_pressure", label: "BP" },
              { key: "heart_rate", label: "HR" },
              { key: "weight", label: "Weight (lbs)" },
              { key: "bmi", label: "BMI" },
              { key: "temperature", label: "Temp (°F)" },
              { key: "spo2", label: "SpO2 (%)" },
              { key: "resp_rate", label: "Resp Rate" },
              { key: "pain_scale", label: "Pain (0-10)" },
            ].map(v => (
              <div key={v.key}>
                <Label className="text-[10px] text-muted-foreground">{v.label}</Label>
                <Input
                  value={vitals[v.key] ?? ""}
                  onChange={(e) => updateField("vitals", v.key, e.target.value)}
                  className="h-7 text-xs"
                  placeholder="—"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SOAP Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="subjective" className="text-xs gap-1">
              {sectionIcons.subjective} S
            </TabsTrigger>
            <TabsTrigger value="objective" className="text-xs gap-1">
              {sectionIcons.objective} O
            </TabsTrigger>
            <TabsTrigger value="assessment" className="text-xs gap-1">
              {sectionIcons.assessment} A
            </TabsTrigger>
            <TabsTrigger value="plan" className="text-xs gap-1">
              {sectionIcons.plan} P
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjective" className="mt-3 space-y-3">
            {renderFieldGroup("subjective", subjective)}
            {Object.keys(subjective).length === 0 && (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                Select a service line and encounter type to load template fields
              </p>
            )}
          </TabsContent>
          <TabsContent value="objective" className="mt-3 space-y-3">
            {renderFieldGroup("objective", objective)}
          </TabsContent>
          <TabsContent value="assessment" className="mt-3 space-y-3">
            {renderFieldGroup("assessment", assessment)}
          </TabsContent>
          <TabsContent value="plan" className="mt-3 space-y-3">
            {renderFieldGroup("plan", plan)}
          </TabsContent>
        </Tabs>

        {/* Billing codes */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">ICD-10 Codes</Label>
            <Input
              value={icd10Codes}
              onChange={(e) => setIcd10Codes(e.target.value)}
              placeholder="F32.1, F41.1"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">CPT Codes</Label>
            <Input
              value={cptCodes}
              onChange={(e) => setCptCodes(e.target.value)}
              placeholder="99214, 96372"
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-4 pt-3 border-t">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveNote(false)}
              disabled={isSaving || isSigning}
            >
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => saveNote(true)}
              disabled={isSaving || isSigning}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSigning ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <FileCheck className="w-3 h-3 mr-1" />}
              Sign & Lock
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SOAPNoteEditor;
