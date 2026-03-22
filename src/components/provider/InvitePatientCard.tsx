import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare, UserPlus, Check, Calendar, Eye, Send } from "lucide-react";

interface InvitePatientCardProps {
  onInviteSent?: () => void;
  embedded?: boolean;
}

const SERVICE_TYPES = [
  { value: "hormone", label: "Hormone Therapy" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "ketamine", label: "Ketamine Therapy" },
  { value: "general", label: "General Consultation" },
] as const;

type InviteType = "needs_booking" | "already_booked";

const InvitePatientCard = ({ onInviteSent, embedded = false }: InvitePatientCardProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceInterests, setServiceInterests] = useState<string[]>(["hormone"]);
  const [inviteType, setInviteType] = useState<InviteType>("needs_booking");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [sent, setSent] = useState<"email" | "sms" | null>(null);
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"email" | "sms">("email");

  const toggleServiceInterest = (value: string) => {
    setServiceInterests(prev => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter(v => v !== value);
      }
      return [...prev, value];
    });
  };

  const getServiceLabel = () => {
    // Use first selected interest for label
    return SERVICE_TYPES.find(s => s.value === serviceInterests[0])?.label || "Discovery Consultation";
  };

  const getFirstName = () => name.split(" ")[0] || "there";

  // Generate preview content based on invite type
  const getEmailPreviewContent = () => {
    const firstName = getFirstName();
    const serviceLabel = getServiceLabel();
    
    if (inviteType === "already_booked") {
      const dateDisplay = scheduledDate 
        ? new Date(scheduledDate).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
          })
        : "your scheduled time";
      
      return {
        subject: `${firstName}, Complete Your Consultation Payment`,
        body: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-weight: 300; margin: 0;">Réveil</h1>
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; margin-top: 8px;">RESTORE · RENEW · REBALANCE</p>
            </div>
            <div style="padding: 30px; background: white; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
              <h2 style="color: #2C3E50;">Hi ${firstName}!</h2>
              <p style="color: #4a5568;">You have a ${serviceLabel} consultation scheduled for <strong>${dateDisplay}</strong>.</p>
              <p style="color: #4a5568;">Please complete your $149 payment to confirm your appointment.</p>
              
              <div style="background: #f7f9fb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="font-size: 36px; font-weight: 700; color: #2C3E50; margin: 0;">$149</p>
                <p style="font-size: 14px; color: #7F8C8D; margin-top: 4px;">Consultation Fee • 30 Minutes</p>
              </div>
              
              <p style="color: #4a5568; font-size: 14px;">This $149 becomes a credit toward your Hormone Mapping Kit if you decide to proceed with treatment.</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); color: white; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600;">Complete Payment →</a>
              </div>
            </div>
          </div>
        `
      };
    }
    
    // Default: needs_booking
    return {
      subject: `${firstName}, Your Consultation Invitation from Réveil`,
      body: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-weight: 300; margin: 0;">Réveil</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; margin-top: 8px;">RESTORE · RENEW · REBALANCE</p>
          </div>
          <div style="padding: 30px; background: white; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
            <h2 style="color: #2C3E50;">Welcome, ${firstName}!</h2>
            <p style="color: #4a5568;">You've been personally invited to begin your hormone optimization journey with Réveil.</p>
            
            <div style="background: #f7f9fb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="font-size: 36px; font-weight: 700; color: #2C3E50; margin: 0;">$149</p>
              <p style="font-size: 14px; color: #7F8C8D; margin-top: 4px;">Discovery Consultation • 30 Minutes</p>
            </div>
            
            <div style="background: #fafbfc; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="font-weight: 600; color: #2C3E50; margin-bottom: 12px;">Your Consultation Includes:</p>
              <ul style="margin: 0; padding: 0; list-style: none; color: #4a5568;">
                <li style="margin: 8px 0;">✓ 30-minute one-on-one with your provider</li>
                <li style="margin: 8px 0;">✓ Complete symptom assessment</li>
                <li style="margin: 8px 0;">✓ Personalized treatment path discussion</li>
                <li style="margin: 8px 0;">✓ <strong>$149 credit toward your Hormone Mapping Kit</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); color: white; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600;">Book Your Consultation →</a>
            </div>
            
            <p style="text-align: center; color: #718096; font-size: 14px;">
              After payment, you'll schedule your consultation time.
            </p>
          </div>
        </div>
      `
    };
  };

  const getSMSPreviewContent = () => {
    const firstName = getFirstName();
    const serviceLabel = getServiceLabel();
    
    if (inviteType === "already_booked") {
      const dateDisplay = scheduledDate 
        ? new Date(scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : "your appointment";
      return `Hi ${firstName}! 🏥 Please complete your $149 payment to confirm your ${serviceLabel} consultation on ${dateDisplay}. Pay here: [payment link] - Réveil`;
    }
    
    return `Hi ${firstName}! 🌟 The clinical team at Réveil has invited you to book a $149 Discovery Consultation. Book here: [payment link] Questions? Call (706) 821-7354`;
  };

  const handlePreview = (mode: "email" | "sms") => {
    if (!name.trim()) {
      toast.error("Please enter patient name to preview");
      return;
    }
    if (mode === "email" && !email.trim()) {
      toast.error("Please enter patient email to preview");
      return;
    }
    if (mode === "sms" && !phone.trim()) {
      toast.error("Please enter patient phone to preview");
      return;
    }
    setPreviewMode(mode);
    setShowPreview(true);
  };

  const handleSendFromPreview = async () => {
    setShowPreview(false);
    await handleSendInvite(previewMode);
  };

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
      // Send the consultation invite with invite_type
      const { data, error } = await supabase.functions.invoke("send-consultation-invite", {
        body: {
          patient_email: email.trim() || `${phone.replace(/\D/g, "")}@sms.placeholder.com`,
          patient_name: name.trim(),
          service_type: serviceInterests[0], // Primary interest
          service_interests: serviceInterests, // All interests
          invite_type: inviteType,
          scheduled_date: inviteType === "already_booked" ? scheduledDate : null,
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
            service_type: serviceInterests[0],
            payment_url: data.paymentLink,
            invite_type: inviteType,
            scheduled_date: inviteType === "already_booked" ? scheduledDate : null,
          },
        });

        if (smsError) throw smsError;
        setSent("sms");
        toast.success(`$149 consultation invite texted to ${phone}`);
      } else {
        setSent("email");
        const serviceLabel = SERVICE_TYPES.find(s => s.value === serviceInterests[0])?.label || "Consultation";
        const action = inviteType === "already_booked" ? "payment link" : "invite";
        toast.success(`${serviceLabel} ${action} emailed to ${email}!`);
      }

      // Reset form after short delay
      setTimeout(() => {
        setEmail("");
        setName("");
        setPhone("");
        setServiceInterests(["hormone"]);
        setInviteType("needs_booking");
        setScheduledDate("");
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
  const emailPreview = getEmailPreviewContent();
  const smsPreview = getSMSPreviewContent();

  const formContent = (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Send a $149 Discovery Consultation invite. After payment, they'll schedule their consultation. 
        The $149 becomes a credit toward their $349 Hormone Mapping Kit.
      </p>
      
      {/* Invite Type Selection */}
      <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
        <Label className="text-xs font-medium text-foreground mb-2 block">Invite Type</Label>
        <RadioGroup 
          value={inviteType} 
          onValueChange={(v) => setInviteType(v as InviteType)}
          className="space-y-2"
          disabled={isLoading}
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="needs_booking" id="needs_booking" className="mt-0.5" />
            <div>
              <Label htmlFor="needs_booking" className="text-sm font-medium cursor-pointer">
                Needs to Book
              </Label>
              <p className="text-xs text-muted-foreground">Patient pays $149 → then schedules consultation</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="already_booked" id="already_booked" className="mt-0.5" />
            <div>
              <Label htmlFor="already_booked" className="text-sm font-medium cursor-pointer">
                Already Booked
              </Label>
              <p className="text-xs text-muted-foreground">Patient already scheduled, just needs to pay $149</p>
            </div>
          </div>
        </RadioGroup>
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

        {/* Multi-select Service Interests */}
        <div>
          <Label className="text-xs text-muted-foreground">
            Service Interests (select all that apply)
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map((service) => (
              <div
                key={service.value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  serviceInterests.includes(service.value)
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:bg-muted/50"
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => !isLoading && toggleServiceInterest(service.value)}
              >
                <Checkbox
                  id={`invite-service-${service.value}`}
                  checked={serviceInterests.includes(service.value)}
                  onCheckedChange={() => toggleServiceInterest(service.value)}
                  disabled={isLoading}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`invite-service-${service.value}`}
                  className="text-xs font-medium cursor-pointer flex-1"
                >
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
          {serviceInterests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {serviceInterests.map((interest) => {
                const label = SERVICE_TYPES.find(s => s.value === interest)?.label;
                return (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Show scheduled date picker only for "already booked" */}
        {inviteType === "already_booked" && (
          <div>
            <Label htmlFor="scheduled-date" className="text-xs text-muted-foreground">
              Scheduled Date/Time (optional)
            </Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Preview & Send Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handlePreview("email")}
          disabled={isLoading || !name.trim() || !email.trim()}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Email
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePreview("sms")}
          disabled={isLoading || !name.trim() || !phone.trim()}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview SMS
        </Button>
      </div>

      {/* Direct Send Buttons */}
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
              Send Email
            </>
          )}
        </Button>
        <Button
          variant="secondary"
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
              Send SMS
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {embedded ? (
        formContent
      ) : (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <UserPlus className="w-4 h-4" />
              Invite New Patient
            </CardTitle>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewMode === "email" ? (
                <>
                  <Mail className="w-5 h-5" />
                  Email Preview
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  SMS Preview
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {previewMode === "email" ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>To:</strong> {email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Subject:</strong> {emailPreview.subject}
                </p>
              </div>
              <div 
                className="border rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emailPreview.body }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>To:</strong> {phone}
                </p>
              </div>
              <div className="bg-primary/10 rounded-2xl rounded-bl-none p-4 max-w-sm">
                <p className="text-sm">{smsPreview}</p>
                <p className="text-xs text-muted-foreground mt-2">{smsPreview.length} characters</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendFromPreview} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {previewMode === "email" ? "Email" : "SMS"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvitePatientCard;
