import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageCircle, CreditCard } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";
import { openAssistantChat } from "@/lib/openAssistantChat";

const BookingWidget = () => {
  const { openBooking } = useBooking();
  
  const openAssistant = () => openAssistantChat();

  return (
    <section id="booking" className="py-16 md:py-20 bg-surface scroll-mt-20 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-sm p-8 md:p-12 shadow-[var(--shadow-md)]">
            <div className="text-center space-y-5 mb-10">
              <div className="inline-flex p-3 bg-primary/8 border border-primary/15 rounded-sm">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-playfair text-foreground">
                Ready to Take the Next Step?
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-jost font-light">
                Your $79 Wellness Assessment is where it all begins. Meet with a provider, discuss your goals, and get a personalized plan.
              </p>

              <p className="text-sm text-primary font-medium font-jost">
                <CreditCard className="inline h-4 w-4 mr-1 align-text-bottom" />
                Paid at booking · Transparent pricing for every next step
              </p>
            </div>
            
            <div className="text-center mb-10">
              <Button
                size="lg"
                onClick={() => {
                  trackCTAClick('book_consultation', 'booking_widget');
                  openBooking();
                }}
              >
                Book Your $79 Wellness Assessment →
              </Button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-jost">Not ready to book?</span>
              </div>
            </div>

            <div className="bg-secondary/60 rounded-sm p-6 border border-border">
              <h3 className="text-lg font-jost font-medium text-foreground text-center mb-2">
                Have questions? Chat with our virtual care team.
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-5 font-jost font-light">
                Get instant answers about pricing, insurance, and our process — 24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
                <Button 
                  onClick={openAssistant}
                  variant="outline"
                  className="gap-2 sm:min-w-[240px]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with Virtual Care Team
                </Button>
                
                <a 
                  href="tel:+17067603470" 
                  className="inline-flex items-center justify-center gap-2 px-6 h-11 border-2 border-primary/20 text-primary font-jost text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>(706) 760-3470</span>
                </a>
              </div>
              
              <p className="text-[10px] text-muted-foreground text-center mt-4 italic font-jost">
                Admin questions only · No medical advice provided
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingWidget;
