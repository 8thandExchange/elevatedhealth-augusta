/**
 * /patient/create-account
 *
 * Standalone account-creation surface. Patients land here from
 * post-payment / post-intake email links that include ?email and ?name
 * query params. The page no longer requires a Stripe session_id
 * verification — that path used to bind to the legacy ZRT $250 kit
 * payment, which we no longer sell.
 *
 * If a session_id is present in the URL (legacy invite emails), we
 * silently ignore it. The page focuses on the one job that matters:
 * stand up the patient's portal credentials and link them to the
 * patient row keyed off their email.
 */
import { useEffect, useState, FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Lock, Mail, User, Eye, EyeOff, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPatientSignupPrefill, linkPatientAccount } from "@/lib/patientAccountLink";

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const CreateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get("email");
  const nameParam = searchParams.get("name");

  const [email, setEmail] = useState(emailParam || "");
  const [name, setName] = useState(nameParam || "");
  const [phone, setPhone] = useState("");
  const [existingPhone, setExistingPhone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // Hydrate from any existing patient row keyed off email.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!emailParam) {
        setHydrating(false);
        return;
      }
      try {
        const prefill = await getPatientSignupPrefill(emailParam);
        if (cancelled) return;
        if (prefill?.phone) {
          setExistingPhone(prefill.phone);
          setPhone(formatPhoneNumber(prefill.phone.replace(/\D/g, "")));
        }
        if (prefill?.full_name && !nameParam) setName(prefill.full_name);
      } catch (e) {
        console.warn("CreateAccount hydrate error", e);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [emailParam, nameParam]);

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsCreating(true);
    try {
      const displayName = (name || email.split("@")[0]).trim();
      const nameParts = displayName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || "Patient";
      const lastName = nameParts.slice(1).join(" ");

      const { data: authData, error: authError } = await supabase.functions.invoke(
        "create-patient-auth-account",
        {
          body: {
            email,
            password,
            full_name: displayName,
          },
        },
      );

      if (authError) {
        if (authError instanceof FunctionsHttpError) {
          try {
            const body = await authError.context.json();
            if (body?.error_code === "already_registered") {
              toast.error("An account with this email already exists. Please log in.");
              navigate("/patient/login");
              return;
            }
            if (body?.error_code === "staff_email_conflict") {
              toast.error(
                "That email is your clinic staff login. Use a different email for a test patient (e.g. yourname+test@gmail.com).",
              );
              return;
            }
            if (body?.error) throw new Error(String(body.error));
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== authError.message) throw parseErr;
          }
        }
        throw authError;
      }

      if (authData?.error_code === "staff_email_conflict") {
        toast.error(
          "That email is your clinic staff login. Use a different email for a test patient (e.g. yourname+test@gmail.com).",
        );
        return;
      }

      if (authData?.error_code === "already_registered") {
        toast.error("An account with this email already exists. Please log in.");
        navigate("/patient/login");
        return;
      }

      const userId = authData?.user_id as string | undefined;
      if (!userId) {
        throw new Error("Account created but user id missing");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhoneForStorage = cleanPhone.length === 10 ? cleanPhone : null;

      let resolvedPatientId: string | null = null;
      let primaryProgram: string | null | undefined;
      let patientPhone = formattedPhoneForStorage;

      try {
        const linked = await linkPatientAccount({
          email,
          fullName: displayName,
          phone: formattedPhoneForStorage,
        });
        if (!linked?.patient_id) {
          throw new Error("Could not connect your portal to a patient record. Please call the clinic.");
        }
        resolvedPatientId = linked.patient_id;
        primaryProgram = linked.primary_program;
        patientPhone = formattedPhoneForStorage || linked.phone;
      } catch (linkErr: unknown) {
        const linkMsg = linkErr instanceof Error ? linkErr.message : String(linkErr);
        if (linkMsg.includes("email_already_linked")) {
          toast.error("This email is linked to another account. Please log in or contact the clinic.");
          navigate("/patient/login");
          return;
        }
        if (linkMsg.includes("not_authenticated")) {
          toast.error("Session expired. Please try again.");
          return;
        }
        throw linkErr;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (accessToken) {
        supabase.functions.invoke("send-welcome-email", {
          body: {
            user_id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            primary_program: primaryProgram,
            ...(resolvedPatientId ? { patient_id: resolvedPatientId } : {}),
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch((err) => console.error("Welcome email error", err));
      }

      if (patientPhone) {
        supabase.functions.invoke("send-welcome-sms", {
          body: {
            patient_id: resolvedPatientId,
            phone: patientPhone,
            first_name: firstName,
            primary_program: primaryProgram,
          },
        }).catch((err) => console.error("Welcome SMS error", err));
      }

      toast.success("Account created! Let's finish your intake.");
      navigate("/patient/intake");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      console.error("Account creation error:", err);
      if (msg.includes("already registered")) {
        toast.error("An account with this email already exists. Please log in.");
        navigate("/patient/login");
      } else if (msg.includes("row-level security") || msg.includes("permission denied")) {
        toast.error("We couldn't finish portal setup. Please call the clinic — we're fixing this on our end.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (hydrating) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
            <p className="font-jost text-muted-foreground">Setting up your portal&hellip;</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Create Your Account | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-playfair text-3xl text-foreground mb-2">
              Create your portal account
            </h1>
            <p className="font-jost text-muted-foreground">
              Quick &mdash; less than a minute. After this you'll see intake.
            </p>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-jost">
                <Lock className="w-5 h-5 text-accent" />
                Secure account setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={!!emailParam}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone number
                    <span className="text-xs text-muted-foreground font-normal">(SMS reminders)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(706) 555-0142"
                    className="mt-1"
                  />
                  {!existingPhone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional but recommended for visit reminders.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Create password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isCreating} className="w-full" size="lg">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account&hellip;
                    </>
                  ) : (
                    "Create account & continue"
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Already have an account?{" "}
                <a href="/patient/login" className="text-accent hover:underline">
                  Log in here
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateAccount;
