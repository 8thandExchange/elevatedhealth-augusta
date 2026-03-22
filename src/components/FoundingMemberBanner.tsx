import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FoundingMemberBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto border border-accent/40 p-8 md:p-12 text-center">
          <p className="section-label mb-4">Limited Availability</p>
          <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-6">
            Founding Member Pricing — 25 spots per tier
          </h2>
          <p className="font-jost font-light text-foreground text-lg mb-4 leading-relaxed">
            Wellness Pass $149/mo · Longevity Protocol $299/mo · Executive Concierge $549/mo
          </p>
          <p className="font-jost font-medium text-accent text-lg mb-8">
            Lock in your rate forever.
          </p>
          <Button 
            onClick={() => navigate("/membership")}
            className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-8 py-5 rounded-sm hover:bg-primary-light"
          >
            Claim your founding rate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="font-jost text-xs text-muted-foreground mt-6">
            Founding pricing closes 30 days after launch. No exceptions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FoundingMemberBanner;
