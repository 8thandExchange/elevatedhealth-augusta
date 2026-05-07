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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Mail, Send, MessageSquare, Zap, Eye, Edit, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface QuickEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type DeliveryMethod = "email" | "sms" | "both";

interface EmailTemplate {
  id: string;
  name: string;
  template_key: string;
  subject: string;
  body_html: string;
  sms_text: string | null;
  merge_fields: string[];
}

const MESSAGE_TYPES = [
  { 
    value: "welcome", 
    label: "Welcome", 
    description: "Welcome to Elevated Health Augusta + portal access",
    emailFunction: "send-welcome-email",
    smsFunction: "send-welcome-sms",
  },
  { 
    value: "consultation_invite", 
    label: "$79 RN Assessment Invite", 
    description: "Send $79 Wellness Assessment payment link",
    emailFunction: "send-consultation-invite",
    smsFunction: "send-consultation-invite-sms",
  },
  { 
    value: "kit_payment", 
    label: "Kit Payment Request", 
    description: "Request payment for hormone mapping kit",
    emailFunction: "send-kit-payment-link",
    smsFunction: "send-kit-payment-sms",
  },
  { 
    value: "labs_reviewed", 
    label: "Labs Reviewed", 
    description: "Notify patient their labs are ready",
    emailFunction: "send-labs-reviewed-notification",
    smsFunction: "send-labs-reviewed-sms",
  },
  { 
    value: "vitality_activation", 
    label: "Vitality Activation", 
    description: "Send $249/mo Vitality membership link",
    emailFunction: "send-vitality-activation",
    smsFunction: "send-vitality-activation-sms",
  },
  { 
    value: "glp1_activation", 
    label: "GLP-1 Activation", 
    description: "Send Semaglutide/Tirzepatide payment link",
    emailFunction: "send-glp1-activation",
    smsFunction: "send-glp1-activation-sms",
  },
  { 
    value: "hormone_addon", 
    label: "Hormone Add-On", 
    description: "Send $149/mo hormone add-on link (GLP-1 members)",
    emailFunction: "send-hormone-addon-activation",
    smsFunction: "send-hormone-addon-sms",
  },
  { 
    value: "iv_ketamine", 
    label: "IV Ketamine Payment", 
    description: "Send $400 IV ketamine payment link",
    emailFunction: "send-iv-ketamine-payment-email",
    smsFunction: "send-iv-ketamine-payment-sms",
  },
  { 
    value: "intake_reminder", 
    label: "Intake Reminder", 
    description: "Remind patient to complete intake forms",
    emailFunction: "send-intake-reminder",
    smsFunction: null,
  },
];

const QuickEmailModal = ({ open, onOpenChange, onSuccess }: QuickEmailModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messageType, setMessageType] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Preview/Edit state
  const [step, setStep] = useState<"select" | "preview">("select");
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [editedSms, setEditedSms] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchPatients();
    }
  }, [searchQuery, open]);

  const searchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email, phone")
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = async () => {
    if (!messageType) return;
    
    setIsLoadingTemplate(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", messageType)
        .single();

      if (error) {
        // Template not found in DB, use defaults
        console.log("Template not found in DB, using default");
        setTemplate(null);
        setEditedSubject(getDefaultSubject(messageType));
        setEditedBody(getDefaultBody(messageType));
        setEditedSms(getDefaultSms(messageType));
      } else {
        setTemplate(data as EmailTemplate);
        setEditedSubject(data.subject);
        setEditedBody(data.body_html);
        setEditedSms(data.sms_text || "");
      }
    } catch (err) {
      console.error("Error loading template:", err);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const getDefaultSubject = (type: string): string => {
    const subjects: Record<string, string> = {
      welcome: "Welcome to Elevated Health Augusta, {{patient_name}}!",
      consultation_invite: "Your $79 Wellness Assessment Awaits",
      kit_payment: "Complete Your Lab Kit Payment",
      labs_reviewed: "Your Lab Results Are Ready",
      vitality_activation: "Your Vitality Membership Awaits",
      glp1_activation: "Start Your Weight Loss Journey",
      hormone_addon: "Add Hormone Therapy to Your Plan",
      iv_ketamine: "IV Ketamine Therapy Payment",
      intake_reminder: "Complete Your Health Intake",
    };
    return subjects[type] || "Message from Elevated Health Augusta";
  };

  const getDefaultBody = (type: string): string => {
    return `<p>Dear {{patient_name}},</p><p>Thank you for choosing Elevated Health Augusta.</p><p>Questions? Call (706) 760-3470</p>`;
  };

  const getDefaultSms = (type: string): string => {
    return `Hi {{first_name}}, thank you for choosing Elevated Health Augusta! Questions? Call (706) 760-3470`;
  };

  const mergePlaceholders = (text: string) => {
    if (!text || !selectedPatient) return text || "";
    return text
      .replace(/\{\{patient_name\}\}/g, selectedPatient.full_name)
      .replace(/\{\{first_name\}\}/g, selectedPatient.full_name.split(" ")[0])
      .replace(/\{\{email\}\}/g, selectedPatient.email || "")
      .replace(/\{\{phone\}\}/g, selectedPatient.phone || "")
      .replace(/\{\{clinic_phone\}\}/g, "(706) 760-3470")
      .replace(/\{\{payment_link\}\}/g, "[Payment Link]")
      .replace(/\{\{portal_link\}\}/g, "[Portal Link]");
  };

  const handleProceedToPreview = async () => {
    await loadTemplate();
    setStep("preview");
  };

  const handleBackToSelect = () => {
    setStep("select");
    setIsEditing(false);
    setActiveTab("preview");
  };

  const resetToDefault = () => {
    if (template) {
      setEditedSubject(template.subject);
      setEditedBody(template.body_html);
      setEditedSms(template.sms_text || "");
    } else {
      setEditedSubject(getDefaultSubject(messageType));
      setEditedBody(getDefaultBody(messageType));
      setEditedSms(getDefaultSms(messageType));
    }
    setIsEditing(false);
    setActiveTab("preview");
  };

  const selectedMessageInfo = MESSAGE_TYPES.find(m => m.value === messageType);
  
  const canSendSms = selectedMessageInfo?.smsFunction !== null;
  const canSendEmail = selectedMessageInfo?.emailFunction !== null;
  const canSendBoth = canSendEmail && canSendSms;

  const hasRequiredContact = () => {
    if (!selectedPatient) return false;
    if (deliveryMethod === "email") return !!selectedPatient.email;
    if (deliveryMethod === "sms") return !!selectedPatient.phone;
    if (deliveryMethod === "both") return !!selectedPatient.email && !!selectedPatient.phone;
    return false;
  };

  const getMissingContactMessage = () => {
    if (!selectedPatient) return "";
    if (deliveryMethod === "email" && !selectedPatient.email) return "No email address on file";
    if (deliveryMethod === "sms" && !selectedPatient.phone) return "No phone number on file";
    if (deliveryMethod === "both") {
      if (!selectedPatient.email && !selectedPatient.phone) return "No email or phone on file";
      if (!selectedPatient.email) return "No email address on file (SMS will still send)";
      if (!selectedPatient.phone) return "No phone number on file (Email will still send)";
    }
    return "";
  };

  const handleSend = async () => {
    if (!selectedPatient || !messageType || !selectedMessageInfo) {
      toast.error("Please select a patient and message type");
      return;
    }

    setIsSending(true);
    const results: { email?: boolean; sms?: boolean } = {};
    
    try {
      const payload = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.full_name,
        patient_email: selectedPatient.email,
        patient_phone: selectedPatient.phone,
        first_name: selectedPatient.full_name.split(" ")[0],
        send_email: true,
        custom_subject: isEditing ? editedSubject : undefined,
        custom_body: isEditing ? editedBody : undefined,
        custom_sms: isEditing ? editedSms : undefined,
      };

      // Log the communication
      try {
        await supabase
          .from("communication_logs")
          .insert({
            patient_id: selectedPatient.id,
            template_key: messageType,
            subject: mergePlaceholders(editedSubject),
            body_preview: mergePlaceholders(editedBody).substring(0, 200).replace(/<[^>]*>/g, ''),
            delivery_method: deliveryMethod,
          });
      } catch (logErr) {
        console.error("Failed to log communication:", logErr);
      }

      // Send Email
      if ((deliveryMethod === "email" || deliveryMethod === "both") && selectedPatient.email && selectedMessageInfo.emailFunction) {
        try {
          const { error } = await supabase.functions.invoke(selectedMessageInfo.emailFunction, { body: payload });
          if (error) throw error;
          results.email = true;
        } catch (err: any) {
          console.error("Email send error:", err);
          results.email = false;
        }
      }

      // Send SMS
      if ((deliveryMethod === "sms" || deliveryMethod === "both") && selectedPatient.phone && selectedMessageInfo.smsFunction) {
        try {
          const { error } = await supabase.functions.invoke(selectedMessageInfo.smsFunction, { body: payload });
          if (error) throw error;
          results.sms = true;
        } catch (err: any) {
          console.error("SMS send error:", err);
          results.sms = false;
        }
      }

      // Show result toast
      if (deliveryMethod === "both") {
        if (results.email && results.sms) {
          toast.success(`Email & SMS sent to ${selectedPatient.full_name}!`);
        } else if (results.email) {
          toast.success("Email sent! SMS failed.");
        } else if (results.sms) {
          toast.success("SMS sent! Email failed.");
        } else {
          toast.error("Both email and SMS failed to send");
        }
      } else if (deliveryMethod === "email") {
        if (results.email) {
          toast.success(`Email sent to ${selectedPatient.email}!`);
        } else {
          toast.error("Failed to send email");
        }
      } else {
        if (results.sms) {
          toast.success(`SMS sent to ${selectedPatient.phone}!`);
        } else {
          toast.error("Failed to send SMS");
        }
      }

      if (results.email || results.sms) {
        onOpenChange(false);
        onSuccess?.();
        resetForm();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setPatients([]);
    setSelectedPatient(null);
    setMessageType("");
    setDeliveryMethod("email");
    setStep("select");
    setTemplate(null);
    setEditedSubject("");
    setEditedBody("");
    setEditedSms("");
    setIsEditing(false);
    setActiveTab("preview");
  };

  // Auto-switch to email if SMS not available for selected type
  useEffect(() => {
    if (messageType) {
      if (deliveryMethod === "sms" && !canSendSms) {
        setDeliveryMethod("email");
      }
      if (deliveryMethod === "both" && !canSendBoth) {
        setDeliveryMethod(canSendEmail ? "email" : "sms");
      }
    }
  }, [messageType, canSendSms, canSendEmail, canSendBoth, deliveryMethod]);

  const getDeliveryIcon = () => {
    if (deliveryMethod === "both") return <Zap className="w-5 h-5 text-primary" />;
    if (deliveryMethod === "sms") return <MessageSquare className="w-5 h-5 text-primary" />;
    return <Mail className="w-5 h-5 text-primary" />;
  };

  const getButtonLabel = () => {
    if (deliveryMethod === "both") return "Send Both";
    if (deliveryMethod === "sms") return "Send SMS";
    return "Send Email";
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDeliveryIcon()}
            {step === "select" ? "Send Notification" : "Preview & Send"}
          </DialogTitle>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4 overflow-y-auto">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label>Search Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
              
              {patients.length > 0 && !selectedPatient && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                    >
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.email || "No email"} • {patient.phone || "No phone"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient */}
            {selectedPatient && (
              <div className="bg-primary/5 rounded-lg p-3">
                <p className="font-medium">{selectedPatient.full_name}</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className={!selectedPatient.email ? "text-amber-600" : ""}>
                    ✉️ {selectedPatient.email || "No email on file"}
                  </p>
                  <p className={!selectedPatient.phone ? "text-amber-600" : ""}>
                    📱 {selectedPatient.phone || "No phone on file"}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedPatient(null)}
                  className="mt-1"
                >
                  Change Patient
                </Button>
              </div>
            )}

            {/* Message Type */}
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type..." />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        {type.label}
                        {type.smsFunction && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">SMS</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMessageInfo && (
                <p className="text-xs text-muted-foreground">{selectedMessageInfo.description}</p>
              )}
            </div>

            {/* Delivery Method Toggle */}
            {messageType && (
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
                    disabled={!canSendBoth}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Both
                  </Button>
                </div>
                {!canSendSms && messageType && (
                  <p className="text-xs text-muted-foreground">SMS not available for this message type</p>
                )}
              </div>
            )}

            {/* Next Button */}
            <Button
              onClick={handleProceedToPreview}
              disabled={!selectedPatient || !messageType || !hasRequiredContact()}
              className="w-full"
            >
              Preview Message
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            {selectedPatient && getMissingContactMessage() && (
              <p className="text-xs text-center text-amber-600">
                {getMissingContactMessage()}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={handleBackToSelect}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {/* Recipient Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium">{selectedPatient?.full_name}</p>
              <div className="text-sm text-muted-foreground flex gap-4">
                <span>✉️ {selectedPatient?.email || "No email"}</span>
                <span>📱 {selectedPatient?.phone || "No phone"}</span>
              </div>
            </div>

            {isLoadingTemplate ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
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
                    {(deliveryMethod === "email" || deliveryMethod === "both") && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b">
                          <p className="text-sm font-medium">Subject: {mergePlaceholders(editedSubject)}</p>
                        </div>
                        <div 
                          className="p-4 bg-white text-foreground prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: mergePlaceholders(editedBody) }}
                        />
                      </div>
                    )}

                    {/* SMS Preview */}
                    {(deliveryMethod === "sms" || deliveryMethod === "both") && editedSms && (
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
                    {(deliveryMethod === "email" || deliveryMethod === "both") && (
                      <>
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
                            rows={8}
                            className="font-mono text-sm"
                          />
                        </div>
                      </>
                    )}

                    {(deliveryMethod === "sms" || deliveryMethod === "both") && (
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

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg flex-wrap">
                      <span className="font-medium">Merge Fields:</span>
                      {["patient_name", "first_name", "clinic_phone"].map((field) => (
                        <code 
                          key={field} 
                          className="bg-background px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-primary/10"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${field}}}`);
                            toast.success(`Copied {{${field}}}`);
                          }}
                        >
                          {`{{${field}}}`}
                        </code>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

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
                    disabled={isSending || !hasRequiredContact()}
                    className={deliveryMethod === "both" ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" : ""}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {getButtonLabel()}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickEmailModal;