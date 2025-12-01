import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut, AlertTriangle, Check, User, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import confetti from "canvas-confetti";

interface Patient {
  id: string;
  full_name: string;
  safety_flags: any;
  current_protocol: string | null;
}

interface Order {
  id: string;
  patient_id: string;
  status: string;
  protocol_snapshot: any;
  created_at: string;
  patients: Patient;
}

interface SymptomLog {
  id: string;
  date_logged: string;
  estrogen_score: number;
  progesterone_score: number;
  androgen_score: number;
  cortisol_score: number;
}

interface Protocol {
  id: string;
  name: string;
  primary_compound: string;
  dispenser_type: string;
  instructions: string;
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientLogs, setPatientLogs] = useState<SymptomLog[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [recommendedProtocol, setRecommendedProtocol] = useState<Protocol | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Check for admin/staff role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
      if (!hasAccess) {
        toast.error("Access denied");
        navigate("/admin/login");
        return;
      }

      await loadData();
    } catch (error: any) {
      toast.error(error.message);
      navigate("/admin/login");
    }
  };

  const loadData = async () => {
    try {
      // Load pending orders with patient info
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          patients (*)
        `)
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setPendingOrders(ordersData || []);

      // Load protocols
      const { data: protocolsData } = await supabase
        .from("protocols")
        .select("*");
      
      setProtocols(protocolsData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = async (order: Order) => {
    setSelectedPatient(order.patients);

    // Load patient's symptom logs
    const { data: logs } = await supabase
      .from("symptom_logs")
      .select("*")
      .eq("patient_id", order.patient_id)
      .order("date_logged", { ascending: true });

    setPatientLogs(logs || []);

    // Determine recommended protocol based on highest score
    if (logs && logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      const scores = {
        estrogen: latestLog.estrogen_score,
        progesterone: latestLog.progesterone_score,
        androgen: latestLog.androgen_score,
        cortisol: latestLog.cortisol_score,
      };

      const highestCategory = Object.entries(scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];

      let recommended: Protocol | undefined;
      if (highestCategory === "estrogen") {
        recommended = protocols.find(p => p.name.includes("Menopause"));
      } else if (highestCategory === "androgen") {
        recommended = protocols.find(p => p.name.includes("Vitality"));
      } else if (highestCategory === "progesterone") {
        recommended = protocols.find(p => p.name.includes("Balance"));
      } else {
        recommended = protocols.find(p => p.name.includes("Adrenal"));
      }

      setRecommendedProtocol(recommended || null);
    }
  };

  const authorizeOrder = async (orderId: string) => {
    setIsAuthorizing(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "authorized" })
        .eq("id", orderId);

      if (error) throw error;

      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success("Order authorized successfully!");
      
      // Refresh data
      await loadData();
      setSelectedPatient(null);
      setPatientLogs([]);
      setRecommendedProtocol(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const chartData = patientLogs.map(log => ({
    date: new Date(log.date_logged).toLocaleDateString(),
    Estrogen: log.estrogen_score,
    Progesterone: log.progesterone_score,
    Androgen: log.androgen_score,
    Cortisol: log.cortisol_score,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Provider Portal</p>
            <h1 className="font-cormorant text-2xl text-foreground">Patient Management</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pending Reviews */}
          <div className="space-y-4">
            <h2 className="font-cormorant text-xl text-foreground">Pending Reviews</h2>
            {pendingOrders.length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No pending reviews</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => {
                const hasSafetyFlags = order.patients.safety_flags && 
                  Array.isArray(order.patients.safety_flags) && 
                  order.patients.safety_flags.length > 0;

                return (
                  <Card 
                    key={order.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient?.id === order.patient_id 
                        ? "ring-2 ring-primary" 
                        : ""
                    } ${hasSafetyFlags ? "border-red-500 border-2" : "border-border/50"}`}
                    onClick={() => selectPatient(order)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.patients.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {hasSafetyFlags && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      {hasSafetyFlags && (
                        <div className="mt-2 text-xs text-red-500">
                          Safety: {order.patients.safety_flags.join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Center Panel - Trends */}
          <div className="space-y-4">
            <h2 className="font-cormorant text-xl text-foreground">Symptom Trends</h2>
            <Card className="bg-card border-border/50">
              <CardContent className="pt-6">
                {selectedPatient && patientLogs.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Estrogen" stroke="#ec4899" strokeWidth={2} />
                        <Line type="monotone" dataKey="Progesterone" stroke="#a855f7" strokeWidth={2} />
                        <Line type="monotone" dataKey="Androgen" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="Cortisol" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select a patient to view trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Prescription Pad */}
          <div className="space-y-4">
            <h2 className="font-cormorant text-xl text-foreground">Prescription Pad</h2>
            <Card className="bg-card border-border/50">
              <CardContent className="pt-6">
                {selectedPatient && recommendedProtocol ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-widest text-gold mb-2">
                        Recommended Protocol
                      </p>
                      <h3 className="font-cormorant text-xl text-foreground">
                        {recommendedProtocol.name}
                      </h3>
                    </div>

                    {/* Dispenser Visual */}
                    <div className="flex justify-center py-4">
                      <div className={`w-20 h-32 rounded-xl flex items-center justify-center shadow-lg ${
                        recommendedProtocol.dispenser_type === "Pink Topiclick"
                          ? "bg-gradient-to-b from-pink-300 to-pink-500"
                          : recommendedProtocol.dispenser_type === "Blue Topiclick"
                          ? "bg-gradient-to-b from-blue-300 to-blue-500"
                          : "bg-gradient-to-b from-gray-300 to-gray-500"
                      }`}>
                        <span className="text-white text-xs font-medium rotate-90 tracking-wider">
                          {recommendedProtocol.dispenser_type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Compound:</span> {recommendedProtocol.primary_compound}</p>
                      <p><span className="text-muted-foreground">Instructions:</span> {recommendedProtocol.instructions}</p>
                    </div>

                    <Button 
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        const order = pendingOrders.find(o => o.patient_id === selectedPatient.id);
                        if (order) authorizeOrder(order.id);
                      }}
                      disabled={isAuthorizing}
                    >
                      {isAuthorizing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Authorize & Send Order
                    </Button>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
                    <p>Select a patient to view recommended protocol</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;