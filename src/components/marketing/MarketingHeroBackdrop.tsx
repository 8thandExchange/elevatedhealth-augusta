import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { probeMarketingImage } from "@/hooks/useMarketingImageAvailable";

type Props = {
  src: string;
  className?: string;
  imgClassName?: string;
};

/** Full-bleed hero background — renders only when the file exists under /public. */
export function MarketingHeroBackdrop({ src, className, imgClassName }: Props) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    probeMarketingImage(src).then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!available) return null;

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn("absolute inset-0 h-full w-full object-cover", className, imgClassName)}
    />
  );
}
