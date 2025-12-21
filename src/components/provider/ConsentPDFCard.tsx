import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, Loader2, Check, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ConsentPDFCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  consentSignature: string | null;
  consentCompletedAt: string | null;
  consentMethod: string | null;
}

const ConsentPDFCard = ({
  patientId,
  patientName,
  patientEmail,
  consentSignature,
  consentCompletedAt,
  consentMethod,
}: ConsentPDFCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-consent-pdf', {
        body: { patientId, action: 'download' }
      });

      if (error) throw error;
      if (!data?.html) throw new Error("Failed to generate PDF");

      // Create a printable HTML document
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        // Add print trigger after a short delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consent-form-${patientName.replace(/\s+/g, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success("Consent form ready for download/print");
    } catch (error: any) {
      console.error("Error downloading consent:", error);
      toast.error(error.message || "Failed to download consent form");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    if (!patientEmail) {
      toast.error("Patient email not available");
      return;
    }

    setIsEmailing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-consent-pdf', {
        body: { patientId, action: 'email' }
      });

      if (error) throw error;

      toast.success(`Consent form sent to ${patientEmail}`);
    } catch (error: any) {
      console.error("Error emailing consent:", error);
      toast.error(error.message || "Failed to email consent form");
    } finally {
      setIsEmailing(false);
    }
  };

  const hasConsent = consentSignature && consentCompletedAt;
  const isOsmind = consentMethod === 'osmind';

  if (!hasConsent) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-900">Consent Form</span>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            {isOsmind 
              ? "Patient consent will be collected through Osmind for ketamine therapy."
              : "Patient has not yet completed the consent form."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-green-900">Consent Form</span>
          </div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>Signed by: <strong>{consentSignature}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Clock className="w-4 h-4" />
            <span>Date: {format(new Date(consentCompletedAt), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          {consentMethod && (
            <div className="text-xs text-green-600 bg-green-100 rounded px-2 py-1 inline-block">
              Method: {consentMethod === 'internal' ? 'Patient Portal' : consentMethod.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Download/Print
          </Button>

          {patientEmail && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={handleEmail}
              disabled={isEmailing}
            >
              {isEmailing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-1" />
              )}
              Email to Patient
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentPDFCard;