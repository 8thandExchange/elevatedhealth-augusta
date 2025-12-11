import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ShieldAlert, ChevronRight, ChevronLeft, Eye, EyeOff, ArrowLeft, Check, Heart, Brain, Calendar, Phone } from "lucide-react";
import SafetyGate from "@/components/patient/SafetyGate";

type PrimaryProgram = "hormone" | "ketamine";

interface HormoneSafetyScreening {
  breastCancer: boolean;
  uterineCancer: boolean;
  bloodClot: boolean;
  pregnantBreastfeeding: boolean;
}

interface KetamineSafetyScreening {
  activePsychosis: boolean;
  uncontrolledHypertension: boolean;
  seizureDisorder: boolean;
  pregnancy: boolean;
}

// Interest options for multi-select
const INTEREST_OPTIONS = [
  { id: "hormone", label: "Hormone Replacement Therapy", description: "Bio-identical hormones, menopause, perimenopause, testosterone" },
  { id: "weight_loss", label: "Medical Weight Loss", description: "GLP-1 therapy, metabolic optimization" },
  { id: "ketamine", label: "Ketamine Therapy / Mental Wellness", description: "IV ketamine infusions, Spravato®, depression & anxiety" },
  { id: "peptides", label: "Peptide Therapy", description: "Sermorelin, NAD+, PT-141, cellular optimization" },
];

const HORMONE_HIGH_RISK_CONDITIONS = [
  { id: "breastCancer", label: "Breast Cancer (Personal History)", description: "Have you ever been diagnosed with breast cancer?" },
  { id: "uterineCancer", label: "Uterine/Endometrial Cancer", description: "Have you ever been diagnosed with uterine or endometrial cancer?" },
  { id: "bloodClot", label: "Active Blood Clot (DVT/PE)", description: "Do you currently have or recently had a blood clot (deep vein thrombosis or pulmonary embolism)?" },
  { id: "pregnantBreastfeeding", label: "Pregnant or Breastfeeding", description: "Are you currently pregnant or breastfeeding?" },
];

const KETAMINE_HIGH_RISK_CONDITIONS = [
  { id: "activePsychosis", label: "Active Psychosis", description: "Are you currently experiencing psychotic symptoms or have been diagnosed with schizophrenia?" },
  { id: "uncontrolledHypertension", label: "Uncontrolled High Blood Pressure", description: "Do you have high blood pressure that is not well-controlled with medication?" },
  { id: "seizureDisorder", label: "Seizure Disorder", description: "Do you have a history of seizures or epilepsy?" },
  { id: "pregnancy", label: "Pregnant or Trying to Conceive", description: "Are you currently pregnant or actively trying to become pregnant?" },
];

const PatientLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupStep, setSignupStep] = useState<"info" | "program" | "safety" | "complete">("info");
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    fullName: "",
    dob: ""
  });
  const [primaryProgram, setPrimaryProgram] = useState<PrimaryProgram | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hormoneSafetyScreening, setHormoneSafetyScreening] = useState<HormoneSafetyScreening>({
    breastCancer: false,
    uterineCancer: false,
    bloodClot: false,
    pregnantBreastfeeding: false,
  });
  const [ketamineSafetyScreening, setKetamineSafetyScreening] = useState<KetamineSafetyScreening>({
    activePsychosis: false,
    uncontrolledHypertension: false,
    seizureDisorder: false,
    pregnancy: false,
  });
  const [showSafetyGate, setShowSafetyGate] = useState(false);
  const [createdPatientName, setCreatedPatientName] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [confirmedNoneApply, setConfirmedNoneApply] = useState(false);

  // Check for existing session on mount - redirect if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/patient/dashboard", { replace: true });
      } else {
        setCheckingSession(false);
      }
    };
    checkExistingSession();
  }, [navigate]);

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
          .select("risk_status, full_name, primary_program")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (patient?.risk_status === "high_risk_review") {
          setCreatedPatientName(patient.full_name);
          setPrimaryProgram(patient.primary_program as PrimaryProgram || "hormone");
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
    if (primaryProgram === "hormone") {
      return hormoneSafetyScreening.breastCancer || 
             hormoneSafetyScreening.uterineCancer || 
             hormoneSafetyScreening.bloodClot || 
             hormoneSafetyScreening.pregnantBreastfeeding;
    } else if (primaryProgram === "ketamine") {
      return ketamineSafetyScreening.activePsychosis || 
             ketamineSafetyScreening.uncontrolledHypertension || 
             ketamineSafetyScreening.seizureDisorder || 
             ketamineSafetyScreening.pregnancy;
    }
    return false;
  };

  const getSafetyFlags = () => {
    if (primaryProgram === "hormone") {
      return Object.entries(hormoneSafetyScreening)
        .filter(([_, value]) => value)
        .map(([key]) => {
          const condition = HORMONE_HIGH_RISK_CONDITIONS.find(c => c.id === key);
          return condition?.label || key;
        });
    } else if (primaryProgram === "ketamine") {
      return Object.entries(ketamineSafetyScreening)
        .filter(([_, value]) => value)
        .map(([key]) => {
          const condition = KETAMINE_HIGH_RISK_CONDITIONS.find(c => c.id === key);
          return condition?.label || key;
        });
    }
    return [];
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStep("program");
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinueFromProgram = () => {
    // Determine primary program based on interests
    // Ketamine takes priority for workflow routing if selected
    if (selectedInterests.includes("ketamine")) {
      setPrimaryProgram("ketamine");
    } else {
      setPrimaryProgram("hormone");
    }
    setSignupStep("safety");
  };

  // Check if any hormone-related interests are selected
  const hasHormoneInterests = () => {
    return selectedInterests.some(i => ["hormone", "weight_loss", "peptides"].includes(i));
  };

  // Check if ketamine is the ONLY interest selected
  const isKetamineOnly = () => {
    return selectedInterests.length === 1 && selectedInterests.includes("ketamine");
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
      const safetyFlags = getSafetyFlags();
      const medicalHistory = primaryProgram === "hormone" 
        ? hormoneSafetyScreening 
        : ketamineSafetyScreening;

      // Create patient record with safety screening and primary program
      // Skip intake only if ketamine is the ONLY interest selected
      const skipIntake = isKetamineOnly();
      const { error: patientError } = await supabase.from("patients").insert([{
        user_id: authData.user.id,
        full_name: signupData.fullName,
        email: signupData.email, // Store email in patients table
        dob: signupData.dob || null,
        primary_program: primaryProgram,
        treatment_request: selectedInterests.join(","), // Store all selected interests
        risk_status: highRisk ? "high_risk_review" : "standard",
        medical_history: medicalHistory as unknown as Record<string, boolean>,
        safety_flags: highRisk ? safetyFlags : [],
        intake_completed: skipIntake,
        onboarding_status: skipIntake ? "intake_complete" : "account_created",
      }]);

      if (patientError) throw patientError;

      // Send notification to providers about new patient signup
      try {
        await supabase.functions.invoke("send-patient-signup-notification", {
          body: {
            patientName: signupData.fullName,
            patientEmail: signupData.email,
            primaryProgram,
            isHighRisk: highRisk,
            safetyFlags: highRisk ? safetyFlags : [],
          },
        });
        console.log("[PatientLogin] Provider notification sent");
      } catch (notifyError) {
        // Don't block signup if notification fails
        console.error("[PatientLogin] Failed to send provider notification:", notifyError);
      }

      setSignupSuccess(true);
      
      if (highRisk) {
        setCreatedPatientName(signupData.fullName);
        setTimeout(() => {
          setShowSafetyGate(true);
          toast.info("Account created. Manual review required.");
        }, 800);
      } else {
        toast.success("Account created! Welcome to Elevated Health.");
        // Both hormone and ketamine patients go to dashboard
        // Ketamine patients skip intake (intake_completed = true)
        setTimeout(() => navigate("/patient/dashboard"), 800);
      }
    } catch (error: any) {
      // Handle "User already registered" error
      if (error.message?.includes("already registered") || error.code === "user_already_exists") {
        toast.error("This email is already registered. Please sign in instead.", {
          action: {
            label: "Sign In",
            onClick: () => {
              setLoginData({ email: signupData.email, password: "" });
              setSignupStep("info");
            }
          },
          duration: 8000
        });
      } else {
        toast.error(error.message || "Signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show Safety Gate screen if high-risk
  if (showSafetyGate) {
    return (
      <SafetyGate 
        patientName={createdPatientName}
        treatmentType={primaryProgram || "hormone"}
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

  const currentSafetyConditions = primaryProgram === "hormone" 
    ? HORMONE_HIGH_RISK_CONDITIONS 
    : KETAMINE_HIGH_RISK_CONDITIONS;
  
  const currentSafetyScreening = primaryProgram === "hormone"
    ? hormoneSafetyScreening
    : ketamineSafetyScreening;

  const setCurrentSafetyScreening = (id: string, checked: boolean) => {
    if (primaryProgram === "hormone") {
      setHormoneSafetyScreening({
        ...hormoneSafetyScreening,
        [id]: checked
      });
    } else {
      setKetamineSafetyScreening({
        ...ketamineSafetyScreening,
        [id]: checked
      });
    }
    // Reset confirmation when any condition changes
    setConfirmedNoneApply(false);
  };

  const isKetamineHighRisk = () => {
    return ketamineSafetyScreening.activePsychosis || 
           ketamineSafetyScreening.uncontrolledHypertension || 
           ketamineSafetyScreening.seizureDisorder || 
           ketamineSafetyScreening.pregnancy;
  };

  const KETAMINE_CONSULT_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true";

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
                {/* Step 1: Basic Info */}
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
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {/* Step 2: Program Selection - Multi-Select */}
                {signupStep === "program" && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-cormorant text-lg font-medium text-foreground">
                        What are you interested in?
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select all that apply — you can explore multiple options
                      </p>
                    </div>

                    <div className="space-y-3">
                      {INTEREST_OPTIONS.map((option) => {
                        const isSelected = selectedInterests.includes(option.id);
                        const IconComponent = option.id === "ketamine" ? Brain : Heart;
                        const iconBgClass = option.id === "ketamine" 
                          ? "bg-primary/10" 
                          : option.id === "weight_loss"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : option.id === "peptides"
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : "bg-pink-100 dark:bg-pink-900/30";
                        const iconColorClass = option.id === "ketamine"
                          ? "text-primary"
                          : option.id === "weight_loss"
                          ? "text-green-600 dark:text-green-400"
                          : option.id === "peptides"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-pink-600 dark:text-pink-400";
                        
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleInterestToggle(option.id)}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${iconBgClass} transition-colors`}>
                                <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">{option.label}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {option.description}
                                </p>
                              </div>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleInterestToggle(option.id)}
                                className="mt-2"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

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
                      <Button 
                        type="button"
                        onClick={handleContinueFromProgram}
                        className="flex-1"
                        disabled={selectedInterests.length === 0}
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Safety Screening */}
                {signupStep === "safety" && primaryProgram && (
                  <div className="space-y-4">
                    {/* Show Ketamine Safety if ketamine selected */}
                    {selectedInterests.includes("ketamine") && (
                      <>
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                            <h3 className="font-medium text-amber-700 dark:text-amber-400">
                              Ketamine Therapy Safety Screening
                            </h3>
                          </div>
                          <p className="text-sm text-amber-600 dark:text-amber-300">
                            Please answer honestly. This helps us ensure your safety and provide appropriate care.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {KETAMINE_HIGH_RISK_CONDITIONS.map((condition) => (
                            <div 
                              key={condition.id}
                              className={`p-4 rounded-lg border transition-colors ${
                                ketamineSafetyScreening[condition.id as keyof KetamineSafetyScreening]
                                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={`ketamine-${condition.id}`}
                                  checked={ketamineSafetyScreening[condition.id as keyof KetamineSafetyScreening]}
                                  onCheckedChange={(checked) => 
                                    setKetamineSafetyScreening({
                                      ...ketamineSafetyScreening,
                                      [condition.id]: checked === true
                                    })
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={`ketamine-${condition.id}`}
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
                      </>
                    )}

                    {/* Show Hormone Safety if hormone interests selected */}
                    {hasHormoneInterests() && (
                      <>
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                            <h3 className="font-medium text-amber-700 dark:text-amber-400">
                              Hormone Therapy Safety Screening
                            </h3>
                          </div>
                          <p className="text-sm text-amber-600 dark:text-amber-300">
                            Please answer honestly. This helps us ensure your safety and provide appropriate care.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {HORMONE_HIGH_RISK_CONDITIONS.map((condition) => (
                            <div 
                              key={condition.id}
                              className={`p-4 rounded-lg border transition-colors ${
                                hormoneSafetyScreening[condition.id as keyof HormoneSafetyScreening]
                                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={`hormone-${condition.id}`}
                                  checked={hormoneSafetyScreening[condition.id as keyof HormoneSafetyScreening]}
                                  onCheckedChange={(checked) => 
                                    setHormoneSafetyScreening({
                                      ...hormoneSafetyScreening,
                                      [condition.id]: checked === true
                                    })
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={`hormone-${condition.id}`}
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
                      </>
                    )}

                    {/* Ketamine Disqualification Message - Routes to Clinical Eligibility Review */}
                    {primaryProgram === "ketamine" && isKetamineHighRisk() && (
                      <div className="bg-card border border-gold/30 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-gold" />
                          </div>
                          <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">
                            Safety First. Let's Clarify Your Options.
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Your medical intake flagged a potential contraindication for treatment. 
                            At Elevated Health, we prioritize your safety above all else.
                          </p>
                          <p className="text-muted-foreground text-sm">
                            This brief 15-minute triage call is designed to:
                          </p>
                          <ul className="text-sm text-muted-foreground text-left mt-3 space-y-2 max-w-sm mx-auto">
                            <li className="flex items-start gap-2">
                              <span className="text-gold font-semibold">•</span>
                              <span><strong>Clarify:</strong> Review the specific answer that triggered the safety flag</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gold font-semibold">•</span>
                              <span><strong>Re-Evaluate:</strong> Determine if the issue is a hard stop or can be managed</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gold font-semibold">•</span>
                              <span><strong>Redirect:</strong> Explore other modalities if this therapy isn't safe for you</span>
                            </li>
                          </ul>
                        </div>
                        
                        <p className="text-sm font-medium text-foreground mb-2">Book your Clinical Eligibility Review:</p>
                        <div className="rounded-lg overflow-hidden border border-border mb-4">
                          {/* Clinical Eligibility Review Calendar */}
                          <iframe 
                            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ26DhPKdGVdKetVQ6WQKaaGYWWrjCKd3c7P7E4dTNfiAbxcYX4Q2OO9lBS25v8X3yYT7KIPsZ9x?gv=true" 
                            style={{ border: 0 }} 
                            width="100%" 
                            height="400"
                            title="Clinical Eligibility Review"
                          />
                        </div>
                        
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" />
                          Or call us at (706) 750-9973
                        </p>
                      </div>
                    )}

                    {/* Hormone High Risk Warning (existing behavior) */}
                    {primaryProgram === "hormone" && isHighRisk() && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Note:</strong> Based on your responses, your account will require 
                          manual review by our medical team before receiving automated recommendations. 
                          This is for your safety.
                        </p>
                      </div>
                    )}

                    {/* Ketamine: Confirm None Apply (only when ketamine selected and no conditions checked) */}
                    {selectedInterests.includes("ketamine") && !isKetamineHighRisk() && (
                      <div className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="confirm-none-apply"
                            checked={confirmedNoneApply}
                            onCheckedChange={(checked) => setConfirmedNoneApply(checked === true)}
                            className="mt-1"
                          />
                          <Label 
                            htmlFor="confirm-none-apply"
                            className="text-foreground font-medium cursor-pointer"
                          >
                            I confirm I have none of these conditions
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setSignupStep("program");
                          setConfirmedNoneApply(false);
                        }}
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      
                      {/* Show create account button - disabled if ketamine high risk and ketamine only */}
                      {!(selectedInterests.includes("ketamine") && isKetamineHighRisk() && isKetamineOnly()) && (
                        <Button 
                          type="button"
                          onClick={handleSignupComplete}
                          className="flex-1" 
                          disabled={
                            isLoading || 
                            signupSuccess || 
                            (selectedInterests.includes("ketamine") && !isKetamineHighRisk() && !confirmedNoneApply)
                          }
                        >
                          {signupSuccess ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                              Account Created
                            </>
                          ) : isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
