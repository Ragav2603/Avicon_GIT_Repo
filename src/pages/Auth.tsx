import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Blocklist of personal email providers
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "protonmail.com", "proton.me", "mail.com", "live.com",
  "msn.com", "yandex.com", "zoho.com", "gmx.com", "fastmail.com",
  "tutanota.com", "mailinator.com", "guerrillamail.com", "tempmail.com",
  "10minutemail.com", "throwaway.email", "sharklasers.com", "inbox.com",
  "me.com", "mac.com", "qq.com", "163.com", "126.com", "sina.com",
  "rediffmail.com", "ymail.com", "rocketmail.com", "att.net", "comcast.net",
  "verizon.net", "sbcglobal.net", "bellsouth.net", "cox.net", "earthlink.net"
];

const isCompanyEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
};

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .refine(isCompanyEmail, "Personal email addresses are not allowed. Please use your company email address (e.g., you@yourcompany.com)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { signIn, signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect password recovery flow from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    
    if (type === "recovery" && accessToken) {
      // User arrived via password reset link - switch to reset mode
      setMode("reset");
      // Clean up URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Don't redirect when in reset mode - user needs to set new password
    if (mode === "reset") return;
    
    if (!loading && user) {
      if (role) {
        navigate(getRoleDashboard(role));
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, role, loading, navigate, mode]);

  // Note: Invite code validation is performed server-side in the verify-role edge function
  // for security reasons. Client-side validation was removed to prevent code enumeration.
  const getRoleDashboard = (userRole: string) => {
    switch (userRole) {
      case "airline":
        return "/airline-dashboard";
      case "vendor":
        return "/vendor-dashboard";
      case "consultant":
        return "/consultant-dashboard";
      default:
        return "/onboarding";
    }
  };

  const validateForm = () => {
    try {
      if (mode === "forgot") {
        emailSchema.parse({ email });
      } else if (mode === "signup") {
        signupSchema.parse({ email, password });
      } else if (mode === "reset") {
        resetPasswordSchema.parse({ password, confirmPassword });
      } else {
        authSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
          if (err.path[0] === "confirmPassword") fieldErrors.confirmPassword = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Check Your Email",
        description: "We sent you a password reset link. Check your inbox!",
      });
      setMode("login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully changed. You can now sign in.",
      });
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      handleForgotPassword();
      return;
    }

    if (mode === "reset") {
      handleResetPassword();
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      } else {
        // Store invite code in sessionStorage for onboarding
        if (inviteCode.trim()) {
          sessionStorage.setItem('inviteCode', inviteCode.trim());
        }
        
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Sign Up Failed",
              description: "An account with this email already exists. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to confirm your account, or continue to set up your profile.",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Welcome Back";
      case "signup":
        return "Create Your Account";
      case "forgot":
        return "Reset Password";
      case "reset":
        return "Set New Password";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login":
        return "Sign in to access your dashboard";
      case "signup":
        return "Get started with AviCon today";
      case "forgot":
        return "Enter your email to receive a reset link";
      case "reset":
        return "Enter your new password below";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Plane className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white">
              Avi<span className="text-sky-300">Con</span>
            </span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Transform Your Aviation Operations
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Join the platform that connects airlines with verified vendors and provides actionable adoption insights.
            </p>
          </motion.div>

          <div className="mt-12 space-y-4">
            {["AI-Powered RFP Matching", "Verified Vendor Network", "Adoption Analytics "].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="h-2 w-2 rounded-full bg-sky-300" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">
                Avi<span className="gradient-text">Con</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">{getTitle()}</h2>
            <p className="text-muted-foreground mt-2">{getSubtitle()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field - hidden in reset mode */}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
              </div>
            )}

            {/* Password field - shown for login, signup, and reset modes */}
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">{mode === "reset" ? "New Password" : "Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password}</p>}
              </div>
            )}

            {/* Confirm password field - only for reset mode */}
            {mode === "reset" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invite code if you have one"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Have an invite code? Enter it here to auto-verify your account. Code will be validated during registration.
                </p>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Link"}
                  {mode === "reset" && "Update Password"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {(mode === "forgot" || mode === "reset") ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-primary hover:underline"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to AviCon's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
