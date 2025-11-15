import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";

const BookingWidget = () => {
  return (
    <section id="booking" className="py-16 md:py-20 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border-2 border-accent/20 rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-accent/10 rounded-full mb-4">
                <Calendar className="h-12 w-12 text-accent" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Get Your Free 30-Minute Consultation
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take the first step toward transformative care. Schedule a complimentary consultation 
                to discuss your unique needs and explore how ketamine therapy can help you.
              </p>
              
              <div className="pt-4 space-y-4">
                <Button
                  variant="hero"
                  asChild
                  size="lg"
                  className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => trackCTAClick('booking_widget_cta', 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true')}
                >
                  <a
                    href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="h-5 w-5" />
                    Book Your Free Consultation
                  </a>
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Prefer to talk? <a href="tel:+17067603470" className="text-accent hover:underline font-semibold inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Call (706) 760-3470
                  </a>
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground pt-2">
                No obligation • Completely confidential • Available appointments
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingWidget;
