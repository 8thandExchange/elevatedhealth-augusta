import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
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
      name: "Sarah M.",
      role: "Patient",
      content:
        "After years of struggling with treatment-resistant depression, KETRA™ therapy gave me my life back. The physicians at Elevated Health Augusta are truly compassionate and skilled.",
      rating: 5,
    },
    {
      name: "James K.",
      role: "U.S. Marine Corps Veteran",
      content:
        "The specialized care I received for my PTSD was life-changing. They understand what veterans go through and provided treatment that actually works. Forever grateful.",
      rating: 5,
    },
    {
      name: "Linda R.",
      role: "Patient",
      content:
        "I was skeptical at first, but the results speak for themselves. My anxiety is manageable now, and I feel like myself again. The team made me feel safe throughout the entire process.",
      rating: 5,
    },
    {
      name: "Michael T.",
      role: "Patient",
      content:
        "Professional, caring, and effective. The KETRA™ treatment worked faster than any medication I've tried. The facility is modern and comfortable, and the staff is outstanding.",
      rating: 5,
    },
    {
      name: "Jennifer L.",
      role: "Patient",
      content:
        "Finding Elevated Health Augusta was a blessing. The physician-led approach gave me confidence, and the results exceeded my expectations. Highly recommend to anyone struggling.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Patient <span className="text-primary">Success Stories</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from patients who transformed their mental health with KETRA™ therapy
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
              <span className="text-lg font-semibold">4.9/5.0</span>
              <span>Average Rating from 100+ Patients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
