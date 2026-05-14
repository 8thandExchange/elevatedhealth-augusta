import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

interface ResendWelcomeEmailButtonProps {
  patientId: string;
  patientName: string;
  patientEmail: string;
  primaryProgram?: string;
}

const ResendWelcomeEmailButton = ({
  patientId,
  patientName,
  patientEmail,
  primaryProgram = "hormone",
}: ResendWelcomeEmailButtonProps) => {
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (!patientEmail) {
      toast.error("Patient email is required");
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: {
          patient_id: patientId,
          email: patientEmail,
          patient_name: patientName,
          patient_email: patientEmail,
          primary_program: primaryProgram,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Welcome email resent to ${patientEmail}`);
      } else if (data?.emailResponse) {
        toast.success(`Welcome email resent to ${patientEmail}`);
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (err: any) {
      console.error("Resend welcome email error:", err);
      toast.error(err.message || "Failed to resend welcome email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={handleResend}
      disabled={isSending || !patientEmail}
      variant="outline"
      size="sm"
      className="w-full border-primary/50 text-primary hover:bg-primary/10"
    >
      {isSending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="w-4 h-4 mr-2" />
          Resend Welcome Email
        </>
      )}
    </Button>
  );
};

export default ResendWelcomeEmailButton;
