import { ArrowRight } from "lucide-react";

interface MissionStatementProps {
  onOpenBooking: () => void;
}

const MissionStatement = ({ onOpenBooking }: MissionStatementProps) => {
  return (
    <section className="section-spacing bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
              Our Philosophy
            </p>
            <h2 className="font-cormorant text-foreground mb-8">
              The Intersection of Mental Clarity<br />and Metabolic Health
            </h2>
          </div>

          {/* Body Copy */}
          <div className="prose prose-lg max-w-none text-center mb-12">
            <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed mb-6">
              True wellness is not about losing weight or feeling happier—it is about 
              <span className="text-foreground font-medium"> biological alignment</span>. 
              At Elevated Health, we combine advanced Ketamine therapy for neural restoration 
              with precision Hormone Optimization for metabolic balance.
            </p>
            <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
              We treat the whole system, not just the symptom. We test before we treat. 
              We architect personalized protocols based on your unique biology.
            </p>
          </div>

          {/* Differentiator Badge */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-sm text-foreground font-lato">
                Powered by ZRT Diagnostics & Pharmacy-Grade Bio-Identicals
              </span>
            </div>
          </div>

          {/* The Three Resets */}
          <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-border">
            <div className="text-center">
              <div className="text-3xl font-cormorant text-gold mb-2">Neural Reset</div>
              <p className="text-sm text-muted-foreground font-lato font-light">
                Ketamine protocols that restore neural pathways
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-cormorant text-gold mb-2">Metabolic Reset</div>
              <p className="text-sm text-muted-foreground font-lato font-light">
                GLP-1 therapy optimized by hormone testing
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-cormorant text-gold mb-2">Biological Reset</div>
              <p className="text-sm text-muted-foreground font-lato font-light">
                Precision bio-identical hormone restoration
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 text-primary font-lato text-sm tracking-wide hover:gap-3 transition-all duration-300"
            >
              <span className="elegant-underline">Request a personalized consultation</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionStatement;