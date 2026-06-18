import { Badge } from "@/components/ui/badge";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import type { PatientConsentStatus } from "@/lib/consents/patient-consent-status";

interface PatientConsentStatusBadgeProps {
  status: PatientConsentStatus | undefined;
  loading?: boolean;
  onNavigateConsent?: () => void;
}

export function PatientConsentStatusBadge({
  status,
  loading,
  onNavigateConsent,
}: PatientConsentStatusBadgeProps) {
  if (loading || status === undefined) {
    return (
      <Badge variant="outline" className="gap-1 whitespace-nowrap text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Consents…
      </Badge>
    );
  }

  if (status.state === "all_current") {
    return (
      <Badge
        variant="outline"
        className="gap-1 whitespace-nowrap cursor-pointer border-green-600/40 bg-green-500/10 text-green-800 dark:text-green-200 hover:bg-green-500/20"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateConsent?.();
        }}
      >
        <Check className="h-3 w-3" />
        All consents current
      </Badge>
    );
  }

  if (status.state === "expiring_soon") {
    return (
      <Badge
        variant="outline"
        className="gap-1 whitespace-nowrap cursor-pointer border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100 hover:bg-amber-500/20"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateConsent?.();
        }}
      >
        <TriangleAlert className="h-3 w-3" />
        Expiring soon
      </Badge>
    );
  }

  if (status.state === "no_consents_signed") {
    return (
      <Badge
        variant="outline"
        className="gap-1 whitespace-nowrap cursor-pointer border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100 hover:bg-amber-500/20"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateConsent?.();
        }}
      >
        <TriangleAlert className="h-3 w-3" />
        Consents pending
      </Badge>
    );
  }

  if (status.state === "missing_or_expired") {
    return (
      <Badge
        variant="outline"
        className="gap-1 whitespace-nowrap cursor-pointer border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100 hover:bg-amber-500/20"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateConsent?.();
        }}
      >
        <TriangleAlert className="h-3 w-3" />
        Consents needed
      </Badge>
    );
  }

  return null;
}
