import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Package, Loader2, Check, Mail, MessageSquare, Copy } from "lucide-react";

interface SendKitLinkCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  consultationCreditCode?: string; // kept for backward compat but no longer used
  onSuccess?: () => void;
}

const KIT_OPTIONS = [
  {
    id: "hormone",
    name: "Hormone Mapping Panel",
    price: 250,
    description: "ZRT Saliva Profile III - Cortisol, DHEA-S, Estradiol, Progesterone & Testosterone. Includes follow-up consultation.",
  },
];

export function SendKitLinkCard({
  patientId,
  patientName,
  patientEmail,
  patientPhone: initialPhone = "",
  onSuccess,
}: SendKitLinkCardProps) {
  const [selectedKit, setSelectedKit] = useState<string>("hormone");
  const [isSending, setIsSending] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [sentVia, setSentVia] = useState<"email" | "sms" | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [patientPhone, setPatientPhone] = useState(initialPhone);

  const handleSendKitLink = async (method: "email" | "sms") => {
    if (!selectedKit) {
      toast.error("Please select a kit type");
      return;
    }

    if (method === "sms" && !patientPhone) {
      toast.error("Phone number is required for SMS");
      return;
    }

    const isSMS = method === "sms";
    isSMS ? setIsSendingSMS(true) : setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-kit-payment-link", {
        body: {
          patientId,
          patientName,
          patientEmail,
          kitType: selectedKit,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to generate link");

      setGeneratedLink(data.paymentLink);

      await supabase
        .from("patients")
        .update({ onboarding_status: "kit_link_sent" })
        .eq("id", patientId);

      if (isSMS && data.paymentLink) {
        const { error: smsError } = await supabase.functions.invoke("send-kit-payment-sms", {
          body: {
            patient_id: patientId,
            patient_name: patientName,
            patient_phone: patientPhone,
            kit_type: selectedKit,
            payment_url: data.paymentLink,
            amount: 250,
            has_credit: false,
          },
        });

        if (smsError) throw smsError;
        setSentVia("sms");
        toast.success(`Kit payment link texted to ${patientPhone}`);
      } else {
        setSentVia("email");
        toast.success(`Kit payment link emailed to ${patientEmail}`);
      }

      setLinkSent(true);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error sending kit link:", error);
      toast.error(error.message || "Failed to send kit link");
    } finally {
      setIsSending(false);
      setIsSendingSMS(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Payment link copied to clipboard");
    }
  };

  const selectedKitInfo = KIT_OPTIONS.find((k) => k.id === selectedKit);

  if (linkSent) {
    return (
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            Kit Link Sent via {sentVia === "sms" ? "SMS" : "Email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Payment link for <strong>{selectedKitInfo?.name}</strong> sent to {sentVia === "sms" ? patientPhone : patientEmail}
          </p>
          {generatedLink && (
            <div className="space-y-2">
              <Input value={generatedLink} readOnly className="text-xs" />
              <Button variant="outline" size="sm" onClick={copyLink} className="w-full">
                <Copy className="w-3 h-3 mr-1.5" />
                Copy Link for Manual Send
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLinkSent(false);
              setGeneratedLink(null);
              setSentVia(null);
            }}
            className="w-full"
          >
            Send Another Kit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Send Kit Payment Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select kit and send to <strong>{patientName}</strong>
        </p>

        <RadioGroup value={selectedKit} onValueChange={setSelectedKit}>
          {KIT_OPTIONS.map((kit) => (
            <div
              key={kit.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                selectedKit === kit.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={kit.id} id={kit.id} className="mt-1" />
              <Label htmlFor={kit.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{kit.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {kit.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">${kit.price}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Phone input for SMS */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Phone (for SMS delivery)</Label>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Patient will pay:</span>
            <span className="text-lg font-bold">${selectedKitInfo?.price}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleSendKitLink("email")}
              disabled={isSending || isSendingSMS || !selectedKit}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Email Link
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSendKitLink("sms")}
              disabled={isSending || isSendingSMS || !selectedKit || !patientPhone}
            >
              {isSendingSMS ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Text Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}