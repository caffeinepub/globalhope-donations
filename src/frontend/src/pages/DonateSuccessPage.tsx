import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useStripeSessionStatus, useSubmitDonation } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Heart, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const CONFETTI_COLORS = [
  "oklch(0.68 0.19 46)",
  "oklch(0.72 0.21 55)",
  "oklch(0.62 0.17 150)",
  "oklch(0.55 0.20 260)",
  "oklch(0.75 0.16 84)",
];

function ConfettiPiece({
  color,
  x,
  duration,
  delay,
  size,
}: {
  color: string;
  x: number;
  duration: number;
  delay: number;
  size: number;
}) {
  return (
    <div
      className="confetti-piece fixed pointer-events-none"
      style={{
        left: `${x}%`,
        top: "-20px",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        zIndex: 50,
      }}
    />
  );
}

export default function DonateSuccessPage() {
  const navigate = useNavigate();

  // Parse search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  const campaignId = urlParams.get("campaignId");
  const currency = urlParams.get("currency") ?? "USD";
  const donorName = urlParams.get("donorName") ?? "Anonymous";
  const donorEmail = urlParams.get("donorEmail") ?? "";
  const donorPhone = urlParams.get("donorPhone") ?? "";
  const isAnonymous = urlParams.get("isAnonymous") === "true";
  const amountStr = urlParams.get("amount") ?? "0";
  const amountUSDStr = urlParams.get("amountUSD") ?? amountStr;

  const [donationSubmitted, setDonationSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const submitAttempted = useRef(false);

  const { data: sessionStatus, isLoading: statusLoading } =
    useStripeSessionStatus(sessionId);
  const { mutateAsync: submitDonation } = useSubmitDonation();

  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    x: Math.random() * 100,
    duration: 3 + Math.random() * 3,
    delay: Math.random() * 2,
    size: 6 + Math.floor(Math.random() * 10),
  }));

  useEffect(() => {
    async function handleSessionComplete() {
      if (
        sessionStatus?.__kind__ === "completed" &&
        !donationSubmitted &&
        !submitAttempted.current &&
        campaignId
      ) {
        submitAttempted.current = true;
        try {
          await submitDonation({
            campaignId,
            donorName: isAnonymous ? "Anonymous" : donorName,
            donorEmail: isAnonymous ? "" : donorEmail,
            donorPhone,
            amount: BigInt(amountStr),
            amountUSD: BigInt(amountUSDStr),
            currency,
            isAnonymous,
            paymentMethod: {
              __kind__: "stripe",
              stripe: {
                status: "completed",
                sessionId: sessionId ?? "",
              },
            },
          });
        } catch (err) {
          console.error("Failed to record donation:", err);
        } finally {
          setDonationSubmitted(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    }

    handleSessionComplete();
  }, [
    sessionStatus,
    donationSubmitted,
    campaignId,
    sessionId,
    submitDonation,
    donorName,
    donorEmail,
    donorPhone,
    amountStr,
    amountUSDStr,
    currency,
    isAnonymous,
  ]);

  const amount = Number(amountStr) / 100;
  const isProcessing =
    statusLoading ||
    (sessionStatus &&
      sessionStatus.__kind__ !== "completed" &&
      sessionStatus.__kind__ !== "failed");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti &&
          confettiPieces.map((p) => <ConfettiPiece key={p.id} {...p} />)}
      </AnimatePresence>

      <main className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="max-w-lg w-full mx-auto px-4 text-center">
          {isProcessing && !donationSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
              data-ocid="success.loading_state"
            >
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                Confirming Your Donation...
              </h2>
              <p className="text-muted-foreground">
                We're processing your payment. This should only take a moment.
              </p>
            </motion.div>
          ) : sessionStatus?.__kind__ === "failed" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
              data-ocid="success.error_state"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-destructive">
                Payment Failed
              </h2>
              <p className="text-muted-foreground">
                {sessionStatus.failed.error ||
                  "Your payment could not be processed. No charges were made."}
              </p>
              <Button
                onClick={() => navigate({ to: "/campaigns" })}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="space-y-6"
              data-ocid="success.success_state"
            >
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-14 h-14 text-green-500" />
              </motion.div>

              <div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                  Thank You! 🎉
                </h1>
                {!isAnonymous && donorName !== "Anonymous" && (
                  <p className="text-lg text-muted-foreground">
                    Your generosity,{" "}
                    <span className="font-semibold text-foreground">
                      {donorName}
                    </span>
                    , makes a real difference.
                  </p>
                )}
              </div>

              {/* Donation summary card */}
              <div className="bg-card rounded-2xl p-6 card-shadow border border-border text-left space-y-3">
                <h3 className="font-display font-bold text-lg text-center mb-4">
                  Donation Receipt
                </h3>
                <div className="divide-y divide-border">
                  {[
                    {
                      label: "Amount Donated",
                      value: `${currency} ${amount.toFixed(2)}`,
                    },
                    {
                      label: "Donor",
                      value: isAnonymous ? "Anonymous" : donorName,
                    },
                    { label: "Status", value: "✅ Payment Confirmed" },
                    ...(donorEmail
                      ? [{ label: "Receipt Sent To", value: donorEmail }]
                      : []),
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-2.5 text-sm"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your donation is fully processed and will go directly to the
                campaign beneficiaries. Thank you for changing lives! 💝
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate({ to: "/campaigns" })}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-donate"
                  data-ocid="success.primary_button"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Again
                </Button>
                <Button
                  onClick={() => navigate({ to: "/" })}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  data-ocid="success.secondary_button"
                >
                  Back to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Social share */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Share your good deed:
                </p>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const text = `I just donated ${currency} ${amount.toFixed(0)} to a life-changing cause on GlobalHope! Join me in making a difference. 💝`;
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`,
                        "_blank",
                      );
                    }}
                    className="text-xs"
                  >
                    Share on X
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const url = window.location.origin;
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                        "_blank",
                      );
                    }}
                    className="text-xs"
                  >
                    Share on Facebook
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
