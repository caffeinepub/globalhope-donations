import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsCallerAdmin } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function AdminPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  const isLoggingIn = loginStatus === "logging-in";
  const isLoggedIn = !!identity;

  useEffect(() => {
    if (isAdmin === true) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  const isLoading = isInitializing || adminLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="max-w-md w-full mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 card-shadow text-center"
          >
            {isLoading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
                <p className="text-muted-foreground">
                  Checking admin access...
                </p>
              </div>
            ) : isLoggedIn && isAdmin === false ? (
              <div className="space-y-5" data-ocid="admin.error_state">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Access Denied
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Your account does not have admin privileges. Contact the
                    platform owner if you believe this is an error.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                  Principal:{" "}
                  <span className="font-mono text-orange-600">
                    {identity?.getPrincipal().toString().slice(0, 20)}...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Admin Portal
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Log in with your Internet Identity to access the admin
                    dashboard.
                  </p>
                </div>

                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 shadow-donate"
                  data-ocid="admin.login_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-orange-50 rounded-lg p-3 text-left">
                  <Shield className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                  <span>
                    Internet Identity provides secure, privacy-preserving
                    authentication without passwords.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
