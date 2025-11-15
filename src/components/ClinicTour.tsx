import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clinicExterior from "@/assets/clinic-exterior.jpg";
import clinicWaitingRoom from "@/assets/clinic-waiting-room.jpg";
import ivTherapyCloseup from "@/assets/iv-therapy-closeup.jpg";

interface Slide {
  src: string;
  caption: string;
}

const ClinicTour = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: Slide[] = [
    {
      src: clinicExterior,
      caption: "Conveniently located in Augusta, GA"
    },
    {
      src: clinicWaitingRoom,
      caption: "Your private suite – no shared spaces"
    },
    {
      src: ivTherapyCloseup,
      caption: "Precision-dosed, physician-supervised"
    }
  ];

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  return (
    <section id="clinic-tour" className="py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-primary">
              Your Healing Environment
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience comfort, privacy, and professional care in every detail
            </p>
          </div>

          {/* Slider */}
          <Card className="relative overflow-hidden rounded-2xl shadow-2xl bg-secondary/20">
            {/* Main Image */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slide.src}
                    alt={slide.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="1200"
                    height="800"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                  />
                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6">
                    <p className="font-inter text-white text-lg md:text-xl font-medium text-center">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ClinicTour;
