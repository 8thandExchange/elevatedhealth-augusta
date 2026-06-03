import type { ReactNode } from "react";
import { EditorialPanel } from "@/components/marketing/EditorialPanel";
import { useMarketingImageAvailable } from "@/hooks/useMarketingImageAvailable";
import { cn } from "@/lib/utils";

type Props = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
};

/** Pattern C: two-column when photo exists; single column otherwise (no placeholder panel). */
export function PatternCSplit({ imageSrc, imageAlt, children, className }: Props) {
  const hasImage = useMarketingImageAvailable(imageSrc) === true;

  return (
    <div
      className={cn(
        "grid md:grid-cols-12 gap-12 items-center",
        !hasImage && "max-w-3xl",
        className,
      )}
    >
      {hasImage && (
        <div className="md:col-span-5">
          <EditorialPanel src={imageSrc} alt={imageAlt} />
        </div>
      )}
      <div className={hasImage ? "md:col-span-7" : "md:col-span-12"}>{children}</div>
    </div>
  );
}
