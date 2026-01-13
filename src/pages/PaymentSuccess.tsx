import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Package, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Helmet } from "react-helmet";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        setError("No session ID found");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-hormone-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.success) {
          setVerified(true);
          setEmail(data.email);
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

    verifyPayment();
  }, [sessionId]);

  const nextSteps = [
    {
      icon: Package,
      title: "ZRT Kit Ships",
      description: "Your at-home saliva test kit will be shipped within 1-2 business days",
      timeline: "1-2 days"
    },
    {
      icon: Calendar,
      title: "Complete Your Test",
      description: "Follow the simple instructions to collect your saliva samples at home",
      timeline: "5-7 days"
    },
    {
      icon: Phone,
      title: "Lab Review Session",
      description: "Schedule your 45-minute deep-dive consultation to review results and create your protocol",
      timeline: "2 weeks"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Payment Successful | Elevated Health Augusta</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              {verifying ? (
                <Card className="text-center p-12">
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-16 w-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
                      <p className="text-lg text-muted-foreground">Verifying your payment...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : verified ? (
                <>
                  {/* Success Header */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                      Your Hormone Mapping Package is Confirmed!
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                      Thank you for your purchase. A confirmation email has been sent to{" "}
                      <span className="font-semibold text-foreground">{email}</span>
                    </p>
                  </div>

                  {/* Next Steps */}
                  <Card className="mb-8">
                    <CardContent className="p-8">
                      <h2 className="text-xl font-bold mb-6 text-center">What Happens Next</h2>
                      <div className="space-y-6">
                        {nextSteps.map((step, index) => {
                          const Icon = step.icon;
                          return (
                            <div key={index} className="flex gap-4 items-start">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Icon className="h-6 w-6 text-primary" />
                                </div>
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{step.title}</h3>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {step.timeline}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                              {index < nextSteps.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-4 hidden sm:block" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Book Lab Review */}
                  <Card className="mb-8 border-2 border-primary">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h2 className="text-xl font-bold mb-2">Schedule Your Lab Review Now</h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Don't wait! Book your 45-minute Lab Review session for 2 weeks from now so it's on the calendar when your results come in.
                      </p>
                      <Button
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary-dark text-primary-foreground"
                      >
                        <a
                          href={SITE_CONFIG.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="mr-2 h-5 w-5" />
                          Book Lab Review Session
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <div className="text-center text-sm text-muted-foreground">
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
                        <Link to="/hormones-women">Return to Hormone Therapy</Link>
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

export default PaymentSuccess;
