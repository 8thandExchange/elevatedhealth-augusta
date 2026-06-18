import { Link } from "react-router-dom";
import {
  CANCELLATION_NOTICE_HOURS,
  CARE_EMAIL,
  CLINICAL_CANCELLATION_SCENARIOS,
  IV_CANCELLATION_SCENARIOS,
  REFUND_REQUEST_STEPS,
  REBOOKING_FEE_DISPLAY,
  type CancellationScenario,
} from "@/lib/cancellationPolicy";
import { SITE_CONFIG } from "@/lib/siteConfig";

type Variant = "iv-compact" | "iv-full" | "clinical-compact" | "refund-process";

interface Props {
  variant: Variant;
  className?: string;
}

function ScenarioTable({ rows }: { rows: CancellationScenario[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm font-jost">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            <th className="px-4 py-3 font-medium text-foreground w-[42%]">If you…</th>
            <th className="px-4 py-3 font-medium text-foreground">What happens</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0 align-top">
              <td className="px-4 py-3 text-foreground/90">{row.situation}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.outcome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CancellationPolicySummary({ variant, className = "" }: Props) {
  if (variant === "iv-compact") {
    return (
      <div className={`rounded-lg border border-border bg-muted/30 p-4 text-sm font-jost ${className}`}>
        <p className="font-medium text-foreground mb-2">Cancellation & refunds (IV Lounge)</p>
        <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
          <li>
            {CANCELLATION_NOTICE_HOURS}+ hours notice: full refund or free reschedule.
          </li>
          <li>
            Less than {CANCELLATION_NOTICE_HOURS} hours or no-show: no refund; {REBOOKING_FEE_DISPLAY}{" "}
            rebooking fee to book again.
          </li>
          <li>
            Contact{" "}
            <a href={`mailto:${CARE_EMAIL}`} className="text-primary hover:underline">
              {CARE_EMAIL}
            </a>{" "}
            or{" "}
            <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
              {SITE_CONFIG.phone}
            </a>{" "}
            — do not no-show.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          <Link to="/terms#cancellation" className="text-primary hover:underline">
            Full policy
          </Link>
        </p>
      </div>
    );
  }

  if (variant === "iv-full") {
    return (
      <div className={`space-y-4 ${className}`}>
        <ScenarioTable rows={IV_CANCELLATION_SCENARIOS} />
        <RefundSteps />
      </div>
    );
  }

  if (variant === "clinical-compact") {
    return (
      <div className={`rounded-lg border border-border bg-muted/30 p-4 text-sm font-jost ${className}`}>
        <p className="font-medium text-foreground mb-2">Appointment changes</p>
        <p className="text-muted-foreground">
          Provide at least {CANCELLATION_NOTICE_HOURS} hours notice to cancel or reschedule without penalty.
          Late changes and no-shows require a {REBOOKING_FEE_DISPLAY} rebooking fee before booking again.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          <Link to="/terms#cancellation" className="text-primary hover:underline">
            Full cancellation & refund policy
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <RefundSteps />
    </div>
  );
}

function RefundSteps() {
  return (
    <div className="rounded-lg border border-primary/20 bg-background p-4">
      <p className="font-jost font-medium text-foreground mb-3">How to request a refund</p>
      <ol className="list-decimal pl-5 space-y-2 text-sm font-jost text-muted-foreground">
        {REFUND_REQUEST_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
