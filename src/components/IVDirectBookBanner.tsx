import { Link } from "react-router-dom";
import { Droplet, MessageCircle, ArrowRight } from "lucide-react";

export default function IVDirectBookBanner() {
  return (
    <section className="py-10 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border-y border-gold/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-gold/20 p-3 flex-shrink-0">
              <Droplet className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl md:text-3xl font-semibold text-foreground">
                Book IV Hydration in 60 seconds
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                No consultation required. Pick your drip, add boosters, pay & schedule online.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/iv-lounge"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-gold/90 text-white font-medium transition-all"
            >
              Browse Drips <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("open-assistant-chat"))}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gold/40 hover:bg-gold/10 text-foreground font-medium transition-all"
            >
              <MessageCircle className="h-4 w-4" /> Not sure? Chat with us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
