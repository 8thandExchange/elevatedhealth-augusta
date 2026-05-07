import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Phone, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";

const consultationOptions = [
  {
    title: "Hormone Optimization",
    description: "Physician-prescribed HRT and TRT for men and women",
    serviceType: "hormone",
  },
  {
    title: "Medical Weight Loss",
    description: "Physician-supervised semaglutide & tirzepatide (GLP-1) therapy",
    serviceType: "weight_loss",
  },
  {
    title: "IV Therapy",
    description: "Physician-formulated infusions for recovery, immunity, and performance",
    serviceType: "iv_therapy",
  },
  {
    title: "Peptide Protocols",
    description: "Sermorelin, NAD+, GHK-Cu & more for cellular optimization",
    serviceType: "peptide",
  },
];

const Consult = () => {
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const handleBooking = async (serviceType: string, title: string) => {
    trackEvent("consultation_booking_click", { service: title, source: "consult_page" });
    setLoadingService(serviceType);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(`Unable to start checkout. Please call us at ${SITE_CONFIG.phone} to schedule.`);
    } finally {
      setLoadingService(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Book Your $79 Wellness Assessment | Elevated Health Augusta</title>
        <meta name="description" content="Book your $79 Wellness Assessment at Elevated Health Augusta. Hormone optimization, medical weight loss, IV therapy, and peptide protocols." />
      </Helmet>
      <Navbar />
      
      <main className="flex-1 pt-40 pb-16 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="section-label mb-4">Clinical Strategy Session</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-4">
              Your awakening starts with a conversation.
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Select a service below to book your $79 Wellness Assessment — credited toward your first treatment.
            </p>
            <p className="font-jost text-xs text-muted-foreground/80 max-w-2xl mx-auto mt-3">
              Need a physician evaluation for prescription therapies? We'll schedule the MD visit ($149) after your assessment if clinically appropriate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
            {consultationOptions.map((option) => {
              const isLoading = loadingService === option.serviceType;
              return (
                <Card 
                  key={option.serviceType}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/50 hover:border-accent/40"
                  onClick={() => !isLoading && handleBooking(option.serviceType, option.title)}
                >
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <h2 className="font-playfair text-2xl text-foreground mb-3 group-hover:text-accent transition-colors">
                      {option.title}
                    </h2>
                    
                    <p className="font-jost font-light text-sm text-muted-foreground mb-6 flex-1">
                      {option.description}
                    </p>

                    <div className="mb-4">
                      <span className="font-playfair text-2xl font-semibold text-foreground">$79</span>
                      <p className="font-jost text-xs text-accent mt-1">Applied as credit if you proceed</p>
                    </div>

                    <Button 
                      disabled={isLoading}
                      className="w-full bg-primary text-accent font-jost font-medium rounded-sm hover:bg-primary-light"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBooking(option.serviceType, option.title);
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="font-jost text-muted-foreground">
              Questions? Call us at{" "}
              <a 
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="text-accent font-medium hover:underline"
              >
                {SITE_CONFIG.phone}
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Consult;
