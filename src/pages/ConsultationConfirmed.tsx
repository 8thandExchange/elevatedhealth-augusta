import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, Phone, MapPin, ExternalLink, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";

const SERVICE_LABELS: Record<string, { title: string; specialist: string; steps: string[] }> = {
  hormone: {
    title: "Hormone Optimization Consultation",
    specialist: "hormone specialist",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our physician about your goals and symptoms",
      "If you're a good fit, proceed with the $250 Hormone Mapping Panel",
      "Receive your at-home test kit and begin your hormone optimization journey"
    ]
  },
  weight_loss: {
    title: "Weight Loss Consultation",
    specialist: "weight management specialist",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our physician about your weight loss goals",
      "Begin your physician-supervised GLP-1 protocol",
      "Monthly check-ins and dose adjustments as needed"
    ]
  },
  iv_therapy: {
    title: "IV Therapy Consultation",
    specialist: "IV therapy specialist",
    steps: [
      "Book your consultation using the calendar above",
      "Discuss your health goals with our physician",
      "Select your physician-formulated infusion protocol",
      "Schedule your first IV session"
    ]
  },
  peptide: {
    title: "Peptide Protocols Consultation",
    specialist: "peptide therapy specialist",
    steps: [
      "Book your consultation using the calendar above",
      "Speak with our physician about your optimization goals",
      "Begin your physician-prescribed peptide protocol",
      "Regular monitoring and dose adjustments"
    ]
  },
};

const ConsultationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const serviceType = searchParams.get("service") || "hormone";
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {isVerifying ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-jost">Confirming your payment...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair text-foreground mb-4">
                  Payment Confirmed!
                </h1>
                <p className="text-lg text-muted-foreground font-jost max-w-xl mx-auto">
                  Thank you for booking your {serviceInfo.title}. Your next step is to schedule your visit.
                </p>
              </div>

              {/* Booking Section */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-6 w-6 text-accent" />
                    <h2 className="text-xl font-semibold font-jost">Schedule Your Consultation</h2>
                  </div>
                  
                  <p className="text-muted-foreground font-jost mb-6">
                    Select a time that works best for you. Your visit will be with our {serviceInfo.specialist}.
                  </p>

                  <div className="rounded-lg overflow-hidden border mb-6">
                    <iframe
                      src={SITE_CONFIG.bookingUrl}
                      style={{ border: 0, width: "100%", height: "500px" }}
                      title="Schedule Your Consultation"
                    />
                  </div>

                  {/* Clinic Location */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1 font-jost">In-Person Visit Location</h4>
                        <p className="text-sm text-muted-foreground font-jost mb-2">
                          {SITE_CONFIG.address.line1}<br />
                          {SITE_CONFIG.address.cityStateZip}
                        </p>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE_CONFIG.address.full)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-jost"
                        >
                          Get Directions
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-jost">
                    <Phone className="h-4 w-4" />
                    <span>Need help? Call us at {SITE_CONFIG.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 font-jost">What Happens Next?</h3>
                  <ol className="space-y-3 text-sm font-jost">
                    {serviceInfo.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="font-bold text-accent">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Email Confirmation */}
              <Card className="border-blue-200/50 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 font-jost">Check Your Inbox</h3>
                      <p className="text-sm text-muted-foreground font-jost mb-3">
                        We've sent a confirmation email with:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 font-jost">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Your payment receipt</span>
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
                      <p className="text-xs text-muted-foreground mt-4 font-jost">
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
