import CampaignCard from "@/components/CampaignCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveCampaigns } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { Inbox, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Medical",
  "Education",
  "Disaster Relief",
  "Animal Welfare",
  "Environment",
  "Children",
];

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
          ) : filtered.length > 0 ? (
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
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              data-ocid="campaigns.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-orange-300" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No campaigns found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery
                  ? `No campaigns match "${searchQuery}". Try a different search.`
                  : `No ${selectedCategory === "All" ? "" : `${selectedCategory} `}campaigns are currently active.`}
              </p>
              {/* Show sample content when no real campaigns exist */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl">
                {["Medical Aid", "Education", "Disaster Relief"].map(
                  (cat, i) => (
                    <div
                      key={cat}
                      className="bg-card rounded-xl p-4 card-shadow"
                    >
                      <div className="text-2xl mb-2">
                        {["🏥", "📚", "🆘"][i]}
                      </div>
                      <div className="font-semibold text-sm text-foreground mb-1">
                        {cat}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Admin can create campaigns from the dashboard
                      </div>
                    </div>
                  ),
                )}
              </div>
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="outline"
                className="mt-6 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
