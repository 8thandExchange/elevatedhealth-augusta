import { useEffect, useMemo, useState, useRef } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight, Calendar, CheckCircle2, User, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { patientNameEmailPhoneOrFilter } from "@/lib/patientSearch";
import SlotPicker, { type SlotPickerHandle } from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";

interface PatientLite {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  primary_program: string | null;
  elevated_membership_status?: string | null;
}

interface IvTherapy {
  id: string;
  name: string;
  price: number;
  category: string;
}

type ServiceLine =
  | "iv"
  | "consult_hormone"
  | "consult_weight_loss"
  | "consult_peptide"
  | "follow_up";

const SERVICE_OPTIONS: {
  id: ServiceLine;
  label: string;
  description: string;
  duration: number;
}[] = [
  { id: "iv", label: "IV Therapy", description: "Walk-in IV session in the lounge", duration: 60 },
  {
    id: "consult_hormone",
    label: "Hormone Optimization Consult",
    description: "30-min wellness assessment + lab draw",
    duration: 30,
  },
  {
    id: "consult_weight_loss",
    label: "Medical Weight Loss Consult",
    description: "30-min wellness assessment + lab draw",
    duration: 30,
  },
  {
    id: "consult_peptide",
    label: "Peptide Protocols Consult",
    description: "30-min wellness assessment",
    duration: 30,
  },
  {
    id: "follow_up",
    label: "Follow-up visit",
    description: "Existing patient check-in",
    duration: 30,
  },
];

const SERVICE_LINE_FOR_SLOTS: Record<ServiceLine, "iv" | "consult" | "follow_up"> = {
  iv: "iv",
  consult_hormone: "consult",
  consult_weight_loss: "consult",
  consult_peptide: "consult",
  follow_up: "follow_up",
};

const CONSULT_SERVICE_TYPE: Record<ServiceLine, string | null> = {
  iv: null,
  consult_hormone: "hormone",
  consult_weight_loss: "weight_loss",
  consult_peptide: "peptide",
  follow_up: null,
};

type Step = "patient" | "service" | "slot" | "payment" | "confirm";

interface StaffBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: prefill when launching from a patient detail panel.
  initialPatient?: PatientLite | null;
  // Whether the caller currently signed in is admin (controls cash/check override).
  isAdmin?: boolean;
  // Fires once a booking is successfully created. Lets callers (like the
  // eligibility-review queue) update their own state — for example,
  // flipping a flagged-patient row from 'pending' to 'scheduled' and
  // linking the resulting consultation_bookings row.
  onBookingComplete?: (result: { appointmentId: string; bookingId?: string | null }) => void;
}

