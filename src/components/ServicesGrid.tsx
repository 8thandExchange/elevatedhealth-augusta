import { useNavigate } from "react-router-dom";
import { ArrowRight, Droplet } from "lucide-react";

const services = [
  {
    title: "Hormone Optimization",
    description: "Physician-prescribed HRT and TRT for men and women.",
    route: "/hormones",
    note: "Starts with $79 Wellness Assessment",
  },
  {
    title: "IV Therapy",
    description: "Pick your drip, add boosters, pay & schedule online. No consult required.",
    route: "/iv-lounge",
    badge: "Book Direct",
    cta: "Book IV Drip Now",
  },
  {
    title: "Peptide Protocols",
    description: "Physician-supervised Recovery Peptide Review and focused peptide care — not a public catalog.",
    route: "/peptides",
    note: "Starts with $79 Wellness Assessment",
  },
  {
    title: "Medical Weight Loss",
    description: "GLP-1 protocols. Semaglutide. Tirzepatide. Real results.",
    route: "/weightloss",
    note: "Starts with $79 Wellness Assessment",
  },
];

const ServicesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="storefront-section bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Our Services</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Medicine done right.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service: any) => (
            <button
              key={service.title}
              onClick={() => navigate(service.route)}
              className={`group text-left p-8 lg:p-10 border transition-all duration-300 relative ${
                service.badge
                  ? "bg-accent/10 border-accent hover:bg-accent/20 ring-1 ring-accent/30"
                  : "bg-primary border-primary hover:bg-primary-light"
              }`}
            >
              {service.badge && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-jost font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  <Droplet className="h-3 w-3" /> {service.badge}
                </span>
              )}
              <h3 className={`font-playfair text-xl lg:text-2xl mb-3 ${service.badge ? "text-foreground" : "text-accent"}`}>
                {service.title}
              </h3>
              <p className={`font-jost font-light text-sm leading-relaxed mb-3 ${service.badge ? "text-foreground/80" : "text-primary-foreground/80"}`}>
                {service.description}
              </p>
              {service.note && (
                <p className="font-jost text-[11px] uppercase tracking-wider text-primary-foreground/60 mb-6">
                  {service.note}
                </p>
              )}
              {service.badge && <div className="mb-3" />}
              <div className={`flex items-center gap-2 font-jost text-sm font-medium group-hover:gap-3 transition-all duration-300 ${service.badge ? "text-accent" : "text-accent"}`}>
                <span>{service.cta || "Learn More"}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;