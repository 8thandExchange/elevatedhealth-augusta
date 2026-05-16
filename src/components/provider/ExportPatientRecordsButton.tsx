import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";

interface ExportPatientRecordsButtonProps {
  patientId: string;
  patientName: string;
}

export function ExportPatientRecordsButton({ patientId, patientName }: ExportPatientRecordsButtonProps) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-patient-records", {
        body: { patient_id: patientId },
      });
      // Non-2xx responses still populate `data` with the JSON body; check before treating `error` as fatal.
      if (data && typeof data === "object" && "code" in data && data.code === "PDF_GENERATION_NOT_CONFIGURED") {
        toast.message("PDF export is not configured (PDFSHIFT_API_KEY).");
        return;
      }
      const url = data && typeof data === "object" && "signed_url" in data ? (data.signed_url as string | undefined) : undefined;
      if (error && !url) throw new Error(error.message);
      if (!url) throw new Error((data as { error?: string } | null)?.error ?? "No download URL returned");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${patientName.replace(/\s+/g, "_")}_chart_export.pdf`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export ready — download started.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void run()}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileDown className="h-4 w-4 mr-1" />}
      Export Records (PDF)
    </Button>
  );
}
