import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserCheck, Check, Users, Mail, CreditCard, ChevronDown } from "lucide-react";

interface AddExistingPatientCardProps {
  onPatientAdded?: () => void;
  embedded?: boolean;
}

const SERVICE_TYPES = [
  { value: "hormone", label: "Hormone Therapy" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "peptide", label: "Peptide Therapy" },
  { value: "general", label: "General" },
] as const;

const PATIENT_STATUS_OPTIONS = [
  { value: "treatment_active", label: "Active on Treatment" },
  { value: "results_ready", label: "Labs Uploaded, Pending Review" },
  { value: "protocol_approved", label: "Protocol Approved, Pending Rx" },
  { value: "consultation_completed", label: "Start at Step 1 (Consultation Done)" },
] as const;

const AddExistingPatientCard = ({ onPatientAdded, embedded = false }: AddExistingPatientCardProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceInterests, setServiceInterests] = useState<string[]>(["hormone"]);
  const [patientStatus, setPatientStatus] = useState<string>("treatment_active");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [creditCode, setCreditCode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const toggleServiceInterest = (value: string) => {
    setServiceInterests(prev => {
      if (prev.includes(value)) {
        // Don't allow removing the last one
        if (prev.length === 1) return prev;
        return prev.filter(v => v !== value);
      }
      return [...prev, value];
    });
  };

  const handleAddPatient = async () => {
    if (!email.trim() || !name.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    if (serviceInterests.length === 0) {
      toast.error("Please select at least one service interest");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAdding(true);
    setAdded(false);

    try {
      const { data, error } = await supabase.functions.invoke("add-existing-patient", {
        body: {
          patient_email: email.trim(),
          patient_name: name.trim(),
          patient_phone: phone.trim() || null,
          service_type: serviceInterests[0], // Primary program (first selection)
          service_interests: serviceInterests, // All selected interests
          patient_status: patientStatus,
          send_welcome_email: sendWelcomeEmail,
          credit_code: creditCode.trim() || null,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setAdded(true);
        const statusLabel = PATIENT_STATUS_OPTIONS.find(s => s.value === patientStatus)?.label || "Patient";
        let successMessage = `${name} added as ${statusLabel}!`;
        if (data.email_sent) {
          successMessage += " Welcome email sent.";
        }
        if (data.credit_applied) {
          successMessage += " Consultation credit applied.";
        }
        toast.success(successMessage);
        setEmail("");
        setName("");
        setPhone("");
        setServiceInterests(["hormone"]);
        setPatientStatus("treatment_active");
        setSendWelcomeEmail(true);
        setCreditCode("");
        setShowAdvanced(false);
        onPatientAdded?.();
        
        // Reset added state after 3 seconds
        setTimeout(() => setAdded(false), 3000);
      } else {
        throw new Error(data?.error || "Failed to add patient");
      }
    } catch (err: any) {
      console.error("Add patient error:", err);
      toast.error(err.message || "Failed to add patient");
    } finally {
      setIsAdding(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Add a current clinic patient without requiring the $79 Wellness Assessment. 
        Perfect for established patients who need to be added to the system.
      </p>
      
      <div className="text-xs bg-accent/50 rounded-lg p-3 border border-accent">
        <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          No Payment Required
        </p>
        <p className="text-muted-foreground">
          Patient is added directly. Use "Send Kit Link" or "À La Carte" cards to send service-specific payment links.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="existing-name" className="text-xs text-muted-foreground">
            Patient Name
          </Label>
          <Input
            id="existing-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className="mt-1"
            disabled={isAdding}
          />
        </div>
        
        <div>
          <Label htmlFor="existing-email" className="text-xs text-muted-foreground">
            Patient Email
          </Label>
          <Input
            id="existing-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.com"
            className="mt-1"
            disabled={isAdding}
          />
        </div>

        <div>
          <Label htmlFor="existing-phone" className="text-xs text-muted-foreground">
            Phone (Optional)
          </Label>
          <Input
            id="existing-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            className="mt-1"
            disabled={isAdding}
          />
        </div>

        {/* Multi-select Service Interests */}
        <div>
          <Label className="text-xs text-muted-foreground">
            Service Interests (select all that apply)
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map((service) => (
              <div
                key={service.value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  serviceInterests.includes(service.value)
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:bg-muted/50"
                } ${isAdding ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => !isAdding && toggleServiceInterest(service.value)}
              >
                <Checkbox
                  id={`service-${service.value}`}
                  checked={serviceInterests.includes(service.value)}
                  onCheckedChange={() => toggleServiceInterest(service.value)}
                  disabled={isAdding}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`service-${service.value}`}
                  className="text-xs font-medium cursor-pointer flex-1"
                >
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
          {serviceInterests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {serviceInterests.map((interest) => {
                const label = SERVICE_TYPES.find(s => s.value === interest)?.label;
                return (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="existing-status" className="text-xs text-muted-foreground">
            Starting Status
          </Label>
          <Select value={patientStatus} onValueChange={setPatientStatus} disabled={isAdding}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select patient status" />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Welcome Email Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="send-welcome"
            checked={sendWelcomeEmail}
            onCheckedChange={(checked) => setSendWelcomeEmail(checked as boolean)}
            disabled={isAdding}
          />
          <Label 
            htmlFor="send-welcome" 
            className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            Send welcome email to patient
          </Label>
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
              disabled={isAdding}
            >
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Advanced Options
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <Label htmlFor="credit-code" className="text-xs text-muted-foreground">
                Apply Consultation Credit Code (Optional)
              </Label>
              <Input
                id="credit-code"
                type="text"
                value={creditCode}
                onChange={(e) => setCreditCode(e.target.value.toUpperCase())}
                placeholder="e.g., EH-ABC123"
                className="mt-1 font-mono"
                disabled={isAdding}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter a credit code only if operations issued one for a prior $79 Wellness Assessment payment.
                Staff workflows for codes are internal — do not quote retired kit bundles to patients.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button
        onClick={handleAddPatient}
        disabled={isAdding || !email.trim() || !name.trim() || serviceInterests.length === 0}
        variant="outline"
        className="w-full border-primary/50 text-primary hover:bg-primary/10"
      >
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : added ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Patient Added!
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 mr-2" />
            Add Patient (No Payment)
          </>
        )}
      </Button>
    </div>
  );

  return embedded ? (
    formContent
  ) : (
    <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-accent">
          <Users className="w-4 h-4" />
          Add Existing Patient
        </CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default AddExistingPatientCard;