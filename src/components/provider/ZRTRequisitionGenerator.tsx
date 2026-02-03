import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer, Package } from "lucide-react";

interface PatientData {
  full_name: string;
  dob?: string;
  gender?: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone?: string;
  email?: string;
  treatment_request?: string;
}

interface SymptomData {
  estrogen_score?: number;
  progesterone_score?: number;
  androgen_score?: number;
  cortisol_score?: number;
  raw_answers?: {
    symptoms?: Record<string, number>;
    hormoneHistory?: {
      menstrualStatus?: string;
      takingHormones?: boolean;
      hormoneDetails?: string;
      wakeTime?: string;
    };
  };
}

interface ZRTRequisitionGeneratorProps {
  patient: PatientData;
  symptomLog?: SymptomData | null;
  membershipType?: string;
  providerName?: string;
  providerCredentials?: string;
}

// Gender-specific panel descriptions
const getGenderDescription = (gender?: string) => {
  if (gender === 'male') return "Comprehensive Male Hormone Panel";
  return "Comprehensive Female Hormone Panel";
};

const getGenderICD10 = (gender?: string) => {
  if (gender === 'male') return "E29.1"; // Male hypogonadism
  return "E28.9"; // Female hormone dysfunction
};

const PANEL_DETAILS = {
  saliva_iii: {
    title: "Saliva Profile III",
    tests: [
      { code: "E2", name: "Estradiol", reason: "Estrogen level assessment" },
      { code: "Pg", name: "Progesterone", reason: "Progesterone balance" },
      { code: "T", name: "Testosterone", reason: "Androgen assessment" },
      { code: "DHEAS", name: "DHEA-S", reason: "Adrenal function" },
      { code: "Cortisol x4", name: "Diurnal Cortisol (4 samples)", reason: "Cortisol awakening response & daily rhythm" },
    ],
    patientInstructions: [
      "Collect saliva samples upon waking, before noon, before dinner, and at bedtime.",
      "Do not eat, drink (except water), or brush teeth 1 hour before collection.",
      "Avoid alcohol 24 hours before collection.",
      "If taking bioidentical hormones, collect the day after your last dose.",
    ],
  },
  weight_management: {
    title: "Weight Management Profile",
    tests: [
      { code: "E2", name: "Estradiol", reason: "Metabolic hormone influence" },
      { code: "Pg", name: "Progesterone", reason: "Weight regulation" },
      { code: "T", name: "Testosterone", reason: "Muscle/metabolism support" },
      { code: "DHEAS", name: "DHEA-S", reason: "Adrenal/metabolic function" },
      { code: "Cortisol x4", name: "Diurnal Cortisol (4 samples)", reason: "Stress & weight connection" },
      { code: "Insulin", name: "Fasting Insulin", reason: "Insulin resistance screening" },
    ],
    patientInstructions: [
      "Fast for 8-12 hours before morning saliva collection.",
      "Collect upon waking, before noon, before dinner, and at bedtime.",
      "Do not eat, drink (except water), or brush teeth 1 hour before each collection.",
      "Avoid strenuous exercise 24 hours before collection.",
    ],
  },
};

