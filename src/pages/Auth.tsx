import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, Shield } from "lucide-react";

type AuthMode = "patient" | "provider";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        redirectBasedOnRole(session.user.id);
      }
    };
    checkAuth();

    // Listen for auth changes (magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          redirectBasedOnRole(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const redirectBasedOnRole = async (userId: string) => {
    // Check if user has admin/staff role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "staff");
    
    if (isAdmin) {
      navigate("/provider/dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/patient/dashboard`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast.success("Check your email for the login link!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Welcome back!");
      // Redirect handled by onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-cormorant text-3xl text-foreground mb-4">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We sent a login link to <span className="font-medium text-foreground">{email}</span>. 
            Click the link in the email to sign in securely.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">
            {mode === "patient" ? "Patient Portal" : "Provider Portal"}
          </p>
          <h1 className="font-cormorant text-3xl text-foreground">Réveil</h1>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-cormorant text-xl">
              {mode === "patient" ? "Welcome Back" : "Provider Login"}
            </CardTitle>
            <CardDescription>
              {mode === "patient" 
                ? "Enter your email to receive a secure login link" 
                : "Sign in with your credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "patient" ? (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Login Link
                </Button>
              </form>
            ) : (
              <form onSubmit={handleProviderLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-email">Email</Label>
                  <Input
                    id="provider-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-password">Password</Label>
                  <Input
                    id="provider-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In
                </Button>
              </form>
            )}

            {/* Mode Toggle */}
            <div className="mt-6 pt-4 border-t border-border">
              {mode === "patient" ? (
                <button
                  onClick={() => setMode("provider")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Provider Login
                </button>
              ) : (
                <button
                  onClick={() => setMode("patient")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Patient Login
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;