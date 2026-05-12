import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { openBooking } = useBooking();
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-foreground"
    >
      {/* Background video — DISABLED: /hero-video.mp4 and /hero-poster.jpg do not exist in /public,
          so the <video> tag was producing 404s. Drop those two files into /public and uncomment to re-enable.
          The section's bg-foreground keeps a clean dark wash in the meantime.
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      */}

      {/* Dim overlay for text readability */}
      <div className="absolute inset-0 bg-foreground/50" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-32 pb-20">
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-background leading-[1.08] mb-8 animate-fade-in-up">
          You remember what it felt like
          <br />
          <span className="italic" style={{ letterSpacing: "-0.02em" }}>
            to wake up ready.
          </span>
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl text-background/80 font-jost font-light leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Physician-owned wellness for hormone optimization, peptide therapy, and IV care.
          One place for everything that helps you feel like yourself again.
        </p>

        <div
          className="flex flex-col items-center gap-5 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            onClick={openBooking}
            className="bg-background text-foreground font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm transition-all duration-300 hover:bg-background/90"
          >
            Book a consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <button
            onClick={() => navigate("/iv-lounge")}
            className="text-background/80 font-jost text-sm underline-offset-4 hover:underline"
          >
            Or book an IV walk-in →
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
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
