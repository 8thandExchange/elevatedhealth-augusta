import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Clock, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Helmet } from "react-helmet";

const KetaminePaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientEmail, setPatientEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndNotify = async () => {
      if (!sessionId) {
        setVerifying(false);
        setError("No session ID found");
        return;
      }

      try {
        // Verify the payment and send notification to Lauren
        const { data, error } = await supabase.functions.invoke("verify-ketamine-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.success) {
          setVerified(true);
          setPatientName(data.name || "Patient");
          setPatientEmail(data.email);
        } else {
          setError(data.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verifyAndNotify();
  }, [sessionId]);

  return (
    <>
      <Helmet>
        <title>Registration Confirmed | Réveil</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
              {verifying ? (
                <Card className="text-center p-12">
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-16 w-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
                      <p className="text-lg text-muted-foreground">Processing your registration...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : verified ? (
                <>
                  {/* Success Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-fade-in">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="font-cormorant text-3xl sm:text-4xl text-foreground mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                      Registration Confirmed
                    </h1>
                    <p className="text-gold text-lg font-light animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      Your Secure Portal is Being Prepared
                    </p>
                  </div>

                  {/* Main Card */}
                  <Card className="border-gold/30 shadow-lg mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <CardContent className="p-8 sm:p-10">
                      {/* Shield Icon */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <Shield className="h-16 w-16 text-primary" />
                          <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      <p className="text-center text-lg text-muted-foreground font-light leading-relaxed mb-8">
                        To ensure the highest level of privacy and safety, our clinical team is currently 
                        generating your <span className="text-foreground font-medium">encrypted medical chart</span> in Osmind.
                      </p>

                      {/* Action Item Box */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="bg-gold/10 rounded-full p-4">
                            <Mail className="h-10 w-10 text-gold animate-pulse" />
                          </div>
                        </div>
                        <h3 className="font-cormorant text-xl text-foreground mb-3">
                          Check Your Email
                        </h3>
                        <p className="text-muted-foreground font-light mb-4">
                          Please check your email at <span className="font-medium text-foreground">{patientEmail}</span> in 
                          the next <span className="text-primary font-medium">1-2 hours</span> for a secure invitation from Osmind.
                        </p>
                        <p className="text-sm text-muted-foreground/80 italic">
                          You must click that link to complete your medical screening before your appointment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* What to Expect */}
                  <Card className="border-border/50 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <CardContent className="p-6">
                      <h4 className="font-cormorant text-lg text-foreground mb-4 text-center">What to Expect</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-gold">1</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">Email from Osmind</span> — Secure intake invitation within 1-2 hours
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-gold">2</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">Complete Screening</span> — Medical history & mental health questionnaire
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-gold">3</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">Provider Review</span> — We'll reach out to schedule your session
                          </p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <div className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <p>
                      Questions? Call us at{" "}
                      <a href={`tel:${SITE_CONFIG.phone}`} className="text-primary hover:underline font-medium">
                        {SITE_CONFIG.phone}
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <Card className="text-center p-12">
                  <CardContent>
                    <div className="text-red-500 mb-4">
                      <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Verification Issue</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <div className="space-y-4">
                      <Button asChild variant="outline">
                        <a href="/ketamine">Return to Ketamine Therapy</a>
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact us at{" "}
                        <a href={`tel:${SITE_CONFIG.phone}`} className="text-primary hover:underline">
                          {SITE_CONFIG.phone}
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default KetaminePaymentSuccess;
