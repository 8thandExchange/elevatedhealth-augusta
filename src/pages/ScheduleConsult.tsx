import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Lock, CreditCard, AlertTriangle, Calendar, ArrowLeft } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import KitTracker from "@/components/patient/KitTracker";
import { Card, CardContent } from "@/components/ui/card";

const GOOGLE_CALENDAR_URL = SITE_CONFIG.bookingUrl;

const ScheduleConsult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [kitData, setKitData] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);
  const [processingRebooking, setProcessingRebooking] = useState(false);

  // Handle rebooking success return
  useEffect(() => {
    const rebookingParam = searchParams.get("rebooking");
    if (rebookingParam === "success" && patientId) {
      // Update status back to ready to book
      const updateStatus = async () => {
        try {
          await supabase
            .from("patients")
            .update({ onboarding_status: "consult_scheduled" })
            .eq("id", patientId);
          setOnboardingStatus("consult_scheduled");
          toast.success("Rebooking fee paid! You can now schedule your appointment.");
        } catch (err) {
          console.error("Status update error:", err);
        }
      };
      updateStatus();
    }
  }, [searchParams, patientId]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Please log in to access this page");
          navigate("/patient/login");
          return;
        }

        // Get patient record
        const { data: patient } = await supabase
          .from("patients")
          .select("id, onboarding_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!patient) {
          toast.error("Patient record not found");
          navigate("/patient/dashboard");
          return;
        }

        setPatientId(patient.id);
        setOnboardingStatus(patient.onboarding_status);

        // Check for paid hormone mapping payment
        const { data: payment } = await supabase
          .from("hormone_mapping_payments")
          .select("*")
          .eq("patient_id", patient.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (payment) {
          setHasPaid(true);
          setKitData(payment);
        }
      } catch (err) {
        console.error("Payment check error:", err);
        toast.error("Unable to verify payment status");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [navigate]);

  const handleConfirmBooking = async () => {
    if (!patientId) return;
    
    setConfirming(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ onboarding_status: "consult_scheduled" })
        .eq("id", patientId);

      if (error) throw error;

      toast.success("Booking Confirmed!", {
        description: "You'll receive a confirmation email shortly. Check your inbox and spam folder.",
        duration: 6000,
      });
      setTimeout(() => navigate("/patient/dashboard"), 2000);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handlePayRebookingFee = async () => {
    setProcessingRebooking(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-rebooking-checkout");
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Rebooking checkout error:", err);
      toast.error(err.message || "Failed to create payment. Please try again.");
      setProcessingRebooking(false);
    }
  };

  // Check if patient is in the "penalty box" (needs to pay rebooking fee)
  const needsRebookingFee = onboardingStatus === "rebooking_fee_required";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Schedule Your Strategy Call | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/patient/dashboard")}
            className="gap-2 mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient Portal
          </Button>
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Checking your payment status...</p>
            </div>
          ) : needsRebookingFee ? (
            /* Penalty Box - Missed Appointment State */
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                  Appointment Missed
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Per our policy, cancellations within 24 hours require a re-booking fee to reschedule.
                </p>
              </div>

              {/* Locked Calendar Visual */}
              <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <Calendar className="w-24 h-24 text-muted-foreground/30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-red-500" />
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Your scheduling calendar is locked until the rebooking fee is paid.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Rebooking Fee Payment Card */}
              <Card className="border-border bg-card">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <span className="text-3xl font-semibold text-foreground">$99</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                      Late Cancellation / No-Show Rebooking Fee
                    </p>
                    <Button
                      size="xl"
                      onClick={handlePayRebookingFee}
                      disabled={processingRebooking}
                      className="min-w-[280px]"
                    >
                      {processingRebooking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Pay $99 Rebooking Fee"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Support Note */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Questions about this policy? Call us at{" "}
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                    {SITE_CONFIG.phone}
                  </a>
                </p>
              </div>
            </div>
          ) : hasPaid ? (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                  Schedule Your Strategy Call
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your Hormone Mapping payment is confirmed. Select a time below for your 
                  45-minute Clinical Strategy Session with Lauren Bursey.
                </p>
              </div>

              {/* Kit Tracker - Show current status */}
              {kitData && (
                <KitTracker
                  status={kitData.zrt_kit_status}
                  trackingNumber={kitData.tracking_number}
                  shippedAt={kitData.shipped_at}
                  sampleReceivedAt={kitData.sample_received_at}
                  resultsReadyAt={kitData.results_ready_at}
                />
              )}

              {/* Google Calendar Embed */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-cormorant font-semibold text-foreground">
                    Book Your Appointment
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    We recommend booking 3 weeks out to allow time for your lab results.
                  </p>
                </div>
                <div className="p-0">
                  <iframe
                    src={GOOGLE_CALENDAR_URL}
                    style={{ border: 0 }}
                    width="100%"
                    height="800"
                    title="Schedule Strategy Call"
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Confirm Booking Button */}
              <div className="text-center space-y-4">
                <Button
                  size="xl"
                  onClick={handleConfirmBooking}
                  disabled={confirming}
                  className="min-w-[300px]"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking & Return to Dashboard"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Click after you've selected your appointment time above
                </p>
              </div>

              {/* Support Note */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
                <p>
                  Questions? Call us at{" "}
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                    {SITE_CONFIG.phone}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* Payment Required State */
            <div className="text-center py-16 space-y-8">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                  Payment Required
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  To schedule your Strategy Call, please complete your $349 Hormone Mapping 
                  payment first. This includes your at-home ZRT test kit and 45-minute clinical review.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-2xl font-semibold text-foreground">$349</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  Hormone Mapping Experience includes ZRT Saliva Test Kit + Strategy Session
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/hormones-women")}
                  className="w-full"
                >
                  Start Hormone Mapping
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Already paid? Contact us at{" "}
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                    {SITE_CONFIG.phone}
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleConsult;
