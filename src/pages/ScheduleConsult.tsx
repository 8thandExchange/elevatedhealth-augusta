import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Package, Calendar, Loader2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

const ScheduleConsult = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

              {/* Booking Calendar */}
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
                  <iframe
                    src={SITE_CONFIG.bookingLinks.labReview}
                    style={{ border: 0, width: "100%", height: "600px" }}
                    title="Schedule Lab Review Appointment"
                  />
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
