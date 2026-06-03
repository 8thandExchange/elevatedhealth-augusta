import { useState } from "react";
import { cn } from "@/lib/utils";
import { EditorialFallback } from "@/components/marketing/EditorialFallback";

type FallbackVariant = "light" | "dark" | "warm";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackVariant?: FallbackVariant;
};

/**
 * Renders src when the file exists in /public; otherwise a branded fallback only.
 */
export function MarketingImage({
  src,
  alt,
  className,
  imgClassName,
  fallbackVariant = "light",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <EditorialFallback variant={fallbackVariant} />
      {!failed && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "relative z-10 h-full w-full object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
