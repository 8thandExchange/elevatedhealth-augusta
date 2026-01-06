import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Calendar } from "lucide-react";
import SafetyGate from "@/components/patient/SafetyGate";
import ConsultationModal from "@/components/ConsultationModal";
import { clearAuthStorage, isSessionValid } from "@/lib/authUtils";

type PrimaryProgram = "hormone" | "ketamine";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginMethod, setLoginMethod] = useState<"password" | "magic">("password");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showSafetyGate, setShowSafetyGate] = useState(false);
  const [createdPatientName, setCreatedPatientName] = useState("");
  const [primaryProgram, setPrimaryProgram] = useState<PrimaryProgram | null>(null);
  const [showConsultModal, setShowConsultModal] = useState(false);
  
  // Ref to prevent race conditions with navigation
  const hasNavigatedRef = useRef(false);
  
  // Helper to get redirect path for returning patients
  const getRedirectPath = () => redirectTo === "consult" ? "/consult" : "/patient/dashboard";

  // Check for existing session on mount with timeout protection
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Timeout - show login form after 8 seconds (increased for slow networks)
    timeoutId = setTimeout(() => {
      if (isMounted && checkingSession) {
        console.warn("[PatientLogin] Session check timed out - forcing login form");
        clearAuthStorage();
        setCheckingSession(false);
      }
    }, 8000);

    const checkExistingSession = async () => {
      try {
        console.log("[PatientLogin] Checking existing session...");
        const valid = await isSessionValid();
        
        if (!isMounted) return;
        
        if (valid && !hasNavigatedRef.current) {
          console.log("[PatientLogin] Valid session found - redirecting");
          hasNavigatedRef.current = true;
          navigate(getRedirectPath(), { replace: true });
        } else {
          console.log("[PatientLogin] No valid session - showing login form");
          clearAuthStorage();
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("[PatientLogin] Session check error:", error);
        if (isMounted) {
          clearAuthStorage();
          setCheckingSession(false);
        }
      }
    };
    
    checkExistingSession();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  // Handle Google OAuth sign in (existing patients only)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectPath = redirectTo === "consult" ? "/consult" : "/patient/dashboard";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign in failed");
      setIsLoading(false);
    }
  };

  // Sync profile from Google metadata on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only handle SIGNED_IN for Google OAuth users - prevent race condition
      if (event === 'SIGNED_IN' && session?.user && !hasNavigatedRef.current) {
        const user = session.user;
        const provider = user.app_metadata?.provider;
        
        // Only sync for Google OAuth users - defer Supabase calls with setTimeout
        if (provider === 'google') {
          hasNavigatedRef.current = true;
          setTimeout(async () => {
            try {
              const metadata = user.user_metadata;
              const fullName = metadata?.full_name || metadata?.name;
              const avatarUrl = metadata?.avatar_url || metadata?.picture;
              
              // Check if patient record exists
              const { data: existingPatient } = await supabase
                .from('patients')
                .select('id, full_name, avatar_url, onboarding_status, intake_completed')
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (existingPatient) {
                // Existing patient - update with Google info if not already set
                const updates: Record<string, string> = {};
                if (!existingPatient.full_name && fullName) updates.full_name = fullName;
                if (!existingPatient.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;
                
                if (Object.keys(updates).length > 0) {
                  await supabase
                    .from('patients')
                    .update(updates)
                    .eq('id', existingPatient.id);
                }
                
                console.log("[PatientLogin] Existing Google user - going to dashboard");
                navigate("/patient/dashboard", { replace: true });
              } else {
                // NEW Google user without patient record - they need to go through proper onboarding
                // Show error and redirect to booking
                console.log("[PatientLogin] New Google user without patient record - need consultation first");
                toast.error("No patient account found. Please book a consultation first.", {
                  duration: 5000
                });
                await supabase.auth.signOut();
                hasNavigatedRef.current = false;
              }
            } catch (err) {
              console.error("Error checking Google profile:", err);
              navigate("/patient/dashboard", { replace: true });
            }
          }, 0);
        }
      }
    });

    return () => subscription.unsubscribe();
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
      navigate(getRedirectPath());
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/patient/dashboard`,
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">Patient Portal</p>
          <h1 className="font-cormorant text-3xl text-foreground">Elevated Health</h1>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-cormorant text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your wellness dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
              <p className="text-xs text-center text-muted-foreground">For existing patients only</p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
              </div>
            </div>

            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => { setLoginMethod("password"); setMagicLinkSent(false); }}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === "password" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod("magic"); setMagicLinkSent(false); }}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  loginMethod === "magic" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Magic Link
              </button>
            </div>

            {/* Password Login Form */}
            {loginMethod === "password" && (
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
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
            )}

            {/* Magic Link Form */}
            {loginMethod === "magic" && !magicLinkSent && (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="your@email.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Mail className="w-4 h-4 mr-2" />
                  Send Magic Link
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll email you a secure link to sign in — no password needed
                </p>
              </form>
            )}

            {/* Magic Link Sent Confirmation */}
            {loginMethod === "magic" && magicLinkSent && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a sign-in link to <strong>{magicLinkEmail}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMagicLinkSent(false); setMagicLinkEmail(""); }}
                  className="text-sm text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Patient CTA */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            New to Elevated Health?
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowConsultModal(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Your Consultation
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Your portal access will be created after your first visit
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={showConsultModal} 
        onClose={() => setShowConsultModal(false)} 
      />
    </div>
  );
};

export default PatientLogin;
