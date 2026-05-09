import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  ExternalLink,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { downloadIcs } from "@/lib/ics";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface BookingConfirmedCardProps {
  appointmentId: string;
  serviceLabel: string;
  scheduledAt: string;
  durationMinutes: number;
  preVisitInstructions?: string[];
  rescheduleHref?: string;
}

// Single confirmation card shown after a slot is booked. Replaces the prior
// minimal "Booked" message that omitted the time, location, and any way
// to add the appointment to a calendar or reschedule.
const BookingConfirmedCard = ({
  appointmentId,
  serviceLabel,
  scheduledAt,
  durationMinutes,
  preVisitInstructions,
  rescheduleHref,
}: BookingConfirmedCardProps) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const confirmationNumber = appointmentId.slice(0, 8).toUpperCase();
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    SITE_CONFIG.address.full,
  )}`;

  const handleAddToCalendar = () => {
    downloadIcs(
      {
        uid: `${appointmentId}@elevatedhealthaugusta.com`,
        title: `${serviceLabel} — Elevated Health Augusta`,
        description:
          `Confirmation #${confirmationNumber}. ` +
          `Address: ${SITE_CONFIG.address.full}. ` +
          `Questions or changes: ${SITE_CONFIG.phone}.`,
        location: SITE_CONFIG.address.full,
        startUtc: start,
        endUtc: end,
        organizer: {
          name: SITE_CONFIG.clinicName,
          email: "booking@elevatedhealthaugusta.com",
        },
      },
      `eha-${confirmationNumber}.ics`,
    );
  };

  return (
    <Card className="border-2 border-accent/30 shadow-lg">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="font-playfair text-2xl text-foreground mb-1">
              You're booked.
            </h2>
            <p className="font-jost text-sm text-muted-foreground">
              Confirmation #{confirmationNumber}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <CalendarIcon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                When
              </p>
              <p className="font-jost font-medium text-foreground">
                {format(start, "EEEE, MMMM d")}
              </p>
              <p className="font-jost text-sm text-muted-foreground">
                {format(start, "h:mm a")} ({durationMinutes} min)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                Where
              </p>
              <p className="font-jost font-medium text-foreground">
                {SITE_CONFIG.address.line1}
              </p>
              <p className="font-jost text-sm text-muted-foreground">
                {SITE_CONFIG.address.cityStateZip}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-sm text-accent hover:underline font-jost"
              >
                Get directions <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {preVisitInstructions && preVisitInstructions.length > 0 && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Before your visit
            </p>
            <ul className="space-y-1.5">
              {preVisitInstructions.map((instr, i) => (
                <li
                  key={i}
                  className="font-jost text-sm text-foreground flex gap-2"
                >
                  <span className="text-accent">·</span>
                  <span>{instr}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={handleAddToCalendar} className="rounded-full">
            <Download className="h-4 w-4 mr-2" /> Add to calendar
          </Button>
          {rescheduleHref ? (
            <Button
              variant="outline"
              asChild
              className="rounded-full"
            >
              <a href={rescheduleHref}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reschedule
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              className="rounded-full"
            >
              <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                <Phone className="h-4 w-4 mr-2" /> Reschedule by phone
              </a>
            </Button>
          )}
        </div>

        <p className="font-jost text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Need to change anything? Call{" "}
          <a
            href={`tel:${SITE_CONFIG.phoneRaw}`}
            className="text-accent hover:underline"
          >
            {SITE_CONFIG.phone}
          </a>
          . A confirmation email and text are on the way.
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingConfirmedCard;
