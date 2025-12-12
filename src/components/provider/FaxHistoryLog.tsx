import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, RefreshCw, CheckCircle, Clock, XCircle, Send, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface ProtocolSnapshot {
  medication?: string;
  strength?: string;
  quantity?: string;
  refills?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
}

interface FaxOrder {
  id: string;
  patient_id: string;
  status: string;
  protocol_snapshot: ProtocolSnapshot | null;
  fax_sent_at: string | null;
  fax_id: string | null;
  fax_status: string | null;
  fax_destination: string | null;
  fax_error: string | null;
  created_at: string;
  patient?: {
    full_name: string;
  };
}

const FaxHistoryLog = () => {
  const [orders, setOrders] = useState<FaxOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadFaxHistory();
  }, []);

  const loadFaxHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          patient_id,
          status,
          protocol_snapshot,
          fax_sent_at,
          fax_id,
          fax_status,
          fax_destination,
          fax_error,
          created_at,
          patients (full_name)
        `)
        .not("fax_sent_at", "is", null)
        .order("fax_sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedOrders: FaxOrder[] = (data || []).map(order => ({
        id: order.id,
        patient_id: order.patient_id,
        status: order.status || "",
        protocol_snapshot: order.protocol_snapshot as ProtocolSnapshot | null,
        fax_sent_at: order.fax_sent_at,
        fax_id: order.fax_id,
        fax_status: order.fax_status,
        fax_destination: order.fax_destination,
        fax_error: order.fax_error,
        created_at: order.created_at || "",
        patient: order.patients as { full_name: string } | undefined,
      }));

      setOrders(formattedOrders);
    } catch (error: any) {
      toast.error("Failed to load fax history");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryFax = async (order: FaxOrder) => {
    if (!order.protocol_snapshot) {
      toast.error("No prescription data to retry");
      return;
    }

    setRetryingId(order.id);
    try {
      // Get patient details
      const { data: patient } = await supabase
        .from("patients")
        .select("full_name, dob, street_address, city, state, zip_code, allergies")
        .eq("id", order.patient_id)
        .single();

      if (!patient) throw new Error("Patient not found");

      const { data: { user } } = await supabase.auth.getUser();

      const snapshot = order.protocol_snapshot;
      const response = await supabase.functions.invoke("send-rx-fax", {
        body: {
          patientId: order.patient_id,
          patientName: patient.full_name,
          patientDob: patient.dob,
          patientAddress: [patient.street_address, patient.city, patient.state, patient.zip_code]
            .filter(Boolean)
            .join(", "),
          patientAllergies: patient.allergies || "NKDA",
          medicationName: snapshot.medication || "",
          strength: snapshot.strength || "",
          quantity: snapshot.quantity || "",
          refills: snapshot.refills || "0",
          diagnosis_code: snapshot.diagnosis_code || "",
          diagnosis_description: snapshot.diagnosis_description || "",
          providerEmail: user?.email || "",
        },
      });

      if (response.error) throw response.error;

      toast.success("Fax retry initiated");
      await loadFaxHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to retry fax");
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (faxStatus: string | null) => {
    switch (faxStatus) {
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case "sending":
      case "queued":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Sending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fax History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Fax History
        </CardTitle>
        <Button variant="outline" size="sm" onClick={loadFaxHistory}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No faxed prescriptions yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.patient?.full_name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {order.protocol_snapshot?.medication || "N/A"}
                    {order.protocol_snapshot?.strength && (
                      <span className="text-muted-foreground text-sm ml-1">
                        {order.protocol_snapshot.strength}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.fax_sent_at
                      ? format(new Date(order.fax_sent_at), "MMM d, h:mm a")
                      : "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.fax_status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.fax_destination || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.fax_status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryFax(order)}
                        disabled={retryingId === order.id}
                      >
                        {retryingId === order.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry
                          </>
                        )}
                      </Button>
                    )}
                    {order.fax_error && (
                      <p className="text-xs text-red-600 mt-1">{order.fax_error}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FaxHistoryLog;
