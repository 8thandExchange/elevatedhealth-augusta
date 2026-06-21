import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, Droplet, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/contexts/BookingContext";
import { CARE_LANES, CARE_PATH_COMPARISON } from "@/lib/howClinicWorksContent";
import { StorefrontSectionHeader } from "@/components/marketing/StorefrontSectionHeader";

const laneIcons = {
  "iv-lounge": Droplet,
  wellness: Stethoscope,
} as const;

const HowClinicWorks = () => {
  const { openBooking } = useBooking();

  return (
    <div className="public-page-shell">
      <Helmet>
        <title>How the Clinic Works | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Two care paths at Elevated Health Augusta: IV Lounge walk-in booking, or a $79 Wellness Assessment for hormones, GLP-1 weight loss, and peptides."
        />
      </Helmet>
      <Navbar />
      <main id="main-content" className="flex-1 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-10 md:space-y-14">
          <StorefrontSectionHeader
            label="Evans, Georgia"
            title={
              <>
                Two ways to <span className="italic">get care</span>
              </>
            }
            lead="Same clinic, same team — two front doors. IV hydration is open booking. Hormones, medical weight loss, and peptides start with a Wellness Assessment."
          />

          <section aria-labelledby="care-paths-heading">
            <p id="care-paths-heading" className="section-label text-center mb-8">
              Choose your path
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {CARE_LANES.map((lane) => {
                const Icon = laneIcons[lane.id];
                const isIv = lane.id === "iv-lounge";

                return (
                  <Card
                    key={lane.id}
                    className={`premium-card h-full flex flex-col ${
                      isIv ? "border-accent/40 bg-accent/[0.03]" : "border-primary/25 bg-primary/[0.02]"
                    }`}
                  >
                    <CardHeader className="space-y-3 pb-4">
                      <p className="section-label">{lane.lane}</p>
                      <CardTitle className="font-playfair text-2xl flex items-center gap-2">
                        <Icon className={`h-6 w-6 ${isIv ? "text-accent" : "text-primary"}`} />
                        {lane.title}
                      </CardTitle>
                      <p className="font-jost text-sm font-medium text-foreground">{lane.tagline}</p>
                      <p className="font-jost text-sm text-muted-foreground leading-relaxed">{lane.summary}</p>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 gap-6">
                      <ol className="font-jost text-sm space-y-3 list-decimal list-inside text-muted-foreground flex-1">
                        {lane.steps.map((step) => (
                          <li key={step} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                      {"href" in lane.cta ? (
                        <Button asChild size="lg" variant={isIv ? "default" : "outline"} className="font-jost w-full">
                          <Link to={lane.cta.href}>
                            {lane.cta.label}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      ) : (
                        <Button size="lg" onClick={openBooking} className="font-jost w-full gap-2">
                          {lane.cta.label}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="path-comparison-heading" className="rounded-sm border border-border/60 overflow-hidden">
            <div className="bg-muted/40 px-6 py-4 text-center border-b border-border/60">
              <h2 id="path-comparison-heading" className="font-playfair text-xl text-foreground">
                At a <span className="italic">glance</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-jost text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-surface">
                    <th className="text-left font-medium text-muted-foreground px-6 py-4 w-1/3" scope="col" />
                    <th className="text-left font-medium text-foreground px-6 py-4 w-1/3" scope="col">
                      IV Lounge
                    </th>
                    <th className="text-left font-medium text-foreground px-6 py-4 w-1/3" scope="col">
                      Wellness Programs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CARE_PATH_COMPARISON.map((row) => (
                    <tr key={row.label} className="border-b border-border/40 last:border-0">
                      <th className="text-left font-medium text-muted-foreground px-6 py-4 align-top" scope="row">
                        {row.label}
                      </th>
                      <td className="px-6 py-4 text-muted-foreground align-top">{row.iv}</td>
                      <td className="px-6 py-4 text-muted-foreground align-top">{row.wellness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="text-center space-y-4 rounded-sm bg-muted/40 p-8">
            <p className="font-jost text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We do not prescribe from symptoms alone. Wellness programs require labs, physician review, and
              appropriate consents before treatment begins. IV guests who want hormones, weight loss, or peptides
              can book a Wellness Assessment anytime.
            </p>
            <Button asChild variant="link" className="font-jost text-accent">
              <Link to="/pricing">See transparent pricing →</Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowClinicWorks;
