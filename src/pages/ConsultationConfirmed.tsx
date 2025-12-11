import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, Gift, Copy, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";

// Calendar URLs by service type
const CALENDAR_URLS: Record<string, string> = {
  hormone: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Bvq4ZKUeVHmDYS8aU45o_2Z0oi4uHvILuZr2wqv6tKLPC71WABKyOSrbCwIjzKPqReipYFqST?gv=true",
  weight_loss: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Bvq4ZKUeVHmDYS8aU45o_2Z0oi4uHvILuZr2wqv6tKLPC71WABKyOSrbCwIjzKPqReipYFqST?gv=true",
  // Ketamine Candidacy Review (15 min) - for paid $99 consultations
  ketamine: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true",
  peptide: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3MR6nvUsM4Se9w_L8puDzb-0hWDSKLm6mlgwgeS-q0bBr0lVhS2PXET0ujlCE5ci9gzE0QPMis?gv=true",
};

// Service type labels
const SERVICE_LABELS: Record<string, { title: string; specialist: string; creditInfo: string; steps: string[] }> = {
  hormone: {
    title: "Hormone Consultation",
    specialist: "hormone specialist",
    creditInfo: "Use this code when purchasing Hormone Mapping to receive $99 off (pay only $200 instead of $299).",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our hormone specialist to discuss your goals and symptoms",
      "If you're a good fit, use your credit code for $99 off Hormone Mapping",
      "Receive your at-home test kit and begin your hormone optimization journey"
    ]
  },
  weight_loss: {
    title: "Weight Loss Consultation",
    specialist: "weight management specialist",
    creditInfo: "Use this code when purchasing Metabolic Mapping to receive $99 off (pay only $200 instead of $299).",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our weight management specialist to discuss your goals",
      "If you're a good fit, use your credit code for $99 off Metabolic Mapping",
      "Begin your medically-supervised weight loss journey"
    ]
  },
  ketamine: {
    title: "Ketamine Candidacy Review",
    specialist: "clinical team",
    creditInfo: "Your $99 will be credited toward your first ketamine infusion session when you move forward with treatment.",
    steps: [
      "Book your 15-minute Candidacy Review using the calendar above",
      "We'll confirm your medical history and discuss your mental health goals",
      "If cleared, we'll book your comprehensive intake and first session immediately",
      "Your $99 credit applies to your first infusion—you'll only pay the balance"
    ]
  },
  peptide: {
    title: "Peptide Consultation",
    specialist: "peptide therapy specialist",
    creditInfo: "Your $99 consultation fee will be credited toward your peptide protocol.",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our peptide specialist to discuss your optimization goals",
      "If you're a good fit, your $99 credit applies to your peptide protocol",
      "Begin your cellular optimization journey"
    ]
  },
};

const ConsultationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const creditCode = searchParams.get("credit");
  const serviceType = searchParams.get("service") || "hormone";
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const serviceInfo = SERVICE_LABELS[serviceType] || SERVICE_LABELS.hormone;
  const bookingUrl = CALENDAR_URLS[serviceType] || CALENDAR_URLS.hormone;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-consultation-payment", {
          body: { session_id: sessionId, credit_code: creditCode }
        });

        if (error) throw error;

        if (data?.success) {
          setVerificationSuccess(true);
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Failed to verify payment. Please contact us.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, creditCode]);

  const handleCopyCode = () => {
    if (creditCode) {
      navigator.clipboard.writeText(creditCode);
      setCopied(true);
      toast.success("Credit code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {isVerifying ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
              <p className="text-muted-foreground">Confirming your payment...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                  Payment Confirmed!
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Thank you for booking your {serviceInfo.title}. Your next step is to schedule your call.
                </p>
              </div>

              {/* Credit Code Card */}
              {creditCode && (
                <Card className="border-gold/30 bg-gold/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-gold/10">
                        <Gift className="h-6 w-6 text-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Your $99 Credit Code</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {serviceInfo.creditInfo}
                        </p>
                        <div className="flex items-center gap-3">
                          <code className="bg-background px-4 py-2 rounded-lg font-mono text-lg font-bold tracking-wider border">
                            {creditCode}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCode}
                            className="gap-2"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Booking Section */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-6 w-6 text-gold" />
                    <h2 className="text-xl font-semibold">Schedule Your Consultation</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    Select a time that works best for you. Your call will be with one of our {serviceInfo.specialist}s.
                  </p>

                  {/* Embedded Calendar */}
                  <div className="rounded-lg overflow-hidden border mb-6">
                    <iframe
                      src={bookingUrl}
                      style={{ border: 0, width: "100%", height: "500px" }}
                      title="Book Discovery Consultation"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Need help? Call us at {SITE_CONFIG.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">What Happens Next?</h3>
                  <ol className="space-y-3 text-sm">
                    {serviceInfo.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="font-bold text-gold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
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
