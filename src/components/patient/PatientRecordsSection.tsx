import { FileText, NotebookPen, Receipt, Droplets, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePatientRecords } from "@/hooks/usePatientRecords";
import { formatClinicDate } from "@/lib/clinicTime";

function SoapBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-jost text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function formatDollars(amount: number | null, fromCents: boolean) {
  if (amount == null) return null;
  const dollars = fromCents ? amount / 100 : amount;
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function PatientRecordsSection({
  patientId,
  patientEmail,
}: {
  patientId: string;
  patientEmail: string | null;
}) {
  const { data } = usePatientRecords(patientId, patientEmail);

  const visitNotes = data?.visitNotes ?? [];
  const documents = data?.documents ?? [];
  const superbills = data?.superbills ?? [];
  const ivVisits = data?.ivVisits ?? [];

  return (
    <>
      {/* Visit notes */}
      <Card>
        <CardHeader>
          <CardTitle className="font-jost text-base flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-accent" />
            Visit notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitNotes.length === 0 ? (
            <p className="font-jost text-sm text-muted-foreground">
              Signed notes from your visits will appear here once your clinician finalizes them.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {visitNotes.map((note) => (
                <AccordionItem key={note.id} value={note.id}>
                  <AccordionTrigger className="font-jost text-sm hover:no-underline">
                    <span className="flex flex-col items-start text-left">
                      <span className="font-medium">{formatClinicDate(note.encounter_date)}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {(note.encounter_type ?? "visit").replace(/_/g, " ")}
                        {note.chief_complaint ? ` · ${note.chief_complaint}` : ""}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-1">
                    <SoapBlock label="Summary" value={note.subjective} />
                    <SoapBlock label="Findings" value={note.objective} />
                    <SoapBlock label="Assessment" value={note.assessment} />
                    <SoapBlock label="Plan" value={note.plan} />
                    <SoapBlock label="Follow-up" value={note.follow_up_plan} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* IV visits */}
      {ivVisits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-jost text-base flex items-center gap-2">
              <Droplets className="h-4 w-4 text-accent" />
              IV lounge visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/50">
              {ivVisits.map((iv) => (
                <li key={iv.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="font-jost text-sm font-medium">{iv.therapy_name ?? "IV therapy"}</p>
                    <p className="font-jost text-xs text-muted-foreground">
                      {formatClinicDate(iv.created_at)}
                      {formatDollars(iv.amount_paid, true)
                        ? ` · ${formatDollars(iv.amount_paid, true)}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-jost text-xs capitalize shrink-0">
                    {(iv.payment_status ?? "").replace(/_/g, " ") || "booked"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-jost text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="font-jost text-xs text-muted-foreground">
              Records your care team shares with you (results, letters, instructions) appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li key={doc.id} className="text-sm font-jost">
                  <p className="font-medium leading-tight">
                    {doc.file_name ?? (doc.document_type ?? "Document").replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(doc.document_type ?? "").replace(/_/g, " ")}
                    {doc.document_type ? " · " : ""}
                    {formatClinicDate(doc.created_at)}
                  </p>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-accent text-xs font-medium hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open document
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Superbills */}
      {superbills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-jost text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Superbills (for insurance)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {superbills.map((sb) => (
                <li key={sb.id} className="text-sm font-jost">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {sb.date_of_service ? formatClinicDate(sb.date_of_service) : formatClinicDate(sb.created_at)}
                    </p>
                    {formatDollars(sb.total_charge, false) && (
                      <span className="text-muted-foreground">{formatDollars(sb.total_charge, false)}</span>
                    )}
                  </div>
                  {sb.notes && <p className="text-xs text-muted-foreground mt-0.5">{sb.notes}</p>}
                </li>
              ))}
            </ul>
            <p className="font-jost text-[11px] text-muted-foreground mt-3">
              Submit these to your insurer for possible out-of-network reimbursement. We do not bill insurance directly.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default PatientRecordsSection;
