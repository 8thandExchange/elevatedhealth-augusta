import { ArrowRight, Dumbbell, Flame, LineChart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";

type BodyRecompositionTeaserProps = {
  /** When true, renders a compact strip (e.g. top-of-page callout). */
  variant?: "section" | "banner";
};

const signals = [
  {
    icon: LineChart,
    title: "Plateaued on GLP-1",
    body: "The scale stalled but visceral fat or appetite signals still need work.",
  },
  {
    icon: Dumbbell,
    title: "Fat loss, not muscle loss",
    body: "You want to look lean — not depleted — as weight comes off.",
  },
  {
    icon: Flame,
    title: "Metabolic reset",
    body: "Insulin resistance, low energy, or stubborn midsection fat despite effort.",
  },
  {
    icon: Shield,
    title: "Physician-built phases",
    body: "Layered protocol that adds support only as you tolerate each step — in clinic, not mail-order.",
  },
];

export function BodyRecompositionTeaser({ variant = "section" }: BodyRecompositionTeaserProps) {
  const { openBooking } = useBooking();

  if (variant === "banner") {
    return (
      <div className="bg-primary/5 border-b border-primary/15 px-6 py-3 text-center text-sm font-jost text-foreground">
        <span className="text-muted-foreground">Beyond standard GLP-1?</span>{" "}
        <button
          type="button"
          onClick={() => document.getElementById("body-recomposition")?.scrollIntoView({ behavior: "smooth" })}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Explore physician-directed body recomposition
        </button>
        <span className="hidden sm:inline text-muted-foreground"> — discussed at your Wellness Assessment.</span>
      </div>
    );
  }

  return (
    <section id="body-recomposition" className="py-16 md:py-24 bg-primary text-primary-foreground scroll-mt-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="section-label section-label-on-dark mb-4">When the scale isn&apos;t the whole story</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
            Body recomposition — built in <span className="italic text-accent-light">phases</span>, not promises
          </h2>
          <p className="font-jost font-light text-base md:text-lg text-primary-foreground/85 leading-relaxed">
            Some patients need more than appetite control. ELEVATED offers advanced, physician-directed programs for
            fat loss with lean-tissue protection — layered metabolic support added only when your labs, history, and
            tolerance support the next step. Protocol details, candidacy, and pricing are reviewed{" "}
            <strong className="font-medium text-primary-foreground">in person</strong> after your Wellness Assessment —
            not published online.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-primary-foreground/15 border border-primary-foreground/20 max-w-4xl mx-auto mb-12">
          {signals.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-primary p-8 text-left">
              <Icon className="h-6 w-6 text-accent-light mb-4" aria-hidden />
              <p className="font-jost font-medium text-sm uppercase tracking-[0.12em] text-primary-foreground mb-2">
                {title}
              </p>
              <p className="font-jost font-light text-sm text-primary-foreground/80 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <p className="font-jost text-sm text-primary-foreground/75 max-w-xl mx-auto">
            Start with the same $79 Wellness Assessment as every ELEVATED program. If advanced recomposition is a fit,
            your physician walks you through options — no influencer stacks, no gray-market peptides, no guessing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="heroLight" size="lg" onClick={() => openBooking()}>
              Book Your Wellness Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              onClick={() => window.open(`tel:${SITE_CONFIG.phone}`, "_self")}
            >
              Call {SITE_CONFIG.phoneFormatted}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
