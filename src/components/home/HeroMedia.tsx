import { useEffect, useState } from "react";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { probeMarketingImage } from "@/hooks/useMarketingImageAvailable";

const mediaClass =
  "absolute inset-0 h-full w-full object-cover object-center max-md:object-[center_40%]";

/**
 * Homepage hero background — poster renders immediately; video layers on when available.
 * Wrapped in z-0 so headline/CTAs always sit above the media stack.
 */
export function HeroMedia() {
  const [useVideo, setUseVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    probeMarketingImage(MARKETING_IMAGES.heroVideo).then((ok) => {
      if (!cancelled && ok) setUseVideo(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <img src={MARKETING_IMAGES.heroPoster} alt="" className={mediaClass} />
      {useVideo && !videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={MARKETING_IMAGES.heroPoster}
          onError={() => setVideoFailed(true)}
          className={mediaClass}
        >
          <source src={MARKETING_IMAGES.heroVideo} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
