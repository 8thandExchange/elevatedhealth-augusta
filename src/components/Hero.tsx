import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { HeroMedia } from "@/components/home/HeroMedia";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { openBooking } = useBooking();
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-primary"
    >
      <HeroMedia />

      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" aria-hidden />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-36 pb-24 md:pt-40 md:pb-28">
        <p className="section-label section-label-on-dark mb-8 md:mb-10 animate-fade-in-up">
          Evans&apos; physician-owned wellness clinic
        </p>
        <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] text-primary-foreground leading-[1.06] mb-10 md:mb-12 animate-fade-in-up">
          You remember what it felt like
          <br />
          <span className="italic text-accent-light" style={{ letterSpacing: "-0.02em" }}>
            to wake up ready.
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl md:text-2xl text-primary-foreground/85 font-jost font-light leading-relaxed mb-14 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Board-certified physician direction for hormone optimization, peptide therapy, IV care, and
          medical weight loss — cash-pay, transparent pricing, in-person in Evans.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            variant="heroLight"
            onClick={openBooking}
          >
            Book Your Wellness Assessment
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="heroOutline"
            onClick={() => navigate("/iv-lounge")}
          >
            Book IV Lounge
          </Button>
        </div>

        <button
          onClick={() => navigate("/how-it-works")}
          className="mt-6 text-primary-foreground/70 font-jost text-sm underline-offset-4 hover:text-primary-foreground transition-colors animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          How the clinic works →
        </button>

        <p
          className="mt-10 font-jost text-xs md:text-sm uppercase tracking-[0.25em] text-primary-foreground/50 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          Physician-owned · Evans, GA · LabCorp · 503A compounding
        </p>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
        aria-hidden="true"
        style={{ animationDuration: "2s" }}
      >
        <ChevronDown className="h-6 w-6 text-primary-foreground/60" />
      </div>
    </section>
  );
};

export default Hero;
