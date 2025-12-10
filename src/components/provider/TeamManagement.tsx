import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, UserPlus, Shield, ShieldCheck, Mail, Calendar, Loader2, Trash2 } from "lucide-react";
import { InviteProviderModal } from "./InviteProviderModal";

interface TeamMember {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  is_master_admin: boolean;
}

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-team-members", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("[TeamManagement] Error:", error);
        toast.error("Failed to load team members");
        return;
      }

      if (data?.team) {
        setTeamMembers(data.team);
      }
    } catch (err: any) {
      console.error("[TeamManagement] Unexpected error:", err);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (targetUserId: string, newRole: string) => {
    try {
      setUpdatingRoleId(targetUserId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const { data, error } = await supabase.functions.invoke("update-team-role", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          target_user_id: targetUserId,
          new_role: newRole,
        },
      });

      if (error) {
        console.error("[TeamManagement] Update error:", error);
        toast.error("Failed to update role");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Role updated successfully");
      
      // Update local state
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.user_id === targetUserId ? { ...m, role: newRole } : m
        )
      );
    } catch (err: any) {
      console.error("[TeamManagement] Unexpected error:", err);
      toast.error("Failed to update role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const removeMember = async () => {
    if (!removingMember) return;
    
    try {
      setIsRemoving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const { data, error } = await supabase.functions.invoke("remove-team-member", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          target_user_id: removingMember.user_id,
        },
      });

      if (error) {
        console.error("[TeamManagement] Remove error:", error);
        toast.error("Failed to remove team member");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`${removingMember.full_name || removingMember.email} has been removed`);
      
      // Update local state
      setTeamMembers((prev) =>
        prev.filter((m) => m.user_id !== removingMember.user_id)
      );
    } catch (err: any) {
      console.error("[TeamManagement] Unexpected error:", err);
      toast.error("Failed to remove team member");
    } finally {
      setIsRemoving(false);
      setRemovingMember(null);
    }
  };

  const getRoleBadge = (role: string, isMasterAdmin: boolean) => {
    if (isMasterAdmin) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Master Admin
        </Badge>
      );
    }
    if (role === "admin") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Staff
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const canRemove = (member: TeamMember) => {
    // Cannot remove master admin or yourself
    return !member.is_master_admin && member.user_id !== currentUserId;
  };

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage providers and staff with access to the dashboard
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {/* Team Members List */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${teamMembers.length} Team Member${teamMembers.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border/30 rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">No team members found</p>
              <Button
                variant="outline"
                onClick={() => setIsInviteOpen(true)}
                className="mt-4"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Your First Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers
                .sort((a, b) => {
                  // Master admin first, then by role, then by name
                  if (a.is_master_admin) return -1;
                  if (b.is_master_admin) return 1;
                  if (a.role === "admin" && b.role !== "admin") return -1;
                  if (a.role !== "admin" && b.role === "admin") return 1;
                  return (a.full_name || a.email).localeCompare(b.full_name || b.email);
                })
                .map((member) => (
                  <div
                    key={member.user_id}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                      member.is_master_admin
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/30 hover:bg-muted/30"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                        member.is_master_admin
                          ? "bg-primary text-primary-foreground"
                          : member.role === "admin"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {getInitials(member.full_name, member.email)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate flex items-center gap-2">
                        {member.full_name || member.email.split("@")[0]}
                        {member.user_id === currentUserId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {member.email}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Added {formatDate(member.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Role Badge or Selector */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {member.is_master_admin ? (
                        getRoleBadge(member.role, member.is_master_admin)
                      ) : (
                        <>
                          {updatingRoleId === member.user_id ? (
                            <div className="flex items-center gap-2 px-3 py-1">
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Updating...</span>
                            </div>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(value) => updateRole(member.user_id, value)}
                            >
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">
                                  <span className="flex items-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                  </span>
                                </SelectItem>
                                <SelectItem value="staff">
                                  <span className="flex items-center gap-2">
                                    Staff
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          {/* Remove Button */}
                          {canRemove(member) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setRemovingMember(member)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteProviderModal
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        onInviteSent={loadTeamMembers}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removingMember?.full_name || removingMember?.email}</strong> from the team?
              <br /><br />
              They will lose access to the provider dashboard immediately. This action can be undone by inviting them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={removeMember}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamManagement;
