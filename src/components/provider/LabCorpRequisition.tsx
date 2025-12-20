import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, Printer } from "lucide-react";

interface LabCorpRequisitionProps {
  patientName: string;
  patientDob?: string;
  gender: string;
  panelType: "mens_safety" | "thyroid" | "safety_cmp";
  reason: string;
  onEmailRequisition: () => void;
  isEmailing?: boolean;
  providerName?: string;
  providerCredentials?: string;
  providerNpi?: string;
  providerSignatureUrl?: string;
}

const PANEL_DETAILS = {
  mens_safety: {
    title: "Men's Safety Panel",
    tests: [
      { code: "PSA", name: "Prostate-Specific Antigen", reason: "Prostate health baseline" },
      { code: "CBC", name: "Complete Blood Count", reason: "Red blood cell monitoring" },
      { code: "CMP", name: "Comprehensive Metabolic Panel", reason: "Liver/kidney function" },
    ],
    icd10: "E29.1", // Testicular hypofunction
    instructions: "Fasting recommended. Draw in morning before 10am for accurate hormone levels.",
  },
  thyroid: {
    title: "Thyroid Panel",
    tests: [
      { code: "TSH", name: "Thyroid Stimulating Hormone", reason: "Thyroid function" },
      { code: "Free T3", name: "Triiodothyronine, Free", reason: "Active thyroid hormone" },
      { code: "Free T4", name: "Thyroxine, Free", reason: "Thyroid hormone production" },
    ],
    icd10: "E03.9", // Hypothyroidism, unspecified
    instructions: "No fasting required. Can be drawn any time of day.",
  },
  safety_cmp: {
    title: "Safety Panel (CMP)",
    tests: [
      { code: "CMP", name: "Comprehensive Metabolic Panel", reason: "Liver/kidney function monitoring" },
      { code: "GFR", name: "Glomerular Filtration Rate", reason: "Kidney function estimation" },
    ],
    icd10: "Z13.89", // Screening for other disorders
    instructions: "Fasting 8-12 hours recommended for accurate glucose and lipid results.",
  },
};

const LabCorpRequisition = ({
  patientName,
  patientDob,
  gender,
  panelType,
  reason,
  onEmailRequisition,
  isEmailing,
  providerName = "Provider",
  providerCredentials = "NP-C",
  providerNpi,
  providerSignatureUrl,
}: LabCorpRequisitionProps) => {
  const panel = PANEL_DETAILS[panelType];
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create a printable version and trigger print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LabCorp Requisition - ${patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #2C3E50; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2C3E50; }
          .subtitle { color: #666; font-size: 12px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #2C3E50; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { width: 150px; color: #666; }
          .value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .signature-line { border-bottom: 1px solid #000; width: 300px; margin-top: 40px; }
          .signature-label { font-size: 12px; color: #666; margin-top: 5px; }
          .instructions { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 11px; color: #666; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Elevated Health Augusta</div>
          <div class="subtitle">3654 Wheeler Road, Suite 103 | Augusta, GA 30909 | (706) 250-9855</div>
        </div>

        <h2 style="color: #2C3E50;">LabCorp Laboratory Requisition</h2>
        <p style="color: #666;">Date: ${today}</p>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="row"><span class="label">Patient Name:</span><span class="value">${patientName}</span></div>
          <div class="row"><span class="label">Date of Birth:</span><span class="value">${patientDob || "_______________"}</span></div>
          <div class="row"><span class="label">Gender:</span><span class="value">${gender === "male" ? "Male" : "Female"}</span></div>
        </div>

        <div class="section">
          <div class="section-title">${panel.title}</div>
          <div class="row"><span class="label">ICD-10 Code:</span><span class="value">${panel.icd10}</span></div>
          <div class="row"><span class="label">Clinical Reason:</span><span class="value">${reason}</span></div>
          
          <table>
            <thead>
              <tr>
                <th>Test Code</th>
                <th>Test Name</th>
                <th>Clinical Indication</th>
              </tr>
            </thead>
            <tbody>
              ${panel.tests.map(t => `
                <tr>
                  <td><strong>${t.code}</strong></td>
                  <td>${t.name}</td>
                  <td>${t.reason}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="instructions">
          <strong>Patient Instructions:</strong><br/>
          ${panel.instructions}
        </div>

        <div class="section" style="margin-top: 40px;">
          <div class="section-title">Provider Authorization</div>
          ${providerSignatureUrl 
            ? `<div style="margin: 20px 0;">
                <img src="${providerSignatureUrl}" alt="Provider Signature" style="max-height: 60px; max-width: 250px;" />
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Electronically signed on ${today}</div>
              </div>`
            : `<div class="signature-line"></div>
               <div class="signature-label">Provider Signature / Date</div>`
          }
          <p style="margin-top: 20px; font-size: 12px;">
            <strong>Ordering Provider:</strong> ${providerName}, ${providerCredentials}<br/>
            <strong>NPI:</strong> ${providerNpi || "_______________"}<br/>
            <strong>License:</strong> Georgia NP License
          </p>
        </div>

        <div class="footer">
          This requisition is valid for 90 days from the date of issue.<br/>
          Patient should present this form at any LabCorp Patient Service Center.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="border-amber-500 border-2 bg-amber-50/30 dark:bg-amber-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-amber-600" />
            LabCorp Requisition Required
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
            Blood Work
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium mb-1">{panel.title}</p>
          <p className="text-amber-700 dark:text-amber-300">{reason}</p>
        </div>

        <div className="bg-white dark:bg-background rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-muted-foreground mb-2">Tests Ordered:</p>
          <div className="flex flex-wrap gap-2">
            {panel.tests.map((t) => (
              <Badge key={t.code} variant="secondary" className="text-xs">
                {t.code}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={onEmailRequisition}
            disabled={isEmailing}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isEmailing ? "Sending..." : "Email to Provider"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabCorpRequisition;