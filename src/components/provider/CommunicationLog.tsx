import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare, Zap, Clock, RefreshCw, Send } from "lucide-react";
import { format } from "date-fns";

interface CommunicationLogEntry {
  id: string;
  template_key: string | null;
  subject: string | null;
  body_preview: string | null;
  delivery_method: string;
  status: string;
  sent_at: string;
}

interface CommunicationLogProps {
  patientId: string;
  onResend?: (entry: CommunicationLogEntry) => void;
}

// Includes both current and legacy template keys. Legacy keys remain
// labeled here so historical communication-log rows render meaningfully
// in the patient timeline. Do not surface legacy keys in NEW send paths
// (see QuickEmailModal MESSAGE_TYPES for the live list).
const TEMPLATE_LABELS: Record<string, string> = {
  welcome: "Welcome Email",
  consultation_invite: "Wellness Assessment Invite",
  labs_reviewed: "Labs Reviewed",
  treatment_authorized: "Treatment Authorized",
  intake_reminder: "Intake Reminder",
  appointment_reminder: "Appointment Reminder",
  membership_activation: "ELEVATED Program Activation",
  glp1_activation: "GLP-1 Activation",
  // Legacy (Réveil-era) template keys — historical rows only:
  kit_payment: "Kit Payment Request (legacy)",
  vitality_activation: "Vitality Activation (legacy)",
  hormone_addon: "Hormone Add-On (legacy)",
};

const CommunicationLog = ({ patientId, onResend }: CommunicationLogProps) => {
  const [logs, setLogs] = useState<CommunicationLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [patientId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("communication_logs")
        .select("*")
        .eq("patient_id", patientId)
        .order("sent_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error loading communication logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case "sms":
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case "both":
        return <Zap className="w-4 h-4 text-primary" />;
      default:
        return <Mail className="w-4 h-4 text-blue-600" />;
    }
  };

  const getDeliveryLabel = (method: string) => {
    switch (method) {
      case "sms":
        return "SMS";
      case "both":
        return "Email + SMS";
      default:
        return "Email";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Communication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Communication History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadLogs}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages sent yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    {getDeliveryIcon(log.delivery_method)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {log.template_key 
                          ? TEMPLATE_LABELS[log.template_key] || log.template_key
                          : log.subject || "Message"}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {getDeliveryLabel(log.delivery_method)}
                      </Badge>
                    </div>
                    {log.subject && log.template_key && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {log.subject}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.sent_at), "MMM d, h:mm a")}
                      </span>
                      <Badge 
                        variant={log.status === "sent" ? "outline" : "secondary"}
                        className="text-[10px] px-1.5"
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                  {onResend && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onResend(log)}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunicationLog;