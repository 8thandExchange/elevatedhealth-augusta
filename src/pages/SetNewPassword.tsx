import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_TEXT =
  "This password reset link is invalid or has expired. Request a new one from the login page.";

const SetNewPassword = () => {
  const navigate = useNavigate();
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
  const [isRecoveryValid, setIsRecoveryValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validation = useMemo(() => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};
    if (newPassword.length > 0 && newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (confirmPassword.length > 0 && confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const bootstrapRecovery = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const param = (key: string) => searchParams.get(key) ?? hashParams.get(key);

        const type = param("type");
        const accessToken = param("access_token");
        const refreshToken = param("refresh_token");
        const code = searchParams.get("code");
        const isRecoveryType = type === "recovery";

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setErrorMessage(ERROR_TEXT);
            setIsRecoveryValid(false);
            return;
          }
        } else if (isRecoveryType && accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setErrorMessage(ERROR_TEXT);
            setIsRecoveryValid(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setErrorMessage(ERROR_TEXT);
          setIsRecoveryValid(false);
          return;
        }

        if (!code && !isRecoveryType) {
          setErrorMessage(ERROR_TEXT);
          setIsRecoveryValid(false);
          return;
        }

        setIsRecoveryValid(true);
      } catch {
        setErrorMessage(ERROR_TEXT);
        setIsRecoveryValid(false);
      } finally {
        setIsCheckingRecovery(false);
      }
    };

    void bootstrapRecovery();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      toast.success("Password updated. Please log in with your new password.");
      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isRecoveryValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-playfair italic text-2xl text-foreground">Reset Link Invalid</CardTitle>
            <CardDescription className="font-jost text-muted-foreground">{errorMessage || ERROR_TEXT}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/login">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[3px] text-gold mb-2 font-jost">Password Recovery</p>
          <h1 className="font-playfair italic text-4xl text-foreground">Set New Password</h1>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-playfair italic text-xl">Create a new password</CardTitle>
            <CardDescription className="font-jost">Use at least 8 characters for your new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validation.newPassword && <p className="text-sm text-destructive">{validation.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validation.confirmPassword && <p className="text-sm text-destructive">{validation.confirmPassword}</p>}
              </div>

              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetNewPassword;
