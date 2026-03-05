import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calcProgress,
  formatCurrency,
  formatDeadline,
  getCategoryInfo,
} from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Heart, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Campaign } from "../backend.d";
import CampaignImage from "./CampaignImage";

interface Props {
  campaign: Campaign;
  index?: number;
  ocidPrefix?: string;
}

export default function CampaignCard({
  campaign,
  index = 1,
  ocidPrefix = "campaign_card",
}: Props) {
  const progress = calcProgress(campaign.currentAmount, campaign.targetAmount);
  const categoryInfo = getCategoryInfo(campaign.category);
  const deadline = formatDeadline(campaign.deadline);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      data-ocid={`${ocidPrefix}.item.${index}`}
      className="bg-card rounded-xl overflow-hidden card-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col"
    >
      {/* Campaign image */}
      <div className="relative overflow-hidden h-48">
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryInfo.color}`}
          >
            {categoryInfo.label}
          </span>
        </div>
        {!campaign.isActive && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-700 text-gray-200">
              Closed
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
          {campaign.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(campaign.currentAmount, "USD")}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(campaign.targetAmount, "USD")}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs font-semibold text-orange-500">
              {progress}% funded
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>
              {campaign.category === "Education"
                ? "1,284"
                : campaign.category === "Medical"
                  ? "856"
                  : "2,143"}{" "}
              supporters
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{deadline}</span>
          </div>
        </div>

        <Button
          onClick={() =>
            navigate({ to: "/campaign/$id", params: { id: campaign.id } })
          }
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition-all hover:shadow-donate"
          data-ocid={`${ocidPrefix}.donate_button.${index}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Donate Now
        </Button>
      </div>
    </motion.div>
  );
}
