import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface ContactProps {
  onOpenBooking?: () => void;
}

const Contact = ({ onOpenBooking }: ContactProps) => {
  const handleBooking = () => {
    trackCTAClick('cta_book_consultation', 'booking_calendar');
    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-secondary scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section Header */}
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
            Begin Today
          </p>
          <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
            Start Your Journey
          </h2>
          <p className="font-lato text-lg text-muted-foreground font-light mb-12 leading-relaxed">
            Schedule your complimentary consultation and discover<br className="hidden sm:block" />
            how we can help you achieve your wellness goals.
          </p>

          {/* Primary CTA */}
          <Button 
            size="lg"
            onClick={handleBooking}
            className="font-lato tracking-wide text-base px-12 py-7"
          >
            Book Consultation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Phone Alternative */}
          <p className="mt-8 text-sm text-muted-foreground font-lato font-light">
            Or call us at{" "}
            <a 
              href={`tel:${SITE_CONFIG.phoneRaw}`} 
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('cta_call', `tel:${SITE_CONFIG.phoneRaw}`)}
            >
              {SITE_CONFIG.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
