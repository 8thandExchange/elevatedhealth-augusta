import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Testimonials = () => {

  const testimonials = [
    {
      quote: "I spent years trying different medications that never quite worked. After my first KETRA™ session, I felt a shift I can only describe as my brain finally exhaling. Three months later, I'm living a life I didn't think was possible anymore.",
      initials: "M.R.",
      location: "Augusta, GA"
    },
    {
      quote: "The darkness had become so familiar that I forgot what it felt like to want to get out of bed. KETRA™ didn't just lift the depression—it gave me back my curiosity about life. I'm reconnecting with my family in ways I haven't in years.",
      initials: "J.S.",
      location: "Evans, GA"
    },
    {
      quote: "As a combat Veteran, I carried guilt about needing help for my PTSD. The team here understood without me having to explain. The treatment worked faster than I expected, and for the first time in a decade, I'm sleeping through the night.",
      initials: "T.W.",
      location: "Martinez, GA"
    },
    {
      quote: "I was terrified to try something new after so many failed treatments. But the expert-led approach and the care I received made all the difference. My anxiety doesn't control my days anymore. I finally feel like myself again.",
      initials: "K.H.",
      location: "Grovetown, GA"
    },
    {
      quote: "After losing hope that anything would help my depression, KETRA™ therapy gave me something I hadn't felt in years—optimism. The transformation wasn't instant, but it was real. I'm grateful every single day.",
      initials: "D.L.",
      location: "Augusta, GA"
    }
  ];

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Stories of <span className="text-primary">Transformation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real people, real healing, real hope
            </p>
          </div>

          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="p-4 md:p-8">
                    <Card className="p-8 md:p-12 bg-card/60 backdrop-blur border-accent/10 shadow-lg">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                          <Quote className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      <blockquote className="text-lg md:text-xl text-foreground leading-relaxed text-center mb-8 font-light italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-lg">{testimonial.initials}</p>
                        <p className="text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Names abbreviated for privacy. All testimonials represent genuine patient experiences.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
