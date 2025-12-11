import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, BarChart3, Users, Settings } from "lucide-react";

interface ManageRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    user_id: string;
    email: string;
    full_name: string | null;
    roles: string[];
    is_master_admin: boolean;
  } | null;
  onRolesUpdated?: (userId: string, newRoles: string[]) => void;
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

export const ManageRolesModal = ({ open, onOpenChange, member, onRolesUpdated }: ManageRolesModalProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(member?.roles || []);
  const [isSaving, setIsSaving] = useState(false);

  // Update selected roles when member changes
  if (member && member.roles.join(",") !== selectedRoles.join(",") && !isSaving) {
    setSelectedRoles(member.roles);
  }

  const toggleRole = (roleId: string) => {
    // Master admin must always have admin role
    if (member?.is_master_admin && roleId === "admin" && selectedRoles.includes("admin")) {
      toast.error("Master admin must have Admin role");
      return;
    }

    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        // Don't allow removing the last role
        if (prev.length === 1) {
          toast.error("At least one role must be selected");
          return prev;
        }
        return prev.filter(r => r !== roleId);
      }
      return [...prev, roleId];
    });
  };

  const handleSave = async () => {
    if (!member) return;

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const { data, error } = await supabase.functions.invoke("update-team-roles", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          target_user_id: member.user_id,
          roles: selectedRoles,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Roles updated successfully");
      onRolesUpdated?.(member.user_id, selectedRoles);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Update roles error:", error);
      toast.error("Failed to update roles", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Manage Roles
          </DialogTitle>
          <DialogDescription>
            Update roles for {member.full_name || member.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {AVAILABLE_ROLES.map((role) => {
            const Icon = role.icon;
            const isDisabled = member.is_master_admin && role.id === "admin";
            
            return (
              <label
                key={role.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isDisabled 
                    ? "opacity-50 cursor-not-allowed bg-muted/20"
                    : selectedRoles.includes(role.id)
                    ? "bg-primary/5 border-primary/30 cursor-pointer"
                    : "bg-muted/30 border-border/50 hover:bg-muted/50 cursor-pointer"
                }`}
              >
                <Checkbox
                  id={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                  disabled={isSaving || isDisabled}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{role.label}</span>
                    {isDisabled && (
                      <span className="text-xs text-muted-foreground">(required)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {role.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Roles"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
