import { useEffect, useState } from "react";
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
import SlotPicker from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";

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
  hormone: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes (consult + lab draw)",
  ],
  weight_loss: [
    "Bring photo ID and a list of any current medications",
    "Bring recent labs if you have them",
  ],
  peptide: [
    "Bring photo ID and a list of any current medications",
    "Bring any recent bloodwork or sleep-study results",
  ],
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
  const [providerId, setProviderId] = useState<string | null>(null);
  const [processingRebooking, setProcessingRebooking] = useState(false);

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
        const { data: patient } = await supabase
          .from("patients")
          .select("id, email, onboarding_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (patient?.onboarding_status === "rebooking_fee_required") {
          setNeedsRebookingFee(true);
          setLoading(false);
          return;
        }

        const email = patient?.email || user.email;
        if (!email) {
          toast.error("We couldn't find your account email.");
          navigate("/patient/dashboard");
          return;
        }

        // Most-recent paid consultation_bookings row that hasn't been
        // scheduled yet (or whose appointment was cancelled).
        const { data: booking } = await supabase
          .from("consultation_bookings")
          .select("id, service_type, customer_email, customer_name, booked_for")
          .eq("customer_email", email)
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!booking) {
          setPaidBooking(null);
          setLoading(false);
          return;
        }

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
    slot: { provider_id: string; start: string };
  }) => {
    if (!paidBooking) return;
    const { data, error } = await supabase.functions.invoke(
      "book-consult-appointment",
      {
        body: {
          booking_id: paidBooking.id,
          slot_start: slot.start,
          provider_id: slot.provider_id,
        },
      },
    );
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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Schedule Your Visit | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="pt-32 pb-20">
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
                      $79
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
                      "Pay $79 rebooking fee"
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
                No paid consultation found
              </h1>
              <p className="font-jost text-muted-foreground max-w-xl mx-auto">
                We don't see a paid $79 consultation on your account yet. Pick
                the service line you want to start with — your visit time gets
                scheduled right after payment.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button onClick={() => navigate("/hormones")}>
                  Hormone Optimization
                </Button>
                <Button onClick={() => navigate("/weightloss")} variant="outline">
                  Medical Weight Loss
                </Button>
                <Button onClick={() => navigate("/peptides")} variant="outline">
                  Peptide Protocols
                </Button>
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
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-3">
                  Pick a time for your visit
                </h1>
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Your {serviceLabel} is paid and ready. Choose any open slot
                  below.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <ProviderChooser
                    serviceLine="consult"
                    selectedProviderId={providerId}
                    onChange={setProviderId}
                  />
                  <SlotPicker
                    serviceLine="consult"
                    durationMinutes={30}
                    providerId={providerId || undefined}
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
