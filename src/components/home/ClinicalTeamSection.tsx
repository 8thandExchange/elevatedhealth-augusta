import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES, MARKETING_IMAGE_FRAMING } from "@/lib/marketingImages";
import { useMarketingImagesBatch } from "@/hooks/useMarketingImageAvailable";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const teamSrcs = [MARKETING_IMAGES.staffCaroline, MARKETING_IMAGES.physician];

const ClinicalTeamSection = () => {
  const { ref, isVisible } = useScrollReveal();
  const { ready, available } = useMarketingImagesBatch(teamSrcs);

  const hasCaroline = available.has(MARKETING_IMAGES.staffCaroline);
  const hasPhysician = available.has(MARKETING_IMAGES.physician);

  if (!ready || (!hasCaroline && !hasPhysician)) return null;

  return (
    <section ref={ref} className="section-band-surface">
      <div className="container mx-auto px-6 lg:px-8 space-y-20 md:space-y-28">
        {hasCaroline && (
          <div
            className={`max-w-5xl mx-auto grid gap-12 lg:gap-20 items-center md:grid-cols-2 ${revealClasses.fadeUp(isVisible, 0, true)}`}
          >
            <MarketingImage
              src={MARKETING_IMAGES.staffCaroline}
              alt="Caroline Marshall, RN — Elevated Health Augusta"
              preverified
              className="aspect-[2/3] border border-border order-1"
              imgClassName={MARKETING_IMAGE_FRAMING.staffCaroline}
            />

            <div className="order-2">
              <p className="section-label mb-5">Your Clinical Team</p>
              <h2 className="font-playfair italic text-3xl md:text-4xl lg:text-5xl text-foreground mb-2 leading-tight">
                Caroline Marshall, RN
              </h2>
              <p className="font-jost font-medium uppercase tracking-[2px] text-xs text-muted-foreground mb-8">
                Intake · IV Therapy · Member Visits · Phlebotomy
              </p>

              <div className="space-y-5 font-jost font-light text-base text-foreground/90 leading-relaxed">
                <p>
                  Most of your visits at Elevated Health Augusta are with Caroline — intake,
                  IV drips, lab draws, member check-ins, and follow-up coordination. She operates
                  under physician-authorized standing orders with direct access to our physicians when your case needs physician review.
                </p>
                <p>
                  That means same-day IV booking without a consult, a familiar face every time
                  you walk in, and a clinical team that actually knows your chart — not a
                  rotating telehealth queue.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasPhysician && (
          <div
            className={`max-w-5xl mx-auto grid gap-12 lg:gap-20 items-center md:grid-cols-2 ${revealClasses.fadeUp(isVisible, 120, true)}`}
          >
            <div className="order-2 md:order-1">
              <p className="section-label mb-5">Physician-Owned</p>
              <div className="space-y-1 mb-8">
                <h2 className="font-playfair italic text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                  Dr. Troy Akers
                </h2>
                <h2 className="font-playfair italic text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                  Dr. Dennis Williams
                </h2>
              </div>

              <div className="space-y-5 font-jost font-light text-base text-foreground/90 leading-relaxed">
                <p>
                  Every protocol, lab panel, and prescription at Elevated Health Augusta is set
                  and supervised by our physicians. Hormone optimization, peptide medicine, GLP-1
                  weight management, and IV formulary — physician-owned, not franchise-operated.
                </p>
                <p>
                  Caroline handles day-to-day clinical care; Dr. Akers and Dr. Williams review labs,
                  sign protocols, and step in when your case needs physician decision-making.
                </p>
                <p className="text-muted-foreground italic font-playfair">
                  &ldquo;We&apos;re not building an app. We&apos;re rebuilding a clinic.&rdquo;
                </p>
              </div>
            </div>

            <MarketingImage
              src={MARKETING_IMAGES.physician}
              alt="Dr. Troy Akers — Elevated Health Augusta"
              preverified
              className="aspect-[4/5] border border-border order-1 md:order-2"
              imgClassName="grayscale-[10%]"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ClinicalTeamSection;
