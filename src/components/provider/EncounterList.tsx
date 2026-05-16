import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { usePatientEncounters } from "@/lib/encounters/use-patient-encounters";
import type { PatientEncounter } from "@/data/encounters/types";
import { ENCOUNTER_TYPE_LABELS } from "@/data/encounters/types";
import { EncounterForm } from "@/components/provider/EncounterForm";
import { EncounterDetail } from "@/components/provider/EncounterDetail";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

function statusBadge(status: PatientEncounter["status"]) {
  if (status === "draft") return <Badge className="bg-amber-500/90 text-white">Draft</Badge>;
  if (status === "signed") return <Badge className="bg-emerald-600/90 text-white">Signed</Badge>;
  return <Badge variant="secondary">Amended</Badge>;
}

interface EncounterListProps {
  patientId: string;
  patientName: string;
  isAdmin: boolean;
}

export function EncounterList({ patientId, patientName, isAdmin }: EncounterListProps) {
  const [page, setPage] = useState(0);
  const [createKey, setCreateKey] = useState(0);
  const { data, isLoading, refetch } = usePatientEncounters(patientId, page);
  const qc = useQueryClient();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [activeEncounterId, setActiveEncounterId] = useState<string | undefined>(undefined);

  const [detailEncounter, setDetailEncounter] = useState<PatientEncounter | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openRow = (row: PatientEncounter) => {
    if (row.status === "draft") {
      setEditorMode("edit");
      setActiveEncounterId(row.id);
      setEditorOpen(true);
    } else {
      setDetailEncounter(row);
      setDetailOpen(true);
    }
  };

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["patient_encounters", patientId] });
    void refetch();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">Encounters</h4>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setCreateKey((k) => k + 1);
            setEditorMode("create");
            setActiveEncounterId(undefined);
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Encounter
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading encounters…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No encounters yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created by</TableHead>
              <TableHead className="hidden md:table-cell">Signed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => openRow(r)}>
                <TableCell className="whitespace-nowrap text-sm">
                  {format(new Date(r.encounter_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-sm">
                  {ENCOUNTER_TYPE_LABELS[r.encounter_type as keyof typeof ENCOUNTER_TYPE_LABELS] ?? r.encounter_type}
                </TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                  {r.created_by_user_id.slice(0, 8)}…
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {r.signed_at ? format(new Date(r.signed_at), "MMM d, yyyy") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">
              {editorMode === "create" ? "New encounter" : "Edit draft encounter"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">{patientName}</p>
          </DialogHeader>
          <EncounterForm
            key={editorMode === "create" ? `create-${createKey}` : `edit-${activeEncounterId ?? "x"}`}
            patientId={patientId}
            encounterId={editorMode === "edit" ? activeEncounterId : undefined}
            mode={editorMode === "create" ? "create" : "edit"}
            onSigned={() => {
              invalidate();
              setEditorOpen(false);
            }}
            onCancel={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <EncounterDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        encounter={detailEncounter}
        patientId={patientId}
        isAdmin={isAdmin}
        onAfterAmendment={(next) => {
          invalidate();
          setDetailOpen(false);
          setEditorMode("edit");
          setActiveEncounterId(next.id);
          setEditorOpen(true);
        }}
      />
    </div>
  );
}
