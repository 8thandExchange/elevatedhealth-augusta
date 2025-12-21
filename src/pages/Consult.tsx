import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Phone, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

// Elegant custom SVG icons matching ConsultationModal brand style
const NeuralIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <path 
      d="M24 4C24 4 28 12 28 20C28 28 24 36 24 44" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
    <path 
      d="M18 8C18 8 22 14 22 22C22 30 18 38 18 44" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.7"
    />
    <path 
      d="M30 8C30 8 26 14 26 22C26 30 30 38 30 44" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="24" cy="14" r="2" fill="currentColor" opacity="0.8"/>
    <circle cx="20" cy="24" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="28" cy="24" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="24" cy="34" r="2" fill="currentColor" opacity="0.8"/>
  </svg>
);

const VitalityIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M24 44V40" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M40 24H44" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M4 24H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M35.3 12.7L38.1 9.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    <path d="M9.9 38.1L12.7 35.3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    <path d="M35.3 35.3L38.1 38.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    <path d="M9.9 9.9L12.7 12.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.4"/>
  </svg>
);

const DNAIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <path 
      d="M16 6C16 6 20 10 24 14C28 18 32 22 32 26C32 30 28 34 24 38C20 42 16 46 16 46" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
    <path 
      d="M32 6C32 6 28 10 24 14C20 18 16 22 16 26C16 30 20 34 24 38C28 42 32 46 32 46" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
    <line x1="14" y1="12" x2="34" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <line x1="12" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <line x1="12" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <line x1="14" y1="36" x2="34" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
  </svg>
);

const Consult = () => {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const consultationOptions = [
    {
      Icon: NeuralIcon,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      bookingUrl: "https://calendar.app.google/2zDZmMUzdw1RPR5E8"
    },
    {
      Icon: VitalityIcon,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1CBfpH07YJj-i6hEBsR8fQQSlo73zA8irBgHx6vj82matcVWu0-K-MFMrC5euDFR-vG5QujSlP?gv=true"
    },
    {
      Icon: DNAIcon,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
    }
  ];

  const handleBooking = (title: string, url: string) => {
    trackEvent("consultation_booking_click", { service: title, source: "consult_page" });
    
    try {
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setFailedUrls(prev => new Set(prev).add(url));
        toast.error(
          "Unable to open booking calendar. Please call us at (706) 760-3470 to schedule.",
          { duration: 8000 }
        );
        trackEvent("consultation_booking_blocked", { service: title, source: "consult_page" });
      }
    } catch (error) {
      console.error("Error opening booking URL:", error);
      setFailedUrls(prev => new Set(prev).add(url));
      toast.error(
        "Unable to open booking calendar. Please call us at (706) 760-3470 to schedule.",
        { duration: 8000 }
      );
      trackEvent("consultation_booking_error", { service: title, source: "consult_page", error: String(error) });
    }
  };

  const handleCallNow = () => {
    trackEvent("phone_click", { source: "consult_page_fallback" });
    window.location.href = "tel:7067603470";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Rebook Your Appointment | Elevated Health Augusta</title>
        <meta name="description" content="Returning patients can easily rebook appointments for ketamine therapy, medical weight loss, or hormone replacement. Access your care calendar." />
      </Helmet>
      <Navbar />
      
      <main className="flex-1 pt-40 pb-16 px-4 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Rebook Your Appointment
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome back! Select a service below to schedule your next visit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {consultationOptions.map((option, index) => {
              const hasFailed = failedUrls.has(option.bookingUrl);
              
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-gold/40 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !hasFailed && handleBooking(option.title, option.bookingUrl)}
                >
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div className="mb-6 inline-flex p-5 rounded-2xl bg-gold/10 group-hover:scale-110 transition-transform mx-auto text-gold">
                      <option.Icon />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-gold transition-colors">
                      {option.title}
                    </h2>
                    
                    <p className="text-base text-muted-foreground mb-6 leading-relaxed flex-1">
                      {option.description}
                    </p>

                    {hasFailed ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-amber-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Calendar unavailable</span>
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallNow();
                          }}
                        >
                          <Phone className="mr-2 h-5 w-5" />
                          Call to Book
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-gold hover:bg-gold/90 text-white font-semibold py-6 text-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBooking(option.title, option.bookingUrl);
                        }}
                      >
                        Book Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <p className="text-muted-foreground mb-4">
              Questions? Call us at{" "}
              <a 
                href="tel:7067603470" 
                className="text-gold font-semibold hover:underline"
                onClick={() => trackEvent("phone_click", { source: "consult_page" })}
              >
                (706) 760-3470
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
