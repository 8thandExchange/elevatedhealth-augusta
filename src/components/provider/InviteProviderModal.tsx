import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail } from "lucide-react";

interface InviteProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent?: () => void;
}

export const InviteProviderModal = ({ open, onOpenChange, onInviteSent }: InviteProviderModalProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [isSending, setIsSending] = useState(false);

  const handleSendInvite = async () => {
    if (!email || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-provider-invite", {
        body: { email, full_name: fullName, role },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Invitation sent to ${email}`, {
        description: "They will receive an email to set up their password.",
      });

      setEmail("");
      setFullName("");
      setRole("staff");
      onOpenChange(false);
      onInviteSent?.();
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error("Failed to send invitation", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Provider or Staff
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to set up a new provider or staff account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Dr. John Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="provider@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v: "admin" | "staff") => setRole(v)} disabled={isSending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="staff">Staff (Standard Access)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can manage users and settings. Staff can manage patients and orders.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendInvite} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
