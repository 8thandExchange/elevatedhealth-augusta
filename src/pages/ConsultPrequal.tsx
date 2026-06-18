import { useEffect, useMemo, useState, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Shield, FileText, CreditCard, Phone, CheckCircle2 } from "lucide-react";
import { filterVisibleVisitReasons } from "@/lib/serviceConfig";
import { TIER_1_CONSENTS, ALL_CONSENTS } from "@/data/consents";
import { consultScreeningBlockMessage } from "@/lib/consultPrequalScreening";
import { CONSULT_JOURNEY_STAGES } from "@/lib/consultJourney";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { getActiveConsentVersion } from "@/lib/consents/consent-helpers";
import { ConsentDocumentDisplay } from "@/components/consents/ConsentDocumentDisplay";
import { hasWellnessAssessmentPaid } from "@/lib/wellnessAssessmentPayment";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";

const VISIT_REASONS = filterVisibleVisitReasons([
  { id: "hormone", label: "Hormone optimization (HRT/TRT)" },
  { id: "weight_loss", label: "Weight loss (GLP-1 therapy)" },
  { id: "peptide", label: "Peptide therapy" },
  { id: "general_wellness", label: "General wellness / longevity" },
  { id: "exploring", label: "Just exploring" },
]);

type Step = "profile" | "screening" | "consents" | "pay";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export default function ConsultPrequal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[] | null>(null);

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [fullName, setFullName] = useState(searchParams.get("name") ?? "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "other">("female");
  const [reasons, setReasons] = useState<Set<string>>(new Set());

  const [screening, setScreening] = useState({
    pregnant_or_breastfeeding: false,
    breast_cancer_history: false,
    uterine_cancer_history: false,
    prostate_cancer_history: false,
    active_blood_clot: false,
    polycythemia: false,
    active_cancer_treatment: false,
    severe_heart_failure: false,
    acknowledged_disclaimer: false,
  });

  const [consentVersions, setConsentVersions] = useState<Record<string, { id: string; title: string }>>({});
  const [consentsLoading, setConsentsLoading] = useState(true);
  const [consentsLoadFailed, setConsentsLoadFailed] = useState(false);
  const [consentsAccepted, setConsentsAccepted] = useState<Record<string, boolean>>({});
  const [consentsScrolled, setConsentsScrolled] = useState<Record<string, boolean>>({});
  const [signatureName, setSignatureName] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingPaid, setCheckingPaid] = useState(true);

  useEffect(() => {
    (async () => {
      setCheckingPaid(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const checkEmail = (user?.email ?? email).toLowerCase().trim();
        if (!checkEmail) return;

        const [{ data: patient }, { data: booking }] = await Promise.all([
          supabase
            .from("patients")
            .select("onboarding_status, elevated_membership_status")
            .eq("email", checkEmail)
            .maybeSingle(),
          supabase
            .from("consultation_bookings")
            .select("id")
            .eq("customer_email", checkEmail)
            .eq("status", "paid")
            .limit(1)
            .maybeSingle(),
        ]);

        const paid = hasWellnessAssessmentPaid({
          onboardingStatus: patient?.onboarding_status,
          hasPaidConsultBooking: !!booking?.id,
          elevatedMembershipStatus: patient?.elevated_membership_status,
        });
        setAlreadyPaid(paid);
      } finally {
        setCheckingPaid(false);
      }
    })();
  }, [email]);

  useEffect(() => {
    const raw = searchParams.get("reasons");
    if (raw) {
      setReasons(new Set(raw.split(",").filter(Boolean)));
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      setConsentsLoading(true);
      setConsentsLoadFailed(false);
      try {
        const map: Record<string, { id: string; title: string }> = {};
        for (const type of TIER_1_CONSENTS) {
          const data = await getActiveConsentVersion(type);
          if (data) map[type] = { id: data.id, title: data.title };
        }
        setConsentVersions(map);
        if (TIER_1_CONSENTS.some((t) => !map[t])) {
          setConsentsLoadFailed(true);
        }
      } catch {
        setConsentsLoadFailed(true);
      } finally {
        setConsentsLoading(false);
      }
    })();
  }, []);

  const allConsentsChecked = useMemo(
    () =>
      TIER_1_CONSENTS.every((t) => consentsAccepted[t] && consentsScrolled[t]),
    [consentsAccepted, consentsScrolled],
  );

  const stepIndex = step === "profile" ? 1 : step === "screening" ? 2 : step === "consents" ? 3 : 4;

  const submitProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !dob || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please complete contact info including phone and date of birth.");
      return;
    }
    setStep("screening");
  };

  const submitScreening = async (e: FormEvent) => {
    e.preventDefault();
    if (!screening.acknowledged_disclaimer) {
      toast.error("Please acknowledge the medical disclaimer.");
      return;
    }
    setLoading(true);
    setBlocked(null);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-consult-prequal", {
        body: {
          email,
          full_name: fullName,
          phone: phone.replace(/\D/g, ""),
          dob,
          gender,
          visit_reasons: [...reasons],
          ...screening,
        },
      });
      if (error) throw error;
      if (data?.screening_result === "blocked") {
        setBlocked(data.block_reasons ?? []);
        return;
      }
      if (consentsLoadFailed || TIER_1_CONSENTS.some((t) => !consentVersions[t]?.id)) {
        toast.error("Consent forms are temporarily unavailable. Please call the clinic.");
        return;
      }
      setSessionId(data.session_id);
      setStep("consents");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setLoading(false);
    }
  };

  const submitConsents = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId || !allConsentsChecked || signatureName.trim().length < 2) {
      toast.error("Read each consent, check all boxes, and type your full legal name.");
      return;
    }
    setLoading(true);
    try {
      const consent_records = TIER_1_CONSENTS.map((type) => ({
        consent_type: type,
        consent_version_id: consentVersions[type]?.id,
      })).filter((r) => r.consent_version_id);

      if (consent_records.length !== TIER_1_CONSENTS.length) {
        throw new Error("Consent forms are temporarily unavailable. Please call the clinic.");
      }

      const { data, error } = await supabase.functions.invoke("complete-consult-prequal-consents", {
        body: { session_id: sessionId, signature_name: signatureName.trim(), consent_records },
      });
      if (error) throw error;

      setStep("pay");
      sessionStorage.setItem("consult_checkout_token", data.checkout_token);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save consents");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async () => {
    const checkoutToken = sessionStorage.getItem("consult_checkout_token");
    if (!checkoutToken) {
      toast.error("Checkout session expired. Please restart.");
      setStep("profile");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: {
          serviceType: "wellness_assessment",
          reasons: [...reasons],
          checkout_token: checkoutToken,
        },
      });
      if (error) {
        toast.error(await readEdgeFunctionError(error, "Checkout failed"));
        return;
      }
      if (data?.error_code === "already_paid") {
        toast.info(data.error ?? "You have already paid the wellness assessment.");
        navigate("/patient/dashboard");
        return;
      }
      if (data?.error_code === "prequal_required" || data?.error_code === "invalid_prequal_token") {
        toast.error(data.error ?? "Please restart enrollment.");
        setStep("profile");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 pt-32 pb-20">
          <Alert variant="destructive">
            <AlertDescription>{consultScreeningBlockMessage(blocked)}</AlertDescription>
          </Alert>
          <Button className="mt-6 w-full" variant="outline" asChild>
            <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
              <Phone className="mr-2 h-4 w-4" /> Call {SITE_CONFIG.phone}
            </a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (checkingPaid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 pt-32 pb-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
          <p className="mt-4 font-jost text-muted-foreground">Checking your enrollment status…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (alreadyPaid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 pt-32 pb-20">
          <Card>
            <CardContent className="space-y-4 pt-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="font-playfair text-2xl">Wellness assessment already paid</h1>
              <p className="font-jost text-sm text-muted-foreground">
                Your one-time $79 fee is on file. Continue in the patient portal for GFE clearance, scheduling, and
                membership enrollment — no duplicate payment needed.
              </p>
              <Button className="w-full" onClick={() => navigate("/patient/dashboard")}>
                Go to patient portal
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Enroll — Wellness Assessment | Elevated Health Augusta</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 pt-28 pb-16">
        <div className="mb-8 text-center">
          <p className="section-label mb-2">Consult-gated programs</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground">Start your enrollment</h1>
          <p className="mt-3 font-jost text-muted-foreground text-sm max-w-lg mx-auto">
            Screening → consents → $79 wellness assessment → Good Faith Exam → schedule your visit.
          </p>
        </div>

        <div className="mb-8 flex justify-between gap-1">
          {CONSULT_JOURNEY_STAGES.slice(1, 5).map((s, i) => (
            <div key={s.id} className="flex-1 text-center">
              <div
                className={`mx-auto mb-1 h-2 rounded-full ${i + 1 <= stepIndex ? "bg-accent" : "bg-muted"}`}
              />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.shortLabel}</span>
            </div>
          ))}
        </div>

        {step === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-jost text-lg">Your information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitProfile} className="space-y-4">
                <div>
                  <Label htmlFor="pq-name">Full name</Label>
                  <Input id="pq-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="pq-email">Email</Label>
                  <Input id="pq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="pq-phone">Mobile phone</Label>
                  <Input id="pq-phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} required />
                </div>
                <div>
                  <Label htmlFor="pq-dob">Date of birth</Label>
                  <Input id="pq-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                </div>
                <div>
                  <Label>Biological sex (for screening)</Label>
                  <div className="mt-2 flex gap-4">
                    {(["female", "male", "other"] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 text-sm capitalize">
                        <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>What brings you in? (optional)</Label>
                  <div className="mt-2 grid gap-2">
                    {VISIT_REASONS.map(({ id, label }) => (
                      <label key={id} className="flex items-start gap-2 text-sm">
                        <Checkbox
                          checked={reasons.has(id)}
                          onCheckedChange={(v) =>
                            setReasons((prev) => {
                              const next = new Set(prev);
                              if (v) next.add(id);
                              else next.delete(id);
                              return next;
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Continue to screening <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "screening" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-jost text-lg">
                <Shield className="h-5 w-5 text-accent" /> Safety screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitScreening} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Answer honestly. Some conditions require a phone consult before we can enroll you online.
                </p>
                {gender === "female" && (
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={screening.pregnant_or_breastfeeding}
                      onCheckedChange={(v) =>
                        setScreening((s) => ({ ...s, pregnant_or_breastfeeding: v === true }))
                      }
                    />
                    I am pregnant or breastfeeding
                  </label>
                )}
                {[
                  { key: "breast_cancer_history" as const, label: "Personal history of breast cancer" },
                  ...(gender === "female"
                    ? [{ key: "uterine_cancer_history" as const, label: "Personal history of uterine/endometrial cancer" }]
                    : []),
                  ...(gender === "male"
                    ? [
                        { key: "prostate_cancer_history" as const, label: "Personal history of prostate cancer" },
                        { key: "polycythemia" as const, label: "Polycythemia (high red blood cell count)" },
                      ]
                    : []),
                  { key: "active_blood_clot" as const, label: "Active blood clot (DVT/PE)" },
                  { key: "active_cancer_treatment" as const, label: "Currently in active cancer treatment" },
                  { key: "severe_heart_failure" as const, label: "Severe or uncontrolled heart failure" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={screening[key]}
                      onCheckedChange={(v) => setScreening((s) => ({ ...s, [key]: v === true }))}
                    />
                    {label}
                  </label>
                ))}
                <label className="flex items-start gap-2 text-sm border-t pt-4">
                  <Checkbox
                    checked={screening.acknowledged_disclaimer}
                    onCheckedChange={(v) =>
                      setScreening((s) => ({ ...s, acknowledged_disclaimer: v === true }))
                    }
                  />
                  I understand this is not emergency care and I will call 911 for emergencies. Information provided is accurate.
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("profile")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to consents"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "consents" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-jost text-lg">
                <FileText className="h-5 w-5 text-accent" /> Required clinic consents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consentsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading consent forms…
                </div>
              ) : consentsLoadFailed ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>
                      Consent forms are temporarily unavailable. Please call the clinic at{" "}
                      <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="underline">
                        {SITE_CONFIG.phone}
                      </a>
                      .
                    </AlertDescription>
                  </Alert>
                  <Button type="button" variant="outline" onClick={() => setStep("screening")}>
                    Back
                  </Button>
                </div>
              ) : (
              <form onSubmit={submitConsents} className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Read each document in full, then check the box to confirm your agreement.
                </p>
                {TIER_1_CONSENTS.map((type) => {
                  const doc = ALL_CONSENTS[type];
                  const version = consentVersions[type];
                  return (
                    <div key={type} className="space-y-3 rounded-lg border p-4">
                      <p className="font-medium text-sm">{version?.title ?? doc.title}</p>
                      <ConsentDocumentDisplay
                        bodyMarkdown={doc.body_markdown}
                        enforceScroll
                        onScrollComplete={() =>
                          setConsentsScrolled((prev) => ({ ...prev, [type]: true }))
                        }
                      />
                      {!consentsScrolled[type] && (
                        <p className="text-xs text-muted-foreground">Scroll to the bottom to enable agreement.</p>
                      )}
                      <label className="flex items-start gap-2 text-sm">
                        <Checkbox
                          checked={!!consentsAccepted[type]}
                          disabled={!consentsScrolled[type]}
                          onCheckedChange={(v) =>
                            setConsentsAccepted((c) => ({ ...c, [type]: v === true }))
                          }
                        />
                        <span>
                          I have read and agree to the{" "}
                          <strong>{version?.title ?? doc.title}</strong>
                        </span>
                      </label>
                    </div>
                  );
                })}
                <div>
                  <Label htmlFor="pq-sig">Type your full legal name to sign</Label>
                  <Input
                    id="pq-sig"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder={fullName}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("screening")}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to payment"}
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        )}

        {step === "pay" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-jost text-lg">
                <CreditCard className="h-5 w-5 text-accent" /> Wellness assessment — $79
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                After payment, we&apos;ll email your Good Faith Exam link. Once cleared, you&apos;ll book your in-person visit.
              </p>
              <Button className="w-full" size="lg" onClick={startCheckout} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay $79 securely with Stripe"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Already paid?{" "}
                <Link to="/patient/login" className="text-accent underline">
                  Sign in to your portal
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
