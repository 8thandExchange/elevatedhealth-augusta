import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Package, Loader2, Check, DollarSign, Sparkles } from "lucide-react";

interface SendKitLinkCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string;
  consultationCreditCode?: string;
  onSuccess?: () => void;
}

const KIT_OPTIONS = [
  {
    id: "hormone",
    name: "Hormone Mapping Kit",
    fullPrice: 349,
    creditPrice: 250, // After $99 credit
    description: "ZRT Saliva+Blood Panel - For hormone optimization patients",
  },
  {
    id: "metabolic",
    name: "Metabolic Mapping Kit", 
    fullPrice: 349,
    creditPrice: 250, // After $99 credit
    description: "ZRT Saliva+Blood Panel - For weight loss patients",
  },
];

export function SendKitLinkCard({
  patientId,
  patientName,
  patientEmail,
  consultationCreditCode: propCreditCode,
  onSuccess,
}: SendKitLinkCardProps) {
  const [selectedKit, setSelectedKit] = useState<string>("hormone");
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [creditCode, setCreditCode] = useState<string | null>(propCreditCode || null);
  const [isLoadingCredit, setIsLoadingCredit] = useState(!propCreditCode);

  // Auto-fetch credit code if not provided via props
  useEffect(() => {
    if (propCreditCode) {
      setCreditCode(propCreditCode);
      setIsLoadingCredit(false);
      return;
    }

    const fetchCreditCode = async () => {
      try {
        // Look up credit code from consultation_bookings by email
        const { data, error } = await supabase
          .from("consultation_bookings")
          .select("credit_code, status")
          .eq("customer_email", patientEmail)
          .eq("status", "paid")
          .not("credit_code", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data?.credit_code) {
          setCreditCode(data.credit_code);
        }
      } catch (err) {
        console.error("Error fetching credit code:", err);
      } finally {
        setIsLoadingCredit(false);
      }
    };

    fetchCreditCode();
  }, [patientEmail, propCreditCode]);

  const handleSendKitLink = async () => {
    if (!selectedKit) {
      toast.error("Please select a kit type");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-kit-payment-link", {
        body: {
          patientId,
          patientName,
          patientEmail,
          kitType: selectedKit,
          creditCode: creditCode,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setLinkSent(true);
        setGeneratedLink(data.paymentLink);
        toast.success(`Kit payment link sent to ${patientEmail}`);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error sending kit link:", error);
      toast.error(error.message || "Failed to send kit link");
    } finally {
      setIsSending(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Payment link copied to clipboard");
    }
  };

  const selectedKitInfo = KIT_OPTIONS.find((k) => k.id === selectedKit);
  const hasCredit = !!creditCode;
  const displayPrice = hasCredit ? selectedKitInfo?.creditPrice : selectedKitInfo?.fullPrice;

  if (linkSent) {
    return (
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            Kit Link Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Payment link for <strong>{selectedKitInfo?.name}</strong> sent to {patientEmail}
          </p>
          {generatedLink && (
            <div className="space-y-2">
              <Input value={generatedLink} readOnly className="text-xs" />
              <Button variant="outline" size="sm" onClick={copyLink} className="w-full">
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
          Select which diagnostic kit to send to <strong>{patientName}</strong>
        </p>

        {isLoadingCredit ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking for consultation credit...
          </div>
        ) : hasCredit ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Sparkles className="h-3 w-3 mr-1" />
            $99 Consultation Credit Applied (Code: {creditCode})
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            No consultation credit found
          </Badge>
        )}

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
                  <div className="text-right">
                    {hasCredit ? (
                      <>
                        <span className="text-sm line-through text-muted-foreground">
                          ${kit.fullPrice}
                        </span>
                        <span className="text-sm font-bold text-green-600 ml-2">
                          ${kit.creditPrice}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold">${kit.fullPrice}</span>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Patient will pay:</span>
            <div className="flex items-center gap-2">
              {hasCredit && (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  $99 saved
                </Badge>
              )}
              <span className="text-lg font-bold">${displayPrice}</span>
            </div>
          </div>
          <Button
            onClick={handleSendKitLink}
            disabled={isSending || !selectedKit || isLoadingCredit}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send ${displayPrice} Payment Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}