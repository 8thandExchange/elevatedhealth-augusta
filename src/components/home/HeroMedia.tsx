import { useEffect, useState } from "react";
import { MARKETING_IMAGES } from "@/lib/marketingImages";

type MediaMode = "video" | "poster" | "mesh";

function probe(url: string): Promise<boolean> {
  return fetch(url, { method: "HEAD" }).then((r) => r.ok).catch(() => false);
}

/** Background layer for homepage hero — auto-enables video/poster when files exist in /public/images/. */
export function HeroMedia() {
  const [mode, setMode] = useState<MediaMode>("mesh");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (await probe(MARKETING_IMAGES.heroVideo)) {
        if (!cancelled) setMode("video");
        return;
      }
      if (await probe(MARKETING_IMAGES.heroPoster)) {
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
        poster={MARKETING_IMAGES.heroPoster}
        className="absolute inset-0 h-full w-full object-cover"
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
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
    );
  }

  return <div className="hero-mesh absolute inset-0" aria-hidden />;
}
