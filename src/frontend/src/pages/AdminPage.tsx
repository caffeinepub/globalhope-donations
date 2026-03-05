import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Heart, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "ankitasingh.ltd@gmail.com";
const ADMIN_PASSWORD = "Ankitasingh7860@@";

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") === "true") {
      navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD
      ) {
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_email", ADMIN_EMAIL);
        // Signal that the admin token needs to be initialized on the actor.
        // useAdminActor watches this via the actor reference change triggered below.
        localStorage.setItem("admin_token_init_needed", Date.now().toString());
        // Force actor re-initialization so useAdminActor gets a fresh actor
        // reference and calls _initializeAccessControlWithSecret on it.
        queryClient.removeQueries({ queryKey: ["actor"] });
        queryClient.invalidateQueries({ queryKey: ["actor"] });
        navigate({ to: "/admin/dashboard" });
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card rounded-2xl p-8 card-shadow border border-border"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md orange-gradient flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight text-foreground">
                  Global<span className="text-orange-500">Hope</span>
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Admin Login
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to manage campaigns and donations
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="admin-email"
                  className="text-sm font-semibold text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="h-11"
                  data-ocid="admin.email_input"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="admin-password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="h-11 pr-11"
                    data-ocid="admin.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200"
                  data-ocid="admin.error_state"
                >
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                data-ocid="admin.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              This area is restricted to authorized administrators only.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
