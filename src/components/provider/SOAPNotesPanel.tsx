import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import SOAPNoteEditor from "./SOAPNoteEditor";

interface SOAPNote {
  id: string;
  patient_id: string;
  provider_id: string;
  encounter_date: string;
  encounter_type: string;
  service_line: string;
  status: string;
  signed_at: string | null;
  subjective: Record<string, any>;
  objective: Record<string, any>;
  assessment: Record<string, any>;
  plan: Record<string, any>;
  vitals: Record<string, any>;
  icd10_codes: string[];
  cpt_codes: string[];
  created_at: string;
  updated_at: string;
}

interface SOAPNotesPanelProps {
  patientId: string;
  patientName: string;
  serviceLine?: string;
  providerName?: string;
}

const SOAPNotesPanel = ({ patientId, patientName, serviceLine = "hormone", providerName = "Provider" }: SOAPNotesPanelProps) => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingNote, setEditingNote] = useState<SOAPNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingNote, setViewingNote] = useState<SOAPNote | null>(null);

  useEffect(() => {
    if (patientId) loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("soap_notes")
        .select("*")
        .eq("patient_id", patientId)
        .order("encounter_date", { ascending: false });

      if (error) throw error;
      setNotes((data as any[]) || []);
    } catch (error) {
      console.error("Error loading SOAP notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setIsCreating(true);
    setViewingNote(null);
  };

  const handleEditNote = (note: SOAPNote) => {
    setEditingNote(note);
    setIsCreating(true);
    setViewingNote(null);
  };

  const handleViewNote = (note: SOAPNote) => {
    setViewingNote(note);
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleSaved = () => {
    setIsCreating(false);
    setEditingNote(null);
    loadNotes();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Draft</Badge>;
      case "signed": return <Badge className="bg-green-100 text-green-700 border-green-300">Signed</Badge>;
      case "amended": return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Amended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEncounterTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      initial: "Initial Eval",
      follow_up: "Follow-Up",
      urgent: "Urgent",
      telehealth: "Telehealth",
    };
    return types[type] || type;
  };

  const getServiceLineBadge = (line: string) => {
    const lines: Record<string, { label: string; className: string }> = {
      hormone: { label: "HRT", className: "bg-blue-100 text-blue-700" },
      weight_loss: { label: "Weight Loss", className: "bg-emerald-100 text-emerald-700" },
      peptide: { label: "Peptide", className: "bg-amber-100 text-amber-800" },
    };
    return lines[line] || { label: line, className: "bg-gray-100 text-gray-700" };
  };

  // If creating/editing, show the editor
  if (isCreating) {
    return (
      <SOAPNoteEditor
        patientId={patientId}
        patientName={patientName}
        serviceLine={serviceLine}
        existingNote={editingNote}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  // If viewing a signed note
  if (viewingNote) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              SOAP Note — {format(new Date(viewingNote.encounter_date), "MMM d, yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              {viewingNote.status === "draft" && (
                <Button size="sm" variant="outline" onClick={() => handleEditNote(viewingNote)} className="h-7 text-xs">
                  Edit
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setViewingNote(null)} className="h-7 text-xs">
                Back to List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex gap-2 flex-wrap">
            {getStatusBadge(viewingNote.status)}
            <Badge className={getServiceLineBadge(viewingNote.service_line).className}>
              {getServiceLineBadge(viewingNote.service_line).label}
            </Badge>
            <Badge variant="outline">{getEncounterTypeBadge(viewingNote.encounter_type)}</Badge>
          </div>

          {/* Vitals */}
          {viewingNote.vitals && Object.keys(viewingNote.vitals).length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Vitals</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(viewingNote.vitals).map(([key, value]) => 
                  value ? (
                    <div key={key}>
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* S/O/A/P sections */}
          {[
            { key: "subjective", label: "Subjective", color: "border-l-blue-500" },
            { key: "objective", label: "Objective", color: "border-l-green-500" },
            { key: "assessment", label: "Assessment", color: "border-l-amber-500" },
            { key: "plan", label: "Plan", color: "border-l-purple-500" },
          ].map(({ key, label, color }) => {
            const data = viewingNote[key as keyof SOAPNote] as Record<string, any>;
            if (!data || Object.keys(data).length === 0) return null;
            return (
              <div key={key} className={`p-3 rounded-lg border border-l-4 ${color} bg-background`}>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</h4>
                <div className="space-y-1">
                  {Object.entries(data).map(([field, value]) =>
                    value && value !== "" ? (
                      <div key={field} className="text-xs">
                        <span className="text-muted-foreground capitalize font-medium">{field.replace(/_/g, " ")}:</span>{" "}
                        <span className="text-foreground">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}

          {/* ICD-10 & CPT */}
          <div className="flex gap-4 text-xs">
            {viewingNote.icd10_codes?.length > 0 && (
              <div><span className="text-muted-foreground font-medium">ICD-10:</span> {viewingNote.icd10_codes.join(", ")}</div>
            )}
            {viewingNote.cpt_codes?.length > 0 && (
              <div><span className="text-muted-foreground font-medium">CPT:</span> {viewingNote.cpt_codes.join(", ")}</div>
            )}
          </div>

          {viewingNote.signed_at && (
            <p className="text-xs text-muted-foreground italic">
              Signed {format(new Date(viewingNote.signed_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            SOAP Notes
            {notes.length > 0 && (
              <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleNewNote} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              New Note
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
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No SOAP notes yet</p>
              <Button size="sm" variant="link" onClick={handleNewNote} className="mt-1 text-xs">
                Create first encounter note
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notes.map(note => {
                const slBadge = getServiceLineBadge(note.service_line);
                return (
                  <button
                    key={note.id}
                    onClick={() => note.status === "draft" ? handleEditNote(note) : handleViewNote(note)}
                    className="w-full text-left p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(note.status)}
                        <Badge className={`${slBadge.className} text-xs`}>{slBadge.label}</Badge>
                        <Badge variant="outline" className="text-xs">{getEncounterTypeBadge(note.encounter_type)}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.encounter_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.subjective?.chief_complaint || note.subjective?.symptom_changes || "No chief complaint recorded"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SOAPNotesPanel;
