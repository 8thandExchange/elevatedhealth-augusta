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
      className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-foreground"
    >
      <HeroMedia />

      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/55 to-foreground/85" aria-hidden />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-36 pb-24 md:pt-40 md:pb-28">
        <p className="section-label mb-8 md:mb-10 text-accent animate-fade-in-up">
          Evans&apos; physician-owned wellness clinic
        </p>
        <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] text-background leading-[1.06] mb-10 md:mb-12 animate-fade-in-up">
          You remember what it felt like
          <br />
          <span className="italic" style={{ letterSpacing: "-0.02em" }}>
            to wake up ready.
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl md:text-2xl text-background/80 font-jost font-light leading-relaxed mb-14 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Board-certified physician direction for hormone optimization, peptide therapy, IV care, and
          medical weight loss — cash-pay, transparent pricing, in-person in Evans.
        </p>

        <div
          className="flex flex-col items-center gap-5 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            onClick={openBooking}
            className="bg-background text-foreground font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm transition-all duration-300 hover:bg-background/90 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          >
            Book Your Wellness Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/iv-lounge")}
            className="border-background/40 text-background font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-background/10"
          >
            Book IV Lounge
          </Button>

          <button
            onClick={() => navigate("/how-it-works")}
            className="text-background/70 font-jost text-sm underline-offset-4 hover:text-accent transition-colors"
          >
            How the clinic works →
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
        aria-hidden="true"
        style={{ animationDuration: "2s" }}
      >
        <ChevronDown className="h-6 w-6 text-background/60" />
      </div>
    </section>
  );
};

export default Hero;
