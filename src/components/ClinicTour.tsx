import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Maximize2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import clinicInterior from "@/assets/clinic-interior.jpg";
import clinicWaitingRoom from "@/assets/clinic-waiting-room.jpg";
import clinicExterior from "@/assets/clinic-exterior.jpg";
import ivTherapyCloseup from "@/assets/iv-therapy-closeup.jpg";

interface GalleryImage {
  src: string;
  title: string;
  description: string;
  category: "exterior" | "waiting" | "treatment";
}

const ClinicTour = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images: GalleryImage[] = [
    {
      src: clinicExterior,
      title: "Our Evans, GA Location",
      description: "Conveniently located at Evans Town Center, our modern facility provides easy access and ample parking for all patients.",
      category: "exterior"
    },
    {
      src: clinicWaitingRoom,
      title: "Welcoming Reception Area",
      description: "A warm, calming environment designed to put you at ease from the moment you arrive. Comfortable seating and a peaceful atmosphere await.",
      category: "waiting"
    },
    {
      src: clinicInterior,
      title: "Private Treatment Rooms",
      description: "State-of-the-art treatment spaces equipped with comfortable recliners and modern medical technology, ensuring your safety and comfort.",
      category: "treatment"
    },
    {
      src: ivTherapyCloseup,
      title: "Advanced Ketamine Therapy",
      description: "Our KETRA™ protocol utilizes precision medical equipment and pharmaceutical-grade ketamine administered by board-certified providers.",
      category: "treatment"
    }
  ];

  const openModal = (index: number) => {
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section id="clinic-tour" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-2 rounded-full mb-6">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">Virtual Tour</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Experience Our Healing Environment
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Take a virtual tour of our modern, spa-like facility designed specifically for your comfort and peace of mind
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {images.map((image, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => openModal(index)}
              >
                <div className="relative h-[400px] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-gold/20 backdrop-blur-sm rounded-full text-xs font-semibold text-gold border border-gold/30">
                        {image.category === "exterior" && "Exterior"}
                        {image.category === "waiting" && "Waiting Area"}
                        {image.category === "treatment" && "Treatment Space"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                    <p className="text-primary-foreground/90 text-sm line-clamp-2">
                      {image.description}
                    </p>
                  </div>

                  {/* Hover Icon */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-primary-foreground/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-primary-foreground/30">
                    <Maximize2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Visit CTA */}
          <div className="text-center">
            <Card className="inline-block p-8 bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Visit Us in Person?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                We'd love to welcome you to our Evans, GA facility. Schedule your free consultation 
                to tour our clinic and meet our caring team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => {
                    const element = document.getElementById("booking");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Schedule a Visit
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const element = document.getElementById("contact");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get Directions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal Gallery */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-none">
          {selectedImage !== null && (
            <div className="relative w-full h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background transition-colors flex items-center justify-center"
              >
                <X className="h-6 w-6 text-foreground" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background transition-colors flex items-center justify-center"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>

              {/* Image Display */}
              <div className="flex-1 flex items-center justify-center p-8">
                <img
                  src={images[selectedImage].src}
                  alt={images[selectedImage].title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Image Info */}
              <div className="p-8 bg-gradient-to-t from-background to-transparent">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-accent/10 rounded-full text-xs font-semibold text-accent border border-accent/20">
                      {images[selectedImage].category === "exterior" && "Exterior"}
                      {images[selectedImage].category === "waiting" && "Waiting Area"}
                      {images[selectedImage].category === "treatment" && "Treatment Space"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedImage + 1} / {images.length}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {images[selectedImage].title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {images[selectedImage].description}
                  </p>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="px-8 pb-6">
                <div className="flex gap-2 justify-center overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImage
                          ? "border-accent scale-110"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ClinicTour;
