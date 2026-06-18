import { Link } from "react-router-dom";
import { Droplet, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAssistantChat } from "@/lib/openAssistantChat";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";

export default function IVDirectBookBanner() {
  const hasBg = useMarketingImageAvailable(MARKETING_IMAGES.ivLounge) === true;

  return (
    <section className="relative overflow-hidden border-y border-primary/20 bg-primary text-primary-foreground">
      {hasBg && (
        <MarketingImage
          src={MARKETING_IMAGES.ivLounge}
          alt=""
          className="absolute inset-0 opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/85" aria-hidden />

      <div className="container relative z-10 mx-auto px-6 py-14 md:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="flex items-start gap-4 max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            <div className="hidden sm:flex rounded-sm bg-primary-foreground/10 p-3 flex-shrink-0 border border-primary-foreground/20">
              <Droplet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="section-label section-label-on-dark mb-2">Walk-In Lane</p>
              <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl leading-tight text-primary-foreground">
                Book IV hydration in <span className="italic text-accent-light">60 seconds.</span>
              </h2>
              <p className="font-jost font-light text-sm md:text-base text-primary-foreground/80 mt-3 leading-relaxed">
                No consultation required. Pick your drip, add boosters, pay and schedule online.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Button variant="heroLight" size="lg" asChild>
              <Link to="/iv-lounge">
                Browse drips <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" onClick={() => openAssistantChat()}>
              <MessageCircle className="h-4 w-4" /> Not sure? Chat with us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
