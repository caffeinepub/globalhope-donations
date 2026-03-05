import { Button } from "@/components/ui/button";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const LEGAL_PATHS = [
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/donor-privacy",
];

export default function CookieConsentBanner() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Hide on legal pages
  if (LEGAL_PATHS.includes(currentPath)) return null;

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleManage = () => {
    localStorage.setItem("cookie_consent", "managed");
    setVisible(false);
    navigate({ to: "/legal/cookies" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          aria-label="Cookie consent"
          data-ocid="cookie_consent.panel"
        >
          <div className="max-w-4xl mx-auto bg-foreground text-white rounded-2xl shadow-2xl border border-white/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white mb-0.5">
                  We use cookies
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  We use cookies to improve your experience and for analytics.
                  By continuing, you agree to our{" "}
                  <button
                    type="button"
                    onClick={handleManage}
                    className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                  >
                    Cookie Policy
                  </button>
                  .
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleManage}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                data-ocid="cookie_consent.manage_button"
              >
                Manage Preferences
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4"
                data-ocid="cookie_consent.accept_button"
              >
                Accept All
              </Button>
              <button
                type="button"
                onClick={handleAccept}
                aria-label="Close cookie banner"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                data-ocid="cookie_consent.close_button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
