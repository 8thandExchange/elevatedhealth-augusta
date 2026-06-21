import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";

const MissionStatement = () => {
  const { openBooking } = useBooking();
  
  return (
    <section className="storefront-section bg-card relative overflow-hidden">
      {/* Decorative peach blob */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-peach opacity-30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-peach-light opacity-25 blur-3xl" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Numbered label */}
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 font-inter font-semibold">
            01 — Our Philosophy
          </p>
          
          <h2 className="font-inter font-bold text-foreground text-3xl md:text-4xl lg:text-5xl mb-8 leading-tight">
            The Intersection of Mental Clarity
            <br />
            <span className="text-primary">and Metabolic Health</span>
          </h2>

          <p className="text-lg text-muted-foreground font-inter font-normal leading-relaxed mb-6">
            True wellness is not about losing weight or feeling happier—it is about 
            <strong className="text-foreground"> biological alignment</strong>. 
            We combine advanced peptide medicine for cellular restoration 
            with precision Hormone Optimization for metabolic balance.
          </p>
          <p className="text-lg text-muted-foreground font-inter font-normal leading-relaxed mb-10">
            We treat the whole system, not just the symptom. We test before we treat. 
            Every protocol is tailored to your unique biology.
          </p>

          <button
            onClick={openBooking}
            className="inline-flex items-center gap-2 text-primary font-inter text-sm font-semibold tracking-wide hover:gap-3 transition-all duration-300"
          >
            <span>Request a personalized consultation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MissionStatement;
