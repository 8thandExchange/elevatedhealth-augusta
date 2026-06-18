import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Pill,
  Sparkles,
  TestTube,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConsultJourneyProgress from "@/components/patient/ConsultJourneyProgress";
import MembershipSummary from "@/components/patient/MembershipSummary";
import type { Patient } from "@/hooks/usePatient";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { hasWellnessAssessmentPaid } from "@/lib/wellnessAssessmentPayment";
import {
  getConsultJourneyPatientAction,
  type ConsultJourneyContext,
} from "@/lib/consultJourney";
import {
  gfeStatusLabel,
  pickActiveGfeClearance,
} from "@/lib/gfeClearance";
import { formatClinicDate, formatClinicDateTime, formatClinicTime, isConsentActive } from "@/lib/clinicTime";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import {
  APPOINTMENT_STATUS_LABEL,
  consentTypeTitle,
  LAB_ORDER_STATUS_LABEL,
  LAB_PANEL_LABEL,
  serviceLineLabel,
} from "@/lib/patientDashboardLabels";

interface PatientDashboardHomeProps {
  patient: Patient;
  tier1IntakeComplete: boolean | null;
}

type SetupStep = {
  id: string;
  label: string;
  done: boolean;
  actionLabel?: string;
  actionPath?: string;
};

function SetupChecklist({ steps }: { steps: SetupStep[] }) {
  const completed = steps.filter((s) => s.done).length;
  const allDone = completed === steps.length;

  return (
    <Card className="mb-8 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-jost text-base font-medium">Your setup checklist</CardTitle>
          <Badge variant={allDone ? "default" : "secondary"} className="font-jost font-normal">
            {completed} of {steps.length} complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                step.done
                  ? "border-green-200/80 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-border/60 bg-muted/20"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  step.done ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-medium">·</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-jost text-sm ${step.done ? "text-foreground" : "font-medium text-foreground"}`}>
                  {step.label}
                </p>
                {step.done && (
                  <p className="font-jost text-xs text-green-700 dark:text-green-300">Completed</p>
                )}
              </div>
              {!step.done && step.actionLabel && step.actionPath && (
                <Button asChild size="sm" variant="outline" className="shrink-0 font-jost">
                  <Link to={step.actionPath}>{step.actionLabel}</Link>
                </Button>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function downloadConsentPdf(path: string, filename: string) {
  return supabase.storage.from("signed-consents").download(path).then(({ data, error }) => {
    if (error || !data) throw error ?? new Error("Download failed");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

export function PatientDashboardHome({ patient, tier1IntakeComplete }: PatientDashboardHomeProps) {
  const navigate = useNavigate();
  const { data: dash, isLoading } = usePatientDashboard(patient.id, patient.email);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const wellnessPaid = hasWellnessAssessmentPaid({
    onboardingStatus: patient.onboarding_status,
    hasPaidConsultBooking: dash?.hasPaidConsultBooking,
    elevatedMembershipStatus: patient.elevated_membership_status,
  });

  const journeyContext: ConsultJourneyContext = useMemo(
    () => ({
      onboardingStatus: patient.onboarding_status,
      intakeCompleted: !!patient.intake_completed,
      gfeRows: dash?.gfeRows,
      hasPaidConsultBooking: dash?.hasPaidConsultBooking,
      hasTier1Consents: tier1IntakeComplete === true,
    }),
    [
      patient.onboarding_status,
      patient.intake_completed,
      dash?.gfeRows,
      dash?.hasPaidConsultBooking,
      tier1IntakeComplete,
    ],
  );

  const journeyAction = getConsultJourneyPatientAction(journeyContext);
  const activeGfe = dash ? pickActiveGfeClearance(dash.gfeRows) : null;
  const latestGfe = dash?.gfeRows[0] ?? null;
  const hasUpcomingVisit = (dash?.upcomingAppointments.length ?? 0) > 0;

  const setupSteps: SetupStep[] = useMemo(
    () => [
      {
        id: "intake",
        label: "Medical intake questionnaire",
        done: !!patient.intake_completed,
        actionLabel: patient.intake_completed ? undefined : "Start intake",
        actionPath: patient.intake_completed ? undefined : "/patient/intake",
      },
      {
        id: "consents",
        label: "Required clinic consents",
        done: tier1IntakeComplete === true,
        actionLabel: tier1IntakeComplete ? undefined : "Sign consents",
        actionPath: tier1IntakeComplete ? undefined : "/intake/consents",
      },
      {
        id: "assessment",
        label: "Wellness assessment ($79)",
        done: wellnessPaid,
        actionLabel: wellnessPaid ? undefined : "Pay $79",
        actionPath: wellnessPaid ? undefined : "/consult/start",
      },
      {
        id: "gfe",
        label: "Good Faith Exam clearance",
        done: !!activeGfe || patient.onboarding_status === "gfe_cleared",
        actionLabel: undefined,
        actionPath: undefined,
      },
      {
        id: "visit",
        label: "First clinic visit scheduled",
        done: hasUpcomingVisit || patient.onboarding_status === "consultation_scheduled",
        actionLabel: activeGfe && !hasUpcomingVisit ? "Schedule" : undefined,
        actionPath: activeGfe && !hasUpcomingVisit ? "/schedule-consult" : undefined,
      },
    ],
    [patient, tier1IntakeComplete, activeGfe, hasUpcomingVisit, wellnessPaid],
  );

  const handleConsentDownload = async (recordId: string, path: string, type: string) => {
    setDownloadingId(recordId);
    try {
      await downloadConsentPdf(path, path.split("/").pop() ?? `${type}-signed.pdf`);
    } catch {
      toast.error("Could not download your signed document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const nextAppt = dash?.nextAppointment;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="font-jost text-xs uppercase tracking-widest text-muted-foreground mb-1">Your care hub</p>
        <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-1">{patient.full_name}</h1>
        <p className="font-jost text-muted-foreground">
          Appointments, labs, treatment, and documents — all in one place.
        </p>
      </div>

      {tier1IntakeComplete === false && (
        <Alert className="mb-6 border-accent/40 bg-accent/5">
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between font-jost">
            <span>
              {!patient.dob
                ? "Enter your date of birth, then sign your required clinic consents."
                : "Please complete your required clinic consents before clinical services."}
            </span>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/intake/consents">
                {!patient.dob ? "Add date of birth" : "Complete consents"}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <SetupChecklist steps={setupSteps} />

      {/* Hero: next appointment or next action */}
      {nextAppt ? (
        <Card className="mb-8 overflow-hidden border-2 border-accent/30 shadow-md">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[1fr_auto]">
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span className="font-jost text-xs uppercase tracking-wider text-muted-foreground">
                    Next appointment
                  </span>
                </div>
                <div>
                  <h2 className="font-playfair text-2xl md:text-3xl text-foreground">
                    {format(new Date(nextAppt.scheduled_at), "EEEE, MMMM d")}
                  </h2>
                  <p className="font-jost text-lg text-muted-foreground mt-1">
                    {formatClinicTime(nextAppt.scheduled_at)} · {nextAppt.duration_minutes} min ·{" "}
                    {serviceLineLabel(nextAppt.service_line)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-jost">
                    {APPOINTMENT_STATUS_LABEL[nextAppt.status] ?? nextAppt.status}
                  </Badge>
                  {nextAppt.is_telehealth && (
                    <Badge variant="secondary" className="font-jost">
                      Telehealth
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground font-jost">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                  <span>{SITE_CONFIG.address.full}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border/60 bg-muted/20 p-6 md:min-w-[200px]">
                <Button variant="outline" asChild className="font-jost">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Reschedule
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        (journeyAction.ctaLabel || journeyAction.title) && (
          <Card className="mb-8 border-accent/30 bg-accent/5">
            <CardContent className="pt-6 space-y-3">
              <h2 className="font-playfair text-xl">{journeyAction.title}</h2>
              <p className="font-jost text-sm text-muted-foreground">{journeyAction.description}</p>
              {journeyAction.ctaLabel && journeyAction.ctaPath && (
                <Button onClick={() => navigate(journeyAction.ctaPath!)} className="font-jost">
                  {journeyAction.ctaLabel}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        )
      )}

      <ConsultJourneyProgress
        patientId={patient.id}
        context={journeyContext}
        className="mb-8"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current treatment */}
            <Card>
              <CardHeader>
                <CardTitle className="font-jost text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Current treatment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(dash?.treatmentPlans.length ?? 0) > 0 ? (
                  dash!.treatmentPlans.map((plan) => (
                    <div key={plan.id} className="rounded-lg border border-border/60 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-jost font-medium">{plan.title}</p>
                          <p className="text-xs text-muted-foreground font-jost mt-0.5">
                            {serviceLineLabel(plan.service_line)} · Started{" "}
                            {formatClinicDate(plan.start_date)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize font-jost text-xs">
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : patient.current_protocol ? (
                  <p className="font-jost text-sm text-muted-foreground">
                    Active protocol: <span className="text-foreground font-medium">{patient.current_protocol}</span>
                  </p>
                ) : (
                  <p className="font-jost text-sm text-muted-foreground">
                    No active treatment plan yet. Your care team will publish your protocol after your visit and lab
                    review.
                  </p>
                )}

                {(dash?.medications.length ?? 0) > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Active medications
                    </p>
                    <ul className="space-y-2">
                      {dash!.medications.map((med) => (
                        <li key={med.id} className="flex items-start gap-3 text-sm font-jost">
                          <Pill className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{med.medication_name}</p>
                            <p className="text-muted-foreground text-xs">
                              {med.dosage} · {med.frequency} · {med.route}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Labs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-jost text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-accent" />
                  Labs
                </CardTitle>
                {(dash?.labResults.length ?? 0) > 0 && (
                  <Button asChild variant="ghost" size="sm" className="font-jost text-accent">
                    <Link to="/patient/health-report">
                      View full report
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(dash?.labOrders.length ?? 0) === 0 && (dash?.labResults.length ?? 0) === 0 ? (
                  <p className="font-jost text-sm text-muted-foreground">
                    No lab orders yet. Labs are typically drawn at your wellness visit or when your clinician orders a
                    panel.
                  </p>
                ) : (
                  <>
                    {(dash?.labOrders.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">Orders</p>
                        {dash!.labOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-3 py-2"
                          >
                            <div>
                              <p className="font-jost text-sm font-medium">
                                {LAB_PANEL_LABEL[order.panel_slug] ?? order.panel_slug.replace(/-/g, " ")}
                              </p>
                              <p className="font-jost text-xs text-muted-foreground">
                                {LAB_ORDER_STATUS_LABEL[order.status] ?? order.status} ·{" "}
                                {formatClinicDate(order.ordered_at)}
                              </p>
                            </div>
                            <TestTube className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}

                    {(dash?.labResults.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground">
                          Latest results
                        </p>
                        {dash!.labResults.slice(0, 2).map((result) => (
                          <div
                            key={result.id}
                            className="rounded-md bg-muted/30 px-3 py-2 font-jost text-sm"
                          >
                            <p className="font-medium">Drawn {formatClinicDate(result.collection_date)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {[
                                result.testosterone_t != null && `Testosterone ${result.testosterone_t}`,
                                result.estradiol_e2 != null && `Estradiol ${result.estradiol_e2}`,
                                result.tsh != null && `TSH ${result.tsh}`,
                                result.a1c != null && `A1c ${result.a1c}`,
                              ]
                                .filter(Boolean)
                                .slice(0, 3)
                                .join(" · ") || "Results on file — open full report for details."}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Appointment history */}
            <Card>
              <CardHeader>
                <CardTitle className="font-jost text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-accent" />
                  Appointment history
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(dash?.pastAppointments.length ?? 0) === 0 && (dash?.upcomingAppointments.length ?? 0) <= 1 ? (
                  <p className="font-jost text-sm text-muted-foreground">No past visits on file yet.</p>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {[...(dash?.upcomingAppointments.slice(1) ?? []), ...(dash?.pastAppointments ?? [])]
                      .slice(0, 8)
                      .map((appt) => (
                        <li key={appt.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                          <div>
                            <p className="font-jost text-sm font-medium">
                              {formatClinicDate(appt.scheduled_at)} · {formatClinicTime(appt.scheduled_at)}
                            </p>
                            <p className="font-jost text-xs text-muted-foreground">
                              {serviceLineLabel(appt.service_line)}
                            </p>
                          </div>
                          <Badge variant="outline" className="font-jost text-xs shrink-0">
                            {APPOINTMENT_STATUS_LABEL[appt.status] ?? appt.status}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* GFE */}
            {(dash?.gfeRows.length ?? 0) > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-jost text-sm flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Medical clearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-jost">
                  <Badge
                    variant="outline"
                    className={
                      activeGfe
                        ? "border-green-600/40 bg-green-500/10 text-green-800 dark:text-green-200"
                        : undefined
                    }
                  >
                    {gfeStatusLabel(activeGfe ?? latestGfe)}
                  </Badge>
                  {activeGfe?.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Valid through {formatClinicDate(activeGfe.expires_at)}
                    </p>
                  )}
                  {latestGfe?.status === "pending" && latestGfe.meeting_url && (
                    <Button size="sm" variant="outline" asChild className="w-full font-jost">
                      <a href={latestGfe.meeting_url} target="_blank" rel="noopener noreferrer">
                        Complete remote exam
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <MembershipSummary
              membershipTier={patient.membership_tier ?? patient.elevated_membership_status ?? null}
              renewalDate={patient.membership_renewal_date ?? undefined}
            />

            {/* Consents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-jost text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Signed documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(dash?.consentRecords.length ?? 0) === 0 ? (
                  <p className="font-jost text-xs text-muted-foreground">
                    Consents you sign appear here with download links.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {dash!.consentRecords.slice(0, 8).map((rec) => {
                      const active = isConsentActive(rec.expires_at);
                      return (
                        <li key={rec.id} className="text-sm font-jost">
                          <p className="font-medium leading-tight">{consentTypeTitle(rec.consent_type)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Signed {formatClinicDateTime(rec.signed_at)} ·{" "}
                            {active ? "Active" : "Expired"}
                          </p>
                          {rec.pdf_storage_path && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 mt-1 text-accent font-jost"
                              disabled={downloadingId === rec.id}
                              onClick={() =>
                                void handleConsentDownload(rec.id, rec.pdf_storage_path!, rec.consent_type)
                              }
                            >
                              {downloadingId === rec.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin inline" />
                              ) : (
                                <Download className="mr-1 h-3 w-3 inline" />
                              )}
                              Download PDF
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-jost text-sm">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {!patient.intake_completed && (
                  <Button variant="outline" className="justify-start font-jost" asChild>
                    <Link to="/patient/intake">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Complete medical intake
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="justify-start font-jost" asChild>
                  <Link to="/patient/checkin">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Symptom check-in
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start font-jost" asChild>
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call {SITE_CONFIG.phone}
                  </a>
                </Button>
                <Button variant="outline" className="justify-start font-jost" asChild>
                  <Link to="/consult">Request a callback</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

export default PatientDashboardHome;
