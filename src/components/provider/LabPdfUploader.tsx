import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export interface ParsedLabData {
  collectionDate: string | null;
  patientName: string | null;
  labSource?: 'labcorp' | 'unknown';
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  hematocrit?: number | null;
  psa?: number | null;
  alt?: number | null;
  ast?: number | null;
  a1c?: number | null;
  tsh?: number | null;
  freeT3?: number | null;
  freeT4?: number | null;
  vitaminD?: number | null;
  fastingInsulin?: number | null;
  triglycerides?: number | null;
  hdl?: number | null;
  ldl?: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

interface LabPdfUploaderProps {
  patientId: string;
  patientName: string;
  onParsed: (data: ParsedLabData) => void;
  onPdfUploaded: (url: string) => void;
}

function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return file.type || "application/pdf";
}

const LabPdfUploader = ({ patientId, patientName, onParsed, onPdfUploaded }: LabPdfUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "partial" | "error">("idle");

  const handleFile = useCallback(async (file: File) => {
    const mimeType = resolveMimeType(file);
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setParseStatus("idle");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You are not signed in. Log in at /admin/login and try again.");
      }

      // Store PDF first so chart retains the document even if AI parse fails.
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const filePath = `${patientId}/labs/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('lab-documents')
        .upload(filePath, file, { contentType: mimeType, upsert: false });

      if (uploadError) {
        const msg = uploadError.message.toLowerCase();
        if (msg.includes("row-level security") || msg.includes("permission") || msg.includes("403")) {
          throw new Error(
            "Could not store the lab PDF. Use your clinic staff login (e.g. caroline@elevatedhealthaugusta.com), not a patient account."
          );
        }
        throw new Error(`Could not store lab PDF: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from('lab-documents').getPublicUrl(filePath);
      onPdfUploaded(urlData.publicUrl);

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const pdfBase64 = await base64Promise;

      const { data, error } = await supabase.functions.invoke('parse-zrt-labs', {
        body: { pdfBase64, mimeType, filename: file.name },
      });

      if (error) {
        const detail = await readEdgeFunctionError(
          error,
          "AI could not read this file. Enter values manually below — the PDF is saved to the chart."
        );
        setParseStatus("partial");
        toast.warning("PDF saved — auto-fill unavailable", { description: detail });
        return;
      }

      if (!data?.success) {
        setParseStatus("partial");
        toast.warning("PDF saved — auto-fill unavailable", {
          description: data?.error || "Enter values manually below.",
        });
        return;
      }

      const parsedData = data.data as ParsedLabData;

      if (parsedData.patientName) {
        const pdfName = parsedData.patientName.toLowerCase().replace(/[^a-z]/g, '');
        const expectedName = patientName.toLowerCase().replace(/[^a-z]/g, '');
        if (!pdfName.includes(expectedName.slice(0, 5)) && !expectedName.includes(pdfName.slice(0, 5))) {
          toast.warning("Patient name in PDF may not match", {
            description: `PDF shows: ${parsedData.patientName}`,
          });
        }
      }

      setParseStatus("success");
      onParsed(parsedData);

      const sourceLabel = parsedData.labSource === 'labcorp' ? 'LabCorp' : 'Lab';
      toast.success(`${sourceLabel} values extracted!`, {
        description: `Confidence: ${Math.round((parsedData.confidence?.overall || 0.9) * 100)}%`,
      });
    } catch (error: unknown) {
      console.error('Error uploading/parsing lab PDF:', error);
      setParseStatus("error");
      const message = error instanceof Error ? error.message : "Please enter values manually";
      toast.error("Failed to upload lab PDF", { description: message });
    } finally {
      setIsParsing(false);
    }
  }, [patientId, patientName, onParsed, onPdfUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5'
            : parseStatus === "success"
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : parseStatus === "partial"
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
              : parseStatus === "error"
                ? 'border-destructive bg-destructive/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Saving and extracting lab values...</p>
            {fileName && (
              <p className="text-xs text-muted-foreground">{fileName}</p>
            )}
          </div>
        ) : parseStatus === "success" ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Values extracted successfully
            </p>
            {fileName && (
              <p className="text-xs text-muted-foreground">{fileName}</p>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setParseStatus("idle");
                setFileName(null);
              }}
              className="text-xs"
            >
              Upload different file
            </Button>
          </div>
        ) : parseStatus === "partial" ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              PDF saved — enter values manually
            </p>
            <p className="text-xs text-muted-foreground">Auto-fill could not read this file</p>
            {fileName && (
              <p className="text-xs text-muted-foreground">{fileName}</p>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setParseStatus("idle");
                setFileName(null);
              }}
              className="text-xs"
            >
              Upload different file
            </Button>
          </div>
        ) : parseStatus === "error" ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              Could not upload PDF
            </p>
            <p className="text-xs text-muted-foreground">Check your login and try again</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setParseStatus("idle");
                setFileName(null);
              }}
              className="text-xs"
            >
              Try again
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 py-2 cursor-pointer">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium text-primary">Upload Lab PDF</span>
              <span className="text-sm text-muted-foreground"> (LabCorp PDF)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF is saved to the chart; AI fills values when it can
            </p>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        )}
      </div>

      {!isParsing && parseStatus === "idle" && (
        <p className="text-xs text-center text-muted-foreground">
          Or enter values manually below
        </p>
      )}
    </div>
  );
};

export default LabPdfUploader;
