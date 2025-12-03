import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Package, Calendar, Loader2, Lock, AlertCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ScheduleConsult = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intakeCompleted, setIntakeCompleted] = useState<boolean | null>(null);
  const [checkingIntake, setCheckingIntake] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No payment session found. Please complete checkout first.");
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-hormone-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;
        if (data?.verified) {
          setVerified(true);
        } else {
          setError("Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Unable to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // CHECK #3: Intake First Lock - Check if logged-in user has completed intake
  useEffect(() => {
    const checkIntakeStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in - can't check intake status
          setIntakeCompleted(false);
          setCheckingIntake(false);
          return;
        }

        const { data: patient } = await supabase
          .from("patients")
          .select("intake_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        setIntakeCompleted(patient?.intake_completed || false);
      } catch (err) {
        console.error("Intake check error:", err);
        setIntakeCompleted(false);
      } finally {
        setCheckingIntake(false);
      }
    };

    if (verified) {
      checkIntakeStatus();
    }
  }, [verified]);

  // Calculate recommended booking date (3 weeks from today)
  const recommendedDate = new Date();
  recommendedDate.setDate(recommendedDate.getDate() + 21);
  const formattedDate = recommendedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!sessionId) {
    return <Navigate to="/hormones-women" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Schedule Your Lab Review | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {verifying ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Confirming your payment...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-destructive text-2xl">!</span>
              </div>
              <h1 className="text-2xl font-cormorant font-semibold text-foreground mb-4">
                Verification Issue
              </h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <p className="text-sm text-muted-foreground">
                Contact us at{" "}
                <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                  {SITE_CONFIG.phone}
                </a>
              </p>
            </div>
          ) : verified ? (
            <div className="space-y-10">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                  Payment Confirmed. Your Hormone Mapping Kit is on the way.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your kit will arrive in 3-5 days. Please schedule your 45-Minute Clinical Strategy Session 
                  with Lauren Bersi below. We recommend choosing a date{" "}
                  <span className="font-semibold text-foreground">3 weeks from today</span> to ensure your 
                  lab results are ready.
                </p>
              </div>

              {/* Kit Shipping Info */}
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ZRT Saliva Test Kit</h3>
                    <p className="text-muted-foreground text-sm">
                      Your at-home hormone testing kit will be shipped to your address within 24 hours. 
                      Complete the simple saliva collection and mail it back using the prepaid label included.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Date */}
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Recommended booking date:</p>
                <p className="text-xl font-semibold text-foreground">{formattedDate} or later</p>
              </div>

              {/* Booking Calendar - WITH INTAKE LOCK */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-cormorant font-semibold text-foreground">
                    Schedule Your 45-Minute Lab Review
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Select a time that works for you. Remember to book at least 3 weeks out.
                  </p>
                </div>
                <div className="p-6">
                  {checkingIntake ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Checking intake status...</p>
                    </div>
                  ) : intakeCompleted ? (
                    // UNLOCKED - Show calendar
                    <iframe
                      src={SITE_CONFIG.bookingLinks.labReview}
                      style={{ border: 0, width: "100%", height: "600px" }}
                      title="Schedule Lab Review Appointment"
                    />
                  ) : (
                    // LOCKED - Intake not complete
                    <div className="text-center py-12 relative">
                      {/* Blurred/disabled calendar placeholder */}
                      <div className="opacity-30 pointer-events-none blur-sm mb-6">
                        <div className="h-[400px] bg-secondary/50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-24 h-24 text-muted-foreground/50" />
                        </div>
                      </div>
                      
                      {/* Lock overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                          <Lock className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Calendar Locked
                        </h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-amber-600 mb-4 cursor-help">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Why is this locked?</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Please complete your Medical Intake Form first to unlock scheduling. This ensures Lauren has your health information before your consultation.</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-muted-foreground text-sm mb-6 max-w-md">
                          Please complete your Medical Intake Form first to unlock scheduling.
                        </p>
                        <Button onClick={() => window.location.href = "/patient/intake"}>
                          Complete Intake Form
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Support Note */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Questions? Call us at{" "}
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                    {SITE_CONFIG.phone}
                  </a>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleConsult;