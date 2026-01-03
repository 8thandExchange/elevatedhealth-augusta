import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare, UserPlus, Check, Calendar } from "lucide-react";

interface InvitePatientCardProps {
  onInviteSent?: () => void;
}

const SERVICE_TYPES = [
  { value: "hormone", label: "Hormone Therapy" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "ketamine", label: "Ketamine Therapy" },
  { value: "general", label: "General Consultation" },
] as const;

const InvitePatientCard = ({ onInviteSent }: InvitePatientCardProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<string>("hormone");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [sent, setSent] = useState<"email" | "sms" | null>(null);

  const handleSendInvite = async (method: "email" | "sms") => {
    if (!name.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    if (method === "email" && !email.trim()) {
      toast.error("Please enter patient email");
      return;
    }

    if (method === "sms" && !phone.trim()) {
      toast.error("Please enter patient phone number for SMS");
      return;
    }

    // Basic email validation
    if (method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    const isSMS = method === "sms";
    isSMS ? setIsSendingSMS(true) : setIsSendingEmail(true);

    try {
      // First, create the consultation invite (this creates the Stripe checkout and sends email)
      const { data, error } = await supabase.functions.invoke("send-consultation-invite", {
        body: {
          patient_email: email.trim() || `${phone.replace(/\D/g, "")}@sms.placeholder.com`, // Use placeholder if no email
          patient_name: name.trim(),
          service_type: serviceType,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to send invite");

      // If SMS method selected, also send SMS with the payment link
      if (isSMS && data?.paymentLink) {
        const { error: smsError } = await supabase.functions.invoke("send-consultation-invite-sms", {
          body: {
            patient_name: name.trim(),
            patient_phone: phone.trim(),
            service_type: serviceType,
            payment_url: data.paymentLink,
          },
        });

        if (smsError) throw smsError;
        setSent("sms");
        toast.success(`$99 consultation invite texted to ${phone}`);
      } else {
        setSent("email");
        const serviceLabel = SERVICE_TYPES.find(s => s.value === serviceType)?.label || "Consultation";
        toast.success(`${serviceLabel} invite emailed to ${email}!`);
      }

      // Reset form after short delay
      setTimeout(() => {
        setEmail("");
        setName("");
        setPhone("");
        setServiceType("hormone");
        setSent(null);
        onInviteSent?.();
      }, 3000);

    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsSendingEmail(false);
      setIsSendingSMS(false);
    }
  };

  const isLoading = isSendingEmail || isSendingSMS;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <UserPlus className="w-4 h-4" />
          Invite New Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Send a $99 Discovery Consultation invite. After payment, they'll schedule their consultation. 
          The $99 becomes a credit toward their $349 Hormone Mapping Kit.
        </p>
        
        <div className="text-xs bg-muted/50 rounded-lg p-3 border border-border/50">
          <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Patient Journey:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
            <li>Pay $99 consultation → schedule call</li>
            <li>After consult, send $250 kit link (using Send Kit Link)</li>
          </ol>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="invite-name" className="text-xs text-muted-foreground">
              Patient Name *
            </Label>
            <Input
              id="invite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="invite-email" className="text-xs text-muted-foreground">
              Patient Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="invite-phone" className="text-xs text-muted-foreground">
              Patient Phone (for SMS)
            </Label>
            <Input
              id="invite-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="invite-service" className="text-xs text-muted-foreground">
              Service Interest
            </Label>
            <Select value={serviceType} onValueChange={setServiceType} disabled={isLoading}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email/SMS Send Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleSendInvite("email")}
            disabled={isLoading || !name.trim() || !email.trim()}
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : sent === "email" ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Emailed!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Email Invite
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSendInvite("sms")}
            disabled={isLoading || !name.trim() || !phone.trim()}
          >
            {isSendingSMS ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : sent === "sms" ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Texted!
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Text Invite
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitePatientCard;
