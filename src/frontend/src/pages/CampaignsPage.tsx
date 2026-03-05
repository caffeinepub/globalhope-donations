import CampaignCard from "@/components/CampaignCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveCampaigns } from "@/hooks/useQueries";
import { calcProgress, formatCurrency, getCategoryInfo } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Heart, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Medical",
  "Education",
  "Disaster Relief",
  "Animal Welfare",
  "Environment",
];

const SAMPLE_CAMPAIGNS_DATA = [
  {
    id: "s1",
    title: "Emergency Medical Care for 500 Children in Rural Kenya",
    description:
      "Provide life-saving vaccinations, nutrition support, and basic medical care to children in remote Kenyan villages.",
    category: "Medical",
    current: 3240000n,
    target: 5000000n,
    supporters: 856,
    daysLeft: 30,
  },
  {
    id: "s2",
    title: "Build 10 Classrooms for Girls Education in Afghanistan",
    description:
      "Help construct safe, secure classrooms to ensure young girls can continue their education.",
    category: "Education",
    current: 7800000n,
    target: 10000000n,
    supporters: 1284,
    daysLeft: 45,
  },
  {
    id: "s3",
    title: "Flood Relief: Rebuild 200 Homes in Bangladesh",
    description:
      "The monsoon floods devastated entire communities. Help rebuild safe shelters for 200 displaced families.",
    category: "Disaster Relief",
    current: 15600000n,
    target: 20000000n,
    supporters: 2143,
    daysLeft: 20,
  },
  {
    id: "s4",
    title: "Rescue & Rehabilitate 1000 Street Dogs in Mumbai",
    description:
      "Feed, vaccinate and find loving homes for street dogs suffering on Mumbai's streets.",
    category: "Animal Welfare",
    current: 1200000n,
    target: 3000000n,
    supporters: 432,
    daysLeft: 60,
  },
  {
    id: "s5",
    title: "Plant 100,000 Trees to Fight Deforestation in Amazon",
    description:
      "Restore critical Amazon rainforest habitat by planting native tree species with local communities.",
    category: "Environment",
    current: 5500000n,
    target: 8000000n,
    supporters: 1876,
    daysLeft: 90,
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  Medical: "/assets/generated/campaign-medical.dim_600x400.jpg",
  Education: "/assets/generated/campaign-education.dim_600x400.jpg",
  "Disaster Relief": "/assets/generated/campaign-disaster.dim_600x400.jpg",
  "Animal Welfare": "/assets/generated/campaign-animal-welfare.dim_600x400.jpg",
  Environment: "/assets/generated/campaign-environment.dim_600x400.jpg",
};

function SampleCampaignCard({
  campaign,
  index,
  navigate,
}: {
  campaign: (typeof SAMPLE_CAMPAIGNS_DATA)[0];
  index: number;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const progress = calcProgress(campaign.current, campaign.target);
  const catInfo = getCategoryInfo(campaign.category);
  const imgSrc =
    CATEGORY_IMAGES[campaign.category] ||
    "/assets/generated/campaign-disaster.dim_600x400.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      data-ocid={`campaign_list.item.${index}`}
      className="bg-card rounded-xl overflow-hidden card-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={imgSrc}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catInfo.color}`}
          >
            {catInfo.label}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {campaign.daysLeft}d left
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
          {campaign.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {campaign.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(campaign.current, "USD")}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(campaign.target, "USD")}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs font-semibold text-orange-500">
              {progress}% funded
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{campaign.supporters.toLocaleString()} supporters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{campaign.daysLeft} days left</span>
          </div>
        </div>

        <Button
          onClick={() => navigate({ to: "/campaigns" })}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition-all hover:shadow-donate"
          data-ocid={`campaign_list.donate_button.${index}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Donate Now
        </Button>
      </div>
    </motion.div>
  );
}

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useActiveCampaigns();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filtered = (campaigns ?? []).filter((c) => {
    const matchesCat =
      selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sample campaigns filtered by category
  const filteredSamples = SAMPLE_CAMPAIGNS_DATA.filter(
    (c) => selectedCategory === "All" || c.category === selectedCategory,
  ).filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasRealCampaigns = (campaigns?.length ?? 0) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              All <span className="text-orange-400">Campaigns</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              Browse verified campaigns and choose where your donation makes the
              most impact.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-ocid="campaigns.search_input"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    data-ocid={`campaigns.${cat.toLowerCase().replace(/\s+/g, "_")}.tab`}
                    className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((sk) => (
                <div
                  key={sk}
                  className="bg-card rounded-xl overflow-hidden card-shadow"
                  data-ocid="campaigns.loading_state"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasRealCampaigns && filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filtered.length} campaign
                {filtered.length !== 1 ? "s" : ""}
                {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((campaign, i) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={i + 1}
                    ocidPrefix="campaign_list"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Sample campaigns note */}
              {!hasRealCampaigns && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800">
                      Sample campaigns shown
                    </p>
                    <p className="text-orange-700 text-xs mt-0.5">
                      Admin can create real campaigns from the dashboard. These
                      are illustrative examples.
                    </p>
                  </div>
                </div>
              )}

              {filteredSamples.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Showing {filteredSamples.length} sample campaign
                    {filteredSamples.length !== 1 ? "s" : ""}
                    {selectedCategory !== "All"
                      ? ` in ${selectedCategory}`
                      : ""}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSamples.map((campaign, i) => (
                      <SampleCampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        index={i + 1}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  data-ocid="campaigns.empty_state"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-orange-300" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    No campaigns match &quot;{searchQuery}&quot;. Try a
                    different search term.
                  </p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50"
                    data-ocid="campaigns.clear_search_button"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
