import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackVariant?: "light" | "dark" | "warm";
};

/** Pattern C editorial column — photo when available, branded panel otherwise. */
export function EditorialPanel({
  src,
  alt,
  className,
  fallbackVariant = "light",
}: Props) {
  return (
    <MarketingImage
      src={src}
      alt={alt}
      fallbackVariant={fallbackVariant}
      className={cn("aspect-[4/5] border border-border", className)}
    />
  );
}
