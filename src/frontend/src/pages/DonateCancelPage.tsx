import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function DonateCancelPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("campaignId");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
              <XCircle className="w-14 h-14 text-orange-400" />
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                Donation Cancelled
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                No worries — your donation was cancelled and no charges were
                made to your payment method.
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
              <p className="text-sm text-orange-700 leading-relaxed">
                <span className="font-semibold">Changed your mind?</span> You
                can always come back and donate when you're ready. Every
                contribution, no matter the size, makes a real difference in
                someone's life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {campaignId && (
                <Button
                  onClick={() =>
                    navigate({
                      to: "/campaign/$id",
                      params: { id: campaignId },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-donate"
                  data-ocid="cancel.retry_button"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button
                onClick={() => navigate({ to: "/campaigns" })}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
                data-ocid="cancel.back_button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
