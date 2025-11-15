import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import brainPathwayReset from "@/assets/brain-pathway-reset.jpg";
import rapidMoodLift from "@/assets/rapid-mood-lift.jpg";
import safeSupervisedCare from "@/assets/safe-supervised-care.jpg";
import { trackCTAClick } from "@/lib/analytics";

const HowKetamineWorks = () => {
  const handleBooking = () => {
    trackCTAClick('how_ketamine_works_book', 'https://calendar.app.google/SgGgATWunSGzz34s6');
    window.open('https://calendar.app.google/SgGgATWunSGzz34s6', '_blank', 'noopener,noreferrer');
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
        <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
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
                    className="flex flex-col hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <img 
                        src={video.image} 
                        alt={video.alt}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
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
