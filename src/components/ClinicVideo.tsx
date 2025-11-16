import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useState, useRef } from "react";

const ClinicVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-light text-primary mb-4">
            What to Expect
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our private treatment suites and calming environment where your healing journey begins
          </p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-2 border-accent/20 hover:shadow-3xl transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-muted relative">
              {/* Custom Play Button Overlay */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/90 flex flex-col items-center justify-center cursor-pointer group z-10 transition-all duration-300 hover:from-primary/95 hover:via-primary/85 hover:to-primary/95"
                  onClick={handlePlayClick}
                >
                  {/* Elevated Health Branding */}
                  <div className="mb-6">
                    <h3 className="text-3xl md:text-4xl font-light text-gold tracking-wider drop-shadow-lg mb-2">
                      Elevated Health Augusta
                    </h3>
                    <p className="text-white/80 text-sm md:text-base tracking-wide">
                      Tour Our Private Suites
                    </p>
                  </div>

                  {/* Play Button */}
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-primary fill-primary ml-1" />
                    </div>
                    {/* Pulse animation ring */}
                    <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
                  </div>

                  <p className="text-white/70 text-sm mt-6 uppercase tracking-widest">
                    Click to Play
                  </p>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                preload="metadata"
                onClick={handleVideoClick}
                onEnded={() => setIsPlaying(false)}
                style={{ 
                  objectFit: 'cover',
                  filter: 'contrast(1.05) saturate(1.1)'
                }}
              >
                <source src="/videos/clinic-experience.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-6 md:p-8 bg-card">
              <h3 className="text-2xl md:text-3xl font-light text-primary mb-3">
                Tour Our Clinic
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                See our private treatment suites, meet our compassionate team, and experience the calming 
                environment designed for your comfort and healing. Every detail is crafted to support your journey to wellness.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ClinicVideo;
