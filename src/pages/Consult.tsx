import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingDown, Zap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";

const Consult = () => {
  const consultationOptions = [
    {
      icon: Brain,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      color: "primary",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
    },
    {
      icon: TrendingDown,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      color: "accent",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1CBfpH07YJj-i6hEBsR8fQQSlo73zA8irBgHx6vj82matcVWu0-K-MFMrC5euDFR-vG5QujSlP?gv=true"
    },
    {
      icon: Zap,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      color: "gold",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
    }
  ];

  const handleBooking = (title: string, url: string) => {
    trackEvent("consultation_booking_click", { service: title, source: "consult_page" });
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16 px-4 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Book Your Free Consultation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the service you're interested in to schedule your consultation with our team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {consultationOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleBooking(option.title, option.bookingUrl)}
                >
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div className="mb-6 inline-flex p-5 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform mx-auto">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {option.title}
                    </h2>
                    
                    <p className="text-base text-muted-foreground mb-6 leading-relaxed flex-1">
                      {option.description}
                    </p>

                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBooking(option.title, option.bookingUrl);
                      }}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
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
                className="text-primary font-semibold hover:underline"
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
