import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Renders only when the file exists under /public. Shows a muted shell while the image loads
 * so layout does not flash as a blank white panel.
 */
export function MarketingImage({ src, alt, className, imgClassName }: Props) {
  const available = useMarketingImageAvailable(src);
  const [loaded, setLoaded] = useState(false);

  if (available !== true) return null;

  return (
    <div className={cn("relative overflow-hidden bg-muted/50", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
