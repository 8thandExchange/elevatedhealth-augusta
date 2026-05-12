/**
 * /alacarte-success
 *
 * Post-payment landing for à la carte purchases. Five product paths:
 *
 *   testosterone / biEst / progesterone  → medication ships from FCC.
 *                                          No CTA, no slot picker, just a
 *                                          shipment confirmation block.
 *
 *   followUp ($99 follow-up consult)     → SlotPicker for a 30-min
 *                                          follow-up visit. Booking is
 *                                          paid_external (already paid at
 *                                          checkout), no new Stripe charge.
 *
 *   labPanel ($250 lab panel, in-house)  → SlotPicker for a 15-min lab
 *                                          draw. Booking is paid_external,
 *                                          no new Stripe charge.
 *
 * Replaces the legacy "Discuss with Provider → Google Calendar iframe"
 * upsell, which booked nothing in our system.
 *
 * Flag for follow-up work: lab_draw is currently routed through
 * service_line='consult' because we don't yet have a separate lab_draw
 * service line or a phlebotomy capability flag on providers. Caroline's
 * 'consult' availability is what backs lab-draw bookings until we
 * introduce that distinction.
 */
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Package,
  Phone,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SlotPicker, { type SlotPickerHandle } from "@/components/booking/SlotPicker";
import ProviderChooser from "@/components/booking/ProviderChooser";
import BookingConfirmedCard from "@/components/booking/BookingConfirmedCard";

type ProductKey = "testosterone" | "biEst" | "progesterone" | "followUp" | "labPanel";

interface ProductInfo {
  label: string;
  category: string;
  /** What kind of post-payment surface to render. */
  fulfillment: "medication" | "follow_up_visit" | "lab_draw";
  serviceLine?: "consult" | "follow_up";
  durationMinutes?: number;
  appointmentType?: string;
  serviceTypeForBooking?: string;
}

const PRODUCT_CATALOG: Record<ProductKey, ProductInfo> = {
  testosterone: {
    label: "Testosterone Cream",
    category: "Men's HRT",
    fulfillment: "medication",
  },
  biEst: {
    label: "Bi-Est Cream",
    category: "Women's HRT",
    fulfillment: "medication",
  },
  progesterone: {
    label: "Progesterone Cream",
    category: "Women's HRT",
    fulfillment: "medication",
  },
  followUp: {
    label: "Follow-up Consultation",
    category: "Provider Visit",
    fulfillment: "follow_up_visit",
    serviceLine: "follow_up",
    durationMinutes: 30,
    appointmentType: "follow_up_visit",
  },
  labPanel: {
    label: "Lab Panel",
    category: "Diagnostics",
    fulfillment: "lab_draw",
    serviceLine: "consult",
    durationMinutes: 15,
    appointmentType: "lab_draw",
  },
};

const isProductKey = (k: string | null): k is ProductKey =>
  !!k && k in PRODUCT_CATALOG;

const FOLLOW_UP_INSTRUCTIONS = [
  "Bring a list of your current medications and supplements.",
  "If you've drawn labs at LabCorp, bring or upload your results before the visit.",
  "Wear something comfortable; brief vitals will be taken at intake.",
];

const LAB_DRAW_INSTRUCTIONS = [
  "Fast 8–12 hours beforehand unless your physician told you otherwise.",
  "Drink water — well-hydrated veins draw faster.",
  "Bring photo ID. The visit takes about 15 minutes.",
];

interface BookedAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_line: string;
  appointment_type: string;
}

const AlaCartePaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productKey = searchParams.get("product");
  const sessionId = searchParams.get("session_id");
  const productInfo: ProductInfo | null = isProductKey(productKey)
    ? PRODUCT_CATALOG[productKey]
    : null;

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [existingAppointment, setExistingAppointment] = useState<BookedAppointment | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<BookedAppointment | null>(null);
  const slotPickerRef = useRef<SlotPickerHandle>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!sessionId) {
        // Older alacarte links may not include session_id. Fall back to
        // showing the product confirmation panel without verification.
        if (!cancelled) {
          setVerifying(false);
          setVerified(true);
        }
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("verify-alacarte-payment", {
          body: { session_id: sessionId },
        });
        if (cancelled) return;
        if (error) throw error;
        if (!data?.success) {
          setVerificationError(data?.message || "We couldn't confirm payment yet.");
          setVerifying(false);
          return;
        }
        setBookingId(data.booking_id || null);
        setVerified(true);

        if (data.booking_id) {
          const { data: existing } = await supabase
            .from("appointments")
            .select("id, scheduled_at, duration_minutes, service_line, appointment_type")
            .eq("consultation_booking_id", data.booking_id)
            .order("scheduled_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!cancelled && existing) {
            setExistingAppointment(existing as BookedAppointment);
          }
        }
      } catch (e) {
        if (cancelled) return;
        console.error("verify-alacarte-payment failed", e);
        setVerificationError("We couldn't verify your payment. Please call (706) 760-3470.");
      } finally {
        if (!cancelled) setVerifying(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleConfirmSlot = async ({ slot }: { slot: { provider_id: string; start: string } }) => {
    if (!productInfo || !bookingId) {
      toast.error("Booking record not found. Please call us at (706) 760-3470.");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("book-consult-appointment", {
        body: {
          booking_id: bookingId,
          slot_start: slot.start,
          provider_id: slot.provider_id,
          appointment_type: productInfo.appointmentType,
          duration_minutes: productInfo.durationMinutes,
          service_line_override: productInfo.serviceLine,
        },
      });
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
        return;
      }
      if (error) throw error;
      const created = data?.appointment;
      if (!created) throw new Error("Booking did not return an appointment");
      setBookedAppointment({
        id: created.id,
        scheduled_at: created.scheduled_at,
        duration_minutes: created.duration_minutes,
        service_line: created.service_line,
        appointment_type: created.appointment_type,
      });
      toast.success("You're booked.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("book-consult-appointment failed", e);
      toast.error(msg.includes("just got booked") ? msg : "Couldn't confirm that slot. Please pick another or call us.");
    }
  };

  const renderShipmentConfirmation = () => (
    <Card className="border-accent/30 mb-6">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-jost text-xs uppercase tracking-[2.5px] text-muted-foreground mb-1">
              Ships in 5–7 business days
            </p>
            <p className="font-playfair text-2xl text-foreground mb-3">
              {productInfo?.label}
            </p>
            <p className="font-jost font-light text-sm text-muted-foreground mb-3">
              Compounded under 503A pharmacy authority at FCC (Lewisville, TX)
              and shipped direct to the address on file.
            </p>
            <p className="font-jost text-sm text-foreground">
              You already have an active prescription — no visit is required.
              Caroline will reach out within 2 business days if there's anything
              we need to confirm.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderVisitBookingFlow = () => {
    if (!productInfo || !productInfo.serviceLine || !productInfo.durationMinutes) return null;

    if (existingAppointment || bookedAppointment) {
      const appt = (bookedAppointment || existingAppointment) as BookedAppointment;
      const isLab = productInfo.fulfillment === "lab_draw";
      return (
        <BookingConfirmedCard
          appointmentId={appt.id}
          serviceLabel={productInfo.label}
          scheduledAt={appt.scheduled_at}
          durationMinutes={appt.duration_minutes}
          preVisitInstructions={isLab ? LAB_DRAW_INSTRUCTIONS : FOLLOW_UP_INSTRUCTIONS}
        />
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 md:p-8 space-y-2">
            <p className="section-label">Schedule your {productInfo.label.toLowerCase()}</p>
            <h2 className="font-playfair text-2xl text-foreground">
              You've already paid &mdash; now pick a time.
            </h2>
            <p className="font-jost font-light text-sm text-muted-foreground">
              {productInfo.fulfillment === "lab_draw"
                ? "Lab draws are quick (about 15 minutes). Caroline runs the draw on-site at our Evans clinic."
                : "Follow-up visits are 30 minutes with your physician or RN."}
            </p>
          </CardContent>
        </Card>

        <ProviderChooser
          serviceLine={productInfo.serviceLine}
          selectedProviderId={providerId}
          onChange={setProviderId}
          hideWhenSingle
        />

        {providerId && (
          <SlotPicker
            ref={slotPickerRef}
            serviceLine={productInfo.serviceLine === "follow_up" ? "follow_up" : "consult"}
            durationMinutes={productInfo.durationMinutes}
            providerId={providerId}
            onConfirm={handleConfirmSlot}
            confirmLabel="Confirm appointment"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Order Confirmed | {SITE_CONFIG.clinicName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <p className="section-label mb-3">{productInfo?.category ?? "Order"}</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
              Order confirmed.
            </h1>
            {productInfo ? (
              <p className="font-jost font-light text-lg text-muted-foreground max-w-xl mx-auto">
                Your <span className="text-foreground font-medium">{productInfo.label}</span> order
                has been received. A receipt is on its way to your inbox.
              </p>
            ) : (
              <p className="font-jost font-light text-lg text-muted-foreground max-w-xl mx-auto">
                Your order has been received. A receipt is on its way to your inbox.
              </p>
            )}
          </div>

          {verifying && (
            <Card className="text-center">
              <CardContent className="p-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
                <p className="font-jost text-muted-foreground">Verifying your payment&hellip;</p>
              </CardContent>
            </Card>
          )}

          {!verifying && verificationError && (
            <Card className="border-destructive/30 mb-6">
              <CardContent className="p-6 text-center space-y-3">
                <p className="font-jost text-foreground">{verificationError}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.assign(`tel:${SITE_CONFIG.phoneRaw}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call {SITE_CONFIG.phone}
                </Button>
              </CardContent>
            </Card>
          )}

          {!verifying && verified && productInfo?.fulfillment === "medication" &&
            renderShipmentConfirmation()}

          {!verifying && verified && productInfo?.fulfillment !== "medication" &&
            productInfo &&
            renderVisitBookingFlow()}

          {!verifying && verified && !productInfo && (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="font-jost text-muted-foreground mb-4">
                  We couldn't identify the product on this confirmation. If something looks off,
                  please call us at {SITE_CONFIG.phone}.
                </p>
                <Button onClick={() => navigate("/patient/dashboard")}>Return to dashboard</Button>
              </CardContent>
            </Card>
          )}

          {/* Common contact strip */}
          <Card className="bg-secondary/30 mt-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-playfair text-lg text-foreground mb-3">
                Need to make a change or have a question?
              </h3>
              <p className="font-jost font-light text-sm text-muted-foreground mb-4">
                Reach Caroline directly. Members get same-day SMS response during clinic hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.assign(`tel:${SITE_CONFIG.phoneRaw}`)}
                  className="font-jost"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {SITE_CONFIG.phone}
                </Button>
                <Button asChild variant="outline" className="font-jost">
                  <Link to="/patient/dashboard">
                    <Calendar className="w-4 h-4 mr-2" />
                    Open patient portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild variant="outline" className="font-jost">
              <Link to="/">
                Return home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AlaCartePaymentSuccess;
