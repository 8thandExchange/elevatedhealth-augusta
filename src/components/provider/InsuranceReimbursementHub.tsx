import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, DollarSign, FileText, Printer, Info, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceReimbursementHubProps {
  patientId: string;
  patientName: string;
  patientEmail?: string | null;
  patientInsuranceType?: string | null;
  treatmentRequest?: string | null;
  onInsuranceUpdate?: () => void;
}

// Fee schedule data — based on clinic's actual reimbursement rates
const COVERAGE_DATA: Record<string, {
  label: string;
  coveredServices: { service: string; cpt: string; billedAmount: string; expectedReimbursement: string; notes?: string }[];
  notCovered: string[];
  tips: string[];
}> = {
  bcbs: {
    label: "Blue Cross Blue Shield",
    coveredServices: [
      { service: "New Patient E&M (Moderate)", cpt: "99204", billedAmount: "$350", expectedReimbursement: "$180–$220" },
      { service: "New Patient E&M (High)", cpt: "99205", billedAmount: "$500", expectedReimbursement: "$250–$320" },
      { service: "Established E&M (Low)", cpt: "99213", billedAmount: "$175", expectedReimbursement: "$80–$100" },
      { service: "Established E&M (Moderate)", cpt: "99214", billedAmount: "$250", expectedReimbursement: "$120–$160" },
      { service: "Drug Screen (Qualitative)", cpt: "80305", billedAmount: "$150", expectedReimbursement: "$40–$60" },
    ],
    notCovered: [
      "Compounded hormone creams (not FDA-approved for insurance billing)",
      "GLP-1 weight loss medications (usually excluded)",
      "Direct-to-consumer at-home lab kits",
      "Supplement plans",
    ],
    tips: [
      "E&M visits (office visits) may be eligible for out-of-network reimbursement when medically necessary",
      "Ask about out-of-network benefits if your plan has them",
      "We provide superbills for out-of-network reimbursement on non-covered services",
    ],
  },
  tricare: {
    label: "TRICARE",
    coveredServices: [
      { service: "New Patient E&M (Moderate)", cpt: "99204", billedAmount: "$350", expectedReimbursement: "$200–$250" },
      { service: "Established E&M (Moderate)", cpt: "99214", billedAmount: "$250", expectedReimbursement: "$130–$170" },
      { service: "Drug Screen", cpt: "80305", billedAmount: "$150", expectedReimbursement: "$45–$65" },
    ],
    notCovered: [
      "Compounded medications (hormones, peptides)",
      "Weight loss medications (GLP-1 typically excluded)",
      "At-home lab test kits",
    ],
    tips: [
      "TRICARE Prime may require referral from PCM for specialty care",
      "TRICARE Select allows self-referral to in-network providers",
      "Veterans may also have VA benefits — check both",
    ],
  },
  va: {
    label: "VA (Veterans Affairs)",
    coveredServices: [
      { service: "E&M Visit", cpt: "99214", billedAmount: "VA Schedule", expectedReimbursement: "Full coverage via VACCN" },
    ],
    notCovered: [
      "Services not pre-authorized by VA",
      "Compounded medications",
      "Weight loss medications (varies by VA facility)",
    ],
    tips: [
      "Patient must have VA Community Care (VACCN) authorization",
      "We are enrolled as a VA Community Care provider",
      "Authorization must be obtained BEFORE treatment begins",
      "Co-pays may apply depending on priority group",
    ],
  },
  self_pay: {
    label: "Self-Pay",
    coveredServices: [],
    notCovered: [],
    tips: [
      "All services are available at our published cash-pay rates",
      "We provide superbills for out-of-network reimbursement",
      "Membership plans reduce per-visit and medication costs",
      "Ask about financing options through Affirm/Klarna",
    ],
  },
  other: {
    label: "Other Insurance",
    coveredServices: [],
    notCovered: [],
    tips: [
      "We are currently in-network with BCBS, TRICARE, and VA only",
      "For other plans, we operate as out-of-network providers",
      "We provide detailed superbills with CPT/ICD-10 codes for reimbursement",
      "Many plans reimburse 50–80% of out-of-network charges — check your benefits",
      "Payment at checkout is by card — Klarna and Affirm available on eligible purchases",
    ],
  },
};

