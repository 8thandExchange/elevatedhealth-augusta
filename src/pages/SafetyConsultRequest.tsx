import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type IntakeResponse = {
  intake_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  screening_result: string;
  block_severity: "hard" | "service_specific" | null;
  has_anaphylaxis_history: boolean;
};

const BEST_TIME_OPTIONS = [
  { id: "morning_8_12", label: "Morning (8am-12pm)" },
  { id: "afternoon_12_5", label: "Afternoon (12pm-5pm)" },
  { id: "evening_5_7", label: "Evening (5pm-7pm)" },
  { id: "anytime", label: "Anytime is fine" },
] as const;

const DRAWING_TO_IV_OPTIONS = [
  "Energy",
  "Recovery",
  "Immune support",
  "Hydration",
  "Hangover relief",
  "Wellness routine",
  "Other",
] as const;

const SafetyConsultRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intakeId = searchParams.get("intake_id") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bestTime, setBestTime] = useState<string>("");
  const [drawingToIv, setDrawingToIv] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [initialContact, setInitialContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const bootstrap = async () => {
      if (!intakeId) {
        navigate("/book/iv", { replace: true });
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("get-iv-screening-status", {
          body: { intake_id: intakeId },
        });
        if (error) throw error;

        const intake = data as IntakeResponse;
        const validSeverity =
          intake?.block_severity === "hard" || intake?.block_severity === "service_specific";
        if (
          intake?.screening_result !== "blocked" ||
          !validSeverity ||
          intake?.has_anaphylaxis_history
        ) {
          navigate("/book/iv", { replace: true });
          return;
        }

        const first = intake.first_name || "";
        const last = intake.last_name || "";
        const nextEmail = intake.email || "";
        const nextPhone = intake.phone || "";
        setFirstName(first);
        setLastName(last);
        setEmail(nextEmail);
        setPhone(nextPhone);
        setInitialContact({
          firstName: first,
          lastName: last,
          email: nextEmail,
          phone: nextPhone,
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load consult request details.");
        navigate("/book/iv", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, [intakeId, navigate]);

  const contactChangeNote = useMemo(() => {
    const changes: string[] = [];
    if (firstName.trim() !== initialContact.firstName.trim()) {
      changes.push(`First name updated to "${firstName.trim()}"`);
    }
    if (lastName.trim() !== initialContact.lastName.trim()) {
      changes.push(`Last name updated to "${lastName.trim()}"`);
    }
    if (email.trim() !== initialContact.email.trim()) {
      changes.push(`Email updated to "${email.trim()}"`);
    }
    if (phone.trim() !== initialContact.phone.trim()) {
      changes.push(`Phone updated to "${phone.trim()}"`);
    }
    return changes.length > 0 ? `Contact updates: ${changes.join("; ")}.` : "";
  }, [email, firstName, initialContact, lastName, phone]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!bestTime) nextErrors.best_time = "Please pick a preferred callback window.";
    if (!drawingToIv) nextErrors.drawing_to_iv = "Please tell us what you hoped to get from IV therapy.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (!intakeId) return;

    setSubmitting(true);
    try {
      const notesForSubmit = [additionalNotes.trim(), contactChangeNote].filter(Boolean).join("\n");
      const { data, error } = await supabase.functions.invoke("submit-safety-consult-request", {
        body: {
          intake_id: intakeId,
          best_time: bestTime,
          drawing_to_iv: drawingToIv,
          additional_notes: notesForSubmit,
        },
      });
      if (error) throw error;

      if (data?.ok) {
        setSubmitted(true);
        return;
      }
      throw new Error("Unexpected response from submit-safety-consult-request.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-page-shell">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-3xl">Request a consultation</CardTitle>
              <CardDescription className="font-jost">
                Tell us a bit about you and we&apos;ll be in touch within 1 business day to schedule a complimentary
                consultation. No charge for the conversation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 font-jost">
                    Got it. We&apos;ll reach out to you at {phone || "your phone number on file"} within 1 business day.
                    If you need anything urgent in the meantime, call (706) 760-3470.
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/book/iv">Return to menu</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First name</Label>
                      <Input
                        id="first_name"
                        className="bg-muted/30"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last name</Label>
                      <Input
                        id="last_name"
                        className="bg-muted/30"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        className="bg-muted/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        className="bg-muted/30"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Best time to reach you</Label>
                    <RadioGroup value={bestTime} onValueChange={setBestTime} className="space-y-2">
                      {BEST_TIME_OPTIONS.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <RadioGroupItem id={option.id} value={option.id} />
                          <Label htmlFor={option.id}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.best_time && <p className="text-sm text-destructive">{errors.best_time}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drawing_to_iv">What were you hoping to get from IV therapy today?</Label>
                    <select
                      id="drawing_to_iv"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={drawingToIv}
                      onChange={(e) => setDrawingToIv(e.target.value)}
                    >
                      <option value="">Select one...</option>
                      {DRAWING_TO_IV_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.drawing_to_iv && <p className="text-sm text-destructive">{errors.drawing_to_iv}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_notes">Anything else we should know?</Label>
                    <Textarea
                      id="additional_notes"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send My Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyConsultRequest;
