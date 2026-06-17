import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, DollarSign, TrendingUp, Users, Package, 
  AlertTriangle, Clock, RefreshCw, ArrowRight, CreditCard,
  CheckCircle, XCircle, BarChart3, CalendarDays
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface StripeMetrics {
  mrr: number;
  cashCollectedThisMonth: number;
  activeSubscriptionCount: number;
  projectedRevenue: number;
  failedPayments: Array<{
    id: string;
    customerEmail: string | null;
    amountDue: number;
    dueDate: string | null;
    lastAttempt: string | null;
  }>;
}

interface FunnelMetrics {
  leads: number;
  diagnosticsPaid: number;
  activeMembers: number;
  conversionRate: number;
}

interface OperationalBlocker {
  id: string;
  type: "kit_to_ship" | "awaiting_upgrade" | "failed_payment";
  patientName: string;
  patientEmail: string;
  daysPending: number;
  details: string;
}

const BusinessDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stripeMetrics, setStripeMetrics] = useState<StripeMetrics | null>(null);
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics>({ leads: 0, diagnosticsPaid: 0, activeMembers: 0, conversionRate: 0 });
  const [blockers, setBlockers] = useState<OperationalBlocker[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadStripeMetrics(),
      loadFunnelMetrics(),
      loadBlockers(),
    ]);
    setIsLoading(false);
  };

  const loadStripeMetrics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke("get-business-metrics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        console.error("Stripe metrics error:", response.error);
        toast.error("Failed to load Stripe metrics");
        return;
      }

      setStripeMetrics(response.data);
    } catch (error) {
      console.error("Error loading Stripe metrics:", error);
    }
  };

  const loadFunnelMetrics = async () => {
    try {
      // Get leads count (invited patients)
      const { count: leadsCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("is_archived", false);

      const { count: diagnosticsCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .in("onboarding_status", ["awaiting_blood_work", "labs_in_progress", "results_ready", "labs_reviewed"])
        .eq("is_archived", false);

      // Get active members
      const { count: membersCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("onboarding_status", "treatment_active")
        .eq("is_archived", false);

      const diagnostics = diagnosticsCount || 0;
      const members = membersCount || 0;
      const conversionRate = diagnostics > 0 ? (members / diagnostics) * 100 : 0;

      setFunnelMetrics({
        leads: leadsCount || 0,
        diagnosticsPaid: diagnostics,
        activeMembers: members,
        conversionRate: Math.round(conversionRate),
      });
    } catch (error) {
      console.error("Error loading funnel metrics:", error);
    }
  };

  const loadBlockers = async () => {
    try {
      const blockersList: OperationalBlocker[] = [];
      const now = new Date();

      const { data: awaitingDraw } = await supabase
        .from("patients")
        .select("id, full_name, email, updated_at, onboarding_status")
        .eq("onboarding_status", "awaiting_blood_work")
        .eq("is_archived", false);

      if (awaitingDraw) {
        for (const p of awaitingDraw) {
          const updated = p.updated_at ? new Date(p.updated_at) : now;
          const daysPending = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
          blockersList.push({
            id: p.id,
            type: "kit_to_ship",
            patientName: p.full_name || "Unknown",
            patientEmail: p.email || "",
            daysPending,
            details: `Awaiting LabCorp draw (${daysPending}d in status)`,
          });
        }
      }

      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const { data: awaitingUpgrade } = await supabase
        .from("patients")
        .select("id, full_name, email, updated_at, onboarding_status")
        .eq("onboarding_status", "results_ready")
        .lt("updated_at", fortyEightHoursAgo.toISOString())
        .eq("is_archived", false);

      if (awaitingUpgrade) {
        for (const patient of awaitingUpgrade) {
          if (patient.onboarding_status !== "treatment_active") {
            const resultsReady = new Date(patient.updated_at!);
            const daysPending = Math.floor((now.getTime() - resultsReady.getTime()) / (1000 * 60 * 60 * 24));
            blockersList.push({
              id: patient.id,
              type: "awaiting_upgrade",
              patientName: patient.full_name || "Unknown",
              patientEmail: patient.email || "",
              daysPending,
              details: `Lab review complete ${daysPending} days ago, no membership`,
            });
          }
        }
      }

      // 3. Failed payments from Stripe (already loaded in stripeMetrics)
      // We'll add these after stripeMetrics loads

      setBlockers(blockersList);
    } catch (error) {
      console.error("Error loading blockers:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Combine DB blockers with Stripe failed payments
  const allBlockers = [
    ...blockers,
    ...(stripeMetrics?.failedPayments.map(fp => ({
      id: fp.id,
      type: "failed_payment" as const,
      patientName: fp.customerEmail?.split("@")[0] || "Unknown",
      patientEmail: fp.customerEmail || "",
      daysPending: fp.lastAttempt ? Math.floor((Date.now() - new Date(fp.lastAttempt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      details: `${formatCurrency(fp.amountDue)} failed payment`,
    })) || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar 
        title="Business Command Center" 
        subtitle="Revenue & Operations Dashboard"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <h2 className="text-base font-semibold">Patient Schedule</h2>
            <p className="text-xs text-muted-foreground">
              View and manage all clinic appointments — same calendar Kristen and Caroline use.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/calendar">
              <CalendarDays className="w-4 h-4" />
              Open Schedule
            </Link>
          </Button>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total MRR</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stripeMetrics ? formatCurrency(stripeMetrics.mrr) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stripeMetrics?.activeSubscriptionCount || 0} active subscriptions
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Cash This Month</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stripeMetrics ? formatCurrency(stripeMetrics.cashCollectedThisMonth) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Collected via Stripe
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Projected ARR</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stripeMetrics ? formatCurrency(stripeMetrics.projectedRevenue) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on current MRR
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${allBlockers.length > 0 ? 'from-amber-500/10 to-amber-500/5 border-amber-500/20' : 'from-green-500/10 to-green-500/5 border-green-500/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Action Items</p>
                  <p className="text-3xl font-bold text-foreground">
                    {allBlockers.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue blockers
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allBlockers.length > 0 ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                  <AlertTriangle className={`w-6 h-6 ${allBlockers.length > 0 ? 'text-amber-600' : 'text-green-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Health */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Funnel Health
            </CardTitle>
            <CardDescription>Patient conversion pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold">{funnelMetrics.leads}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold">{funnelMetrics.diagnosticsPaid}</p>
                <p className="text-sm text-muted-foreground">Paid $299 Diagnostic</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">{funnelMetrics.activeMembers}</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{funnelMetrics.conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Blockers */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              All Blockers ({allBlockers.length})
            </TabsTrigger>
            <TabsTrigger value="kits" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Kits to Ship ({blockers.filter(b => b.type === "kit_to_ship").length})
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Awaiting Upgrade ({blockers.filter(b => b.type === "awaiting_upgrade").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Operational Blockers</CardTitle>
                <CardDescription>Revenue opportunities stuck in pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                {allBlockers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No blockers! All systems operational.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allBlockers.map((blocker) => (
                      <div 
                        key={blocker.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          blocker.type === "failed_payment" 
                            ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
                            : blocker.daysPending > 3
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            blocker.type === "kit_to_ship" ? "bg-blue-100 dark:bg-blue-900/30" :
                            blocker.type === "awaiting_upgrade" ? "bg-purple-100 dark:bg-purple-900/30" :
                            "bg-red-100 dark:bg-red-900/30"
                          }`}>
                            {blocker.type === "kit_to_ship" && <Package className="w-5 h-5 text-blue-600" />}
                            {blocker.type === "awaiting_upgrade" && <Clock className="w-5 h-5 text-purple-600" />}
                            {blocker.type === "failed_payment" && <XCircle className="w-5 h-5 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{blocker.patientName}</p>
                            <p className="text-sm text-muted-foreground">{blocker.patientEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={blocker.daysPending > 3 ? "destructive" : "secondary"}>
                            {blocker.daysPending} days
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{blocker.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Kits Pending Shipment
                </CardTitle>
                <CardDescription>Legacy kit orders awaiting shipment (historical)</CardDescription>
              </CardHeader>
              <CardContent>
                {blockers.filter(b => b.type === "kit_to_ship").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>All kits have been shipped!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockers.filter(b => b.type === "kit_to_ship").map((blocker) => (
                      <div 
                        key={blocker.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          blocker.daysPending > 3 
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{blocker.patientName}</p>
                            <p className="text-sm text-muted-foreground">{blocker.patientEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={blocker.daysPending > 3 ? "destructive" : "secondary"}>
                            {blocker.daysPending} days waiting
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrades">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Awaiting Membership Upgrade
                </CardTitle>
                <CardDescription>Lab review done &gt;48 hours ago, no membership purchase</CardDescription>
              </CardHeader>
              <CardContent>
                {blockers.filter(b => b.type === "awaiting_upgrade").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No pending upgrades!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockers.filter(b => b.type === "awaiting_upgrade").map((blocker) => (
                      <div 
                        key={blocker.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          blocker.daysPending > 7 
                            ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{blocker.patientName}</p>
                            <p className="text-sm text-muted-foreground">{blocker.patientEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {blocker.daysPending} days since review
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Sales follow-up needed</p>
                        </div>
                      </div>
                    ))}
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

export default BusinessDashboard;
