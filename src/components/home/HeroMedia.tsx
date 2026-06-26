import { useEffect, useState } from "react";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { probeMarketingImage } from "@/hooks/useMarketingImageAvailable";

type MediaMode = "video" | "poster" | "mesh";

/** Background layer for homepage hero — video when available, poster fallback. */
export function HeroMedia() {
  const [mode, setMode] = useState<MediaMode>("mesh");

  useEffect(() => {
    let cancelled = false;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      if (!prefersReducedMotion && (await probeMarketingImage(MARKETING_IMAGES.heroVideo))) {
        if (!cancelled) setMode("video");
        return;
      }
      if (await probeMarketingImage(MARKETING_IMAGES.heroPoster)) {
        if (!cancelled) setMode("poster");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === "video") {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={MARKETING_IMAGES.heroPoster}
        className="absolute inset-0 h-full w-full object-cover object-center max-md:object-[center_40%]"
        aria-hidden
      >
        <source src={MARKETING_IMAGES.heroVideo} type="video/mp4" />
      </video>
    );
  }

  if (mode === "poster") {
    return (
      <img
        src={MARKETING_IMAGES.heroPoster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center max-md:object-[center_40%]"
        aria-hidden
      />
    );
  }

  return null;
}
