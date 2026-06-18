import { ExternalLink, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LABCORP_PORTAL_TITLE,
  LABCORP_PORTAL_TOOLTIP,
  LABCORP_PROVIDER_PORTAL_URL,
} from "@/lib/labcorpPortal";

interface LabCorpPortalLinkProps {
  /** Full label for toolbars; icon-only for compact nav. */
  variant?: "button" | "icon";
  size?: "sm" | "default" | "icon";
  className?: string;
}

/**
 * External link to LabCorp Link for Caroline / clinical staff (requisitions, client billing).
 */
export function LabCorpPortalLink({
  variant = "button",
  size = "sm",
  className,
}: LabCorpPortalLinkProps) {
  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn("shrink-0 border-blue-600/30 bg-blue-50/80 hover:bg-blue-50 dark:bg-blue-950/30", className)}
        asChild
        title={LABCORP_PORTAL_TOOLTIP}
      >
        <a
          href={LABCORP_PROVIDER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={LABCORP_PORTAL_TITLE}
        >
          <TestTube2 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "whitespace-nowrap border-blue-600/35 bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/25 dark:hover:bg-blue-950/40",
        className,
      )}
      asChild
      title={LABCORP_PORTAL_TOOLTIP}
    >
      <a href={LABCORP_PROVIDER_PORTAL_URL} target="_blank" rel="noopener noreferrer">
        <TestTube2 className="h-4 w-4 mr-2 text-blue-700 dark:text-blue-300" />
        LabCorp Portal
        <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-60" />
      </a>
    </Button>
  );
}

export default LabCorpPortalLink;
