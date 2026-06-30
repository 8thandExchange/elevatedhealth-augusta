import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import SlotPicker, { type SlotPickerHandle } from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";
import { PATIENT_SELF_SERVICE_PROVIDER_ID } from "@/lib/patientBookingConfig";
import { REBOOKING_FEE_DISPLAY } from "@/lib/cancellationPolicy";
import { patientGfeIsComplete } from "@/lib/gfeClearance";
import { resolveSchedulableConsultBooking } from "@/lib/paidConsultBooking";
import { hasWellnessAssessmentPaid } from "@/lib/wellnessAssessmentPayment";
import { CancellationPolicySummary } from "@/components/marketing/CancellationPolicySummary";
import { wellnessPreVisitForServiceType } from "@/lib/wellnessVisitInstructions";
import ReferralSourceCapture from "@/components/patient/ReferralSourceCapture";

interface PaidBooking {
  id: string;
  service_type: string | null;
  customer_email: string;
  customer_name: string | null;
  booked_for: string | null;
}

interface ConfirmedAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
}

const SERVICE_LABEL: Record<string, string> = {
  hormone: "Hormone Optimization Consultation",
  weight_loss: "Medical Weight Loss Consultation",
  peptide: "Peptide Protocols Consultation",
};

const PRE_VISIT: Record<string, string[]> = {
  hormone: wellnessPreVisitForServiceType("hormone"),
  weight_loss: wellnessPreVisitForServiceType("weight_loss"),
  peptide: wellnessPreVisitForServiceType("peptide"),
};

