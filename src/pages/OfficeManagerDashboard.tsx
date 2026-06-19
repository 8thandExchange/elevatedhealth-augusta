import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { hasClinicAdminRole } from "@/lib/staffPortalRouting";
import { 
  Loader2, User, Users, Clock, Package, Phone, Mail, TestTube,
  Calendar, CalendarPlus, CheckCircle, AlertCircle, RefreshCw, Search,
  FileText, CreditCard, MessageSquare, Mic, Filter
} from "lucide-react";
import StaffBookingModal from "@/components/booking/StaffBookingModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SmsInbox from "@/components/office/SmsInbox";
import LabCorpPortalLink from "@/components/provider/LabCorpPortalLink";
import { LABCORP_FLOW_HINT } from "@/lib/labcorpPortal";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  onboarding_status: string | null;
  primary_program: string | null;
  created_at: string | null;
  is_archived: boolean | null;
}

interface PendingActivation {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  base_membership: string;
  addon_tier: string;
  total_monthly: number;
  sent_at: string;
  status: string;
}

interface LabPendingPatient {
  id: string;
  full_name: string;
  email: string | null;
  onboarding_status: string;
  updated_at: string | null;
}

interface ChatLead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  source: string | null;
  chat_summary: string | null;
  status: string | null;
  created_at: string;
}

const OfficeManagerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pendingActivations, setPendingActivations] = useState<PendingActivation[]>([]);
  const [labPendingPatients, setLabPendingPatients] = useState<LabPendingPatient[]>([]);
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("patients");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsAdmin(hasClinicAdminRole((roles || []).map((r) => r.role)));
    })();
  }, []);

  const loadData = async () => {
    try {
      // Load all patients
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, onboarding_status, primary_program, created_at, is_archived")
        .order("created_at", { ascending: false });

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Load pending activations
      const { data: activationsData, error: activationsError } = await supabase
        .from("activation_links")
        .select("*")
        .eq("status", "pending")
        .order("sent_at", { ascending: false });

      if (activationsError) throw activationsError;
      setPendingActivations(activationsData || []);

      const { data: labData, error: labError } = await supabase
        .from("patients")
        .select("id, full_name, email, onboarding_status, updated_at")
        .in("onboarding_status", ["awaiting_blood_work", "labs_in_progress", "results_ready"])
        .order("updated_at", { ascending: false })
        .limit(50);

      if (labError) throw labError;
      setLabPendingPatients(labData || []);

      // Load chat leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("chat_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

    } catch (error: any) {
      console.error("Load error:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending_invite: { label: "Pending Invite", variant: "outline" },
      invited: { label: "Invited", variant: "outline" },
      intake_pending: { label: "Intake Pending", variant: "secondary" },
      pending_review: { label: "Pending Review", variant: "secondary" },
      consult_scheduled: { label: "Consult Scheduled", variant: "default" },
      pending_pharmacy_order: { label: "Pharmacy Pending", variant: "secondary" },
      treatment_active: { label: "Active", variant: "default" },
      rebooking_fee_required: { label: "Rebooking Fee", variant: "destructive" },
      subscription_canceled: { label: "Canceled", variant: "destructive" },
    };

    const config = statusConfig[status || ""] || { label: status || "Unknown", variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgramBadge = (program: string | null) => {
    if (!program) {
      return <Badge variant="outline">—</Badge>;
    }
    const p = program.toLowerCase();
    if (p.includes("weight") || p.includes("glp")) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Weight / GLP-1</Badge>;
    }
    if (p.includes("peptide")) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Peptides</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Hormone / Wellness</Badge>;
  };

  const getKitStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      not_ordered: { label: "Not Ordered", color: "bg-gray-100 text-gray-700" },
      ordered: { label: "Ordered", color: "bg-yellow-100 text-yellow-700" },
      shipped: { label: "Shipped", color: "bg-blue-100 text-blue-700" },
      sample_received: { label: "Sample Received", color: "bg-purple-100 text-purple-700" },
      analyzing: { label: "Analyzing", color: "bg-orange-100 text-orange-700" },
      results_ready: { label: "Results Ready", color: "bg-green-100 text-green-700" },
    };

    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = leadSearchTerm === "" || 
      lead.name?.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
      lead.phone?.includes(leadSearchTerm);
    const matchesStatus = leadStatusFilter === "all" || lead.status === leadStatusFilter;
    const matchesSource = leadSourceFilter === "all" || lead.source === leadSourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getLeadStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      qualified: { label: "Qualified", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      converted: { label: "Converted", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
      closed: { label: "Closed", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
    };
    const config = statusConfig[status || "new"] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSourceBadge = (source: string | null) => {
    if (source === "voice") {
      return <Badge variant="outline" className="gap-1"><Mic className="w-3 h-3" /> Voice</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><MessageSquare className="w-3 h-3" /> Chat</Badge>;
  };

  const stats = {
    total: patients.filter(p => !p.is_archived).length,
    active: patients.filter(p => p.onboarding_status === "treatment_active" && !p.is_archived).length,
    pending: patients.filter(p =>
      ["pending_review", "intake_pending", "pending_pharmacy_order", "consultation_paid", "consultation_pending"].includes(p.onboarding_status || "") && !p.is_archived
    ).length,
    pendingActivations: pendingActivations.length,
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "new").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar 
        title="Office Manager Dashboard" 
        subtitle="Patient Overview & Status"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Primary tools: book appointment + open schedule */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <h2 className="text-base font-semibold">Today's Schedule</h2>
            <p className="text-xs text-muted-foreground">Multi-provider day & week view, walk-ins, reschedules.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setBookingModalOpen(true)}
              className="gap-2"
            >
              <CalendarPlus className="w-4 h-4" /> Book Appointment
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/calendar">
                <Calendar className="w-4 h-4" /> Open Schedule
              </Link>
            </Button>
          </div>
        </div>

        <StaffBookingModal
          open={bookingModalOpen}
          onOpenChange={(open) => {
            setBookingModalOpen(open);
            if (!open) loadData();
          }}
          isAdmin={isAdmin}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Treatment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending Action</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingActivations}</p>
                  <p className="text-xs text-muted-foreground">Awaiting Payment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.newLeads}</p>
                  <p className="text-xs text-muted-foreground">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-5 mb-6 [&>button]:shrink-0 [&>button]:whitespace-nowrap">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">All Patients</span>
              <span className="sm:hidden">Patients</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">SMS Inbox</span>
              <span className="sm:hidden">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Leads ({leads.length})</span>
              <span className="sm:hidden">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="activations" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending ({pendingActivations.length})</span>
              <span className="sm:hidden">Pending</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">LabCorp ({labPendingPatients.length})</span>
              <span className="sm:hidden">Labs</span>
            </TabsTrigger>
          </TabsList>

          {/* All Patients Tab */}
          <TabsContent value="patients">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Patient Directory
                  </CardTitle>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            {searchTerm ? "No patients match your search" : "No patients found"}
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient) => (
                          <tr 
                            key={patient.id} 
                            className={`border-b border-border/30 hover:bg-muted/30 ${patient.is_archived ? "opacity-50" : ""}`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{patient.full_name}</p>
                                  {patient.is_archived && (
                                    <Badge variant="outline" className="text-xs">Archived</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                {patient.email && (
                                  <a 
                                    href={`mailto:${patient.email}`}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {patient.email}
                                  </a>
                                )}
                                {patient.phone && (
                                  <a 
                                    href={`tel:${patient.phone}`}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {patient.phone}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getProgramBadge(patient.primary_program)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(patient.onboarding_status)}
                            </td>
                            <td className="py-4 px-4 text-sm text-muted-foreground">
                              {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Activations Tab */}
          <TabsContent value="activations">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Payment Activations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Patients who received activation links but haven't completed payment
                </p>
              </CardHeader>
              <CardContent>
                {pendingActivations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">All activations complete!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Membership</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Monthly</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingActivations.map((activation) => {
                          const sentDate = new Date(activation.sent_at);
                          const daysWaiting = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <tr 
                              key={activation.id} 
                              className={`border-b border-border/30 ${daysWaiting >= 3 ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
                            >
                              <td className="py-4 px-4">
                                <p className="font-medium text-foreground">{activation.patient_name}</p>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <a 
                                    href={`mailto:${activation.patient_email}`}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {activation.patient_email}
                                  </a>
                                  {activation.patient_phone && (
                                    <a 
                                      href={`tel:${activation.patient_phone}`}
                                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {activation.patient_phone}
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="outline">{activation.base_membership}</Badge>
                                {activation.addon_tier !== "none" && (
                                  <Badge variant="secondary" className="ml-1">{activation.addon_tier}</Badge>
                                )}
                              </td>
                              <td className="py-4 px-4 font-medium">
                                ${activation.total_monthly}/mo
                              </td>
                              <td className="py-4 px-4 text-sm text-muted-foreground">
                                {sentDate.toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <Badge 
                                  variant={daysWaiting >= 3 ? "destructive" : "outline"}
                                  className={daysWaiting >= 3 ? "" : ""}
                                >
                                  {daysWaiting} day{daysWaiting !== 1 ? "s" : ""}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Inbox Tab */}
          <TabsContent value="sms">
            <SmsInbox />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Chat & Voice Leads
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Captured leads from website chat and voice assistant
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={leadSearchTerm}
                        onChange={(e) => setLeadSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="chatbot">Chat</SelectItem>
                        <SelectItem value="voice">Voice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {leads.length === 0 ? "No leads captured yet" : "No leads match your filters"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Lead</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Interest</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Captured</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => (
                          <tr 
                            key={lead.id} 
                            className={`border-b border-border/30 hover:bg-muted/30 ${lead.status === "new" ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  {lead.source === "voice" ? (
                                    <Mic className="w-5 h-5 text-purple-600" />
                                  ) : (
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{lead.name || "Unknown"}</p>
                                  {lead.chat_summary && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                      {lead.chat_summary}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                {lead.email && (
                                  <a 
                                    href={`mailto:${lead.email}`}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </a>
                                )}
                                {lead.phone && (
                                  <a 
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </a>
                                )}
                                {!lead.email && !lead.phone && (
                                  <span className="text-sm text-muted-foreground">No contact info</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {lead.interest ? (
                                <Badge variant="secondary" className="capitalize">
                                  {lead.interest}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {getSourceBadge(lead.source)}
                            </td>
                            <td className="py-4 px-4">
                              {getLeadStatusBadge(lead.status)}
                            </td>
                            <td className="py-4 px-4 text-sm text-muted-foreground">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LabCorp pipeline */}
          <TabsContent value="labs">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      LabCorp pipeline
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Patients awaiting draw, in progress, or results ready for provider review.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-2xl">{LABCORP_FLOW_HINT}</p>
                  </div>
                  <LabCorpPortalLink className="self-start shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                {labPendingPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No patients in lab pipeline</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labPendingPatients.map((p) => (
                          <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30">
                            <td className="py-4 px-4">
                              <p className="font-medium text-sm">{p.full_name}</p>
                              {p.email && (
                                <a href={`mailto:${p.email}`} className="text-xs text-muted-foreground hover:text-primary">
                                  {p.email}
                                </a>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary">{p.onboarding_status}</Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-muted-foreground">
                              {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OfficeManagerDashboard;
