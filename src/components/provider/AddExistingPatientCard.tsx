import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserCheck, Check, Users } from "lucide-react";

interface AddExistingPatientCardProps {
  onPatientAdded?: () => void;
}

const SERVICE_TYPES = [
  { value: "hormone", label: "Hormone Therapy" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "ketamine", label: "Ketamine Therapy" },
  { value: "general", label: "General" },
] as const;

const PATIENT_STATUS_OPTIONS = [
  { value: "existing_patient", label: "Existing Patient (Skip Consultation)" },
  { value: "consultation_completed", label: "Consultation Completed" },
  { value: "treatment_active", label: "Active on Treatment" },
] as const;

const AddExistingPatientCard = ({ onPatientAdded }: AddExistingPatientCardProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<string>("hormone");
  const [patientStatus, setPatientStatus] = useState<string>("existing_patient");
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddPatient = async () => {
    if (!email.trim() || !name.trim()) {
      toast.error("Please enter both name and email");
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
          service_type: serviceType,
          patient_status: patientStatus,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setAdded(true);
        const statusLabel = PATIENT_STATUS_OPTIONS.find(s => s.value === patientStatus)?.label || "Patient";
        toast.success(`${name} added as ${statusLabel}!`);
        setEmail("");
        setName("");
        setPhone("");
        setServiceType("hormone");
        setPatientStatus("existing_patient");
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

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
          <Users className="w-4 h-4" />
          Add Existing Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Add a current clinic patient without requiring the $99 consultation. 
          Perfect for established patients who need to be added to the system.
        </p>
        
        <div className="text-xs bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
          <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
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

          <div>
            <Label htmlFor="existing-service" className="text-xs text-muted-foreground">
              Service Interest
            </Label>
            <Select value={serviceType} onValueChange={setServiceType} disabled={isAdding}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        <Button
          onClick={handleAddPatient}
          disabled={isAdding || !email.trim() || !name.trim()}
          variant="outline"
          className="w-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
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
      </CardContent>
    </Card>
  );
};

export default AddExistingPatientCard;
