import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { useAnyMarketingImageAvailable, useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const panels = [
  {
    src: MARKETING_IMAGES.clinicExterior,
    alt: "Elevated Health Augusta clinic exterior in Evans, Georgia",
    caption: "Suite 203 · Evans Town Center",
    tag: "Location",
  },
  {
    src: MARKETING_IMAGES.clinicInterior,
    alt: "Private treatment suite at Elevated Health Augusta",
    caption: "Private suites",
    tag: "Environment",
  },
  {
    src: MARKETING_IMAGES.ivLounge,
    alt: "IV therapy lounge at Elevated Health Augusta",
    caption: "IV Lounge",
    tag: "Walk-in care",
  },
] as const;

function GalleryPanel({
  panel,
  index,
  isVisible,
}: {
  panel: (typeof panels)[number];
  index: number;
  isVisible: boolean;
}) {
  const available = useMarketingImageAvailable(panel.src);
  if (available !== true) return null;

  return (
    <figure
      className={`group bg-primary ${revealClasses.fadeUp(isVisible)}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <MarketingImage
        src={panel.src}
        alt={panel.alt}
        className="aspect-[4/5] md:aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <figcaption className="px-6 py-5 border-t border-accent/20">
        <p className="font-jost text-[10px] uppercase tracking-[2.5px] text-accent mb-1">{panel.tag}</p>
        <p className="font-playfair text-lg text-primary-foreground">{panel.caption}</p>
      </figcaption>
    </figure>
  );
}

const HomeClinicGallery = () => {
  const { ref, isVisible } = useScrollReveal();
  const hasAnyPhoto = useAnyMarketingImageAvailable(panels.map((p) => p.src));

  if (hasAnyPhoto !== true) return null;

  return (
    <section ref={ref} className="storefront-section bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mb-12 md:mb-16 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label section-label-on-dark mb-4">The Space</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl leading-tight">
            Designed for calm, <span className="italic">not crowds.</span>
          </h2>
          <p className="font-jost font-light text-primary-foreground/80 mt-6 text-base md:text-lg leading-relaxed max-w-xl">
            Physician-owned suites in Evans — where hormone consults, IV drips, and peptide protocols happen under one
            roof.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-accent/30 border border-accent/20">
          {panels.map((p, i) => (
            <GalleryPanel key={p.tag} panel={p} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeClinicGallery;
