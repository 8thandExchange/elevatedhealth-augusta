import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const TEAM = [
  {
    id: "akers",
    name: "Dr. Troy Akers, DO",
    role: "Owner / Medical Director",
  },
  {
    id: "williams",
    name: "Dr. Dennis A. Williams, MD",
    role: "Supervising Physician",
  },
  {
    id: "marshall",
    name: "Caroline Marshall, RN BSN",
    role: "Clinical Lead",
  },
] as const;

const About = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>About | Elevated Health Augusta</title>
        <meta name="description" content="Elevated Health Augusta was built by physicians and nurses with experience across emergency medicine and physical medicine & rehabilitation. Evans, GA." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/about" />
        <meta property="og:title" content="About | Elevated Health Augusta" />
        <meta property="og:description" content="Built by physicians and nurses from emergency medicine and PM&R. Evans, GA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/about" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        
        <section className="min-h-[88vh] md:min-h-[90vh] flex items-center bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl py-28 md:py-36">
            <p className="section-label mb-6 md:mb-8">About Elevated Health Augusta</p>
            <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl text-foreground mb-10 md:mb-12 leading-[1.05]">
              Built by a team that spent years watching patients suffer through what was preventable.
            </h1>
            <div className="space-y-6 font-jost font-light text-lg text-muted-foreground leading-relaxed">
              <p>
                Elevated Health Augusta was founded by a team of physicians and nurses with deep experience across 
                emergency medicine and physical medicine &amp; rehabilitation. After years of watching 
                patients cycle through the ER for conditions that were entirely preventable — 
                hormonal decline, severe pregnancy nausea, metabolic breakdown — they built 
                something better.
              </p>
              <p>
                
              </p>
              <p>
                Every protocol at Elevated Health Augusta is physician-designed. Every prescription is physician-signed. 
                Every patient is physician-supervised. Our clinical team works together — physicians 
                and nurses — under direct medical oversight on your individualized care plan.
              </p>
              <p>
                This is the difference between a spa and a clinic. Between an app and a physician. 
                Between feeling okay and feeling like yourself again.
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
              <span>Evans Town Center</span>
              <span className="text-accent/40">·</span>
              <span>Physician-Led Team</span>
              <span className="text-accent/40">·</span>
              <span>Physician-Supervised</span>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-3xl mx-auto" />

        {/* Our Team — photography and bios added when assets are delivered */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <p className="section-label mb-4">Our Team</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground">
                The physicians and nurses behind Elevated Health Augusta
              </h2>
              <p className="font-jost font-light text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
                Real credentials, local presence — the same clinical leadership you&apos;ll meet in Evans.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              {TEAM.map((member) => (
                <article key={member.id} className="flex flex-col items-center text-center space-y-3">
                  <div>
                    <h3 className="font-playfair text-xl text-foreground">{member.name}</h3>
                    <p className="text-xs font-jost tracking-[0.2em] uppercase text-muted-foreground mt-2">{member.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;