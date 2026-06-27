import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { storefrontHeroSection } from "@/lib/storefrontHero";

const PHYSICIANS = [
  {
    id: "akers",
    name: "Dr. Troy Akers",
    discipline: "Emergency Medicine",
    bio: "Years on the emergency medicine front lines — treating the same preventable crises again and again until the pattern became impossible to ignore.",
  },
  {
    id: "pmr",
    title: "Co-Founding Physician",
    discipline: "Physical Medicine & Rehabilitation",
    bio: "More than 30 years in physical medicine and rehabilitation — restoring function after injury, rebuilding capacity after chronic illness, and guiding patients back to the lives they lost.",
  },
] as const;

const About = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>About | Elevated Health Augusta</title>
        <meta name="description" content="Physician-owned clinic in Evans, GA — emergency medicine and physical medicine & rehabilitation leadership under one roof. Built to stop preventable suffering before it reaches the ER." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/about" />
        <meta property="og:title" content="About | Elevated Health Augusta" />
        <meta property="og:description" content="Emergency medicine meets PM&R. Physician-owned, physician-supervised wellness in Evans, GA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/about" />
      </Helmet>
      <div className="public-page-shell">
        <Navbar />
        <main className="flex-1">
        <section className={storefrontHeroSection}>
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl py-28 md:py-36">
            <p className="section-label mb-6 md:mb-8">About Elevated Health Augusta</p>
            <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl text-foreground mb-10 md:mb-12 leading-[1.05]">
              Emergency medicine and rehabilitation — under one roof, on purpose.
            </h1>
            <div className="space-y-6 font-jost font-light text-lg text-muted-foreground leading-relaxed">
              <p>
                Elevated Health Augusta was founded by physician owners who refused to keep treating
                the downstream wreckage of upstream neglect. Dr. Troy Akers spent years in the emergency
                department watching patients arrive with hormonal collapse, metabolic breakdown, and
                chronic pain that should never have been allowed to progress that far. His co-founding
                physician brings more than three decades in physical medicine &amp; rehabilitation — the
                discipline built to restore function, reduce disability, and get people moving again
                after injury and long-term illness.
              </p>
              <p>
                That pairing is deliberate. Acute-care urgency from the ER. Long-game rehabilitation
                philosophy from PM&amp;R. Two board-certified physicians, one physician-owned clinic,
                and a nursing team that executes under their direct oversight — not a franchise script,
                not a telehealth queue, not a spa with a prescription pad.
              </p>
              <p>
                Every protocol is physician-designed. Every prescription is physician-signed. Every
                patient is physician-supervised. Hormone optimization, peptide medicine, medical weight
                loss, and IV therapy — all held to the same standard: treat the cause before it becomes
                a crisis.
              </p>
              <p className="text-foreground/90 font-normal">
                This is the difference between feeling okay and feeling like yourself again.
              </p>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-3xl mx-auto" />

        {/* Credibility */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-xs font-jost font-medium tracking-[2.5px] uppercase text-center">
              <span>Board-Certified Physicians</span>
              <span className="text-accent/40">·</span>
              <span>Emergency Medicine · PM&amp;R</span>
              <span className="text-accent/40">·</span>
              <span>Evans Town Center</span>
              <span className="text-accent/40">·</span>
              <span>Physician-Owned · Physician-Supervised</span>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-3xl mx-auto" />

        <section className="section-band-surface">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <p className="section-label mb-4">Our Team</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground">
                Physician leadership
              </h2>
              <p className="font-jost font-light text-muted-foreground mt-4 max-w-2xl mx-auto">
                Two disciplines. One standard of care.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {PHYSICIANS.map((member) => (
                <article key={member.id} className="premium-card-muted flex flex-col items-center text-center p-8">
                  {"name" in member ? (
                    <h3 className="font-playfair text-xl text-foreground">{member.name}</h3>
                  ) : (
                    <h3 className="font-playfair text-xl text-foreground">{member.title}</h3>
                  )}
                  <p className="font-jost text-xs uppercase tracking-[2px] text-accent mt-2 mb-4">
                    {member.discipline}
                  </p>
                  <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
