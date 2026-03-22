import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Hormone Optimization",
    description: "Physician-prescribed HRT and TRT for men and women.",
    route: "/hormones",
  },
  {
    title: "IV Therapy",
    description: "Physician-formulated infusions. Not a spa. Medicine.",
    route: "/iv-lounge",
  },
  {
    title: "Peptide Protocols",
    description: "The first physician-supervised peptide program in the Augusta area.",
    route: "/peptides",
  },
  {
    title: "Medical Weight Loss",
    description: "GLP-1 protocols. Semaglutide. Tirzepatide. Real results.",
    route: "/weightloss",
  },
];

const ServicesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Our Services</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Medicine done right.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <button
              key={service.title}
              onClick={() => navigate(service.route)}
              className="group text-left bg-primary p-8 lg:p-10 border border-primary transition-all duration-300 hover:bg-primary-light"
            >
              <h3 className="font-playfair text-xl lg:text-2xl text-accent mb-3">
                {service.title}
              </h3>
              <p className="font-jost font-light text-primary-foreground/80 text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <div className="flex items-center gap-2 text-accent font-jost text-sm font-medium group-hover:gap-3 transition-all duration-300">
                <span>Learn More</span>
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