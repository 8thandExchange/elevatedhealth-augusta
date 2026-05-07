import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CareMembershipBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 md:py-16 bg-secondary/20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto border border-accent/40 p-8 md:p-12 bg-background">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-label mb-3">Care Membership</p>
              <h3 className="font-playfair text-2xl md:text-3xl text-foreground mb-4">
                One flat fee covers every visit.
              </h3>
              <p className="font-jost font-light text-foreground mb-6">
                Stay on protocol with unlimited in-clinic injections, supplies, and lab draws.
                Medication and labs billed separately at cost.
              </p>
              <Button
                onClick={() => navigate("/care-membership")}
                className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-8 py-5 rounded-sm hover:bg-primary-light"
              >
                See membership tiers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2 font-jost font-light text-sm text-foreground">
              {[
                "Unlimited weekly RN injection visits",
                "All in-visit supplies included",
                "Lab draw / phlebotomy fee included",
                "Home delivery for creams & oral protocols",
                "From $149/mo — cancel anytime",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareMembershipBanner;
