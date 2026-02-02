import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  DollarSign, 
  ShoppingBag, 
  Copy, 
  Mail, 
  Check, 
  AlertTriangle,
  MessageSquare,
  Send,
} from "lucide-react";
import { ALACARTE_PRICES, MEMBERSHIP_PRICES, type AlacartePriceKey } from "@/lib/stripeConfig";

interface AlaCartePaymentCardProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  hasMembership?: boolean;
}

const ALACARTE_OPTIONS = Object.entries(ALACARTE_PRICES).map(([key, value]) => ({
  key: key as AlacartePriceKey,
  ...value,
}));

type DeliveryMethod = "email" | "sms";

const AlaCartePaymentCard = ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  hasMembership = false,
}: AlaCartePaymentCardProps) => {
  const [selectedProduct, setSelectedProduct] = useState<AlacartePriceKey | "">("");
  const [isSending, setIsSending] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");

  const selectedItem = selectedProduct ? ALACARTE_PRICES[selectedProduct] : null;

  const canSendEmail = !!patientEmail;
  const canSendSMS = !!patientPhone;

  const handleSendPaymentLink = async (method: DeliveryMethod | "copy") => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (method === "email" && !patientEmail) {
      toast.error("Patient email is required for email delivery");
      return;
    }

    if (method === "sms" && !patientPhone) {
      toast.error("Patient phone is required for SMS delivery");
      return;
    }

    setIsSending(true);
    setLinkSent(false);

    try {
      // First create the checkout session
      const { data, error } = await supabase.functions.invoke("create-alacarte-checkout", {
        body: {
          product_key: selectedProduct,
          patient_email: patientEmail || "",
          patient_name: patientName,
          patient_id: patientId,
        },
      });

      if (error) throw error;

      if (data?.url) {
        setGeneratedLink(data.url);

        if (method === "copy") {
          await navigator.clipboard.writeText(data.url);
          toast.success("Payment link copied to clipboard!");
          return;
        }

        if (method === "email") {
          const { error: emailError } = await supabase.functions.invoke("send-alacarte-payment-link", {
            body: {
              patient_email: patientEmail,
              patient_name: patientName,
              payment_url: data.url,
              product_name: selectedItem?.name || "À La Carte Order",
              amount: selectedItem?.displayPrice || "",
            },
          });

          if (emailError) {
            console.error("Email send error:", emailError);
            toast.warning("Payment link created but email failed. Use copy link instead.");
          } else {
            setLinkSent(true);
            toast.success(`Payment link sent to ${patientEmail}!`);
          }
        }

        if (method === "sms") {
          const { error: smsError } = await supabase.functions.invoke("send-alacarte-payment-sms", {
            body: {
              patient_phone: patientPhone,
              patient_name: patientName,
              payment_url: data.url,
              product_name: selectedItem?.name || "À La Carte Order",
              amount: selectedItem?.displayPrice || "",
            },
          });

          if (smsError) {
            console.error("SMS send error:", smsError);
            toast.warning("Payment link created but SMS failed. Use copy link instead.");
          } else {
            setLinkSent(true);
            toast.success(`Payment link sent via SMS to ${patientPhone}!`);
          }
        }
      }
    } catch (err: any) {
      console.error("Payment link error:", err);
      toast.error(err.message || "Failed to create payment link");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Payment link copied!");
    } else {
      await handleSendPaymentLink("copy");
    }
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
          <ShoppingBag className="w-4 h-4" />
          À La Carte Medication Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Membership Upsell Banner */}
        {!hasMembership && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary">Non-member pricing</p>
                <p className="text-muted-foreground mt-1">
                  Consider the Vitality Membership at {MEMBERSHIP_PRICES.vitality.displayPrice} for 
                  included medications and better value.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Select Medication</label>
          <Select value={selectedProduct} onValueChange={(v) => setSelectedProduct(v as AlacartePriceKey)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose à la carte item..." />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {ALACARTE_OPTIONS.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    <span className="text-amber-600 font-medium ml-4">{item.displayPrice}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedItem && (
            <p className="text-xs text-muted-foreground mt-1">{selectedItem.description}</p>
          )}
        </div>

        {/* Price Display */}
        {selectedItem && (
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold">Payment Amount</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{selectedItem.name}</span>
              <span className="text-amber-600 text-xl font-bold">{selectedItem.displayPrice}</span>
            </div>
          </div>
        )}

        {/* Delivery Method Selection */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Send Via</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={deliveryMethod === "email" ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${deliveryMethod === "email" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
              onClick={() => setDeliveryMethod("email")}
              disabled={!canSendEmail}
            >
              <Mail className="w-4 h-4 mr-1.5" />
              Email
              {!canSendEmail && <span className="ml-1 text-xs opacity-60">(N/A)</span>}
            </Button>
            <Button
              type="button"
              variant={deliveryMethod === "sms" ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${deliveryMethod === "sms" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
              onClick={() => setDeliveryMethod("sms")}
              disabled={!canSendSMS}
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              SMS
              {!canSendSMS && <span className="ml-1 text-xs opacity-60">(N/A)</span>}
            </Button>
          </div>
          {deliveryMethod === "email" && patientEmail && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Will send to: <span className="text-foreground">{patientEmail}</span>
            </p>
          )}
          {deliveryMethod === "sms" && patientPhone && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Will send to: <span className="text-foreground">{patientPhone}</span>
            </p>
          )}
        </div>

        {/* Send Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => handleSendPaymentLink(deliveryMethod)}
            disabled={isSending || !selectedProduct || (deliveryMethod === "email" && !canSendEmail) || (deliveryMethod === "sms" && !canSendSMS)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : linkSent ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSending ? "Sending..." : linkSent ? "Sent!" : `Send via ${deliveryMethod === "email" ? "Email" : "SMS"}`}
          </Button>

          {!canSendEmail && !canSendSMS && (
            <p className="text-xs text-center text-amber-600">
              No email or phone on file - add contact info to send
            </p>
          )}

          {!selectedProduct && (canSendEmail || canSendSMS) && (
            <p className="text-xs text-center text-muted-foreground">Select a medication to continue</p>
          )}
        </div>

        {/* Copy Link Fallback */}
        <Button
          onClick={handleCopyLink}
          disabled={!selectedProduct}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          size="sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Payment Link
        </Button>

        {/* Pricing Comparison */}
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-medium">Membership comparison:</span> À la carte patients pay per item. 
            Vitality members ({MEMBERSHIP_PRICES.vitality.displayPrice}) get medications included.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlaCartePaymentCard;
