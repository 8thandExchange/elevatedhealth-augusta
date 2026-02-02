import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ParsedLabData {
  collectionDate: string | null;
  patientName: string | null;
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

interface LabPdfUploaderProps {
  patientName: string;
  onParsed: (data: ParsedLabData) => void;
  onPdfUploaded: (url: string) => void;
}

const LabPdfUploader = ({ patientName, onParsed, onPdfUploaded }: LabPdfUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
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
      // Convert file to base64
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

      // Call edge function to parse
      const { data, error } = await supabase.functions.invoke('parse-zrt-labs', {
        body: { pdfBase64, mimeType: file.type }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to parse PDF');

      const parsedData = data.data as ParsedLabData;

      // Validate patient name matches (fuzzy match)
      if (parsedData.patientName) {
        const pdfName = parsedData.patientName.toLowerCase().replace(/[^a-z]/g, '');
        const expectedName = patientName.toLowerCase().replace(/[^a-z]/g, '');
        if (!pdfName.includes(expectedName.slice(0, 5)) && !expectedName.includes(pdfName.slice(0, 5))) {
          toast.warning("Patient name in PDF may not match", {
            description: `PDF shows: ${parsedData.patientName}`
          });
        }
      }

      // Upload PDF to storage
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('lab-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Don't fail the whole process if storage fails
      } else {
        const { data: urlData } = supabase.storage
          .from('lab-documents')
          .getPublicUrl(filePath);
        onPdfUploaded(urlData.publicUrl);
      }

      setParseStatus("success");
      onParsed(parsedData);
      
      toast.success("Lab values extracted!", {
        description: `Confidence: ${Math.round((parsedData.confidence?.overall || 0.9) * 100)}%`
      });

    } catch (error: any) {
      console.error('Error parsing PDF:', error);
      setParseStatus("error");
      toast.error("Failed to parse lab PDF", {
        description: error.message || "Please enter values manually"
      });
    } finally {
      setIsParsing(false);
    }
  }, [patientName, onParsed, onPdfUploaded]);

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
              : parseStatus === "error"
                ? 'border-destructive bg-destructive/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Extracting lab values...</p>
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
        ) : parseStatus === "error" ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              Could not parse PDF
            </p>
            <p className="text-xs text-muted-foreground">Please enter values manually below</p>
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
              <span className="text-sm font-medium text-primary">Upload ZRT PDF</span>
              <span className="text-sm text-muted-foreground"> or drag & drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI will extract lab values automatically
            </p>
            <input
              type="file"
              accept="application/pdf"
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
