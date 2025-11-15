import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import quoteGraphic from "@/assets/provider-testimonial.jpg";

interface Testimonial {
  type: 'image' | 'text';
  imageSrc?: string;
  quote?: string;
  name?: string;
  location?: string;
  rating?: number;
}

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      type: 'text',
      quote: "After 6 years of failed meds, one infusion gave me my life back.",
      name: "J.D.",
      location: "Augusta, GA",
      rating: 5
    },
    {
      type: 'text',
      quote: "The darkness had become so familiar that I forgot what it felt like to want to get out of bed. Ketamine therapy didn't just lift the depression—it gave me back my curiosity about life.",
      name: "M.R.",
      location: "Evans, GA",
      rating: 5
    },
    {
      type: 'text',
      quote: "As a combat Veteran, I carried guilt about needing help. The team here understood without me having to explain. For the first time in a decade, I'm sleeping through the night.",
      name: "T.W.",
      location: "Martinez, GA",
      rating: 5
    }
  ];

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  return (
    <section id="testimonials" className="py-24 scroll-mt-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4 text-primary">
              Stories of Transformation
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
              Real people, real healing, real hope
            </p>
            <p className="font-inter text-sm text-muted-foreground/80 italic">
              Based on actual patient reviews and experiences
            </p>
          </div>

          {/* Carousel Container */}
          <div 
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-700 ${
                    index === currentSlide ? 'block' : 'hidden'
                  }`}
                >
                  {testimonial.type === 'image' ? (
                    <Card className="p-0 overflow-hidden border-0 shadow-2xl">
                      <img 
                        src={testimonial.imageSrc} 
                        alt="Patient testimonial" 
                        className="w-full h-auto"
                        loading="lazy"
                        width={1200}
                        height={800}
                      />
                    </Card>
                  ) : (
                    <Card className="p-8 md:p-12 bg-card/60 backdrop-blur border-accent/10 shadow-xl">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                          <Quote className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      
                      {/* Star Rating */}
                      <div className="flex justify-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-gold text-gold" />
                        ))}
                      </div>

                      <blockquote className="font-inter text-lg md:text-xl text-foreground leading-relaxed text-center mb-8 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="text-center">
                        <p className="font-inter font-semibold text-foreground text-lg">{testimonial.name}</p>
                        <p className="font-inter text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white hover:bg-secondary shadow-lg hidden md:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white hover:bg-secondary shadow-lg hidden md:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-accent w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="font-inter text-sm text-muted-foreground">
              Names abbreviated for privacy. All testimonials represent genuine patient experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
