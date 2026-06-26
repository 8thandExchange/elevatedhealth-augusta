import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera, User } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  currentName: string;
  currentAvatarUrl: string | null;
  onUpdate: (newName: string, newAvatarUrl: string | null) => void;
}

const EMPTY = {
  phone: "",
  dob: "",
  gender: "",
  street_address: "",
  city: "",
  state: "",
  zip_code: "",
  allergies: "",
  preferred_pharmacy: "",
  insurance_type: "",
  insurance_plan_name: "",
  insurance_member_id: "",
  insurance_group_number: "",
};

const EditProfileModal = ({
  isOpen,
  onClose,
  patientId,
  currentName,
  currentAvatarUrl,
  onUpdate,
}: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(currentName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [fields, setFields] = useState({ ...EMPTY });
  const [medicalHistory, setMedicalHistory] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !patientId) return;
    let cancelled = false;
    setIsLoading(true);
    setFullName(currentName);
    setAvatarUrl(currentAvatarUrl);
    supabase
      .from("patients")
      .select(
        "phone, dob, gender, street_address, city, state, zip_code, allergies, insurance_type, insurance_plan_name, insurance_member_id, insurance_group_number, medical_history",
      )
      .eq("id", patientId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setIsLoading(false);
          return;
        }
        const mh =
          data.medical_history && typeof data.medical_history === "object" && !Array.isArray(data.medical_history)
            ? (data.medical_history as Record<string, unknown>)
            : {};
        setMedicalHistory(mh);
        setFields({
          phone: data.phone ?? "",
          dob: data.dob ?? "",
          gender: data.gender ?? "",
          street_address: data.street_address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zip_code: data.zip_code ?? "",
          allergies: data.allergies ?? "",
          preferred_pharmacy: typeof mh.preferred_pharmacy === "string" ? mh.preferred_pharmacy : "",
          insurance_type: data.insurance_type ?? "",
          insurance_plan_name: data.insurance_plan_name ?? "",
          insurance_member_id: data.insurance_member_id ?? "",
          insurance_group_number: data.insurance_group_number ?? "",
        });
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, patientId, currentName, currentAvatarUrl]);

  const setField = (key: keyof typeof EMPTY, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const nextMedicalHistory = {
        ...medicalHistory,
        preferred_pharmacy: fields.preferred_pharmacy.trim() || null,
      };
      const { error } = await supabase
        .from("patients")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          phone: fields.phone.trim() || null,
          dob: fields.dob || null,
          gender: fields.gender || null,
          street_address: fields.street_address.trim() || null,
          city: fields.city.trim() || null,
          state: fields.state.trim() || null,
          zip_code: fields.zip_code.trim() || null,
          allergies: fields.allergies.trim() || null,
          insurance_type: fields.insurance_type.trim() || null,
          insurance_plan_name: fields.insurance_plan_name.trim() || null,
          insurance_member_id: fields.insurance_member_id.trim() || null,
          insurance_group_number: fields.insurance_group_number.trim() || null,
          medical_history: nextMedicalHistory,
        })
        .eq("id", patientId);
      if (error) throw error;
      toast.success("Profile updated");
      onUpdate(fullName.trim(), avatarUrl);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const busy = isSaving || isUploading || isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">Your profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {fullName ? getInitials(fullName) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">Click to upload photo</p>
            </div>

            {/* Personal */}
            <section className="space-y-3">
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">Personal</p>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={fields.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" value={fields.dob} onChange={(e) => setField("dob", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Sex / gender</Label>
                <Select value={fields.gender || undefined} onValueChange={(v) => setField("gender", v)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Address */}
            <section className="space-y-3">
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">Address</p>
              <div className="space-y-2">
                <Label htmlFor="street">Street address</Label>
                <Input
                  id="street"
                  value={fields.street_address}
                  onChange={(e) => setField("street_address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={fields.city} onChange={(e) => setField("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    maxLength={2}
                    className="uppercase"
                    value={fields.state}
                    onChange={(e) => setField("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" value={fields.zip_code} onChange={(e) => setField("zip_code", e.target.value)} />
                </div>
              </div>
            </section>

            {/* Health */}
            <section className="space-y-3">
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">Health</p>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  rows={2}
                  placeholder="List any medication or other allergies, or 'None known'."
                  value={fields.allergies}
                  onChange={(e) => setField("allergies", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacy">Preferred pharmacy</Label>
                <Input
                  id="pharmacy"
                  placeholder="Pharmacy name & location"
                  value={fields.preferred_pharmacy}
                  onChange={(e) => setField("preferred_pharmacy", e.target.value)}
                />
              </div>
            </section>

            {/* Insurance */}
            <section className="space-y-3">
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">
                Insurance (optional — we don&apos;t bill insurance, but this helps with superbills)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="insType">Insurer</Label>
                  <Input
                    id="insType"
                    value={fields.insurance_type}
                    onChange={(e) => setField("insurance_type", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insPlan">Plan name</Label>
                  <Input
                    id="insPlan"
                    value={fields.insurance_plan_name}
                    onChange={(e) => setField("insurance_plan_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insMember">Member ID</Label>
                  <Input
                    id="insMember"
                    value={fields.insurance_member_id}
                    onChange={(e) => setField("insurance_member_id", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insGroup">Group #</Label>
                  <Input
                    id="insGroup"
                    value={fields.insurance_group_number}
                    onChange={(e) => setField("insurance_group_number", e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