const InsuranceReimbursementHub = ({
  patientId,
  patientName,
  patientEmail,
  patientInsuranceType,
  treatmentRequest,
  onInsuranceUpdate,
}: InsuranceReimbursementHubProps) => {
  const [selectedInsurance, setSelectedInsurance] = useState(patientInsuranceType || "self_pay");
  const [isSaving, setIsSaving] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  const coverageInfo = COVERAGE_DATA[selectedInsurance] || COVERAGE_DATA.self_pay;

  const handleSaveInsurance = async (value: string) => {
    setSelectedInsurance(value);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ insurance_type: value })
        .eq("id", patientId);
      if (error) throw error;
      toast.success(`Insurance updated to ${COVERAGE_DATA[value]?.label || value}`);
      onInsuranceUpdate?.();
    } catch (err: any) {
      toast.error("Failed to save insurance type");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintGuide = () => {
    if (!guideRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked — allow popups to print");
      return;
    }

    const coveredRows = coverageInfo.coveredServices.map(s =>
      `<tr>
        <td style="padding:8px;border:1px solid #ddd">${s.service}</td>
        <td style="padding:8px;border:1px solid #ddd;font-family:monospace">${s.cpt}</td>
        <td style="padding:8px;border:1px solid #ddd">${s.billedAmount}</td>
        <td style="padding:8px;border:1px solid #ddd;font-weight:600">${s.expectedReimbursement}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${s.notes || "—"}</td>
      </tr>`
    ).join("");

    printWindow.document.write(`
      <html><head><title>Insurance Reimbursement Guide - ${patientName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 20px; color: #1a365d; }
        h2 { font-size: 16px; margin-top: 24px; color: #2d3748; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th { background: #f7fafc; padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 13px; }
        td { font-size: 13px; }
        .tips { background: #f0fff4; border-left: 4px solid #48bb78; padding: 12px; margin: 16px 0; }
        .not-covered { background: #fff5f5; border-left: 4px solid #fc8181; padding: 12px; margin: 16px 0; }
        .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #718096; }
        .hsa { background: #ebf8ff; border-left: 4px solid #4299e1; padding: 12px; margin: 16px 0; }
      </style></head><body>
      <h1>Insurance Reimbursement Guide</h1>
      <p><strong>Patient:</strong> ${patientName}<br/>
      <strong>Insurance:</strong> ${coverageInfo.label}<br/>
      <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      
      <p>Elevated Health Augusta is committed to helping you maximize your insurance benefits. 
      Below is a summary of what your plan may cover and how to submit for reimbursement.</p>

      ${coverageInfo.coveredServices.length > 0 ? `
        <h2>✅ Services Likely Covered</h2>
        <table>
          <thead><tr>
            <th>Service</th><th>CPT Code</th><th>Billed</th><th>Est. Reimbursement</th><th>Notes</th>
          </tr></thead>
          <tbody>${coveredRows}</tbody>
        </table>
      ` : ""}

      ${coverageInfo.notCovered.length > 0 ? `
        <div class="not-covered">
          <h2 style="margin-top:0">❌ Typically Not Covered</h2>
          <ul>${coverageInfo.notCovered.map(s => `<li>${s}</li>`).join("")}</ul>
        </div>
      ` : ""}

      <div class="hsa">
        <h2 style="margin-top:0">💳 Payment & Documentation</h2>
        <p>We accept major credit and debit cards at checkout. Klarna and Affirm are available on
        eligible purchases. We do not currently accept HSA or FSA cards directly.</p>
        <p>After your visit, we can provide a detailed superbill with CPT and ICD-10 codes for
        out-of-network insurance reimbursement requests.</p>
      </div>

      <div class="tips">
        <h2 style="margin-top:0">💡 Tips for Maximizing Your Benefits</h2>
        <ul>${coverageInfo.tips.map(t => `<li>${t}</li>`).join("")}</ul>
      </div>

      <h2>📋 How to Submit for Reimbursement</h2>
      <ol>
        <li>We generate a <strong>superbill</strong> after each visit with CPT codes, ICD-10 diagnoses, and charges</li>
        <li>Submit the superbill to your insurance company (fax, mail, or online portal)</li>
        <li>Include your member ID, group number, and a copy of your insurance card</li>
        <li>Reimbursement typically arrives within 30–60 days</li>
      </ol>

      <div class="footer">
        <p><strong>Elevated Health Augusta</strong><br/>
        1258 Broad St, Augusta, GA 30901 · (706) 760-3470<br/>
        NPI: 1578971552 · Tax ID: 99-0830253<br/>
        www.elevatedhealthaugusta.com</p>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Insurance & Reimbursement Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" ref={guideRef}>
        {/* Insurance Type Selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedInsurance} onValueChange={handleSaveInsurance}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select insurance..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
              <SelectItem value="tricare">TRICARE</SelectItem>
              <SelectItem value="va">VA (Veterans Affairs)</SelectItem>
              <SelectItem value="self_pay">Self-Pay</SelectItem>
              <SelectItem value="other">Other Insurance</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {isSaving ? "Saving..." : coverageInfo.label}
          </Badge>
        </div>

        {/* Coverage Estimator Table */}
        {coverageInfo.coveredServices.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Estimated Coverage
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Service</th>
                    <th className="text-left p-2 font-medium">CPT</th>
                    <th className="text-left p-2 font-medium">Est. Reimb.</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageInfo.coveredServices.map((s, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="p-2">{s.service}</td>
                      <td className="p-2 font-mono text-primary">{s.cpt}</td>
                      <td className="p-2 font-medium">{s.expectedReimbursement}</td>
                      <td className="p-2 text-muted-foreground">{s.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Not Covered */}
        {coverageInfo.notCovered.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Typically Not Covered
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {coverageInfo.notCovered.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium text-primary flex items-center gap-1">
            <Info className="w-3 h-3" />
            Counseling Tips
          </p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {coverageInfo.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment reminder for staff counseling */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
          <p className="text-xs font-medium text-foreground">💳 Payment at checkout</p>
          <p className="text-xs text-muted-foreground mt-1">
            Card only — Klarna and Affirm on eligible purchases. We do not accept HSA or FSA cards
            directly. Generate a superbill below if the patient needs documentation for insurance
            reimbursement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintGuide} className="flex-1 gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print Reimbursement Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceReimbursementHub;
