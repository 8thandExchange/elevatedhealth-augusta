import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Phone, 
  Mail, 
  Gift, 
  Clock, 
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConsultationBooking {
  id: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount_paid: number | null;
  status: string;
  credit_code: string | null;
  credit_used_at: string | null;
  follow_up_date: string | null;
  notes: string | null;
  service_type: string | null;
  created_at: string;
  booked_for: string | null;
}

const ConsultationTracker = () => {
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationBooking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("consultation_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Error loading consultations:", error);
      toast.error("Failed to load consultations");
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsultation = async () => {
    if (!selectedConsultation) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({
          status: editStatus,
          notes: editNotes,
        })
        .eq("id", selectedConsultation.id);

      if (error) throw error;
      toast.success("Consultation updated");
      loadConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      toast.error("Failed to update consultation");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Pending Booking</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-blue-600 border-blue-400">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-400">Completed</Badge>;
      case "converted_to_mapping":
        return <Badge className="bg-green-600">Converted to Mapping</Badge>;
      case "nurture":
        return <Badge variant="outline" className="text-purple-600 border-purple-400">In Nurture</Badge>;
      case "lost":
        return <Badge variant="outline" className="text-red-600 border-red-400">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const filteredConsultations = filterStatus === "all" 
    ? consultations 
    : consultations.filter(c => c.status === filterStatus);

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.status === "pending").length,
    scheduled: consultations.filter(c => c.status === "scheduled").length,
    completed: consultations.filter(c => c.status === "completed").length,
    converted: consultations.filter(c => c.status === "converted_to_mapping").length,
  };

  const conversionRate = stats.total > 0 
    ? Math.round((stats.converted / stats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-yellow-600">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p>
            <p className="text-xs text-blue-600">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
            <p className="text-xs text-green-600">Converted</p>
          </CardContent>
        </Card>
        <Card className="bg-gold/10 border-gold/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gold">{conversionRate}%</p>
            <p className="text-xs text-gold">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consultations</SelectItem>
            <SelectItem value="pending">Pending Booking</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="converted_to_mapping">Converted</SelectItem>
            <SelectItem value="nurture">In Nurture</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={loadConsultations}>
          Refresh
        </Button>
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Discovery Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No consultations found</p>
          ) : (
            <div className="space-y-3">
              {filteredConsultations.map((consult) => (
                <div 
                  key={consult.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConsultation?.id === consult.id ? "border-gold bg-gold/5" : ""
                  }`}
                  onClick={() => {
                    setSelectedConsultation(consult);
                    setEditNotes(consult.notes || "");
                    setEditStatus(consult.status);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {consult.customer_name || consult.customer_email}
                        </span>
                        {getStatusBadge(consult.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {consult.customer_email}
                        </span>
                        {consult.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {consult.customer_phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getDaysAgo(consult.created_at)}
                        </span>
                        {consult.credit_code && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Gift className="h-3 w-3" />
                            {consult.credit_code}
                            {consult.credit_used_at && " (Used)"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${consult.amount_paid || 99}</p>
                      <p className="text-xs text-muted-foreground">{consult.service_type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Panel */}
      {selectedConsultation && (
        <Card className="border-gold">
          <CardHeader>
            <CardTitle className="text-lg">
              Edit: {selectedConsultation.customer_name || selectedConsultation.customer_email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Booking</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="converted_to_mapping">Converted to Mapping</SelectItem>
                  <SelectItem value="nurture">In Nurture</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this consultation..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={updateConsultation} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedConsultation(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultationTracker;
