import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, UserPlus, Check, Calendar } from "lucide-react";

interface InvitePatientCardProps {
  onInviteSent?: () => void;
}

const InvitePatientCard = ({ onInviteSent }: InvitePatientCardProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendInvite = async () => {
    if (!email.trim() || !name.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setSent(false);

    try {
      const { data, error } = await supabase.functions.invoke("send-consultation-invite", {
        body: {
          patient_email: email.trim(),
          patient_name: name.trim(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSent(true);
        toast.success(`Consultation invite sent to ${email}!`);
        setEmail("");
        setName("");
        onInviteSent?.();
        
        // Reset sent state after 3 seconds
        setTimeout(() => setSent(false), 3000);
      } else {
        throw new Error(data?.error || "Failed to send invite");
      }
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error(err.message || "Failed to send invitation email");
    } finally {
      setIsSending(false);
    }
  };

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
              Patient Name
            </Label>
            <Input
              id="invite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="mt-1"
              disabled={isSending}
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
              disabled={isSending}
            />
          </div>
        </div>

        <Button
          onClick={handleSendInvite}
          disabled={isSending || !email.trim() || !name.trim()}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : sent ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Invite Sent!
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send $99 Consultation Invite
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InvitePatientCard;