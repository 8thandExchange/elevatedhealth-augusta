import { Link } from "react-router-dom";
import { Droplet, MessageCircle, ArrowRight } from "lucide-react";
import { openAssistantChat } from "@/lib/openAssistantChat";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";

export default function IVDirectBookBanner() {
  const hasBg = useMarketingImageAvailable(MARKETING_IMAGES.ivLounge) === true;

  return (
    <section className="relative overflow-hidden border-y border-accent/25 bg-foreground text-background">
      {hasBg && (
        <MarketingImage
          src={MARKETING_IMAGES.ivLounge}
          alt=""
          className="absolute inset-0 opacity-40"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80" aria-hidden />

      <div className="container relative z-10 mx-auto px-6 py-14 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="rounded-sm bg-background/10 p-3 flex-shrink-0 border border-background/20">
              <Droplet className="h-6 w-6 text-background" />
            </div>
            <div>
              <p className="section-label section-label-on-dark mb-2">Walk-In Lane</p>
              <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl leading-tight">
                Book IV hydration in <span className="italic">60 seconds.</span>
              </h2>
              <p className="font-jost font-light text-sm md:text-base text-background/75 mt-3 leading-relaxed">
                No consultation required. Pick your drip, add boosters, pay and schedule online.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/iv-lounge"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-background text-foreground font-jost text-xs font-medium uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
            >
              Browse drips <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => openAssistantChat()}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-background/30 text-background font-jost text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:border-accent/50"
            >
              <MessageCircle className="h-4 w-4" /> Not sure? Chat with us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
