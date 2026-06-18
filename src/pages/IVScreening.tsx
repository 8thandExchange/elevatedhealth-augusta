import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CANCELLATION_NOTICE_HOURS, REBOOKING_FEE_DISPLAY } from "@/lib/cancellationPolicy";

type YesNoKeys =
  | "has_chf"
  | "has_esrd"
  | "is_pregnant"
  | "has_anaphylaxis_history"
  | "has_ckd"
  | "on_anticoagulants"
  | "has_hypertension_uncontrolled"
  | "has_diabetes"
  | "has_thyroid_disorder"
  | "currently_breastfeeding"
  | "has_g6pd_deficiency"
  | "has_sesame_allergy"
  | "has_iv_allergies";

interface ScreeningFormState {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  selected_therapy_id: string;
  has_chf: boolean;
  has_esrd: boolean;
  is_pregnant: boolean;
  has_anaphylaxis_history: boolean;
  has_g6pd_deficiency: boolean;
  has_ckd: boolean;
  on_anticoagulants: boolean;
  has_hypertension_uncontrolled: boolean;
  has_diabetes: boolean;
  has_thyroid_disorder: boolean;
  currently_breastfeeding: boolean;
  has_sesame_allergy: boolean;
  has_iv_allergies: boolean;
  iv_allergies_text: string;
  current_medications: string;
  known_allergies: string;
  recent_surgeries: string;
  acknowledged_disclaimer: boolean;
}

const yesNoQuestions: Array<{ key: YesNoKeys; label: string; helper?: string }> = [
  { key: "has_chf", label: "Do you have congestive heart failure (CHF)?" },
  { key: "has_esrd", label: "Do you have end-stage renal disease (kidney failure on dialysis)?" },
  {
    key: "is_pregnant",
    label: "Are you currently pregnant or trying to become pregnant?",
  },
  {
    key: "has_anaphylaxis_history",
    label: "Have you ever had an anaphylactic (severe allergic) reaction to any medication or food?",
  },
  { key: "has_ckd", label: "Do you have chronic kidney disease (any stage)?" },
  {
    key: "on_anticoagulants",
    label: "Are you currently taking blood thinners (Warfarin, Eliquis, Xarelto, Plavix, etc.)?",
  },
  { key: "has_hypertension_uncontrolled", label: "Do you have uncontrolled high blood pressure?" },
  { key: "has_diabetes", label: "Do you have diabetes (type 1 or type 2)?" },
  { key: "has_thyroid_disorder", label: "Do you have a thyroid disorder?" },
  { key: "currently_breastfeeding", label: "Are you currently breastfeeding?" },
  {
    key: "has_g6pd_deficiency",
    label: "Do you have a G6PD deficiency?",
    helper: 'If you do not know, answer "No".',
  },
  { key: "has_sesame_allergy", label: "Do you have a sesame allergy?" },
  {
    key: "has_iv_allergies",
    label: "Have you ever had a reaction to IV vitamins or fluids?",
  },
];

