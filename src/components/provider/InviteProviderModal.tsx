import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail, Shield, BarChart3, Users } from "lucide-react";

interface InviteProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent?: () => void;
}

const AVAILABLE_ROLES = [
  { 
    id: "admin", 
    label: "Admin", 
    description: "Full clinical access - manage patients, treatment, settings",
    icon: Shield 
  },
  { 
    id: "staff", 
    label: "Staff", 
    description: "Limited access - kit shipping, pharmacy orders, patient support",
    icon: Users 
  },
  { 
    id: "business_admin", 
    label: "Business Admin", 
    description: "Financial access - revenue metrics, funnel analytics, business dashboard",
    icon: BarChart3 
  },
];

export const InviteProviderModal = ({ open, onOpenChange, onInviteSent }: InviteProviderModalProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["staff"]);
  const [mode, setMode] = useState<"invite" | "create">("create");
  const [password, setPassword] = useState("");
  const [isSending, setIsSending] = useState(false);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        if (prev.length === 1) {
          toast.error("At least one role must be selected");
          return prev;
        }
        return prev.filter(r => r !== roleId);
      }
      return [...prev, roleId];
    });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let p = "";
    for (let i = 0; i < 14; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p);
  };

  const handleSendInvite = async () => {
    if (!email || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    if (mode === "create" && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-provider-invite", {
        body: {
          email,
          full_name: fullName,
          roles: selectedRoles,
          mode,
          ...(mode === "create" ? { password } : {}),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (mode === "create") {
        toast.success(`Account created for ${email}`, {
          description: `They can sign in immediately with the password you set. Share it securely.`,
        });
      } else {
        toast.success(`Invitation sent to ${email}`, {
          description: `Roles: ${selectedRoles.map(r => AVAILABLE_ROLES.find(ar => ar.id === r)?.label).join(", ")}`,
        });
      }

      setEmail("");
      setFullName("");
      setSelectedRoles(["staff"]);
      setPassword("");
      onOpenChange(false);
      onInviteSent?.();
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(mode === "create" ? "Failed to create account" : "Failed to send invitation", {
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
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Create a provider/staff account directly with a password, or send an email invite.
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

          <div className="space-y-3">
            <Label>Roles (select one or more)</Label>
            <div className="space-y-3">
              {AVAILABLE_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoles.includes(role.id)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 border-border/50 hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                      disabled={isSending}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{role.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
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
