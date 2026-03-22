import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageCircle, CreditCard } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";

const BookingWidget = () => {
  const { openBooking } = useBooking();
  
  const openAssistant = () => {
    const chatButton = document.querySelector('[aria-label="Open assistant"]');
    if (chatButton) (chatButton as HTMLButtonElement).click();
  };

  return (
    <section id="booking" className="py-16 md:py-20 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border-2 border-accent/20 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center space-y-6 mb-8">
              <div className="inline-block p-4 bg-accent/10 rounded-full">
                <Calendar className="h-12 w-12 text-accent" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Take the Next Step?
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your $149 Medical Consultation is where it all begins. Meet with a provider, discuss your goals, and get a personalized plan.
              </p>

              <p className="text-sm text-primary font-medium">
                <CreditCard className="inline h-4 w-4 mr-1" />
                $149 applies as a credit toward your first treatment
              </p>
            </div>
            
            {/* Primary CTA */}
            <div className="text-center mb-8">
              <Button
                onClick={() => {
                  trackCTAClick('book_consultation', 'booking_widget');
                  openBooking();
                }}
                className="px-8 py-4 h-auto bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
              >
                Book Your $149 Consultation →
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Not ready to book?</span>
              </div>
            </div>

            {/* Secondary Options */}
            <div className="bg-secondary/30 rounded-xl p-6 border border-border/20">
              <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                Have questions? Chat with our virtual care team.
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Get instant answers about pricing, insurance, and our process—24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  onClick={openAssistant}
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with Virtual Care Team
                </Button>
                
                <a 
                  href="tel:+17067603470" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Or Call: (706) 760-3470</span>
                </a>
              </div>
              
              <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
                Admin questions only • No medical advice provided
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingWidget;
