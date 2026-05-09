import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import SlotPicker from "@/components/booking/SlotPicker";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const IVPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const therapyName = searchParams.get("therapy") || "IV Therapy";
  const sessionId = searchParams.get("session_id") || "";
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);

  const handleConfirm = async ({
    slot,
  }: {
    slot: { provider_id: string; start: string };
  }) => {
    if (!sessionId) {
      toast.error("Missing payment session id. Please call us at " + SITE_CONFIG.phone);
      return;
    }
    const { data, error } = await supabase.functions.invoke(
      "book-iv-appointment",
      {
        body: {
          session_id: sessionId,
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
        duration_minutes: data.appointment.duration_minutes || 60,
      });
    }
  };

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
              {!confirmed && (
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Your <strong>{therapyName}</strong> is paid. Pick a time below
                  and we'll have you in the chair.
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
            ) : (
              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-accent" />
                    <h2 className="font-playfair text-xl text-foreground">
                      Schedule your IV session
                    </h2>
                  </div>
                  <p className="text-muted-foreground font-jost">
                    Sessions run 45–60 minutes in our private IV lounge.
                  </p>
                  <SlotPicker
                    serviceLine="iv"
                    durationMinutes={60}
                    onConfirm={handleConfirm}
                    confirmLabel="Confirm IV session"
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
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IVPaymentSuccess;
