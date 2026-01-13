import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, Gift, Copy, Check, Phone, MapPin, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";

// Service type labels
const SERVICE_LABELS: Record<string, { title: string; specialist: string; creditInfo: string; steps: string[] }> = {
  hormone: {
    title: "Hormone Consultation",
    specialist: "hormone specialist",
    creditInfo: "Use this code when purchasing Hormone Mapping to receive $99 off (pay only $250 instead of $349).",
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
    creditInfo: "Use this code when purchasing Metabolic Mapping to receive $99 off (pay only $250 instead of $349).",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our weight management specialist to discuss your goals",
      "If you're a good fit, use your credit code for $99 off Metabolic Mapping",
      "Begin your medically-supervised weight loss journey"
    ]
  },
  ketamine: {
    title: "Ketamine Therapy Consultation",
    specialist: "clinical team",
    creditInfo: "Your $99 will be credited toward your first ketamine infusion session when you move forward with treatment.",
    steps: [
      "Book your 45-minute consultation using the calendar above",
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
  hair: {
    title: "Hair Restoration Consultation",
    specialist: "hair restoration specialist",
    creditInfo: "Your $99 consultation fee will be credited toward your hair restoration protocol.",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our specialist about your hair loss concerns and goals",
      "Review FDA-approved treatment options (Finasteride, Minoxidil, Dutasteride, GHK-Cu)",
      "Begin your personalized hair restoration protocol"
    ]
  },
  sexual: {
    title: "Sexual Wellness Consultation",
    specialist: "sexual wellness specialist",
    creditInfo: "Your $99 consultation fee will be credited toward your treatment protocol.",
    steps: [
      "Book your private consultation using the calendar above",
      "Discuss your concerns confidentially with our specialist",
      "Review treatment options (Tadalafil, Sildenafil, PT-141)",
      "Start your discreet, personalized treatment plan"
    ]
  },
};

const ConsultationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const serviceType = searchParams.get("service") || "hormone";
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [creditCode, setCreditCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const serviceInfo = SERVICE_LABELS[serviceType] || SERVICE_LABELS.hormone;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-consultation-payment", {
          body: { session_id: sessionId }
        });

        if (error) throw error;

        if (data?.success) {
          setVerificationSuccess(true);
          // Credit code is generated and returned from the verification function
          if (data.credit_code) {
            setCreditCode(data.credit_code);
          }
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
                      src={SITE_CONFIG.bookingUrl}
                      style={{ border: 0, width: "100%", height: "500px" }}
                      title="Book Discovery Consultation"
                    />
                  </div>

                  {/* Clinic Location - In-Person Consultations */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">In-Person Visit Location</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {SITE_CONFIG.address.line1}<br />
                          {SITE_CONFIG.address.cityStateZip}
                        </p>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE_CONFIG.address.full)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          Get Directions
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
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

              {/* Email Confirmation Preview */}
              <Card className="border-blue-200/50 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Check Your Inbox</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        We've sent a confirmation email to your inbox with:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Your payment receipt</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Your $99 credit code (save this!)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Clinic address and directions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>What to bring to your appointment</span>
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-4">
                        Don't see it? Check your spam folder or contact us at {SITE_CONFIG.phone}
                      </p>
                    </div>
                  </div>
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
