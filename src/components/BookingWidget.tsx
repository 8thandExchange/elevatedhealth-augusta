import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";

const BookingWidget = () => {
  return (
    <section id="booking" className="py-16 md:py-20 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border-2 border-accent/20 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center space-y-6 mb-8">
              <div className="inline-block p-4 bg-accent/10 rounded-full">
                <Calendar className="h-12 w-12 text-accent" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Book Your Free Consultation
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Schedule directly with our team
              </p>
            </div>
            
            {/* Google Calendar Embed */}
            <div className="w-full rounded-lg overflow-hidden shadow-inner bg-background/50">
              <iframe 
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true" 
                style={{ border: 0 }} 
                width="100%" 
                height="800" 
                frameBorder="0"
                title="Book Consultation"
              />
            </div>
            
            <p className="text-center text-sm text-muted-foreground pt-6">
              Prefer to talk? <a href="tel:+17067603470" className="text-accent hover:underline font-semibold inline-flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Call (706) 760-3470
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingWidget;
