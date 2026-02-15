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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PatientData {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  dob?: string | null;
  gender?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  allergies?: string | null;
  insurance_type?: string | null;
  insurance_plan_name?: string | null;
  insurance_member_id?: string | null;
  insurance_group_number?: string | null;
}

interface EditPatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  onUpdated?: () => void;
}

const EditPatientProfileModal = ({
  isOpen,
  onClose,
  patient,
  onUpdated,
}: EditPatientProfileModalProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [allergies, setAllergies] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [insurancePlanName, setInsurancePlanName] = useState("");
  const [insuranceMemberId, setInsuranceMemberId] = useState("");
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when patient changes
  useEffect(() => {
    if (patient) {
      setFullName(patient.full_name || "");
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
      setDob(patient.dob || "");
      setGender(patient.gender || "");
      setStreetAddress(patient.street_address || "");
      setCity(patient.city || "");
      setState(patient.state || "");
      setZipCode(patient.zip_code || "");
      setAllergies(patient.allergies || "");
      setInsuranceType(patient.insurance_type || "self_pay");
      setInsurancePlanName(patient.insurance_plan_name || "");
      setInsuranceMemberId(patient.insurance_member_id || "");
      setInsuranceGroupNumber(patient.insurance_group_number || "");
    }
  }, [patient]);

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length >= 6) {
      setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
    } else if (digits.length >= 3) {
      setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
    } else {
      setPhone(digits);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          dob: dob || null,
          gender: gender || null,
          street_address: streetAddress.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zip_code: zipCode.trim() || null,
          allergies: allergies.trim() || "NKDA",
          insurance_type: insuranceType || "self_pay",
          insurance_plan_name: insurancePlanName.trim() || null,
          insurance_member_id: insuranceMemberId.trim() || null,
          insurance_group_number: insuranceGroupNumber.trim() || null,
        })
        .eq("id", patient.id);

      if (error) throw error;

      toast.success("Patient profile updated");
      onUpdated?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating patient:", error);
      toast.error(error.message || "Failed to update patient");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border border-gold/30 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-cormorant text-foreground">
            Edit Patient Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Basic Information
            </Label>
            
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Patient's full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Mailing Address
            </Label>
            <Input
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Street Address"
            />
            <div className="grid grid-cols-6 gap-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="col-span-3"
              />
              <Input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="ST"
                className="col-span-1"
                maxLength={2}
              />
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="ZIP"
                className="col-span-2"
                maxLength={10}
              />
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Medical Information
            </Label>
            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-sm">Drug Allergies</Label>
              <Input
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="List allergies or leave blank for NKDA"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if no known drug allergies (NKDA)
              </p>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Insurance Information
            </Label>
            
            <div className="space-y-2">
              <Label htmlFor="insuranceType" className="text-sm">Insurance Type</Label>
              <Select value={insuranceType} onValueChange={setInsuranceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="tricare">TRICARE</SelectItem>
                  <SelectItem value="va">VA (Veterans Affairs)</SelectItem>
                  <SelectItem value="self_pay">Self-Pay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurancePlanName" className="text-sm">Plan Name</Label>
              <Input
                id="insurancePlanName"
                value={insurancePlanName}
                onChange={(e) => setInsurancePlanName(e.target.value)}
                placeholder="e.g. BCBS Federal Employee"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="insuranceMemberId" className="text-sm">Member ID</Label>
                <Input
                  id="insuranceMemberId"
                  value={insuranceMemberId}
                  onChange={(e) => setInsuranceMemberId(e.target.value)}
                  placeholder="Member ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceGroupNumber" className="text-sm">Group #</Label>
                <Input
                  id="insuranceGroupNumber"
                  value={insuranceGroupNumber}
                  onChange={(e) => setInsuranceGroupNumber(e.target.value)}
                  placeholder="Group number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-foreground/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gold hover:bg-gold-dark text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientProfileModal;
