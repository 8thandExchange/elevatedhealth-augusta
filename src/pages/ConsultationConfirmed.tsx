import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import SlotPicker from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";

const SERVICE_LABELS: Record<
  string,
  {
    title: string;
    serviceLine: string;
    preVisitInstructions: string[];
  }
> = {
  hormone: {
    title: "Hormone Optimization Consultation",
    serviceLine: "consult",
    preVisitInstructions: [
      "Bring photo ID and a list of any current medications",
      "Plan to be on-site about 45 minutes (consult + lab draw)",
      "Eat normally beforehand — no fasting required",
    ],
  },
  weight_loss: {
    title: "Medical Weight Loss Consultation",
    serviceLine: "consult",
    preVisitInstructions: [
      "Bring photo ID and a list of any current medications",
      "Plan to be on-site about 45 minutes (consult + lab draw)",
      "Bring recent labs if you have them",
    ],
  },
  peptide: {
    title: "Peptide Protocols Consultation",
    serviceLine: "consult",
    preVisitInstructions: [
      "Bring photo ID and a list of any current medications",
      "Plan to be on-site about 45 minutes",
      "Bring any recent bloodwork or sleep-study results",
    ],
  },
};

interface ConfirmedAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
}

const ConsultationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const serviceType = searchParams.get("service") || "hormone";
  const serviceInfo = SERVICE_LABELS[serviceType] || SERVICE_LABELS.hormone;

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-consultation-payment",
          {
            body: { session_id: sessionId },
          },
        );

        if (error) throw error;

        if (data?.success) {
          setVerificationSuccess(true);
          // Find the consultation_bookings row that verify-consultation-payment
          // just created/updated, so we can pass its id to book-consult-appointment.
          const { data: row } = await supabase
            .from("consultation_bookings")
            .select("id, booked_for")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          if (row) {
            setBookingId(row.id);
            // If verify-consultation-payment runs after the patient previously
            // refreshed and already booked, keep them on the confirmed view.
            if (row.booked_for) {
              const { data: appt } = await supabase
                .from("appointments")
                .select("id, scheduled_at, duration_minutes")
                .eq("consultation_booking_id", row.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (appt) setConfirmed(appt as ConfirmedAppointment);
            }
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Failed to verify payment. Please contact us.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleConfirm = async ({
    slot,
  }: {
    slot: { provider_id: string; start: string };
  }) => {
    if (!bookingId) {
      toast.error("Booking record missing. Please call us at " + SITE_CONFIG.phone);
      return;
    }
    const { data, error } = await supabase.functions.invoke(
      "book-consult-appointment",
      {
        body: {
          booking_id: bookingId,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {isVerifying ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-jost">
                Confirming your payment...
              </p>
            </div>
          ) : !verificationSuccess ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="font-playfair text-2xl text-foreground">
                  We couldn't verify that payment
                </p>
                <p className="text-muted-foreground font-jost">
                  If your card was charged, please call us at{" "}
                  <a
                    href={`tel:${SITE_CONFIG.phoneRaw}`}
                    className="text-accent hover:underline"
                  >
                    {SITE_CONFIG.phone}
                  </a>{" "}
                  and we'll get you scheduled.
                </p>
              </CardContent>
            </Card>
          ) : confirmed ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-2">
                  Payment confirmed.
                </h1>
                <p className="font-jost text-muted-foreground">
                  Your {serviceInfo.title} is on the calendar.
                </p>
              </div>
              <BookingConfirmedCard
                appointmentId={confirmed.id}
                serviceLabel={serviceInfo.title}
                scheduledAt={confirmed.scheduled_at}
                durationMinutes={confirmed.duration_minutes}
                preVisitInstructions={serviceInfo.preVisitInstructions}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-3">
                  Payment confirmed.
                </h1>
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Pick a time below for your {serviceInfo.title}. You'll meet
                  your provider in person at our Evans clinic.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <ProviderChooser
                    serviceLine={serviceInfo.serviceLine}
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
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-jost pt-2 border-t border-border">
                    <Phone className="h-4 w-4" />
                    <span>
                      Need help? Call us at{" "}
                      <a
                        href={`tel:${SITE_CONFIG.phoneRaw}`}
                        className="text-accent hover:underline"
                      >
                        {SITE_CONFIG.phone}
                      </a>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-accent/15">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair text-lg text-foreground mb-1">
                        Receipt is in your inbox
                      </h3>
                      <p className="font-jost text-sm text-muted-foreground">
                        We've emailed your payment receipt and your $79
                        consultation credit code. The full booking confirmation
                        — with calendar invite and pre-visit instructions —
                        will land as soon as you pick a time above.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConsultationConfirmed;
