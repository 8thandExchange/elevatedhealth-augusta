import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Pattern C editorial column — only when photo exists in /public/images/. */
export function EditorialPanel({ src, alt, className }: Props) {
  return (
    <MarketingImage
      src={src}
      alt={alt}
      className={cn("aspect-[4/5] border border-border", className)}
    />
  );
}
