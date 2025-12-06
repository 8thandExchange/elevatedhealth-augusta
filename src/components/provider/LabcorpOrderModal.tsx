import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Upload, Check, Loader2, FileText, TestTube } from "lucide-react";

interface LabcorpOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    full_name: string;
    dob?: string;
    street_address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    email?: string | null;
  };
  onSuccess?: () => void;
}

const LAB_CODES = {
  male_safety: [
    { code: "005009", name: "CBC with Differential" },
    { code: "322000", name: "CMP (Comprehensive Metabolic Panel)" },
    { code: "010322", name: "PSA (Prostate-Specific Antigen)" },
    { code: "070001", name: "Testosterone Total/Free" },
  ],
  thyroid: [
    { code: "004259", name: "TSH (Thyroid Stimulating Hormone)" },
    { code: "001974", name: "Free T4 (Thyroxine)" },
  ],
};

const LabcorpOrderModal = ({ isOpen, onClose, patient, onSuccess }: LabcorpOrderModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const formatAddress = () => {
    const parts = [
      patient.street_address,
      patient.city,
      patient.state,
      patient.zip_code,
    ].filter(Boolean);
    return parts.join(", ") || "No address on file";
  };

  const formatDOB = () => {
    if (!patient.dob) return "No DOB on file";
    return new Date(patient.dob).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `labcorp-requisition-${patient.id}-${timestamp}.pdf`;
      const filePath = `${patient.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("patient-documents")
        .upload(filePath, uploadedFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("patient-documents")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Save to patient_documents table
      const { error: dbError } = await supabase.from("patient_documents").insert({
        patient_id: patient.id,
        document_type: "labcorp_requisition",
        file_name: uploadedFile.name,
        file_url: fileUrl,
        notes: "Labcorp Safety Panel Requisition",
      });

      if (dbError) throw dbError;

      // Update patient status to awaiting_blood_work
      const { error: statusError } = await supabase
        .from("patients")
        .update({ onboarding_status: "awaiting_blood_work" })
        .eq("id", patient.id);

      if (statusError) throw statusError;

      // Send email notification to patient
      if (patient.email) {
        const { error: emailError } = await supabase.functions.invoke(
          "send-labcorp-requisition-notification",
          {
            body: {
              patientEmail: patient.email,
              patientName: patient.full_name,
              downloadUrl: fileUrl,
            },
          }
        );

        if (emailError) {
          console.error("Email error:", emailError);
          toast.warning("Document uploaded but email notification failed");
        } else {
          toast.success("Requisition uploaded and patient notified via email!");
        }
      } else {
        toast.success("Requisition uploaded. Note: No email on file to notify patient.");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload requisition");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            Labcorp Order Helper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info Section */}
          <Card className="border-border/50">
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Patient Information (Copy for Labcorp Link)
              </p>

              {/* Name */}
              <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{patient.full_name}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(patient.full_name, "Name")}
                >
                  {copiedField === "Name" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* DOB */}
              <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDOB()}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(formatDOB(), "DOB")}
                >
                  {copiedField === "DOB" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Address */}
              <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium truncate">{formatAddress()}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(formatAddress(), "Address")}
                  className="flex-shrink-0 ml-2"
                >
                  {copiedField === "Address" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Standard Lab Codes Reference */}
          <Card className="border-border/50">
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Standard Lab Codes Reference
              </p>

              {/* Male Safety Panel */}
              <div>
                <p className="text-sm font-semibold text-primary mb-2">Male Safety Panel</p>
                <div className="space-y-1">
                  {LAB_CODES.male_safety.map((code) => (
                    <div
                      key={code.code}
                      className="flex items-center justify-between text-sm p-1.5 hover:bg-secondary/30 rounded"
                    >
                      <span className="text-muted-foreground">{code.name}</span>
                      <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">
                        {code.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thyroid Panel */}
              <div>
                <p className="text-sm font-semibold text-primary mb-2">Thyroid Panel</p>
                <div className="space-y-1">
                  {LAB_CODES.thyroid.map((code) => (
                    <div
                      key={code.code}
                      className="flex items-center justify-between text-sm p-1.5 hover:bg-secondary/30 rounded"
                    >
                      <span className="text-muted-foreground">{code.name}</span>
                      <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">
                        {code.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Upload Signed Requisition
              </p>

              <div className="space-y-2">
                <Label htmlFor="pdf-upload" className="text-sm">
                  Upload Labcorp Requisition (PDF)
                </Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {uploadedFile && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {uploadedFile.name}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                When uploaded, the patient will receive an email with the download link and
                instructions to visit any Labcorp location.
              </p>

              <Button
                onClick={handleUpload}
                disabled={!uploadedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading & Notifying Patient...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Notify Patient
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LabcorpOrderModal;