const IVScreening = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId") || "";
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ScreeningFormState>({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    selected_therapy_id: serviceId,
    has_chf: false,
    has_esrd: false,
    is_pregnant: false,
    has_anaphylaxis_history: false,
    has_g6pd_deficiency: false,
    has_ckd: false,
    on_anticoagulants: false,
    has_hypertension_uncontrolled: false,
    has_diabetes: false,
    has_thyroid_disorder: false,
    currently_breastfeeding: false,
    has_sesame_allergy: false,
    has_iv_allergies: false,
    iv_allergies_text: "",
    current_medications: "",
    known_allergies: "",
    recent_surgeries: "",
    acknowledged_disclaimer: false,
  });

  useEffect(() => {
    if (!serviceId) {
      navigate("/book/iv", { replace: true });
    }
  }, [navigate, serviceId]);

  const setYesNo = (key: YesNoKeys, value: boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.selected_therapy_id) nextErrors.selected_therapy_id = "Please select an IV service first.";
    if (!form.first_name.trim()) nextErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!form.date_of_birth.trim()) nextErrors.date_of_birth = "Date of birth is required.";
    if (form.has_iv_allergies && !form.iv_allergies_text.trim()) {
      nextErrors.iv_allergies_text = "Please describe your prior IV reaction.";
    }
    if (!form.acknowledged_disclaimer) {
      nextErrors.acknowledged_disclaimer = "You must acknowledge the screening disclaimer to continue.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-iv-screening", {
        body: form,
      });
      if (error) throw error;

      const intakeId = data?.intake_id as string | undefined;
      const screeningResult = data?.screening_result as string | undefined;
      if (!intakeId || !screeningResult) {
        throw new Error("Invalid screening response from server.");
      }

      if (screeningResult === "cleared") {
        navigate(`/book/iv/slots?intake_id=${encodeURIComponent(intakeId)}&serviceId=${encodeURIComponent(form.selected_therapy_id)}`);
        return;
      }
      if (screeningResult === "warned") {
        navigate(`/book/iv/warnings/${encodeURIComponent(intakeId)}?serviceId=${encodeURIComponent(form.selected_therapy_id)}`);
        return;
      }
      navigate(`/book/iv/blocked/${encodeURIComponent(intakeId)}?serviceId=${encodeURIComponent(form.selected_therapy_id)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit screening right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="font-playfair italic text-4xl text-foreground mb-3">IV Medical Screening</h1>
            <p className="font-jost text-muted-foreground">
              Complete this safety intake before selecting a calendar slot.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-2xl">Pre-Infusion Safety Form</CardTitle>
              <CardDescription className="font-jost">
                Please answer honestly. These questions help us keep you safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-10">
                <section className="space-y-4">
                  <h2 className="font-playfair text-xl">Section 1 - About you</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First name</Label>
                      <Input
                        id="first_name"
                        value={form.first_name}
                        onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
                      />
                      {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last name</Label>
                      <Input
                        id="last_name"
                        value={form.last_name}
                        onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
                      />
                      {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => setForm((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                      {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="font-playfair text-xl">Section 2 - Critical medical history (hard contraindications)</h2>
                  <div className="space-y-5">
                    {yesNoQuestions.slice(0, 4).map((q) => (
                      <div key={q.key} className="space-y-2">
                        <Label className="font-jost">{q.label}</Label>
                        <RadioGroup
                          value={form[q.key] ? "yes" : "no"}
                          onValueChange={(v) => setYesNo(q.key, v === "yes")}
                          className="flex gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id={`${q.key}-yes`} />
                            <Label htmlFor={`${q.key}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id={`${q.key}-no`} />
                            <Label htmlFor={`${q.key}-no`}>No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="font-playfair text-xl">Section 3 - Additional medical history (soft contraindications)</h2>
                  <div className="space-y-5">
                    {yesNoQuestions.slice(4).map((q) => (
                      <div key={q.key} className="space-y-2">
                        <Label className="font-jost">{q.label}</Label>
                        {q.helper && <p className="text-xs text-muted-foreground">{q.helper}</p>}
                        <RadioGroup
                          value={form[q.key] ? "yes" : "no"}
                          onValueChange={(v) => setYesNo(q.key, v === "yes")}
                          className="flex gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id={`${q.key}-yes`} />
                            <Label htmlFor={`${q.key}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id={`${q.key}-no`} />
                            <Label htmlFor={`${q.key}-no`}>No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                    {form.has_iv_allergies && (
                      <div className="space-y-2">
                        <Label htmlFor="iv_allergies_text">Please describe your IV reaction</Label>
                        <Textarea
                          id="iv_allergies_text"
                          value={form.iv_allergies_text}
                          onChange={(e) => setForm((prev) => ({ ...prev, iv_allergies_text: e.target.value }))}
                        />
                        {errors.iv_allergies_text && <p className="text-sm text-destructive">{errors.iv_allergies_text}</p>}
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="font-playfair text-xl">Section 4 - Open context</h2>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_medications">Current medications</Label>
                      <Textarea
                        id="current_medications"
                        value={form.current_medications}
                        onChange={(e) => setForm((prev) => ({ ...prev, current_medications: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="known_allergies">Known allergies</Label>
                      <Textarea
                        id="known_allergies"
                        value={form.known_allergies}
                        onChange={(e) => setForm((prev) => ({ ...prev, known_allergies: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recent_surgeries">Recent surgeries within 3 months</Label>
                      <Textarea
                        id="recent_surgeries"
                        value={form.recent_surgeries}
                        onChange={(e) => setForm((prev) => ({ ...prev, recent_surgeries: e.target.value }))}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="font-playfair text-xl">Section 5 - Acknowledgment</h2>
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="ack"
                        checked={form.acknowledged_disclaimer}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, acknowledged_disclaimer: checked === true }))
                        }
                      />
                      <Label htmlFor="ack" className="leading-relaxed font-jost">
                        I confirm the information above is accurate to the best of my knowledge and understand that IV
                        therapy carries inherent risks including but not limited to vein irritation, allergic reaction,
                        infection, and fluid overload. I authorize Elevated Health Augusta clinicians to administer the
                        treatment I have selected, contingent on this screening result. I have read the{" "}
                        <a href="/terms#cancellation" className="text-primary underline underline-offset-2">
                          cancellation and refund policy
                        </a>
                        : {CANCELLATION_NOTICE_HOURS}+ hours notice for a full refund or free reschedule; less than{" "}
                        {CANCELLATION_NOTICE_HOURS} hours or no-show forfeits prepayment and requires a{" "}
                        {REBOOKING_FEE_DISPLAY} rebooking fee.
                      </Label>
                    </div>
                    {errors.acknowledged_disclaimer && (
                      <p className="text-sm text-destructive mt-2">{errors.acknowledged_disclaimer}</p>
                    )}
                    {errors.selected_therapy_id && (
                      <p className="text-sm text-destructive mt-2">{errors.selected_therapy_id}</p>
                    )}
                  </div>
                </section>

                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit screening
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IVScreening;