const ZRTRequisitionGenerator = ({
  patient,
  symptomLog,
  membershipType = "hormone",
  providerName = "Provider",
  providerCredentials = "NP-C",
}: ZRTRequisitionGeneratorProps) => {
  const panelType = membershipType.toLowerCase().includes("weight") ? "weight_management" : "saliva_iii";
  const panel = PANEL_DETAILS[panelType];
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hormoneHistory = symptomLog?.raw_answers?.hormoneHistory;
  const symptoms = symptomLog?.raw_answers?.symptoms;

  const formatAddress = () => {
    const parts = [
      patient.street_address,
      patient.city,
      patient.state,
      patient.zip_code,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(generatePrintableHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(generatePrintableHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintableHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZRT Test Requisition - ${patient.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 850px; margin: 0 auto; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2C3E50; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 20px; font-weight: bold; color: #2C3E50; }
        .logo-sub { font-size: 10px; color: #666; }
        .zrt-logo { text-align: right; }
        .zrt-logo-text { font-size: 24px; font-weight: bold; color: #0066CC; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .section-title { font-weight: bold; font-size: 12px; color: #2C3E50; background: #f5f5f5; padding: 6px 10px; margin-bottom: 8px; border-left: 3px solid #2C3E50; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field { margin-bottom: 6px; }
        .field-label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { font-size: 11px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd; min-height: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background: #f9f9f9; font-weight: 600; }
        .checkbox { display: inline-block; width: 14px; height: 14px; border: 2px solid #2C3E50; margin-right: 8px; vertical-align: middle; background: #2C3E50; }
        .checkbox-empty { background: white; }
        .symptom-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .symptom-item { font-size: 9px; padding: 3px 5px; background: #f5f5f5; border-radius: 3px; }
        .symptom-score { font-weight: bold; color: #2C3E50; }
        .instructions { background: #fffef0; border: 1px solid #e5e5c0; padding: 12px; border-radius: 4px; margin-top: 15px; }
        .instructions h4 { margin: 0 0 8px 0; color: #666; font-size: 11px; }
        .instructions li { margin-bottom: 4px; font-size: 10px; }
        .signature-section { margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-line { border-bottom: 1px solid #000; padding-top: 30px; }
        .signature-label { font-size: 9px; color: #666; margin-top: 4px; }
        .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center; }
        @media print { 
          body { padding: 15px; } 
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Elevated Health Augusta</div>
          <div class="logo-sub">3654 Wheeler Road, Suite 103 | Augusta, GA 30909 | (706) 250-9855</div>
        </div>
        <div class="zrt-logo">
          <div class="zrt-logo-text">ZRT</div>
          <div style="font-size: 9px; color: #666;">Laboratory Test Requisition</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-label">Patient Name</div>
              <div class="field-value">${patient.full_name}</div>
            </div>
            <div class="field">
              <div class="field-label">Date of Birth</div>
              <div class="field-value">${patient.dob || "_______________"}</div>
            </div>
            <div class="field">
              <div class="field-label">Gender</div>
              <div class="field-value">${patient.gender === "male" ? "Male" : "Female"}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">Address</div>
              <div class="field-value">${formatAddress()}</div>
            </div>
            <div class="field">
              <div class="field-label">Phone</div>
              <div class="field-value">${patient.phone || "_______________"}</div>
            </div>
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${patient.email || "_______________"}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">HORMONE HISTORY (ZRT Required)</div>
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-label">Menstrual Status</div>
              <div class="field-value">${hormoneHistory?.menstrualStatus || "Not provided"}</div>
            </div>
            <div class="field">
              <div class="field-label">Currently Taking Hormones?</div>
              <div class="field-value">${hormoneHistory?.takingHormones === true ? "Yes" : hormoneHistory?.takingHormones === false ? "No" : "Not provided"}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">Hormone Details (if applicable)</div>
              <div class="field-value">${hormoneHistory?.hormoneDetails || "N/A"}</div>
            </div>
            <div class="field">
              <div class="field-label">Usual Wake Time (for Cortisol)</div>
              <div class="field-value">${hormoneHistory?.wakeTime || "Not provided"}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">TEST PANEL SELECTION</div>
        <div style="margin-bottom: 10px;">
          <span class="checkbox ${panelType === "saliva_iii" ? "" : "checkbox-empty"}"></span>
          <strong>Saliva Profile III</strong> - ${getGenderDescription(patient.gender)}
        </div>
        <div>
          <span class="checkbox ${panelType === "weight_management" ? "" : "checkbox-empty"}"></span>
          <strong>Weight Management Profile</strong> - Metabolic & Hormone Assessment
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Test Code</th>
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
        <div style="margin-top: 8px; font-size: 10px;">
          <strong>ICD-10:</strong> ${getGenderICD10(patient.gender)} | <strong>Date:</strong> ${today}
        </div>
      </div>

      <div class="section">
        <div class="section-title">SYMPTOM HISTORY (Provider Reference)</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
          <div style="background: #f0f9ff; padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #666;">Estrogen Score</div>
            <div style="font-size: 16px; font-weight: bold; color: #2C3E50;">${symptomLog?.estrogen_score ?? "—"}</div>
          </div>
          <div style="background: #fdf4ff; padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #666;">Progesterone Score</div>
            <div style="font-size: 16px; font-weight: bold; color: #2C3E50;">${symptomLog?.progesterone_score ?? "—"}</div>
          </div>
          <div style="background: #f0fdf4; padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #666;">Androgen Score</div>
            <div style="font-size: 16px; font-weight: bold; color: #2C3E50;">${symptomLog?.androgen_score ?? "—"}</div>
          </div>
          <div style="background: #fffbeb; padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #666;">Cortisol Score</div>
            <div style="font-size: 16px; font-weight: bold; color: #2C3E50;">${symptomLog?.cortisol_score ?? "—"}</div>
          </div>
        </div>
        ${symptoms ? `
        <div class="symptom-grid">
          ${Object.entries(symptoms).filter(([_, v]) => (v as number) > 0).map(([key, value]) => `
            <div class="symptom-item">${key.replace(/_/g, ' ')}: <span class="symptom-score">${value}</span></div>
          `).join("")}
        </div>
        ` : '<div style="font-size: 10px; color: #666;">No detailed symptoms recorded</div>'}
      </div>

      <div class="instructions">
        <h4>PATIENT COLLECTION INSTRUCTIONS</h4>
        <ul style="margin: 0; padding-left: 18px;">
          ${panel.patientInstructions.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>

      <div class="signature-section">
        <div>
          <div class="signature-line"></div>
          <div class="signature-label">Provider Signature</div>
          <div style="margin-top: 8px; font-size: 10px;">
            <strong>${providerName}, ${providerCredentials}</strong><br/>
            Elevated Health Augusta
          </div>
        </div>
        <div>
          <div class="signature-line"></div>
          <div class="signature-label">Date</div>
        </div>
      </div>

      <div class="footer">
        <strong>ELEVATED HEALTH AUGUSTA</strong> | HIPAA Compliant | Patient Copy Included in Kit<br/>
        Results will be sent to ordering provider within 5-7 business days of sample receipt.
      </div>
    </body>
    </html>
  `;

  return (
    <Card className="border-blue-500 border-2 bg-blue-50/30 dark:bg-blue-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-blue-600" />
            Prepare ZRT Saliva Kit
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            {panel.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">{getGenderDescription(patient.gender)}</p>
          <p className="text-blue-700 dark:text-blue-300 text-xs">
            Auto-filled from patient intake. Print and include in kit.
          </p>
        </div>

        <div className="bg-white dark:bg-background rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-muted-foreground mb-2">Tests Included:</p>
          <div className="flex flex-wrap gap-2">
            {panel.tests.map((t) => (
              <Badge key={t.code} variant="secondary" className="text-xs">
                {t.code}
              </Badge>
            ))}
          </div>
        </div>

        {hormoneHistory && (
          <div className="bg-white dark:bg-background rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-muted-foreground mb-2">Hormone History Captured:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Menstrual:</span>{" "}
                <span className="font-medium">{hormoneHistory.menstrualStatus || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">On Hormones:</span>{" "}
                <span className="font-medium">
                  {hormoneHistory.takingHormones === true ? "Yes" : hormoneHistory.takingHormones === false ? "No" : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Wake Time:</span>{" "}
                <span className="font-medium">{hormoneHistory.wakeTime || "—"}</span>
              </div>
            </div>
          </div>
        )}

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
            size="sm"
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Requisition
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZRTRequisitionGenerator;
