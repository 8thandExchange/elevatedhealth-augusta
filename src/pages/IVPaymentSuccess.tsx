import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Phone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";
import SlotPicker, { type SlotPickerHandle } from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PATIENT_SELF_SERVICE_PROVIDER_ID } from "@/lib/patientBookingConfig";

interface ConfirmedAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
}

const IV_PRE_VISIT = [
  "Arrive hydrated and have eaten a light meal beforehand",
  "Wear comfortable clothing with easy arm access",
  "Bring photo ID; allow 45–60 minutes",
];

const SLOT_CONFLICT_CODES = new Set([
  "room_unavailable",
  "limit_exceeded",
  "room_blackout",
  "slot_taken",
]);

type BookingPhase = "auto_booking" | "pick_slot";

const IVPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const therapyName = searchParams.get("therapy") || "IV Therapy";
  const sessionId = searchParams.get("session_id") || "";
  const slotTokenFromQuery = searchParams.get("slot_token") || "";
  const intakeIdFromQuery = searchParams.get("intake_id") || "";
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);
  const [phase, setPhase] = useState<BookingPhase | null>(null);
  const [providerId, setProviderId] = useState<string | null>(PATIENT_SELF_SERVICE_PROVIDER_ID);
  const slotPickerRef = useRef<SlotPickerHandle>(null);
  const autoBookStartedRef = useRef(false);

  const bookSlot = useCallback(
    async (slotToken: string): Promise<boolean> => {
      if (!sessionId) {
        toast.error("Missing payment session id. Please call us at " + SITE_CONFIG.phone);
        return false;
      }
      const { data, error } = await supabase.functions.invoke("book-iv-appointment", {
        body: {
          session_id: sessionId,
          slot_token: slotToken,
          intake_id: intakeIdFromQuery || undefined,
        },
      });
      const code = (data as { error_code?: string } | null)?.error_code;
      if (code && SLOT_CONFLICT_CODES.has(code)) {
        toast.error(
          (data as { error?: string })?.error ||
            "That slot is no longer available. Please pick another.",
        );
        await slotPickerRef.current?.reload();
        return false;
      }
      if (error || data?.error) {
        toast.error(data?.error || "Could not book that slot. Please pick another.");
        return false;
      }
      if (data?.appointment) {
        setConfirmed({
          id: data.appointment.id,
          scheduled_at: data.appointment.scheduled_at,
          duration_minutes: data.appointment.duration_minutes || 60,
        });
        return true;
      }
      return false;
    },
    [intakeIdFromQuery, sessionId],
  );

  useEffect(() => {
    if (!sessionId || confirmed || autoBookStartedRef.current) return;
    if (!slotTokenFromQuery) {
      setPhase("pick_slot");
      return;
    }
    autoBookStartedRef.current = true;
    const autoBook = async () => {
      setPhase("auto_booking");
      const ok = await bookSlot(slotTokenFromQuery);
      if (!ok) setPhase("pick_slot");
    };
    void autoBook();
  }, [sessionId, slotTokenFromQuery, confirmed, bookSlot]);

  const handleConfirm = async ({
    slot,
  }: {
    slot: { slot_token: string; start: string };
  }) => {
    await bookSlot(slot.slot_token);
  };

  const subhead = confirmed
    ? null
    : phase === "auto_booking"
      ? `Your ${therapyName} is paid. Finalizing your appointment now...`
      : `Your ${therapyName} is paid. Pick a time below and we'll have you in the chair.`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-3">
                Payment confirmed.
              </h1>
              {subhead && (
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  {subhead}
                </p>
              )}
            </div>

            {confirmed ? (
              <BookingConfirmedCard
                appointmentId={confirmed.id}
                serviceLabel={therapyName}
                scheduledAt={confirmed.scheduled_at}
                durationMinutes={confirmed.duration_minutes}
                preVisitInstructions={IV_PRE_VISIT}
              />
            ) : phase === "auto_booking" ? (
              <Card>
                <CardContent className="p-8 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
                    <p className="font-jost text-muted-foreground">
                      Confirming your calendar slot...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : phase === "pick_slot" ? (
              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <ProviderChooser
                    serviceLine="iv"
                    selectedProviderId={providerId}
                    onChange={setProviderId}
                    patientFacing
                  />
                  <SlotPicker
                    ref={slotPickerRef}
                    serviceLine="iv"
                    durationMinutes={60}
                    providerId={providerId || PATIENT_SELF_SERVICE_PROVIDER_ID}
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
            ) : (
              <Card>
                <CardContent className="p-8 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IVPaymentSuccess;
