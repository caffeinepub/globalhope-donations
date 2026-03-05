import { campaignDetailRoute } from "@/App";
import CampaignImage from "@/components/CampaignImage";
import DonationForm from "@/components/DonationForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaign, useCampaignStats } from "@/hooks/useQueries";
import {
  calcProgress,
  formatCurrency,
  formatDate,
  formatDeadline,
  getCategoryInfo,
} from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Heart,
  Play,
  Share2,
  Target,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export default function CampaignDetailPage() {
  const { id } = campaignDetailRoute.useParams();
  const navigate = useNavigate();

  const { data: campaign, isLoading, isError } = useCampaign(id);
  const { data: stats } = useCampaignStats(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-5">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20" data-ocid="campaign.error_state">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              Campaign Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              This campaign may have ended or the link is incorrect.
            </p>
            <Button
              onClick={() => navigate({ to: "/campaigns" })}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Browse Campaigns
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = calcProgress(campaign.currentAmount, campaign.targetAmount);
  const categoryInfo = getCategoryInfo(campaign.category);
  const totalRaised = stats?.totalRaised ?? campaign.currentAmount;
  const supporterCount = stats?.supporterCount ?? 0n;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/campaigns" })}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Campaigns
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* ─── Left: Campaign Info ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 space-y-8"
            >
              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryInfo.color}`}
                  >
                    {categoryInfo.label}
                  </span>
                  {!campaign.isActive && (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                  {campaign.title}
                </h1>
              </div>

              {/* Main image */}
              <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
                <CampaignImage
                  imageId={campaign.imageIds?.[0]}
                  fallbackSrc={
                    campaign.category === "Education"
                      ? "/assets/generated/campaign-education.dim_600x400.jpg"
                      : campaign.category === "Medical"
                        ? "/assets/generated/campaign-medical.dim_600x400.jpg"
                        : "/assets/generated/campaign-disaster.dim_600x400.jpg"
                  }
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Progress stats */}
              <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-display text-2xl font-bold text-orange-500">
                      {formatCurrency(totalRaised, "USD")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Amount Raised
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Users className="w-5 h-5 text-orange-400" />
                      {supporterCount.toString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Supporters
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="font-semibold text-sm">
                      {formatDeadline(campaign.deadline)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Deadline
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      {progress}% funded
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Goal: {formatCurrency(campaign.targetAmount, "USD")}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>
                      Target: {formatCurrency(campaign.targetAmount, "USD")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                    <Clock className="w-4 h-4" />
                    <span>Ends {formatDate(campaign.deadline)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <h2 className="font-display text-xl font-bold text-foreground mb-3">
                  About This Campaign
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {/* Image gallery */}
              {campaign.imageIds && campaign.imageIds.length > 1 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {campaign.imageIds.map((imgId, i) => (
                      <div
                        key={imgId}
                        className="rounded-xl overflow-hidden aspect-square bg-muted"
                      >
                        <CampaignImage
                          imageId={imgId}
                          alt={`${campaign.title} image ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video links */}
              {campaign.videoUrls && campaign.videoUrls.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Videos
                  </h2>
                  <div className="space-y-3">
                    {campaign.videoUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-orange-300 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <Play className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-orange-500 transition-colors">
                            Watch Campaign Video
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {url}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="flex items-center gap-3 py-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Share:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: campaign.title,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Campaign
                </Button>
              </div>
            </motion.div>

            {/* ─── Right: Donation Form (sticky) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-24">
                {campaign.isActive ? (
                  <DonationForm campaign={campaign} />
                ) : (
                  <div className="bg-card rounded-2xl p-6 card-shadow text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-display font-bold text-lg mb-2">
                      Campaign Ended
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This campaign has ended. Browse other active campaigns to
                      make a difference.
                    </p>
                    <Button
                      onClick={() => navigate({ to: "/campaigns" })}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    >
                      Browse Active Campaigns
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
