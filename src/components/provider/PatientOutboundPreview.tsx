import { Mail, MessageSquare } from "lucide-react";

interface PatientOutboundPreviewProps {
  emailSubject?: string;
  emailText?: string;
  smsBody?: string;
  showEmail: boolean;
  showSms: boolean;
  consentLabels?: string[];
  note?: string;
}

export function PatientOutboundPreview({
  emailSubject,
  emailText,
  smsBody,
  showEmail,
  showSms,
  consentLabels,
  note,
}: PatientOutboundPreviewProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Preview — what the patient will receive
      </p>

      {note && <p className="text-sm text-muted-foreground">{note}</p>}

      {consentLabels && consentLabels.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Consent documents in this link</p>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {consentLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Use “View text” on each consent row in the chart to read the full document before sending.
          </p>
        </div>
      )}

      {showEmail && emailSubject && emailText && (
        <div className="space-y-2 rounded-md border border-border/50 bg-background p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4 text-accent" />
            Email
          </p>
          <p className="text-xs text-muted-foreground">
            Subject: <span className="text-foreground">{emailSubject}</span>
          </p>
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded bg-muted/40 p-3 font-jost text-xs leading-relaxed text-foreground">
            {emailText}
          </pre>
        </div>
      )}

      {showSms && smsBody && (
        <div className="space-y-2 rounded-md border border-border/50 bg-background p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-accent" />
            SMS
          </p>
          <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words rounded bg-muted/40 p-3 font-jost text-xs leading-relaxed text-foreground">
            {smsBody}
          </pre>
        </div>
      )}
    </div>
  );
}