const StaffBookingModal = ({
  open,
  onOpenChange,
  initialPatient,
  isAdmin = false,
  onBookingComplete,
}: StaffBookingModalProps) => {
  const [step, setStep] = useState<Step>("patient");

  // ----- Step 1: patient -----
  const [patient, setPatient] = useState<PatientLite | null>(initialPatient || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PatientLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientDob, setNewPatientDob] = useState("");
  const [creatingPatient, setCreatingPatient] = useState(false);

  // ----- Step 2: service -----
  const [serviceLine, setServiceLine] = useState<ServiceLine | null>(null);
  const [therapies, setTherapies] = useState<IvTherapy[]>([]);
  const [therapyId, setTherapyId] = useState<string | null>(null);

  // ----- Step 3: slot -----
  const [providerId, setProviderId] = useState<string | null>(null);
  const [pickedSlot, setPickedSlot] = useState<{ slot_token: string; start: string } | null>(
    null,
  );
  const slotPickerRef = useRef<SlotPickerHandle>(null);

  // ----- Step 4: payment -----
  type IvPaymentMethod = "pay_at_visit" | "card_on_file_pending" | "member_no_charge";
  type ConsultPaymentMethod = "pay_at_visit" | "paid_external" | "pending_link";
  const [ivPayment, setIvPayment] = useState<IvPaymentMethod>("pay_at_visit");
  const [consultPayment, setConsultPayment] = useState<ConsultPaymentMethod>("pay_at_visit");
  const [captureCardNow, setCaptureCardNow] = useState(false);
  const [notes, setNotes] = useState("");

  // ----- Step 5: confirm -----
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    appointmentId: string;
    serviceLabel: string;
    scheduledAt: string;
  } | null>(null);

  // Load IV therapies once on open
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("iv_therapies")
        .select("id, name, price, category, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order")
        .order("price");
      setTherapies(((data as IvTherapy[]) || []).map((t) => t));
    })();
  }, [open]);

  // Patient search (debounced inside the search button click)
  const runSearch = async () => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, primary_program, elevated_membership_status")
        .or(patientNameEmailPhoneOrFilter(q))
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setSearchResults((data as PatientLite[]) || []);
    } catch (e) {
      console.error(e);
      toast.error("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatientName.trim() || (!newPatientEmail.trim() && !newPatientPhone.trim())) {
      toast.error("Need a name and at least one of email or phone.");
      return;
    }
    setCreatingPatient(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .insert({
          full_name: newPatientName.trim(),
          email: newPatientEmail.trim() || null,
          phone: newPatientPhone.trim() || null,
          dob: newPatientDob || null,
          onboarding_status: "staff_created",
        })
        .select("id, full_name, email, phone, primary_program, elevated_membership_status")
        .single();
      if (error) throw error;
      setPatient(data as PatientLite);
      setShowCreatePatient(false);
      setStep("service");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not create patient.";
      toast.error(msg);
    } finally {
      setCreatingPatient(false);
    }
  };

  const isMember = patient?.elevated_membership_status === "active";

  const reset = () => {
    setStep("patient");
    setPatient(initialPatient || null);
    setSearchTerm("");
    setSearchResults([]);
    setShowCreatePatient(false);
    setNewPatientName("");
    setNewPatientEmail("");
    setNewPatientPhone("");
    setNewPatientDob("");
    setServiceLine(null);
    setTherapyId(null);
    setProviderId(null);
    setPickedSlot(null);
    setIvPayment("pay_at_visit");
    setConsultPayment("pay_at_visit");
    setCaptureCardNow(false);
    setNotes("");
    setCreated(null);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const handleBookAnother = () => {
    reset();
  };

  const serviceMeta = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === serviceLine) || null,
    [serviceLine],
  );

  const handleSubmit = async () => {
    if (!patient || !serviceLine || !pickedSlot) {
      toast.error("Missing booking details.");
      return;
    }
    setSubmitting(true);
    try {
      const handleRoomConflictResponse = async (data: unknown) => {
        const code = (data as { error_code?: string } | null)?.error_code;
        if (
          code === "room_unavailable" ||
          code === "limit_exceeded" ||
          code === "room_blackout" ||
          code === "slot_taken"
        ) {
          toast.error(
            (data as { error?: string })?.error ||
              "That slot is no longer available. Please pick another.",
          );
          await slotPickerRef.current?.reload();
          return true;
        }
        return false;
      };

      if (serviceLine === "iv") {
        if (!therapyId) {
          toast.error("Pick an IV therapy.");
          setSubmitting(false);
          return;
        }
        const therapy = therapies.find((t) => t.id === therapyId);
        const paymentStatus: IvPaymentMethod = isMember
          ? ivPayment === "pay_at_visit" || ivPayment === "card_on_file_pending"
            ? ivPayment
            : "member_no_charge"
          : ivPayment;

        const { data, error } = await supabase.functions.invoke("book-iv-appointment", {
          body: {
            slot_token: pickedSlot.slot_token,
            booking_source: "staff_phone",
            staff_booking: {
              patient_id: patient.id,
              therapy_id: therapyId,
              therapy_name: therapy?.name,
              addon_ids: [],
              payment_status: paymentStatus,
              amount_cents: paymentStatus === "member_no_charge" ? 0 : Math.round((therapy?.price || 0) * 100),
              customer_email: patient.email || undefined,
              customer_name: patient.full_name,
              customer_phone: patient.phone || undefined,
            },
          },
        });
        if (error || data?.error) {
          if (await handleRoomConflictResponse(data)) return;
          throw new Error(data?.error || error?.message || "Booking failed");
        }
        setCreated({
          appointmentId: data.appointment.id,
          serviceLabel: therapy?.name || "IV Therapy",
          scheduledAt: data.appointment.scheduled_at,
        });
        onBookingComplete?.({ appointmentId: data.appointment.id, bookingId: data.booking_id ?? null });
      } else if (serviceLine === "follow_up") {
        // Follow-ups reuse consult lane with its own service_type marker.
        const { data, error } = await supabase.functions.invoke("book-consult-appointment", {
          body: {
            slot_token: pickedSlot.slot_token,
            booking_source: "staff_phone",
            staff_booking: {
              patient_id: patient.id,
              service_type: "follow_up",
              payment_status: "member_no_charge", // follow-ups don't trigger payment
              customer_email: patient.email || undefined,
              customer_name: patient.full_name,
              customer_phone: patient.phone || undefined,
              notes: notes || undefined,
              is_admin_override: isAdmin,
            },
          },
        });
        if (error || data?.error) {
          if (await handleRoomConflictResponse(data)) return;
          throw new Error(data?.error || error?.message || "Booking failed");
        }
        setCreated({
          appointmentId: data.appointment.id,
          serviceLabel: "Follow-up visit",
          scheduledAt: data.appointment.scheduled_at,
        });
        onBookingComplete?.({ appointmentId: data.appointment.id, bookingId: data.booking_id ?? null });
      } else {
        const consultServiceType = CONSULT_SERVICE_TYPE[serviceLine]!;
        const paymentStatus: ConsultPaymentMethod = isMember ? "member_no_charge" as ConsultPaymentMethod : consultPayment;
        const { data, error } = await supabase.functions.invoke("book-consult-appointment", {
          body: {
            slot_token: pickedSlot.slot_token,
            booking_source: "staff_phone",
            staff_booking: {
              patient_id: patient.id,
              service_type: consultServiceType,
              payment_status: paymentStatus,
              customer_email: patient.email || undefined,
              customer_name: patient.full_name,
              customer_phone: patient.phone || undefined,
              notes: notes || undefined,
              is_admin_override: isAdmin,
            },
          },
        });
        if (error || data?.error) {
          if (await handleRoomConflictResponse(data)) return;
          throw new Error(data?.error || error?.message || "Booking failed");
        }
        const label = serviceMeta?.label || "Consultation";
        setCreated({
          appointmentId: data.appointment.id,
          serviceLabel: label,
          scheduledAt: data.appointment.scheduled_at,
        });
        onBookingComplete?.({ appointmentId: data.appointment.id, bookingId: data.booking_id ?? null });
      }
      setStep("confirm");
      toast.success("Booking created. Confirmation on its way to the patient.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Booking failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Step navigation guards
  const canGoToService = patient !== null;
  const canGoToSlot = patient !== null && serviceLine !== null && (serviceLine !== "iv" || therapyId !== null);
  const canGoToPayment = canGoToSlot && pickedSlot !== null;

  const stepIndex: Record<Step, number> = {
    patient: 1,
    service: 2,
    slot: 3,
    payment: 4,
    confirm: 5,
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">
            Book on patient's behalf
          </DialogTitle>
          <DialogDescription className="font-jost">
            Step {stepIndex[step]} of 5 · creates an appointment without making the patient log in.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Patient */}
        {step === "patient" && (
          <div className="space-y-4">
            {patient ? (
              <Card className="border-accent/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-jost font-medium">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.email || "no email"} · {patient.phone || "no phone"}
                    </p>
                  </div>
                  {isMember && (
                    <Badge className="bg-accent text-accent-foreground">Member</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>
                    Change
                  </Button>
                </CardContent>
              </Card>
            ) : showCreatePatient ? (
              <div className="space-y-3">
                <Label htmlFor="np-name">Full name</Label>
                <Input
                  id="np-name"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Jane Doe"
                />
                <Label htmlFor="np-email">Email</Label>
                <Input
                  id="np-email"
                  type="email"
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
                <Label htmlFor="np-phone">Phone</Label>
                <Input
                  id="np-phone"
                  type="tel"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  placeholder="(706) 555-0123"
                />
                <Label htmlFor="np-dob">Date of birth (optional)</Label>
                <Input
                  id="np-dob"
                  type="date"
                  value={newPatientDob}
                  onChange={(e) => setNewPatientDob(e.target.value)}
                />
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setShowCreatePatient(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePatient} disabled={creatingPatient}>
                    {creatingPatient && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create patient
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="search">Search patients (name, email, phone)</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        runSearch();
                      }
                    }}
                    placeholder="Type at least 2 characters"
                  />
                  <Button onClick={runSearch} disabled={searching}>
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {searchResults.map((r) => (
                    <Card
                      key={r.id}
                      className="cursor-pointer hover:border-accent/60"
                      onClick={() => setPatient(r)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-jost text-sm font-medium">{r.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.email || "no email"} · {r.phone || "no phone"}
                          </p>
                        </div>
                        {r.elevated_membership_status === "active" && (
                          <Badge variant="secondary">Member</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {searchResults.length === 0 && searchTerm.trim().length >= 2 && !searching && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No matches. Create a new patient?
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreatePatient(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Create new patient
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Service */}
        {step === "service" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((opt) => {
                const selected = serviceLine === opt.id;
                return (
                  <Card
                    key={opt.id}
                    onClick={() => {
                      setServiceLine(opt.id);
                      setTherapyId(null);
                      setPickedSlot(null);
                    }}
                    className={`cursor-pointer transition-all border-2 ${
                      selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-jost font-medium">{opt.label}</p>
                        {selected && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {serviceLine === "iv" && (
              <div className="space-y-2">
                <Label>Which IV?</Label>
                <Select value={therapyId || undefined} onValueChange={(v) => setTherapyId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick an IV therapy" />
                  </SelectTrigger>
                  <SelectContent>
                    {therapies.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — ${t.price.toFixed(0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Slot */}
        {step === "slot" && serviceLine && (
          <div className="space-y-4">
            <ProviderChooser
              serviceLine={SERVICE_LINE_FOR_SLOTS[serviceLine]}
              selectedProviderId={providerId}
              onChange={setProviderId}
            />
            <SlotPicker
              ref={slotPickerRef}
              serviceLine={SERVICE_LINE_FOR_SLOTS[serviceLine]}
              durationMinutes={serviceMeta?.duration || 30}
              providerId={providerId || undefined}
              onConfirm={async ({ slot }) => {
                setPickedSlot(slot);
                setStep("payment");
              }}
              confirmLabel="Use this slot"
            />
          </div>
        )}

        {/* Step 4: Payment */}
        {step === "payment" && serviceLine && pickedSlot && (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-1">
                <p className="font-jost text-sm">
                  <strong>{patient?.full_name}</strong> ·{" "}
                  {format(new Date(pickedSlot.start), "EEE MMM d, h:mm a")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {serviceMeta?.label}
                  {serviceLine === "iv" && therapyId && (
                    <> · {therapies.find((t) => t.id === therapyId)?.name}</>
                  )}
                </p>
              </CardContent>
            </Card>

            {isMember && serviceLine !== "follow_up" && (
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <p className="font-jost text-sm">
                    Patient is an active member — included visit, no charge.
                  </p>
                </CardContent>
              </Card>
            )}

            {serviceLine === "follow_up" && (
              <p className="text-sm text-muted-foreground">
                Follow-up visits are not charged at booking. The provider will
                handle any billing during/after the visit.
              </p>
            )}

            {serviceLine === "iv" && !isMember && (
              <div className="space-y-3">
                <Label>How is the patient paying?</Label>
                <RadioGroup
                  value={ivPayment}
                  onValueChange={(v) => setIvPayment(v as IvPaymentMethod)}
                >
                  <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                      <RadioGroupItem value="pay_at_visit" id="iv-pay-at-visit" />
                      <Label htmlFor="iv-pay-at-visit" className="flex-1 cursor-pointer">
                        <p className="font-jost font-medium">Pay at visit</p>
                        <p className="text-xs text-muted-foreground">
                          Patient pays in the lounge with card or cash.
                        </p>
                      </Label>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                      <RadioGroupItem
                        value="card_on_file_pending"
                        id="iv-card-on-file"
                      />
                      <Label htmlFor="iv-card-on-file" className="flex-1 cursor-pointer">
                        <p className="font-jost font-medium">Capture card on file</p>
                        <p className="text-xs text-muted-foreground">
                          Marks the booking; the patient's card is captured at
                          arrival via the front-desk reader. (Inline Stripe
                          SetupIntent capture is a follow-up.)
                        </p>
                      </Label>
                    </CardContent>
                  </Card>
                </RadioGroup>
                {ivPayment === "card_on_file_pending" && (
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="capture-now"
                      checked={captureCardNow}
                      onCheckedChange={(v) => setCaptureCardNow(Boolean(v))}
                    />
                    <Label htmlFor="capture-now" className="text-xs text-muted-foreground cursor-pointer">
                      I'll text/email the patient a Stripe payment link separately.
                    </Label>
                  </div>
                )}
              </div>
            )}

            {(serviceLine === "consult_hormone" ||
              serviceLine === "consult_weight_loss" ||
              serviceLine === "consult_peptide") &&
              !isMember && (
                <div className="space-y-3">
                  <Label>How is the patient paying for the $79 consult?</Label>
                  <RadioGroup
                    value={consultPayment}
                    onValueChange={(v) => setConsultPayment(v as ConsultPaymentMethod)}
                  >
                    <Card>
                      <CardContent className="p-3 flex items-start gap-3">
                        <RadioGroupItem value="pay_at_visit" id="cs-pay-at-visit" />
                        <Label htmlFor="cs-pay-at-visit" className="flex-1 cursor-pointer">
                          <p className="font-jost font-medium">Pay at visit</p>
                          <p className="text-xs text-muted-foreground">
                            Patient pays at arrival.
                          </p>
                        </Label>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 flex items-start gap-3">
                        <RadioGroupItem value="pending_link" id="cs-pending-link" />
                        <Label htmlFor="cs-pending-link" className="flex-1 cursor-pointer">
                          <p className="font-jost font-medium">Send Stripe payment link</p>
                          <p className="text-xs text-muted-foreground">
                            Booking is held; the patient gets a payment link via
                            email. Slot is reserved either way.
                          </p>
                        </Label>
                      </CardContent>
                    </Card>
                    <Card className={isAdmin ? "" : "opacity-60"}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <RadioGroupItem
                          value="paid_external"
                          id="cs-paid-external"
                          disabled={!isAdmin}
                        />
                        <Label
                          htmlFor="cs-paid-external"
                          className={`flex-1 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                        >
                          <p className="font-jost font-medium">
                            Paid by check / cash{" "}
                            {!isAdmin && (
                              <span className="text-xs text-muted-foreground">(admin only)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Records as paid externally; no Stripe charge.
                          </p>
                        </Label>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </div>
              )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the provider should know before the visit"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === "confirm" && created && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-playfair text-xl">Booking confirmed</h3>
            <p className="text-sm text-muted-foreground font-jost">
              Confirmation #{created.appointmentId.slice(0, 8).toUpperCase()}
            </p>
            <Card className="text-left">
              <CardContent className="p-4 space-y-1">
                <p className="font-jost text-sm">
                  <strong>{patient?.full_name}</strong>
                </p>
                <p className="text-sm text-muted-foreground font-jost flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(created.scheduledAt), "EEE MMM d · h:mm a")}
                </p>
                <p className="text-sm text-muted-foreground">{created.serviceLabel}</p>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground font-jost">
              Patient gets a confirmation email and SMS automatically.
            </p>
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
          {step === "confirm" ? (
            <>
              <Button variant="outline" onClick={close}>
                Done
              </Button>
              <Button onClick={handleBookAnother}>Book another</Button>
            </>
          ) : (
            <>
              <div>
                {step !== "patient" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const order: Step[] = ["patient", "service", "slot", "payment"];
                      const idx = order.indexOf(step);
                      if (idx > 0) setStep(order[idx - 1]);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                {step === "patient" && (
                  <Button onClick={() => setStep("service")} disabled={!canGoToService}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {step === "service" && (
                  <Button onClick={() => setStep("slot")} disabled={!canGoToSlot}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {step === "slot" && (
                  <Button disabled={!canGoToPayment} onClick={() => setStep("payment")}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {step === "payment" && (
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create booking
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffBookingModal;
