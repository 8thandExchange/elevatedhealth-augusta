import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, Shield, Heart, User, MapPin, Pill, Target } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import {
  getIntakeInterestOptions,
  routeIntakeCare,
  type IntakeInterest,
} from "@/lib/intakeCareRouting";
import { resolveLegacyProgramDisplayLabel } from "@/lib/therapyCatalog";

interface PatientInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  primary_program: string | null;
  service_interests: unknown; // JSONB from Supabase
}

type FormStep = "personal" | "medical" | "safety" | "goals" | "consent";

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function PublicIntake() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>("personal");

  // Form state
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    phone: "",
    street_address: "",
    city: "",
    state: "GA",
    zip_code: "",
    allergies: "",
    current_medications: "",
    previous_surgeries: "",
    family_history: {
      cardiac: false,
      mental_health: false,
      diabetes: false,
      cancer: false,
    },
    safety_screening: {
      pregnant_or_nursing: false,
      cardiac_conditions: false,
      liver_kidney_disease: false,
      substance_use_history: false,
    },
    symptom_scores: {
      energy: 5,
      sleep: 5,
      mood: 5,
      libido: 5,
      weight_concern: 5,
    },
    treatment_goals: "",
    secondary_goals: "",
    intake_interests: [] as IntakeInterest[],
    referral_source: "",
    referral_source_detail: "",
    hipaa_acknowledged: false,
    consent_acknowledged: false,
    consent_signature: "",
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("No intake token provided. Please use the link from your welcome email.");
        setLoading(false);
        return;
      }

      try {
        // Look up patient by token via the SECURITY DEFINER RPC. The prior
        // direct table query relied on a permissive RLS policy that allowed
        // dumping every patient row with an active token (security audit
        // 2026-05-08, finding F-2). The RPC enforces an exact token-value
        // match server-side and returns at most one row.
        const { data: rows, error: lookupError } = await supabase.rpc(
          "get_patient_by_intake_token",
          { _token: token },
        );

        if (lookupError) {
          console.error("Token lookup error:", lookupError);
          setError("Unable to validate your intake link. Please contact the clinic.");
          setLoading(false);
          return;
        }

        // The RPC returns a setof; in practice 0 or 1 row.
        const data = Array.isArray(rows) ? rows[0] : rows;

        if (!data) {
          setError("This intake link is invalid or has already been used. Please contact the clinic for a new link.");
          setLoading(false);
          return;
        }

        setPatient(data as PatientInfo);
        if (data.phone) {
          setFormData(prev => ({ ...prev, phone: data.phone || "" }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Validation error:", err);
        setError("An error occurred. Please try again or contact the clinic.");
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: "family_history" | "safety_screening" | "symptom_scores", field: string, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case "personal":
        if (!formData.dob || !formData.gender || !formData.street_address || !formData.city || !formData.zip_code) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case "medical":
        return true; // Optional fields
      case "safety":
        return true; // Checkboxes default to false
      case "goals":
        return true; // Optional
      case "consent":
        if (!formData.hipaa_acknowledged || !formData.consent_acknowledged) {
          toast.error("Please acknowledge both HIPAA and treatment consent");
          return false;
        }
        if (!formData.consent_signature.trim()) {
          toast.error("Please sign by typing your full legal name");
          return false;
        }
        const signatureName = formData.consent_signature.trim().toLowerCase();
        const patientName = patient?.full_name?.trim().toLowerCase() || "";
        if (signatureName !== patientName) {
          toast.error("Signature must match your legal name exactly: " + patient?.full_name);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const steps: FormStep[] = ["personal", "medical", "safety", "goals", "consent"];
  const currentStepIndex = steps.indexOf(currentStep);

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("consent")) return;
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await supabase.functions.invoke("submit-public-intake", {
        body: {
          token,
          ...formData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to submit intake");
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to submit intake");
      }

      setSuccess(true);
      toast.success("Intake submitted successfully!");
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit intake. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Validating your intake link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Unable to Load Intake Form</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              Please contact us for assistance:
            </p>
            <div className="space-y-2">
              <p className="font-medium">{SITE_CONFIG.phone}</p>
              <p className="text-sm text-slate-500">appointments@elevatedhealthaugusta.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">Intake Submitted Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you, {patient?.full_name?.split(" ")[0]}!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Our medical team will review your information and reach out within 24-48 hours to discuss your treatment plan.
            </p>
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-teal-800">
                <strong>Questions?</strong> Call us at {SITE_CONFIG.phone} or email appointments@elevatedhealthaugusta.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-700">Elevated Health Augusta</h1>
          <p className="text-slate-500 mt-1">Medical Intake Form</p>
        </div>

        {/* Welcome message */}
        <Card className="mb-6 bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <p className="text-teal-800">
              Welcome, <strong>{patient?.full_name}</strong>! Please complete this intake form to help us prepare for your care. This takes about 5-10 minutes.
            </p>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div 
              key={step} 
              className={`flex-1 ${index > 0 ? "ml-2" : ""}`}
            >
              <div 
                className={`h-2 rounded-full transition-colors ${
                  index <= currentStepIndex ? "bg-teal-600" : "bg-slate-200"
                }`}
              />
              <p className={`text-xs mt-1 capitalize hidden sm:block ${
                index === currentStepIndex ? "text-teal-700 font-medium" : "text-slate-400"
              }`}>
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === "personal" && <User className="h-5 w-5" />}
              {currentStep === "medical" && <Pill className="h-5 w-5" />}
              {currentStep === "safety" && <Shield className="h-5 w-5" />}
              {currentStep === "goals" && <Target className="h-5 w-5" />}
              {currentStep === "consent" && <Heart className="h-5 w-5" />}
              {currentStep === "personal" && "Personal Information"}
              {currentStep === "medical" && "Medical History"}
              {currentStep === "safety" && "Safety Screening"}
              {currentStep === "goals" && "Treatment Goals"}
              {currentStep === "consent" && "Consent & Acknowledgment"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            {currentStep === "personal" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address (for medications)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input
                    id="street_address"
                    value={formData.street_address}
                    onChange={(e) => handleInputChange("street_address", e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Augusta"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(v) => handleInputChange("state", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP *</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="30909"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="referral_source">How did you hear about us?</Label>
                  <Select
                    value={formData.referral_source}
                    onValueChange={(v) => {
                      const opt = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === v);
                      setFormData((prev) => ({
                        ...prev,
                        referral_source: v,
                        referral_source_detail: opt?.promptForDetail ? prev.referral_source_detail : "",
                      }));
                    }}
                  >
                    <SelectTrigger id="referral_source">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {REFERRAL_SOURCE_OPTIONS.find((o) => o.value === formData.referral_source)?.promptForDetail && (
                    <Input
                      id="referral_source_detail"
                      value={formData.referral_source_detail}
                      onChange={(e) => handleInputChange("referral_source_detail", e.target.value)}
                      placeholder={
                        formData.referral_source === "friend_family"
                          ? "Who can we thank? (optional)"
                          : formData.referral_source === "provider_referral"
                            ? "Referring provider or clinic (optional)"
                            : formData.referral_source === "social_media"
                              ? "Which platform / account? (optional)"
                              : "Tell us more (optional)"
                      }
                    />
                  )}
                </div>
              </>
            )}

            {/* Medical History */}
            {currentStep === "medical" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (medications, foods, environmental)</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="List any known allergies, or write 'None'"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_medications">Current Medications & Supplements</Label>
                  <Textarea
                    id="current_medications"
                    value={formData.current_medications}
                    onChange={(e) => handleInputChange("current_medications", e.target.value)}
                    placeholder="List all current medications, dosages, and supplements"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous_surgeries">Previous Surgeries / Hospitalizations</Label>
                  <Textarea
                    id="previous_surgeries"
                    value={formData.previous_surgeries}
                    onChange={(e) => handleInputChange("previous_surgeries", e.target.value)}
                    placeholder="List any previous surgeries or hospitalizations with approximate dates"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Family Medical History (check all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "cardiac", label: "Heart Disease" },
                      { key: "mental_health", label: "Mental Health Conditions" },
                      { key: "diabetes", label: "Diabetes" },
                      { key: "cancer", label: "Cancer" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`family_${item.key}`}
                          checked={formData.family_history[item.key as keyof typeof formData.family_history]}
                          onCheckedChange={(checked) => handleNestedChange("family_history", item.key, !!checked)}
                        />
                        <Label htmlFor={`family_${item.key}`} className="font-normal cursor-pointer">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Safety Screening */}
            {currentStep === "safety" && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Please answer honestly. This information helps us ensure your safety and customize your treatment plan.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Please check any that apply to you:</Label>
                  
                  {[
                    { key: "pregnant_or_nursing", label: "I am currently pregnant, trying to become pregnant, or nursing" },
                    { key: "cardiac_conditions", label: "I have a history of heart conditions (arrhythmia, heart attack, heart failure)" },
                    { key: "liver_kidney_disease", label: "I have liver or kidney disease" },
                    { key: "substance_use_history", label: "I have a history of substance use disorder" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <Checkbox
                        id={`safety_${item.key}`}
                        checked={formData.safety_screening[item.key as keyof typeof formData.safety_screening]}
                        onCheckedChange={(checked) => handleNestedChange("safety_screening", item.key, !!checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={`safety_${item.key}`} className="font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mt-6">
                  <Label>How would you rate the following (1 = Poor, 10 = Excellent)?</Label>
                  
                  {[
                    { key: "energy", label: "Energy Levels" },
                    { key: "sleep", label: "Sleep Quality" },
                    { key: "mood", label: "Overall Mood" },
                    { key: "libido", label: "Libido / Sex Drive" },
                    { key: "weight_concern", label: "Weight Management" },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="font-normal">{item.label}</Label>
                        <span className="text-sm font-medium text-teal-700">
                          {formData.symptom_scores[item.key as keyof typeof formData.symptom_scores]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.symptom_scores[item.key as keyof typeof formData.symptom_scores]}
                        onChange={(e) => handleNestedChange("symptom_scores", item.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Treatment Goals */}
            {currentStep === "goals" && (
              <>
                <div className="space-y-2">
                  <Label>What are you most interested in? (select all that apply)</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {getIntakeInterestOptions().map((opt) => (
                      <div key={opt.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`interest-${opt.id}`}
                          checked={formData.intake_interests.includes(opt.id)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              intake_interests: checked
                                ? [...prev.intake_interests, opt.id]
                                : prev.intake_interests.filter((x) => x !== opt.id),
                            }));
                          }}
                        />
                        <Label htmlFor={`interest-${opt.id}`} className="font-normal cursor-pointer text-sm">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment_goals">
                    Primary health goals — what brought you to Elevated Health Augusta?
                  </Label>
                  <Textarea
                    id="treatment_goals"
                    value={formData.treatment_goals}
                    onChange={(e) => handleInputChange("treatment_goals", e.target.value)}
                    placeholder="Energy, weight, hormones, recovery, libido, general optimization..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_goals">Secondary goals (optional)</Label>
                  <Textarea
                    id="secondary_goals"
                    value={formData.secondary_goals}
                    onChange={(e) => handleInputChange("secondary_goals", e.target.value)}
                    placeholder="Any additional goals or concerns..."
                    rows={2}
                  />
                </div>

                {(() => {
                  const routing = routeIntakeCare({
                    primaryGoal: "general_wellness",
                    interests: formData.intake_interests.length
                      ? formData.intake_interests
                      : ["general_optimization"],
                    patientSex:
                      formData.gender === "male" || formData.gender === "female"
                        ? formData.gender
                        : null,
                    isPregnant: formData.safety_screening.pregnant_or_nursing,
                  });
                  return (
                    <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-primary">{routing.patientHeadline}</p>
                      <p className="text-sm text-primary/90">{routing.patientBody}</p>
                      {routing.labPanelLabel && (
                        <p className="text-xs text-muted-foreground">
                          Your provider may order: {routing.labPanelLabel}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Booking interests on file:</strong>{" "}
                    {Array.isArray(patient?.service_interests)
                      ? (patient.service_interests as string[]).map(s =>
                          s === "ketamine" ? resolveLegacyProgramDisplayLabel("ketamine") :
                          s === "hormone" ? "Hormone Optimization" :
                          s === "weight_loss" ? "Weight Loss" : s
                        ).join(", ")
                      : (patient?.primary_program || "General Wellness")}
                  </p>
                </div>
              </>
            )}

            {/* Consent */}
            {currentStep === "consent" && (
              <>
                <div className="space-y-6">
                  {/* Scrollable Consent Agreement */}
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Informed Consent for Treatment</h4>
                    <div className="max-h-48 overflow-y-auto bg-white border rounded p-3 text-sm text-slate-600 space-y-3 mb-4">
                      <p><strong>1. CONSENT TO TREATMENT:</strong> I voluntarily consent to medical treatment and services provided by Elevated Health Augusta ("Clinic"). I understand that treatment may include hormone optimization, peptide therapy when prescribed, weight management medications, IV therapy, or other cash-pay wellness services as recommended by my provider.</p>
                      <p><strong>2. BENEFITS AND RISKS:</strong> I understand that while treatment may provide benefits such as improved energy, mood, metabolism, or mental clarity, there are inherent risks including but not limited to: allergic reactions, medication side effects, injection site reactions, changes in blood pressure, mood changes, and other complications. I have been given the opportunity to ask questions about these risks.</p>
                      <p><strong>3. ALTERNATIVES:</strong> I understand that I may choose not to proceed with treatment or may seek alternative treatments. I have been informed of my options.</p>
                      <p><strong>4. MEDICATION COMPLIANCE:</strong> I agree to follow all medication instructions, attend follow-up appointments, complete required lab work, and report any concerning symptoms immediately to the Clinic.</p>
                      <p><strong>5. TELEHEALTH:</strong> I consent to receive care via telehealth when appropriate. I understand the limitations of virtual care and agree to seek emergency care when necessary.</p>
                      <p><strong>6. FINANCIAL RESPONSIBILITY:</strong> I understand that I am responsible for payment of services as outlined in my treatment agreement. Insurance coverage varies; I understand that some services may not be covered.</p>
                      <p><strong>7. WITHDRAWAL OF CONSENT:</strong> I understand that I may withdraw my consent at any time by notifying the Clinic in writing.</p>
                      <p><strong>8. ACKNOWLEDGMENT:</strong> By signing below, I confirm that I have read this consent, understand its contents, and agree to proceed with treatment.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">HIPAA Notice</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      We are committed to protecting your health information. Your personal health information (PHI) will be used only for treatment, payment, and healthcare operations as permitted by HIPAA regulations. We maintain strict security measures to protect your information.{" "}
                      <a 
                        href="/hipaa-notice" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 underline"
                      >
                        Read full HIPAA Notice
                      </a>
                    </p>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hipaa_acknowledged"
                        checked={formData.hipaa_acknowledged}
                        onCheckedChange={(checked) => handleInputChange("hipaa_acknowledged", !!checked)}
                      />
                      <Label htmlFor="hipaa_acknowledged" className="font-normal cursor-pointer">
                        I acknowledge that I have read and understand the HIPAA Notice of Privacy Practices *
                      </Label>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Treatment Consent</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      By submitting this form, I consent to receive treatment from Elevated Health Augusta. I understand that my information will be reviewed by the medical team, and I will be contacted to discuss treatment options. I understand that I can withdraw my consent at any time.
                    </p>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consent_acknowledged"
                        checked={formData.consent_acknowledged}
                        onCheckedChange={(checked) => handleInputChange("consent_acknowledged", !!checked)}
                      />
                      <Label htmlFor="consent_acknowledged" className="font-normal cursor-pointer">
                        I consent to treatment and authorize Elevated Health Augusta to contact me regarding my care *
                      </Label>
                    </div>
                  </div>

                  {/* Signature Field */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold mb-2 text-amber-900">Electronic Signature *</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      By typing your full legal name below, you are electronically signing this consent form. Your signature must match: <strong>{patient?.full_name}</strong>
                    </p>
                    <Input
                      id="consent_signature"
                      value={formData.consent_signature}
                      onChange={(e) => handleInputChange("consent_signature", e.target.value)}
                      placeholder="Type your full legal name"
                      className="bg-white border-amber-300 focus:border-amber-500"
                    />
                    {formData.consent_signature && formData.consent_signature.trim().toLowerCase() === patient?.full_name?.trim().toLowerCase() && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Signature verified
                      </p>
                    )}
                    {formData.consent_signature && formData.consent_signature.trim().toLowerCase() !== patient?.full_name?.trim().toLowerCase() && (
                      <p className="text-sm text-red-600 mt-2">
                        Name must match exactly: {patient?.full_name}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>

              {currentStep !== "consent" ? (
                <Button type="button" onClick={nextStep} className="bg-teal-600 hover:bg-teal-700">
                  Continue
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={
                    submitting || 
                    !formData.hipaa_acknowledged || 
                    !formData.consent_acknowledged ||
                    !formData.consent_signature.trim() ||
                    formData.consent_signature.trim().toLowerCase() !== patient?.full_name?.trim().toLowerCase()
                  }
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Intake Form"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>{SITE_CONFIG.clinicName}</p>
          <p>{SITE_CONFIG.address.full}</p>
          <p>{SITE_CONFIG.phone}</p>
        </div>
      </div>
    </div>
  );
}
