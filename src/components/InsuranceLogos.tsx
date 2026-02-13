import { Shield, Star, Heart } from "lucide-react";

const insuranceItems = [
  { name: "BCBS", label: "Blue Cross Blue Shield", icon: Shield },
  { name: "TRICARE", label: "Military Health System", icon: Star },
  { name: "VA", label: "Veterans Affairs", icon: Heart },
];

const InsuranceLogos = () => {
  return (
    <section id="insurance" className="py-20 lg:py-28 bg-[hsl(40_20%_97%)]">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
            Accessibility
          </p>
          <h2 className="text-3xl sm:text-4xl font-cormorant text-foreground mb-4">
            Insurance Accepted
          </h2>
          <p className="text-muted-foreground font-lato font-light max-w-lg mx-auto">
            We work with major insurance providers to make care accessible
          </p>
        </div>

        {/* Insurance Grid - with icons for visual depth */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {insuranceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="text-center p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-cormorant text-2xl text-foreground block">{item.name}</span>
                <p className="text-sm text-muted-foreground font-lato mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground font-lato font-light">
          Contact us to verify your coverage — more providers coming soon
        </p>
      </div>
    </section>
  );
};

export default InsuranceLogos;
