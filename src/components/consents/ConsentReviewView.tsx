import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { ConsentRecord, ConsentVersion, SectionAttestations } from "@/data/consents/types";
import { supabase } from "@/integrations/supabase/client";
import { formatClinicDate, formatClinicDateTime, isConsentActive } from "@/lib/clinicTime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentDocumentDisplay } from "./ConsentDocumentDisplay";
import { toast } from "sonner";

export interface ConsentReviewViewProps {
  consentRecord: ConsentRecord;
  consentVersion: ConsentVersion;
  showDownloadButton?: boolean;
}

function statusLabel(record: ConsentRecord): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (record.revoked_at) {
    return { label: "Revoked", variant: "destructive" };
  }
  const expires = new Date(record.expires_at);
  if (!isConsentActive(record.expires_at)) {
    return { label: `Expired ${formatClinicDate(expires)}`, variant: "secondary" };
  }
  return { label: `Active — expires ${formatClinicDate(expires)}`, variant: "default" };
}

export function ConsentReviewView({
  consentRecord,
  consentVersion,
  showDownloadButton = true,
}: ConsentReviewViewProps) {
  const [downloading, setDownloading] = useState(false);
  const status = statusLabel(consentRecord);

  const attestations = (consentRecord.section_attestations ?? {}) as SectionAttestations;
  const attestationEntries = Object.entries(attestations);

  const handleDownload = async () => {
    if (!consentRecord.pdf_storage_path) {
      toast.error("Signed PDF is not available yet.");
      return;
    }

    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("signed-consents")
        .download(consentRecord.pdf_storage_path);

      if (error || !data) {
        throw error ?? new Error("Download failed");
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        consentRecord.pdf_storage_path.split("/").pop() ??
        `${consentRecord.consent_type}-signed.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download the signed PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-playfair text-xl text-foreground">{consentVersion.title}</h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Signed by</dt>
            <dd className="font-medium">{consentRecord.signed_typed_name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date signed</dt>
            <dd className="font-medium">{formatClinicDateTime(consentRecord.signed_at)} ET</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-medium">{consentVersion.version_label}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Document hash</dt>
            <dd className="break-all font-mono text-xs">{consentRecord.document_text_hash}</dd>
          </div>
        </dl>
        {showDownloadButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={!consentRecord.pdf_storage_path || downloading}
            onClick={handleDownload}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download signed PDF
          </Button>
        )}
      </div>

      {attestationEntries.length > 0 && (
        <div className="rounded-md border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Section attestations</h3>
          <ul className="space-y-1 text-sm">
            {attestationEntries.map(([id, value]) => (
              <li key={id}>
                <span className="font-mono text-xs text-muted-foreground">{id}</span>:{" "}
                {value ? "Attested" : "Not attested"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConsentDocumentDisplay
        bodyMarkdown={consentVersion.body_markdown}
        enforceScroll={false}
      />
    </div>
  );
}
