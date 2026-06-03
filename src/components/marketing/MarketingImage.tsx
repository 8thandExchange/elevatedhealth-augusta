import { cn } from "@/lib/utils";
import { useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Renders only when the file exists under /public. No placeholder panels on the live site.
 */
export function MarketingImage({ src, alt, className, imgClassName }: Props) {
  const available = useMarketingImageAvailable(src);

  if (available !== true) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
