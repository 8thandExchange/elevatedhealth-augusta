import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Calendar,
  UserPlus,
  FileText,
  TestTube,
  Pill,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  Package,
  Archive,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  items: PipelineItem[];
}

interface PipelineItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  stage: string;
  created_at: string;
  service_type?: string | null;
  is_consultation?: boolean;
  amount_paid?: number | null;
}

const PatientPipeline = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const archiveItem = async (item: PipelineItem) => {
    try {
      if (item.is_consultation) {
        await supabase
          .from("consultation_bookings")
          .update({ status: "archived" })
          .eq("id", item.id);
      } else {
        await supabase
          .from("patients")
          .update({ is_archived: true })
          .eq("id", item.id);
      }
      toast.success("Archived successfully");
      loadPipelineData();
    } catch (error) {
      console.error("Error archiving:", error);
      toast.error("Failed to archive");
    }
  };

  const deleteItem = async (item: PipelineItem) => {
    try {
      if (item.is_consultation) {
        await supabase
          .from("consultation_bookings")
          .delete()
          .eq("id", item.id);
      } else {
        await supabase
          .from("patients")
          .delete()
          .eq("id", item.id);
      }
      toast.success("Deleted successfully");
      loadPipelineData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const loadPipelineData = async () => {
    setIsLoading(true);
    try {
      // Load consultation bookings
      const { data: consultations, error: consultError } = await supabase
        .from("consultation_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (consultError) throw consultError;

      // Load patients at various stages
      const { data: patients, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (patientError) throw patientError;

      // Categorize consultations
      const pendingConsults = consultations?.filter(c => 
        c.status === "pending" || c.status === "scheduled"
      ) || [];
      
      const paidConsults = consultations?.filter(c => 
        c.status === "paid"
      ) || [];
      
      const completedConsults = consultations?.filter(c => 
        c.status === "completed"
      ) || [];

      // Categorize patients
      const consultationPaidPatients = patients?.filter(p => 
        p.onboarding_status === "consultation_paid" || 
        p.onboarding_status === "consultation_invited"
      ) || [];
      
      const invitedPatients = patients?.filter(p => 
        p.onboarding_status === "invited" ||
        p.onboarding_status === "kit_link_sent"
      ) || [];

      const intakePatients = patients?.filter(p => 
        p.onboarding_status === "account_created" || 
        p.onboarding_status === "intake_complete"
      ) || [];

      const awaitingLabs = patients?.filter(p => 
        p.onboarding_status === "awaiting_blood_work" ||
        p.onboarding_status === "labs_in_progress" ||
        p.onboarding_status === "kit_shipped" ||
        p.onboarding_status === "results_ready"
      ) || [];

      const awaitingProtocol = patients?.filter(p => 
        p.onboarding_status === "labs_reviewed" || 
        p.onboarding_status === "protocol_approved"
      ) || [];

      const activePatients = patients?.filter(p => 
        p.onboarding_status === "treatment_active" ||
        p.current_protocol !== null
      ) || [];

      // Build stages
      const pipelineStages: PipelineStage[] = [
        {
          id: "consultation",
          name: "Pending Consult",
          icon: <Calendar className="h-4 w-4" />,
          color: "bg-blue-500",
          count: pendingConsults.length,
          items: pendingConsults.map(c => ({
            id: c.id,
            name: c.customer_name || "Unknown",
            email: c.customer_email,
            phone: c.customer_phone,
            stage: c.status,
            created_at: c.created_at,
            service_type: c.service_type,
            amount_paid: c.amount_paid,
            is_consultation: true,
          })),
        },
        {
          id: "consultation_paid",
          name: "Paid — GFE / schedule",
          icon: <UserPlus className="h-4 w-4" />,
          color: "bg-amber-500",
          count: paidConsults.length + consultationPaidPatients.length,
          items: [
            ...paidConsults.map(c => ({
              id: c.id,
              name: c.customer_name || "Unknown",
              email: c.customer_email,
              phone: c.customer_phone,
              stage: "consultation_paid",
              created_at: c.created_at,
              service_type: c.service_type,
              amount_paid: c.amount_paid,
              credit_code: c.credit_code,
            })),
            ...consultationPaidPatients.map(p => ({
              id: p.id,
              name: p.full_name,
              email: p.email || "",
              phone: p.phone,
              stage: p.onboarding_status || "",
              created_at: p.created_at || "",
            })),
          ],
        },
        {
          id: "invited",
          name: "Kit Link Sent",
          icon: <Package className="h-4 w-4" />,
          color: "bg-yellow-500",
          count: invitedPatients.length,
          items: invitedPatients.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || "",
            phone: p.phone,
            stage: "kit_link_sent",
            created_at: p.created_at || "",
          })),
        },
        {
          id: "intake",
          name: "Completing Intake",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-orange-500",
          count: intakePatients.length,
          items: intakePatients.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || "",
            phone: p.phone,
            stage: p.onboarding_status || "",
            created_at: p.created_at || "",
          })),
        },
        {
          id: "labs",
          name: "Labs In Progress",
          icon: <TestTube className="h-4 w-4" />,
          color: "bg-purple-500",
          count: awaitingLabs.length,
          items: awaitingLabs.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || "",
            phone: p.phone,
            stage: p.onboarding_status || "",
            created_at: p.created_at || "",
          })),
        },
        {
          id: "protocol",
          name: "Protocol Review",
          icon: <Pill className="h-4 w-4" />,
          color: "bg-indigo-500",
          count: awaitingProtocol.length,
          items: awaitingProtocol.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || "",
            phone: p.phone,
            stage: p.onboarding_status || "",
            created_at: p.created_at || "",
          })),
        },
        {
          id: "active",
          name: "Active Treatment",
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "bg-green-500",
          count: activePatients.length,
          items: activePatients.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || "",
            phone: p.phone,
            stage: p.onboarding_status || "active",
            created_at: p.created_at || "",
          })),
        },
      ];

      setStages(pipelineStages);
    } catch (error) {
      console.error("Error loading pipeline:", error);
      toast.error("Failed to load pipeline data");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <Button
              variant={expandedStage === stage.id ? "default" : "outline"}
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
            >
              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
              {stage.icon}
              <span>{stage.name}</span>
              <Badge variant="secondary" className="ml-1">
                {stage.count}
              </Badge>
            </Button>
            {index < stages.length - 1 && (
              <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Expanded Stage View */}
      {expandedStage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stages.find(s => s.id === expandedStage)?.icon}
              {stages.find(s => s.id === expandedStage)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stages.find(s => s.id === expandedStage)?.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No patients in this stage
              </p>
            ) : (
              <div className="space-y-3">
                {stages.find(s => s.id === expandedStage)?.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.email}
                          </span>
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {item.stage.replace(/_/g, " ")}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getDaysAgo(item.created_at)}
                          </p>
                        </div>
                        {/* Inline action icons */}
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-600"
                                  onClick={() => archiveItem(item)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Archive</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialog>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete <strong>{item.name}</strong>? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteItem(item)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                    {item.service_type && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {item.service_type}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className={`cursor-pointer transition-all hover:scale-105 ${
              expandedStage === stage.id ? "ring-2 ring-gold" : ""
            }`}
            onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-full ${stage.color} bg-opacity-20 flex items-center justify-center mx-auto mb-2`}>
                {stage.icon}
              </div>
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-xs text-muted-foreground">{stage.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadPipelineData}>
          Refresh Pipeline
        </Button>
      </div>
    </div>
  );
};

export default PatientPipeline;
