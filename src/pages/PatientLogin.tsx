import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ShieldAlert, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import SafetyGate from "@/components/patient/SafetyGate";

interface SafetyScreening {
  breastCancer: boolean;
  uterineCancer: boolean;
  bloodClot: boolean;
  pregnantBreastfeeding: boolean;
}

const HIGH_RISK_CONDITIONS = [
  { id: "breastCancer", label: "Breast Cancer (Personal History)", description: "Have you ever been diagnosed with breast cancer?" },
  { id: "uterineCancer", label: "Uterine/Endometrial Cancer", description: "Have you ever been diagnosed with uterine or endometrial cancer?" },
  { id: "bloodClot", label: "Active Blood Clot (DVT/PE)", description: "Do you currently have or recently had a blood clot (deep vein thrombosis or pulmonary embolism)?" },
  { id: "pregnantBreastfeeding", label: "Pregnant or Breastfeeding", description: "Are you currently pregnant or breastfeeding?" },
];

const PatientLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupStep, setSignupStep] = useState<"info" | "safety" | "complete">("info");
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    fullName: "",
    dob: ""
  });
  const [safetyScreening, setSafetyScreening] = useState<SafetyScreening>({
    breastCancer: false,
    uterineCancer: false,
    bloodClot: false,
    pregnantBreastfeeding: false,
  });
  const [showSafetyGate, setShowSafetyGate] = useState(false);
  const [createdPatientName, setCreatedPatientName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      // Check if user has high_risk_review status
      if (data.user) {
        const { data: patient } = await supabase
          .from("patients")
          .select("risk_status, full_name")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (patient?.risk_status === "high_risk_review") {
          setCreatedPatientName(patient.full_name);
          setShowSafetyGate(true);
          return;
        }
      }
      
      toast.success("Welcome back!");
      navigate("/patient/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/patient/login`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const isHighRisk = () => {
    return safetyScreening.breastCancer || 
           safetyScreening.uterineCancer || 
           safetyScreening.bloodClot || 
           safetyScreening.pregnantBreastfeeding;
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStep("safety");
  };

  const handleSignupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/patient/dashboard`;
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      const highRisk = isHighRisk();

      // Create patient record with safety screening
      const { error: patientError } = await supabase.from("patients").insert([{
        user_id: authData.user.id,
        full_name: signupData.fullName,
        dob: signupData.dob || null,
        risk_status: highRisk ? "high_risk_review" : "standard",
        medical_history: safetyScreening as unknown as Record<string, boolean>,
        safety_flags: highRisk ? Object.entries(safetyScreening)
          .filter(([_, value]) => value)
          .map(([key]) => {
            const condition = HIGH_RISK_CONDITIONS.find(c => c.id === key);
            return condition?.label || key;
          }) : [],
      }]);

      if (patientError) throw patientError;

      if (highRisk) {
        setCreatedPatientName(signupData.fullName);
        setShowSafetyGate(true);
        toast.info("Account created. Manual review required.");
      } else {
        toast.success("Account created! Welcome to Elevated Health.");
        navigate("/patient/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Show Safety Gate screen if high-risk
  if (showSafetyGate) {
    return (
      <SafetyGate 
        patientName={createdPatientName}
        onContinue={() => navigate("/patient/dashboard")}
      />
    );
  }

  // Show Forgot Password screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-gold mb-2">Patient Portal</p>
            <h1 className="font-cormorant text-3xl text-foreground">Elevated Health</h1>
          </div>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-cormorant text-xl">Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">Patient Portal</p>
          <h1 className="font-cormorant text-3xl text-foreground">Elevated Health</h1>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-cormorant text-xl">Welcome</CardTitle>
            <CardDescription>Sign in to access your wellness dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">New Patient</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                {signupStep === "info" && (
                  <form onSubmit={handleSignupStep1} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-dob">Date of Birth</Label>
                      <Input
                        id="signup-dob"
                        type="date"
                        value={signupData.dob}
                        onChange={(e) => setSignupData({ ...signupData, dob: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Continue to Safety Screening
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {signupStep === "safety" && (
                  <form onSubmit={handleSignupComplete} className="space-y-4">
                    {/* Safety Header */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                        <h3 className="font-medium text-amber-700 dark:text-amber-400">
                          Medical Safety Screening
                        </h3>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        Please answer honestly. This helps us ensure your safety and provide appropriate care.
                      </p>
                    </div>

                    {/* Safety Questions */}
                    <div className="space-y-4">
                      {HIGH_RISK_CONDITIONS.map((condition) => (
                        <div 
                          key={condition.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            safetyScreening[condition.id as keyof SafetyScreening]
                              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={condition.id}
                              checked={safetyScreening[condition.id as keyof SafetyScreening]}
                              onCheckedChange={(checked) => 
                                setSafetyScreening({
                                  ...safetyScreening,
                                  [condition.id]: checked === true
                                })
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label 
                                htmlFor={condition.id}
                                className="text-foreground font-medium cursor-pointer"
                              >
                                {condition.label}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {condition.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* High Risk Warning */}
                    {isHighRisk() && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Note:</strong> Based on your responses, your account will require 
                          manual review by our medical team before receiving automated recommendations. 
                          This is for your safety.
                        </p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setSignupStep("info")}
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Account
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;