import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, ClipboardCheck, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";

const ConsultationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const serviceType = searchParams.get("service") || "hormone";

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-consultation-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data?.success) {
          setVerificationSuccess(true);
          const { data: row } = await supabase
            .from("consultation_bookings")
            .select("customer_email")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          if (row?.customer_email) setCustomerEmail(row.customer_email);
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

  const createAccountUrl = customerEmail
    ? `/patient/create-account?email=${encodeURIComponent(customerEmail)}`
    : "/patient/create-account";

  return (
    <div className="public-page-shell">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {isVerifying ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-jost">Confirming your payment...</p>
            </div>
          ) : !verificationSuccess ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="font-playfair text-2xl text-foreground">We couldn&apos;t verify that payment</p>
                <p className="text-muted-foreground font-jost">
                  If your card was charged, call{" "}
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-accent hover:underline">
                    {SITE_CONFIG.phone}
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-3">Payment confirmed</h1>
                <p className="font-jost text-lg text-muted-foreground max-w-xl mx-auto">
                  Next up: complete your Good Faith Exam (remote medical clearance). After that, you&apos;ll schedule
                  your in-person wellness assessment.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-full bg-accent/15 h-fit">
                      <ClipboardCheck className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-playfair text-xl mb-2">Step 1 — Good Faith Exam</h2>
                      <p className="text-sm text-muted-foreground font-jost">
                        We&apos;re sending a Qualiphy link to your email and phone. Complete the remote exam (about
                        10–15 minutes). You must finish this before booking your clinic visit.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="p-2 rounded-full bg-muted h-fit">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-playfair text-xl mb-2">Step 2 — Book your visit</h2>
                      <p className="text-sm text-muted-foreground font-jost">
                        Once cleared, sign in to your patient portal or use the scheduling link in your confirmation
                        email to pick an in-person time in Evans.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link to={createAccountUrl}>Create portal account</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/patient/login">Sign in</Link>
                </Button>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-6 flex gap-4">
                  <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground font-jost">
                    Receipt and GFE instructions are on the way to{" "}
                    {customerEmail ? <strong>{customerEmail}</strong> : "your email"}. Program interest: {serviceType.replace(/_/g, " ")}.
                  </p>
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
