import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Pill, 
  Phone, 
  Check, 
  Clock, 
  AlertTriangle,
  Calendar,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KitToShip {
  id: string;
  customer_email: string;
  customer_name?: string;
  created_at: string;
  zrt_kit_status: string;
}

interface ConsultationFollowUp {
  id: string;
  customer_email: string;
  customer_name: string | null;
  status: string;
  credit_code: string | null;
  created_at: string;
  booked_for: string | null;
}

interface PharmacyOrder {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  updated_at: string | null;
}

const StaffTasksTab = () => {
  const [kitsToShip, setKitsToShip] = useState<KitToShip[]>([]);
  const [consultationFollowUps, setConsultationFollowUps] = useState<ConsultationFollowUp[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Load kits that need to be shipped (status = 'Ordered' or 'pending')
      const { data: kits } = await supabase
        .from("hormone_mapping_payments")
        .select("id, customer_email, created_at, zrt_kit_status")
        .eq("payment_status", "paid")
        .in("zrt_kit_status", ["not_ordered", "Ordered"])
        .order("created_at", { ascending: true });

      setKitsToShip((kits || []) as KitToShip[]);

      // Load consultation follow-ups (pending consultations that need scheduling or completed ones needing nurture)
      const { data: consultations } = await supabase
        .from("consultation_bookings")
        .select("id, customer_email, customer_name, status, credit_code, created_at, booked_for")
        .in("status", ["pending", "completed", "nurture"])
        .order("created_at", { ascending: true });

      setConsultationFollowUps((consultations || []) as ConsultationFollowUp[]);

      // Load pharmacy orders pending
      const { data: pharmacy } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, updated_at")
        .eq("onboarding_status", "pending_pharmacy_order")
        .order("updated_at", { ascending: true });

      setPharmacyOrders((pharmacy || []) as PharmacyOrder[]);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load staff tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const markKitShipped = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("hormone_mapping_payments")
        .update({ zrt_kit_status: "Shipped", shipped_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Kit marked as shipped");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update kit status");
    } finally {
      setProcessingId(null);
    }
  };

  const markConsultationScheduled = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({ status: "scheduled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Consultation marked as scheduled");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const markPharmacyOrdered = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ onboarding_status: "treatment_active" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Pharmacy order marked complete");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const getDaysWaiting = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  const totalTasks = kitsToShip.length + consultationFollowUps.length + pharmacyOrders.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{kitsToShip.length}</p>
                <p className="text-sm text-green-600">Kits to Ship</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{consultationFollowUps.length}</p>
                <p className="text-sm text-blue-600">Consultation Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Pill className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{pharmacyOrders.length}</p>
                <p className="text-sm text-purple-600">Pharmacy Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalTasks === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-12 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700">All Caught Up!</h3>
            <p className="text-green-600">No pending staff tasks at this time.</p>
          </CardContent>
        </Card>
      )}

      {/* Kits to Ship */}
      {kitsToShip.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Kits to Ship
              <Badge variant="secondary" className="bg-green-100 text-green-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kitsToShip.map((kit) => {
                const daysWaiting = getDaysWaiting(kit.created_at);
                return (
                  <div 
                    key={kit.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 2 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{kit.customer_email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Paid {daysWaiting} day(s) ago</span>
                        {daysWaiting > 2 && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => markKitShipped(kit.id)}
                      disabled={processingId === kit.id}
                    >
                      {processingId === kit.id ? "..." : "Mark Shipped"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Follow-ups */}
      {consultationFollowUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Consultation Follow-ups
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationFollowUps.map((consult) => {
                const daysWaiting = getDaysWaiting(consult.created_at);
                return (
                  <div 
                    key={consult.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 3 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{consult.customer_name || consult.customer_email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Status: {consult.status}</span>
                        {consult.credit_code && (
                          <Badge variant="outline" className="text-green-600">
                            Credit: {consult.credit_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Paid {daysWaiting} day(s) ago</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {consult.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markConsultationScheduled(consult.id)}
                          disabled={processingId === consult.id}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Mark Scheduled
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Orders */}
      {pharmacyOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-600" />
              Pharmacy Orders to Place
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pharmacyOrders.map((order) => {
                const daysWaiting = order.updated_at ? getDaysWaiting(order.updated_at) : 0;
                return (
                  <div 
                    key={order.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 1 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                      {order.phone && (
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => markPharmacyOrdered(order.id)}
                      disabled={processingId === order.id}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {processingId === order.id ? "..." : "Order Placed"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 text-sm">Task Legend</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              <span>Staff Task (can be delegated)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gold/20 border border-gold" />
              <span>Provider Task (clinical decision)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300" />
              <span>Overdue - needs attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffTasksTab;
