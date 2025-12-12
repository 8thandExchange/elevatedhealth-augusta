import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CreateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get("session_id");
  const emailParam = searchParams.get("email");
  const nameParam = searchParams.get("name");

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState(emailParam || "");
  const [name, setName] = useState(nameParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No payment session found. Please complete payment first.");
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-hormone-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;
        if (data?.verified) {
          setVerified(true);
          if (data?.email) setEmail(data.email);
        } else {
          setError("Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Unable to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
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
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/patient/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Update the existing patient record to link to this user
        const { data: patientData, error: updateError } = await supabase
          .from("patients")
          .update({ 
            user_id: signUpData.user.id,
            onboarding_status: "account_created",
            full_name: name || email.split("@")[0],
          })
          .eq("email", email)
          .select("primary_program")
          .single();

        let primaryProgram = patientData?.primary_program;

        if (updateError) {
          console.error("Patient update error:", updateError);
          // Create patient record if it doesn't exist
          await supabase.from("patients").insert({
            user_id: signUpData.user.id,
            email: email,
            full_name: name || email.split("@")[0],
            onboarding_status: "account_created",
          });
        }

        // Send welcome email (fire and forget - don't block account creation)
        supabase.functions.invoke("send-welcome-email", {
          body: {
            patient_name: name || email.split("@")[0],
            patient_email: email,
            primary_program: primaryProgram,
          },
        }).catch(err => console.error("Welcome email error:", err));

        toast.success("Account created! Redirecting to intake form...");
        
        // Auto sign in
        await supabase.auth.signInWithPassword({ email, password });
        
        // Navigate to intake
        navigate("/patient/intake");
      }
    } catch (err: any) {
      console.error("Account creation error:", err);
      if (err.message?.includes("already registered")) {
        toast.error("An account with this email already exists. Please log in.");
        navigate("/patient/login");
      } else {
        toast.error(err.message || "Failed to create account");
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-cormorant font-semibold text-foreground mb-4">
              Verification Issue
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
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
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-cormorant font-semibold text-foreground mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Create your patient portal account to continue
            </p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Secure Account Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
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
                    <Mail className="w-4 h-4" />
                    Email Address
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
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Create Password
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account & Continue"
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Already have an account?{" "}
                <a href="/patient/login" className="text-primary hover:underline">
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