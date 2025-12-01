import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ClinicVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-inter font-light">
            Experience
          </p>
          <h2 className="text-4xl sm:text-5xl font-cormorant font-light text-foreground mb-4">
            What to Expect
          </h2>
          <p className="text-lg text-muted-foreground font-inter font-light max-w-xl mx-auto">
            Experience our private treatment suites and calming environment
          </p>
        </div>

        {/* Video Container */}
        <div className="overflow-hidden animate-fade-in-up">
          <div 
            className="aspect-video w-full bg-secondary relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Custom Play Button Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 bg-primary/80 flex flex-col items-center justify-center cursor-pointer group z-10 transition-all duration-500 hover:bg-primary/85"
                onClick={handlePlayClick}
              >
                <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/60 mb-4 font-inter">
                  Tour Our Space
                </p>
                <h3 className="text-3xl md:text-4xl font-cormorant font-light text-primary-foreground mb-8">
                  Elevated Health Augusta
                </h3>

                {/* Play Button */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border border-primary-foreground/30 flex items-center justify-center group-hover:border-primary-foreground/50 transition-all duration-300">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>

                <p className="text-primary-foreground/50 text-xs mt-8 tracking-[0.2em] uppercase font-inter">
                  Click to Play
                </p>
              </div>
            )}

            {/* Custom Video Controls Overlay */}
            {isPlaying && isHovering && (
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent flex items-end z-20 transition-opacity duration-300">
                <div className="w-full p-6 flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="text-background hover:text-background/80 transition-colors p-2"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-background hover:text-background/80 transition-colors p-2"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={toggleFullscreen}
                    className="text-background hover:text-background/80 transition-colors p-2"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              preload="metadata"
              onClick={togglePlayPause}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/videos/clinic-experience.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Caption */}
          <div className="p-8 lg:p-10 bg-card border border-border/50">
            <h3 className="text-2xl font-cormorant font-light text-foreground mb-3">
              Tour Our Clinic
            </h3>
            <p className="text-muted-foreground font-inter font-light leading-relaxed">
              See our private treatment suites and experience the calming environment 
              designed for your comfort and healing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicVideo;