// /schedule-consult is the post-payment rebooking surface for patients who
// paid the $79 consult but did not finish picking a time. Previously this
// page was gated behind the legacy ZRT $250 hormone_mapping_payments flow,
// which made it unreachable for current patients. The ZRT gate is removed;
// this page now reads consultation_bookings directly.
const ScheduleConsult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rebookingResult = searchParams.get("rebooking");

  const [loading, setLoading] = useState(true);
  const [paidBooking, setPaidBooking] = useState<PaidBooking | null>(null);
  const [needsRebookingFee, setNeedsRebookingFee] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);
  const [providerId, setProviderId] = useState<string | null>(PATIENT_SELF_SERVICE_PROVIDER_ID);
  const [processingRebooking, setProcessingRebooking] = useState(false);
  const [gfeGate, setGfeGate] = useState<"unknown" | "cleared" | "pending">("unknown");
  const [wellnessPaidNoBooking, setWellnessPaidNoBooking] = useState(false);
  const [needsReferralCapture, setNeedsReferralCapture] = useState(false);
  const slotPickerRef = useRef<SlotPickerHandle>(null);

  useEffect(() => {
    if (rebookingResult === "success") {
      toast.success("Rebooking fee paid. You can pick a time below.");
    }
  }, [rebookingResult]);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to schedule your visit.");
          navigate("/patient/login");
          return;
        }

        // Find the patient row + onboarding state.
        const email = (user.email || "").toLowerCase().trim();
        let { data: patient } = await supabase
          .from("patients")
          .select("id, email, onboarding_status, referral_source, user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!patient && email) {
          const { data: byEmail } = await supabase
            .from("patients")
            .select("id, email, onboarding_status, referral_source, user_id")
            .eq("email", email)
            .maybeSingle();
          patient = byEmail;
        }

        if (patient?.id) {
          setNeedsReferralCapture(!patient.referral_source);
          const { data: gfeRows } = await supabase
            .from("gfe_clearances")
            .select("status, expires_at, approved_at, created_at")
            .eq("patient_id", patient.id)
            .order("created_at", { ascending: false })
            .limit(5);
          if (patientGfeIsComplete(gfeRows ?? [], patient.onboarding_status)) {
            setGfeGate("cleared");
          } else {
            setGfeGate("pending");
          }
        }

        if (patient?.onboarding_status === "rebooking_fee_required") {
          setNeedsRebookingFee(true);
          setLoading(false);
          return;
        }

        const accountEmail = (patient?.email || user.email || "").toLowerCase().trim();
        if (!accountEmail) {
          toast.error("We couldn't find your account email.");
          navigate("/patient/dashboard");
          return;
        }

        // Reconcile any paid-but-unlinked consult before resolving the booking, so a
        // patient who paid doesn't hit the "no paid consultation" dead-end.
        await supabase.rpc("sync_my_consult_payment_status").then(
          ({ error }) => {
            if (error) console.warn("[ScheduleConsult] consult payment sync skipped", error.message);
          },
          () => {},
        );

        const booking = await resolveSchedulableConsultBooking({
          email: accountEmail,
          onboardingStatus: patient?.onboarding_status,
        });

        if (!booking) {
          setWellnessPaidNoBooking(
            hasWellnessAssessmentPaid({ onboardingStatus: patient?.onboarding_status }),
          );
          setPaidBooking(null);
          setLoading(false);
          return;
        }

        setWellnessPaidNoBooking(false);

        // If the booking already has a scheduled appointment, skip straight
        // to the confirmed view so we don't double-book.
        if (booking.booked_for) {
          const { data: appt } = await supabase
            .from("appointments")
            .select("id, scheduled_at, duration_minutes, status")
            .eq("consultation_booking_id", booking.id)
            .neq("status", "cancelled")
            .order("scheduled_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (appt && appt.status !== "cancelled") {
            setConfirmed({
              id: appt.id,
              scheduled_at: appt.scheduled_at,
              duration_minutes: appt.duration_minutes || 30,
            });
          }
        }

        setPaidBooking(booking);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate]);

  const handleConfirm = async ({
    slot,
  }: {
    slot: { slot_token: string; start: string };
  }) => {
    if (!paidBooking) return;
    const { data, error } = await supabase.functions.invoke(
      "book-consult-appointment",
      {
        body: {
          booking_id: paidBooking.id,
          slot_token: slot.slot_token,
        },
      },
    );
    const code = (data as { error_code?: string } | null)?.error_code;
    if (
      code === "room_unavailable" ||
      code === "limit_exceeded" ||
      code === "room_blackout" ||
      code === "slot_taken" ||
      code === "gfe_required"
    ) {
      if (code === "gfe_required") {
        toast.error(
          (data as { error?: string })?.error ||
            "Complete your Good Faith Exam before scheduling.",
        );
        setGfeGate("pending");
        return;
      }
      toast.error(
        (data as { error?: string })?.error ||
          "That slot is no longer available. Please pick another.",
      );
      await slotPickerRef.current?.reload();
      return;
    }
    if (error || data?.error) {
      toast.error(data?.error || "Could not book that slot. Please pick another.");
      return;
    }
    if (data?.appointment) {
      setConfirmed({
        id: data.appointment.id,
        scheduled_at: data.appointment.scheduled_at,
        duration_minutes: data.appointment.duration_minutes || 30,
      });
    }
  };

  const handlePayRebookingFee = async () => {
    setProcessingRebooking(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-rebooking-checkout",
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create payment.";
      toast.error(msg);
      setProcessingRebooking(false);
    }
  };

  const serviceType = paidBooking?.service_type || "hormone";
  const serviceLabel = SERVICE_LABEL[serviceType] || "Wellness Assessment";

  return (
    <div className="public-page-shell">
      <Helmet>
        <title>Schedule Your Visit | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient/dashboard")}
            className="gap-2 mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to patient portal
          </Button>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-jost">
                Loading your booking...
              </p>
            </div>
          ) : needsRebookingFee ? (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-4">
                  Appointment missed
                </h1>
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Per our policy, cancellations within 24 hours require a
                  rebooking fee to reschedule.
                </p>
              </div>

              <Card className="border-red-200 bg-red-50/30">
                <CardContent className="py-12 text-center">
                  <div className="relative inline-block mb-6">
                    <Calendar className="w-24 h-24 text-muted-foreground/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-red-500" />
                    </div>
                  </div>
                  <p className="text-muted-foreground font-jost mb-6">
                    Your scheduling calendar is locked until the rebooking fee
                    is paid.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-accent" />
                    <span className="text-3xl font-semibold text-foreground font-playfair">
                      {REBOOKING_FEE_DISPLAY}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm font-jost mb-6">
                    Late cancellation / no-show rebooking fee
                  </p>
                  <Button
                    size="lg"
                    onClick={handlePayRebookingFee}
                    disabled={processingRebooking}
                    className="min-w-[280px]"
                  >
                    {processingRebooking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing…
                      </>
                    ) : (
                      `Pay ${REBOOKING_FEE_DISPLAY} rebooking fee`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : confirmed ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-2">
                  You're booked.
                </h1>
                <p className="font-jost text-muted-foreground">
                  Your {serviceLabel} is on the calendar.
                </p>
              </div>
              <BookingConfirmedCard
                appointmentId={confirmed.id}
                serviceLabel={serviceLabel}
                scheduledAt={confirmed.scheduled_at}
                durationMinutes={confirmed.duration_minutes}
                preVisitInstructions={
                  PRE_VISIT[serviceType] || PRE_VISIT.hormone
                }
              />
            </div>
          ) : !paidBooking ? (
            <div className="text-center py-16 space-y-6">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-playfair text-foreground">
                {wellnessPaidNoBooking ? "Scheduling record needs a moment" : "No paid consultation found"}
              </h1>
              <p className="font-jost text-muted-foreground max-w-xl mx-auto">
                {wellnessPaidNoBooking
                  ? "Your $79 wellness assessment is on file, but we couldn't open the scheduler automatically. Call the clinic and we'll link your account — or try again in a moment."
                  : "We don't see a paid $79 consultation on your account yet. Complete enrollment to pay and continue."}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {wellnessPaidNoBooking ? (
                  <>
                    <Button onClick={() => window.location.reload()}>Try again</Button>
                    <Button variant="outline" onClick={() => navigate("/patient/dashboard")}>
                      Patient portal
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate("/consult/start")}>Start enrollment</Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-jost pt-4">
                Already paid and not seeing it?{" "}
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="text-accent hover:underline"
                >
                  Call {SITE_CONFIG.phone}
                </a>
              </p>
            </div>
          ) : gfeGate !== "cleared" ? (
            <div className="space-y-6 py-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
                  <Lock className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-3xl font-playfair text-foreground">Complete your Good Faith Exam first</h1>
                <p className="font-jost text-muted-foreground max-w-lg mx-auto">
                  Your $79 wellness assessment is paid. Finish the remote Qualiphy medical clearance sent to your email
                  and phone — then return here to book your in-person visit.
                </p>
                <Button onClick={() => navigate("/patient/dashboard")}>Go to patient portal</Button>
              </div>
              {needsReferralCapture && (
                <ReferralSourceCapture
                  compact
                  onRecorded={() => setNeedsReferralCapture(false)}
                />
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {needsReferralCapture && (
                <ReferralSourceCapture onRecorded={() => setNeedsReferralCapture(false)} />
              )}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-3">
                  Pick a time for your visit
                </h1>
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Your Good Faith Exam is complete. Choose an open slot for your {serviceLabel}.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <ProviderChooser
                    serviceLine="consult"
                    selectedProviderId={providerId}
                    onChange={setProviderId}
                    patientFacing
                  />
                  <CancellationPolicySummary variant="clinical-compact" />
                  <SlotPicker
                    ref={slotPickerRef}
                    serviceLine="consult"
                    durationMinutes={30}
                    providerId={providerId || PATIENT_SELF_SERVICE_PROVIDER_ID}
                    onConfirm={handleConfirm}
                    confirmLabel="Book this time"
                  />
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground text-center font-jost">
                Questions? Call us at{" "}
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="text-accent hover:underline"
                >
                  {SITE_CONFIG.phone}
                </a>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleConsult;
