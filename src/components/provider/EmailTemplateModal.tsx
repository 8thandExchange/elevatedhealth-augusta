import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, Edit, RotateCcw, Send, Mail, MessageSquare, Zap } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  template_key: string;
  category: string;
  subject: string;
  body_html: string;
  sms_text: string | null;
  merge_fields: string[];
}

interface EmailTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  templateKey: string;
  onSuccess?: () => void;
}

type DeliveryMethod = "email" | "sms" | "both";

const EmailTemplateModal = ({ 
  open, 
  onOpenChange, 
  patient, 
  templateKey,
  onSuccess 
}: EmailTemplateModalProps) => {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [editedSms, setEditedSms] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    if (open && templateKey) {
      loadTemplate();
    }
  }, [open, templateKey]);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", templateKey)
        .single();

      if (error) throw error;
      
      setTemplate(data as EmailTemplate);
      setEditedSubject(data.subject);
      setEditedBody(data.body_html);
      setEditedSms(data.sms_text || "");
    } catch (err) {
      console.error("Error loading template:", err);
      toast.error("Failed to load email template");
    } finally {
      setIsLoading(false);
    }
  };

  const mergePlaceholders = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\{\{patient_name\}\}/g, patient.full_name)
      .replace(/\{\{first_name\}\}/g, patient.full_name.split(" ")[0])
      .replace(/\{\{email\}\}/g, patient.email || "")
      .replace(/\{\{phone\}\}/g, patient.phone || "")
      .replace(/\{\{clinic_phone\}\}/g, "(706) 922-7454")
      .replace(/\{\{payment_link\}\}/g, "[Payment Link]")
      .replace(/\{\{portal_link\}\}/g, "[Portal Link]");
  };

  const resetToDefault = () => {
    if (template) {
      setEditedSubject(template.subject);
      setEditedBody(template.body_html);
      setEditedSms(template.sms_text || "");
      setIsEditing(false);
      setActiveTab("preview");
    }
  };

  const handleSend = async () => {
    if (!template) return;
    
    setIsSending(true);
    try {
      // Log the communication
      const { error: logError } = await supabase
        .from("communication_logs")
        .insert({
          patient_id: patient.id,
          template_key: template.template_key,
          subject: mergePlaceholders(editedSubject),
          body_preview: mergePlaceholders(editedBody).substring(0, 200),
          delivery_method: deliveryMethod,
        });

      if (logError) console.error("Failed to log communication:", logError);

      // Call the appropriate edge function based on template type
      const functionName = getEdgeFunctionName(template.template_key);
      
      if (deliveryMethod === "email" || deliveryMethod === "both") {
        const { error } = await supabase.functions.invoke(functionName, {
          body: {
            patient_id: patient.id,
            patient_name: patient.full_name,
            patient_email: patient.email,
            first_name: patient.full_name.split(" ")[0],
            custom_subject: isEditing ? editedSubject : undefined,
            custom_body: isEditing ? editedBody : undefined,
          },
        });
        if (error) throw error;
      }

      if ((deliveryMethod === "sms" || deliveryMethod === "both") && patient.phone) {
        const smsFunction = getSmsEdgeFunctionName(template.template_key);
        if (smsFunction) {
          const { error } = await supabase.functions.invoke(smsFunction, {
            body: {
              patient_id: patient.id,
              patient_name: patient.full_name,
              patient_phone: patient.phone,
              first_name: patient.full_name.split(" ")[0],
              custom_message: isEditing ? editedSms : undefined,
            },
          });
          if (error) throw error;
        }
      }

      toast.success(`Message sent to ${patient.full_name}!`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Send error:", err);
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const getEdgeFunctionName = (key: string): string => {
    const functionMap: Record<string, string> = {
      welcome: "send-welcome-email",
      consultation_invite: "send-consultation-invite",
      kit_payment: "send-kit-payment-link",
      labs_reviewed: "send-labs-reviewed-notification",
      treatment_authorized: "send-treatment-authorized",
      intake_reminder: "send-intake-reminder",
      appointment_reminder: "send-appointment-reminder",
    };
    return functionMap[key] || "send-welcome-email";
  };

  const getSmsEdgeFunctionName = (key: string): string | null => {
    const functionMap: Record<string, string> = {
      welcome: "send-welcome-sms",
      kit_payment: "send-kit-payment-sms",
      labs_reviewed: "send-labs-reviewed-sms",
    };
    return functionMap[key] || null;
  };

  const canSendSms = template?.sms_text && patient.phone;
  const canSendEmail = patient.email;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {template?.name || "Email Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Recipient Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="font-medium">{patient.full_name}</p>
            <div className="text-sm text-muted-foreground flex gap-4">
              <span>✉️ {patient.email || "No email"}</span>
              <span>📱 {patient.phone || "No phone"}</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "edit")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4 mt-4">
              {/* Email Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <p className="text-sm font-medium">Subject: {mergePlaceholders(editedSubject)}</p>
                </div>
                <div 
                  className="p-4 bg-white text-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: mergePlaceholders(editedBody) }}
                />
              </div>

              {/* SMS Preview */}
              {editedSms && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <p className="text-sm font-medium">SMS Message</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20">
                    <p className="text-sm">{mergePlaceholders(editedSms)}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input 
                  value={editedSubject}
                  onChange={(e) => {
                    setEditedSubject(e.target.value);
                    setIsEditing(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body (HTML)</Label>
                <Textarea 
                  value={editedBody}
                  onChange={(e) => {
                    setEditedBody(e.target.value);
                    setIsEditing(true);
                  }}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {template?.sms_text && (
                <div className="space-y-2">
                  <Label>SMS Message</Label>
                  <Textarea 
                    value={editedSms}
                    onChange={(e) => {
                      setEditedSms(e.target.value);
                      setIsEditing(true);
                    }}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedSms.length}/160 characters
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <span className="font-medium">Available Merge Fields:</span>
                {template?.merge_fields?.map((field) => (
                  <code key={field} className="bg-background px-1.5 py-0.5 rounded text-xs">
                    {`{{${field}}}`}
                  </code>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Delivery Method */}
          <div className="space-y-2">
            <Label>Send via</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={deliveryMethod === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeliveryMethod("email")}
                disabled={!canSendEmail}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button
                type="button"
                variant={deliveryMethod === "sms" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeliveryMethod("sms")}
                disabled={!canSendSms}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                SMS
              </Button>
              <Button
                type="button"
                variant={deliveryMethod === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeliveryMethod("both")}
                disabled={!canSendEmail || !canSendSms}
                className="flex-1"
              >
                <Zap className="w-4 h-4 mr-1" />
                Both
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button variant="ghost" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
                  Personalized
                </span>
              </>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            disabled={isSending || (!canSendEmail && !canSendSms)}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send {deliveryMethod === "both" ? "Both" : deliveryMethod === "sms" ? "SMS" : "Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateModal;