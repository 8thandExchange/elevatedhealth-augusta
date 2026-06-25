import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, CheckCircle, XCircle, User, MapPin, Calendar, Pill, Heart, Megaphone } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { referralSourceLabel } from "@/lib/referralSources";

interface MedicalHistory {
  intake_completed_at?: string;
  allergies?: string;
  current_medications?: string;
  previous_surgeries?: string;
  treatment_goals?: string;
  marketing?: {
    referral_source?: string;
    referral_source_detail?: string | null;
    captured_at?: string;
  };
  // Safety screening
  pregnant_nursing?: boolean;
  cardiac_conditions?: boolean;
  liver_kidney_disease?: boolean;
  substance_history?: boolean;
  uncontrolled_bp?: boolean;
  bipolar_schizo?: boolean;
  // Family history
  family_cardiac?: boolean;
  family_diabetes?: boolean;
  family_cancer?: boolean;
  family_mental_health?: boolean;
  family_thyroid?: boolean;
  family_autoimmune?: boolean;
}

interface IntakeSummaryCardProps {
  patient: {
    id: string;
    full_name: string;
    dob?: string | null;
    gender?: string | null;
    street_address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    allergies?: string | null;
    medical_history?: MedicalHistory | null;
    intake_completed?: boolean | null;
    treatment_request?: string | null;
  };
}

export default function IntakeSummaryCard({ patient }: IntakeSummaryCardProps) {
  const history = patient.medical_history as MedicalHistory | null;
  
  // Only show if intake is completed
  if (!patient.intake_completed && !history?.intake_completed_at) {
    return null;
  }

  // Calculate age from DOB
  const age = patient.dob 
    ? differenceInYears(new Date(), new Date(patient.dob)) 
    : null;

  // Format completed date
  const completedDate = history?.intake_completed_at 
    ? format(new Date(history.intake_completed_at), "MMM d, yyyy 'at' h:mm a")
    : null;

  // Determine risk status
  const getRiskStatus = (): { level: "HIGH" | "ELEVATED" | "STANDARD"; color: string; bgColor: string } => {
    if (history?.pregnant_nursing) {
      return { level: "HIGH", color: "text-red-700", bgColor: "bg-red-100 border-red-200" };
    }
    if (history?.cardiac_conditions || history?.liver_kidney_disease || history?.substance_history || history?.uncontrolled_bp) {
      return { level: "ELEVATED", color: "text-amber-700", bgColor: "bg-amber-100 border-amber-200" };
    }
    return { level: "STANDARD", color: "text-green-700", bgColor: "bg-green-100 border-green-200" };
  };

  const riskStatus = getRiskStatus();

  // Format address
  const formatAddress = () => {
    const parts = [patient.street_address, patient.city, patient.state, patient.zip_code].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  // Get allergies - prefer medical_history, fallback to patient field
  const allergies = history?.allergies || patient.allergies || null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Medical Intake Summary
          </CardTitle>
          {completedDate && (
            <span className="text-xs text-muted-foreground">
              Completed: {completedDate}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Personal Information */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Personal Information
          </h5>
          <div className="text-sm space-y-1 pl-5">
            <p>
              <span className="text-muted-foreground">DOB:</span>{" "}
              {patient.dob ? format(new Date(patient.dob), "MM/dd/yyyy") : "Not provided"}
              {age !== null && <span className="text-muted-foreground"> ({age} years)</span>}
            </p>
            <p>
              <span className="text-muted-foreground">Gender:</span>{" "}
              {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "Not provided"}
            </p>
            <p className="flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              {formatAddress()}
            </p>
          </div>
        </div>

        {/* Allergies */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Allergies
          </h5>
          <div className="pl-5">
            {allergies ? (
              <div className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-amber-800 dark:text-amber-200">{allergies}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" />
            Current Medications
          </h5>
          <p className="text-sm pl-5">
            {history?.current_medications || "None reported"}
          </p>
        </div>

        {/* Previous Surgeries */}
        {history?.previous_surgeries && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Previous Surgeries
            </h5>
            <p className="text-sm pl-5">{history.previous_surgeries}</p>
          </div>
        )}

        {/* Safety Screening */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Safety Screening
            </h5>
            <Badge className={`${riskStatus.bgColor} ${riskStatus.color} border text-xs`}>
              {riskStatus.level}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pl-5">
            <SafetyItem label="Pregnant/Nursing" flag={history?.pregnant_nursing} isRisk />
            <SafetyItem label="Cardiac conditions" flag={history?.cardiac_conditions} isRisk />
            <SafetyItem label="Liver/Kidney disease" flag={history?.liver_kidney_disease} isRisk />
            <SafetyItem label="Substance history" flag={history?.substance_history} isRisk />
            <SafetyItem label="Uncontrolled BP" flag={history?.uncontrolled_bp} isRisk />
            <SafetyItem label="Bipolar/Schizophrenia" flag={history?.bipolar_schizo} isRisk />
          </div>
        </div>

        {/* Family History */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Family History
          </h5>
          <div className="flex flex-wrap gap-2 pl-5">
            <FamilyBadge label="Cardiac" active={history?.family_cardiac} />
            <FamilyBadge label="Diabetes" active={history?.family_diabetes} />
            <FamilyBadge label="Cancer" active={history?.family_cancer} />
            <FamilyBadge label="Mental Health" active={history?.family_mental_health} />
            <FamilyBadge label="Thyroid" active={history?.family_thyroid} />
            <FamilyBadge label="Autoimmune" active={history?.family_autoimmune} />
          </div>
        </div>

        {/* Treatment Goals */}
        {history?.treatment_goals && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Treatment Goals
            </h5>
            <blockquote className="text-sm italic border-l-2 border-teal-500 pl-3 py-1 bg-muted/30 rounded-r">
              "{history.treatment_goals}"
            </blockquote>
          </div>
        )}

        {/* How they heard about us (marketing attribution) */}
        {history?.marketing?.referral_source && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Heard About Us
            </h5>
            <p className="text-sm pl-5">
              {referralSourceLabel(history.marketing.referral_source)}
              {history.marketing.referral_source_detail && (
                <span className="text-muted-foreground"> — {history.marketing.referral_source_detail}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SafetyItem({ label, flag, isRisk }: { label: string; flag?: boolean; isRisk?: boolean }) {
  if (flag) {
    return (
      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
      <CheckCircle className="w-3.5 h-3.5" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function FamilyBadge({ label, active }: { label: string; active?: boolean }) {
  if (active) {
    return (
      <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700">
        <CheckCircle className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground border-muted">
      <XCircle className="w-3 h-3 mr-1 opacity-50" />
      {label}
    </Badge>
  );
}
