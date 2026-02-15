import { CreditCard, Clock, CheckCircle2 } from "lucide-react";

const FinancingBanner = () => {
  return (
    <section className="py-6 md:py-8 bg-card border-y border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
          <div className="text-center md:text-left">
            <p className="font-inter font-bold text-lg md:text-xl text-foreground">
              Flexible Payment Plans Available
            </p>
            <p className="text-sm text-muted-foreground font-inter">
              Start treatment now, pay over time
            </p>
          </div>

          <div className="hidden md:block w-px h-12 bg-border/30" />

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-inter text-foreground">Pay in 4 interest-free</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-inter text-foreground">Approved in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-inter text-foreground">No impact on credit</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-pink-500">Klarna</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="font-bold text-sm text-blue-500">affirm</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinancingBanner;
