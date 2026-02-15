import { Shield, Star, Heart } from "lucide-react";

const insuranceItems = [
  { name: "BCBS", label: "Blue Cross Blue Shield", icon: Shield },
  { name: "TRICARE", label: "Military Health System", icon: Star },
  { name: "VA", label: "Veterans Affairs", icon: Heart },
];

const InsuranceLogos = () => {
  return (
    <section id="insurance" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-10 -left-20 w-64 h-64 rounded-full bg-peach opacity-25 blur-3xl" />
      
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 font-inter font-semibold">
            04 — Accessibility
          </p>
          <h2 className="text-3xl sm:text-4xl font-inter font-bold text-foreground mb-4">
            Insurance <span className="text-primary">Accepted</span>
          </h2>
          <p className="text-muted-foreground font-inter max-w-lg mx-auto">
            We work with major insurance providers to make care accessible
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {insuranceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="text-center p-8 bg-card rounded-2xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-inter font-bold text-2xl text-foreground block">{item.name}</span>
                <p className="text-sm text-muted-foreground font-inter mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground font-inter">
          Contact us to verify your coverage — more providers coming soon
        </p>
      </div>
    </section>
  );
};

export default InsuranceLogos;
