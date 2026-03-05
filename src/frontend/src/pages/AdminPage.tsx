import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsCallerAdmin } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isLoggedIn = !!identity;
  const principalId = identity?.getPrincipal().toString();

  useEffect(() => {
    if (isAdmin === true) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  const isLoading = isInitializing || adminLoading;

  const handleCopyPrincipal = () => {
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      setCopied(true);
      toast.success("Principal ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ACCESS_STEPS = [
    {
      step: "1",
      title: "Login with Internet Identity",
      desc: "Click the login button above to authenticate.",
    },
    {
      step: "2",
      title: "Copy your Principal ID",
      desc: "After logging in, copy your Principal ID shown on screen.",
    },
    {
      step: "3",
      title: "Contact platform owner",
      desc: "Share your Principal ID with the platform owner to get admin role assigned.",
    },
    {
      step: "4",
      title: "Refresh the page",
      desc: "Once assigned, refresh this page to access the admin dashboard.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 bg-background">
        <div className="max-w-lg w-full mx-auto px-4 space-y-6">
          {/* Main login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 card-shadow border border-border"
          >
            {isLoading ? (
              <div className="space-y-4 text-center">
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
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Access Denied
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Your account does not have admin privileges. Contact the
                    platform owner with your Principal ID below.
                  </p>
                </div>

                {/* Principal ID box */}
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                    Your Principal ID
                  </p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs font-mono text-foreground break-all flex-1 leading-relaxed">
                      {principalId}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyPrincipal}
                      className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      data-ocid="admin.copy_principal_button"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Admin Access
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Contact the platform owner to get admin access assigned to
                    your account.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* How to get admin access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-6 card-shadow border border-border"
            data-ocid="admin.access_info_card"
          >
            <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              How to Get Admin Access
            </h3>
            <div className="space-y-3">
              {ACCESS_STEPS.map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={() => navigate({ to: "/admin/dashboard" })}
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-full justify-between"
                data-ocid="admin.dashboard_link"
              >
                <span>Already have access? Go to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
