import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { requestPasswordReset } from "@/lib/requestPasswordReset";
import {
  CALENDAR_KIOSK_USERNAME,
  getSchedulePortalHome,
  isCalendarSubdomain,
  mainSiteUrl,
  resolveCalendarLoginEmail,
} from "@/lib/schedulePortalHost";

const STAFF_ROLES = new Set(["admin", "staff", "provider", "business_admin"]);

interface SchedulePortalLoginProps {
  kioskMode?: boolean;
}

function safeNext(path: string | null, home: string): string {
  if (!path) return home;
  if (path === "/" || path.startsWith("/calendar")) return path === "/" ? home : path;
  return home;
}

const SchedulePortalLogin = ({ kioskMode: kioskModeProp }: SchedulePortalLoginProps) => {
  const onCalendarHost = kioskModeProp ?? isCalendarSubdomain();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalHome = getSchedulePortalHome();
  const next = safeNext(searchParams.get("next"), portalHome);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href");
    if (link) link.setAttribute("href", "/calendar-manifest.json");
    document.documentElement.classList.add("schedule-portal");
    return () => {
      document.documentElement.classList.remove("schedule-portal");
      if (link && prev) link.setAttribute("href", prev);
    };
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setCheckingSession(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      if (roles?.some((r) => STAFF_ROLES.has(r.role))) {
        navigate(next, { replace: true });
        return;
      }
      await supabase.auth.signOut();
      setCheckingSession(false);
    };
    void check();
  }, [navigate, next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email = resolveCalendarLoginEmail(username);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Sign-in failed");

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (roleError) throw roleError;

      if (!roles?.some((r) => STAFF_ROLES.has(r.role))) {
        await supabase.auth.signOut();
        toast.error("This calendar is for authorized clinic staff only.");
        return;
      }

      navigate(next, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not sign in";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(resetEmail, "staff");
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("If that email is on file, a reset link was sent.");
      setForgotMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#2A2826]">
        <Loader2 className="h-8 w-8 animate-spin text-[#B8956A]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EHA Calendar — Sign in</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="manifest" href="/calendar-manifest.json" />
      </Helmet>

      <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-[#F2EBDC]">
        {/* Brand panel — visible on desktop */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#2A2826] text-[#F2EBDC] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,#B8956A_0%,transparent_50%)]" />
          <div className="relative">
            <p className="font-jost text-xs uppercase tracking-[0.35em] text-[#B8956A] mb-6">
              Elevated Health Augusta
            </p>
            <h1 className="font-playfair text-5xl leading-tight">
              Your clinic
              <br />
              <span className="italic text-[#B8956A]">schedule</span>
            </h1>
            <p className="font-jost text-sm text-[#F2EBDC]/70 mt-6 max-w-md leading-relaxed">
              Appointments, IV walk-ins, and consult visits in one place. Sign in to view and
              manage the day — patient details stay behind this login.
            </p>
          </div>
          <div className="relative flex items-center gap-3 text-[#F2EBDC]/50 font-jost text-xs">
            <Lock className="h-4 w-4 text-[#B8956A]" />
            Staff-only · HIPAA-protected schedule data
          </div>
        </div>

        {/* Login panel */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-10">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-xl bg-[#2A2826] flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-[#B8956A]" />
            </div>
            <div>
              <p className="font-jost text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Elevated Health
              </p>
              <h1 className="font-playfair text-2xl text-foreground">Calendar</h1>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="font-playfair text-3xl text-foreground">
                {forgotMode ? "Reset password" : "Sign in"}
              </h2>
              <p className="font-jost text-sm text-muted-foreground mt-2">
                {forgotMode
                  ? "Enter your staff email and we will send a reset link."
                  : "Use your staff email, or username calendar for the shared clinic login. Initial password is set by the clinic — change anytime via Forgot password."}
              </p>
            </div>

            {forgotMode ? (
              <form onSubmit={handleForgot} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="font-jost">Staff email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 bg-background"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-jost" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-primary font-jost"
                  onClick={() => setForgotMode(false)}
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-jost">Email or username</Label>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={`staff email or ${CALENDAR_KIOSK_USERNAME}`}
                    required
                    disabled={isLoading}
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-jost">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 bg-background pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-jost bg-[#2A2826] hover:bg-[#2A2826]/90 text-[#F2EBDC]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Open Calendar"
                  )}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-primary font-jost"
                  onClick={() => {
                    setForgotMode(true);
                    setResetEmail(username.includes("@") ? username : "");
                  }}
                >
                  Forgot password?
                </button>
              </form>
            )}

            {!onCalendarHost && (
              <p className="mt-10 font-jost text-xs text-muted-foreground text-center">
                Full clinical portal{" "}
                <a href={mainSiteUrl("/admin/login")} className="text-primary underline-offset-4 hover:underline">
                  staff sign-in
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SchedulePortalLogin;
