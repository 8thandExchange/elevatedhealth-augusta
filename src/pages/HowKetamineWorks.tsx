import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import brainPathwayReset from "@/assets/brain-pathway-reset.jpg";
import rapidMoodLift from "@/assets/rapid-mood-lift.jpg";
import safeSupervisedCare from "@/assets/safe-supervised-care.jpg";
import { trackCTAClick, trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const HowKetamineWorks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const handleBooking = () => {
    trackCTAClick('how_ketamine_works_book', 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true');
    window.open('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true', '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    trackCTAClick('how_ketamine_works_call', 'tel:+17067603470');
    window.location.href = 'tel:+17067603470';
  };

  const videos = [
    {
      image: brainPathwayReset,
      title: "1. Brain Pathway Reset",
      description: "Ketamine blocks NMDA receptors, triggering glutamate surge and BDNF release — rebuilding neural connections in hours.",
      alt: "Medical illustration of brain synapse pathway showing neural connections and BDNF markers"
    },
    {
      image: rapidMoodLift,
      title: "2. Rapid Mood Lift",
      description: "Within 4 hours, 70%+ of patients report relief from treatment-resistant depression (Yale Study, 2023).",
      alt: "Medical infographic showing mood improvement timeline with 70% statistic"
    },
    {
      image: safeSupervisedCare,
      title: "3. Safe, Supervised Care",
      description: "Physician-monitored infusions in private suites with oxygen, anti-nausea meds, and vital tracking.",
      alt: "Medical facility illustration showing private treatment suite with vital signs monitor"
    }
  ];

  return (
    <>
      <Helmet>
        <title>How Ketamine Works | Elevated Health Augusta</title>
        <meta 
          name="description" 
          content="See how ketamine rapidly resets brain pathways for depression, PTSD, and anxiety. Evidence-based explainers backed by Yale research." 
        />
        <meta property="og:title" content="How Ketamine Works | Elevated Health Augusta" />
        <meta property="og:description" content="Evidence-based ketamine therapy explained with medical illustrations and research-backed data." />
        <link rel="canonical" href="https://www.elevatedhealthaugusta.com/how-ketamine-works" />
        
        {/* Schema.org structured data for medical content */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "How Ketamine Works",
            "description": "Evidence-based explanation of ketamine therapy mechanism of action for treating depression, PTSD, and anxiety",
            "medicalAudience": [{
              "@type": "MedicalAudience",
              "audienceType": "Patient"
            }],
            "about": {
              "@type": "MedicalTherapy",
              "name": "Ketamine Therapy",
              "relevantSpecialty": {
                "@type": "MedicalSpecialty",
                "name": "Psychiatry"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                How Ketamine Works
              </h1>
              <p className="font-inter text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
                Rapid, research-backed relief in 45 minutes. Explore the science behind ketamine therapy.
              </p>
            </div>
          </div>
        </section>

        {/* Video Grid Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                {videos.map((video, index) => (
                  <Card 
                    key={index} 
                    className="flex flex-col hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenIndex(index);
                        trackEvent('image_enlarge', { section: 'how_ketamine_works', title: video.title });
                      }}
                      className="relative aspect-video w-full overflow-hidden bg-muted cursor-zoom-in"
                      aria-label={`Expand ${video.title}`}
                    >
                      <img 
                        src={video.image} 
                        alt={video.alt}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </button>
                    <CardHeader>
                      <CardTitle className="font-playfair text-2xl text-foreground">
                        {video.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="font-inter text-base leading-relaxed">
                        {video.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Lightbox Dialog */}
              {openIndex !== null && (
                <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
                  <DialogContent className="max-w-5xl p-0 overflow-hidden bg-card">
                    <img 
                      src={videos[openIndex].image} 
                      alt={`${videos[openIndex].alt} (expanded)`} 
                      className="w-full h-auto object-contain" 
                    />
                    <div className="p-4">
                      <h3 className="font-playfair text-xl text-foreground">{videos[openIndex].title}</h3>
                      <p className="font-inter text-sm text-muted-foreground">{videos[openIndex].description}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Research Citation */}
              <div className="mt-12 p-6 bg-secondary/30 rounded-lg border border-border">
                <p className="font-inter text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Research-Backed:</strong> Data from Yale School of Medicine (2023), 
                  National Institute of Mental Health, and peer-reviewed journals. Ketamine therapy has shown 70%+ response 
                  rates for treatment-resistant depression in clinical trials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ready to Start Your Healing Journey?
              </h2>
              <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book a free consultation to discuss your treatment options with our board-certified providers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={handleBooking}
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Book Your Consultation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleCall}
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Call Us (706) 760-3470
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HowKetamineWorks;
