import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingDown, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";

const PillarGrid = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Brain,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for treatment-resistant depression, PTSD, and anxiety",
      price: "$400",
      priceDetail: "/session",
      color: "primary",
      route: SITE_CONFIG.routes.ketamine,
      features: ["70% response rate", "Results within 24hrs", "FDA-approved options"]
    },
    {
      icon: TrendingDown,
      title: "Medical Weight Loss",
      description: "Semaglutide (GLP-1) therapy with personalized nutrition and lifestyle support",
      price: "$399",
      priceDetail: "/month",
      color: "accent",
      route: SITE_CONFIG.routes.weightloss,
      features: ["15-20% weight loss", "Physician supervised", "Evidence-based"]
    },
    {
      icon: Zap,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore energy, mood, and vitality",
      price: "$299",
      priceDetail: "/month",
      color: "gold",
      route: SITE_CONFIG.routes.hormones,
      features: ["BHRT therapy", "Lab testing included", "Coming Soon"]
    }
  ];

  return (
    <section id="pillars" className="py-16 md:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-primary">
              Your Path to Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three comprehensive pillars of care designed to help you restore your mind, renew your body, and rebalance your hormones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Card 
                  key={index} 
                  className={`group hover:shadow-xl transition-all duration-300 border-2 hover:border-${pillar.color}/40 cursor-pointer`}
                  onClick={() => navigate(pillar.route)}
                >
                  <CardContent className="p-8">
                    <div className={`mb-6 inline-flex p-4 rounded-xl bg-${pillar.color}/10`}>
                      <Icon className={`h-10 w-10 text-${pillar.color}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {pillar.description}
                    </p>

                    <div className="mb-6">
                      <span className={`text-4xl font-bold text-${pillar.color}`}>{pillar.price}</span>
                      <span className="text-muted-foreground">{pillar.priceDetail}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pillar.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full bg-${pillar.color}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full bg-${pillar.color} hover:bg-${pillar.color}-light text-white group-hover:translate-x-1 transition-transform`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(pillar.route);
                      }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarGrid;
