import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { HeroMedia } from "@/components/home/HeroMedia";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { openBooking } = useBooking();
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-primary md:min-h-screen"
    >
      <HeroMedia />

      {/* Scrim stack — z-[1] sits above video (z-0), below copy (z-20) */}
      <div
        className="absolute inset-x-0 top-0 h-28 md:h-32 bg-gradient-to-b from-primary/90 to-transparent pointer-events-none z-[1]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/55 to-primary/80 pointer-events-none z-[1]"
        aria-hidden
      />

      <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-28 pb-16 md:pt-40 md:pb-32">
        <span className="eyebrow eyebrow-on-dark mb-5 md:mb-10">
          Physician-owned wellness · Evans, GA
        </span>
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[5.75rem] text-primary-foreground leading-[1.04] mb-6 md:mb-12 drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          You remember what it felt like
          <br />
          <span className="italic text-accent-light" style={{ letterSpacing: "-0.025em" }}>
            to wake up ready.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-2xl text-primary-foreground/90 font-jost font-light leading-relaxed mb-8 md:mb-14 max-w-2xl mx-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.3)]">
          Board-certified physician direction for hormone optimization, peptide therapy, IV care, and
          medical weight loss — cash-pay, transparent pricing, in-person in Evans.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

        <p className="mt-4 font-jost text-sm text-center text-primary-foreground/70">
          Transparent pricing, no surprise bills · Physician-owned · Evans, GA
        </p>

        <button
          onClick={() => navigate("/how-it-works")}
          className="mt-6 text-primary-foreground/80 font-jost text-sm underline underline-offset-4 decoration-accent-light/40 hover:text-primary-foreground hover:decoration-accent-light transition-colors"
        >
          How the clinic works →
        </button>

        <p className="mt-12 font-jost text-[11px] md:text-xs uppercase tracking-[0.28em] text-primary-foreground/55">
          Physician-owned · Evans, GA · LabCorp · 503A compounding
        </p>
      </div>

      {/* Refined scroll cue — thin descending hairline rather than a bouncing chevron */}
      <button
        onClick={() => navigate("/how-it-works")}
        className="group absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        aria-label="Scroll to learn how the clinic works"
      >
        <span className="font-jost text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40 group-hover:text-primary-foreground/70 transition-colors">
          Scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-primary-foreground/20">
          <span className="block h-1/2 w-px bg-accent-light animate-[scrollcue_2s_ease-in-out_infinite]" />
        </span>
      </button>
    </section>
  );
};

export default Hero;
