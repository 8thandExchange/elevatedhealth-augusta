import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle, Mail, AlertCircle } from "lucide-react";
import { getSafeStaffRedirect, getStaffPortalLoginPath } from "@/lib/staffPortalRouting";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectAfterLogin = getSafeStaffRedirect(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");

  // Check for existing session on mount - redirect if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin/staff role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const hasAccess = roles?.some(
          (r) =>
            r.role === "admin" ||
            r.role === "staff" ||
            r.role === "business_admin" ||
            r.role === "provider",
        );
        if (hasAccess) {
          navigate(redirectAfterLogin ?? getStaffPortalLoginPath(session.user.email), { replace: true });
          return;
        }
      }
      setCheckingSession(false);
    };
    checkExistingSession();
  }, [navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setResetEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setLoginError(error.message);
        }
        return;
      }

      if (data.user && data.session) {
        // Check if user has provider-portal access role
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        if (roleError) throw roleError;

        const hasAccess = roles?.some(
          (r) =>
            r.role === "admin" ||
            r.role === "staff" ||
            r.role === "business_admin" ||
            r.role === "provider",
        );
        
        if (!hasAccess) {
          await supabase.auth.signOut();
          setLoginError("Access denied. This portal is for authorized providers only. Contact admin@elevatedhealthaugusta.com to request access.");
          return;
        }

        toast.success("Logged in successfully");

        // Small delay to ensure session is propagated
        setTimeout(
          () => navigate(redirectAfterLogin ?? getStaffPortalLoginPath(data.user.email), { replace: true }),
          100,
        );
      }
    } catch (error: any) {
      setLoginError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      setResendCountdown(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setResendCountdown(60);
      toast.success("Reset email sent again!");
    } catch (error: any) {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setResetEmail("");
    setEmailError("");
    setResendCountdown(0);
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success screen after email sent
  if (showForgotPassword && resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              {/* Heading */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Check Your Email</h2>
                <p className="text-muted-foreground">
                  We sent a password reset link to
                </p>
                <p className="font-medium text-foreground">{resetEmail}</p>
              </div>

              {/* Help Box */}
              <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Didn't receive the email?</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Check your spam or junk folder</li>
                      <li>• Make sure the email address is correct</li>
                      <li>• Allow a few minutes for delivery</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Resend Button */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={resendCountdown > 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCountdown > 0 ? (
                    `Resend in ${resendCountdown}s`
                  ) : (
                    "Resend Email"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmailSent(false);
                    setResetEmail("");
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Try a different email address
                </button>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={resetForgotPasswordFlow}
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  disabled={isLoading}
                  className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {emailError && (
                  <div className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {emailError}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !resetEmail || !!emailError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <button
                type="button"
                onClick={resetForgotPasswordFlow}
                className="w-full inline-flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-xs uppercase tracking-[3px] text-muted-foreground font-jost">Clinical Team Access</span>
          </div>
          <CardTitle className="font-jost">Staff Sign-In</CardTitle>
          <CardDescription>
            Authorized providers and staff only. New accounts must be invited by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-destructive">{loginError}</p>
                  {loginError.includes("Invalid") && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setResetEmail(email);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError("");
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  required
                  disabled={isLoading}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 z-20 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-[#2A2826] transition-colors hover:text-[#B8956A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link to="/patient/login" className="text-sm text-primary hover:underline font-jost">
          Looking for the patient portal? → Sign in here
        </Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to website
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
