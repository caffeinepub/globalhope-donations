import CampaignCard from "@/components/CampaignCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActiveCampaigns } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Globe,
  Heart,
  Home,
  Send,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const IMPACT_ITEMS = [
  {
    icon: BookOpen,
    amount: "$10",
    description: "Provides school supplies for one child for a full year",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Stethoscope,
    amount: "$25",
    description: "Funds vaccinations and preventative care for 5 children",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Home,
    amount: "$50",
    description: "Helps rebuild a family's shelter after a natural disaster",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Globe,
    amount: "$100",
    description:
      "Provides clean water access for an entire village for a month",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

const STATS = [
  { value: "2.4M+", label: "Lives Impacted" },
  { value: "$18M+", label: "Funds Raised" },
  { value: "340+", label: "Active Campaigns" },
  { value: "95%", label: "Funds to Beneficiaries" },
];

export default function HomePage() {
  const { data: campaigns, isLoading } = useActiveCampaigns();
  const featuredCampaigns = campaigns?.slice(0, 3) ?? [];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1400x600.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-200 text-sm font-medium px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Heart className="w-3.5 h-3.5 fill-orange-300 text-orange-300" />
              Together, we make a difference
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Donate Today
              <br />
              <span className="text-orange-400 font-serif italic">
                to Save a Life
              </span>
            </h1>

            <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-xl">
              Join thousands of donors making a real difference. Support
              verified campaigns in medical care, education, disaster relief,
              and more.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate({ to: "/campaigns" })}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-donate text-base px-8 py-6 h-auto transition-all hover:scale-105"
                data-ocid="hero.donate_button"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donate Now
              </Button>

              <Button
                onClick={() => navigate({ to: "/campaigns" })}
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-semibold text-base px-8 py-6 h-auto backdrop-blur-sm"
              >
                View All Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="absolute bottom-8 right-8 hidden lg:block"
        >
          <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-5 text-white min-w-[220px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-white/70">
                Live Fundraising
              </span>
            </div>
            <div className="text-3xl font-display font-bold mb-0.5">$18M+</div>
            <div className="text-sm text-white/60">raised this year alone</div>
          </div>
        </motion.div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────────────── */}
      <section className="bg-orange-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-2xl font-display font-bold">
                  {stat.value}
                </div>
                <div className="text-sm text-orange-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Campaigns ────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Active Campaigns
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-2 mb-4">
              Campaigns Needing Your Help
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every campaign is verified by our team. Your donation goes
              directly to those in need.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl overflow-hidden card-shadow"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign, i) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  index={i + 1}
                />
              ))}
            </div>
          ) : (
            /* Fallback sample campaigns when none exist yet */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_CAMPAIGNS.map((campaign, i) => (
                <SampleCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  index={i + 1}
                  navigate={navigate}
                />
              ))}
            </div>
          )}

          {(campaigns?.length ?? 0) > 3 && (
            <div className="text-center mt-10">
              <Button
                onClick={() => navigate({ to: "/campaigns" })}
                variant="outline"
                size="lg"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold"
              >
                View All Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Impact Breakdown ──────────────────────────────────── */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Your Impact
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-2 mb-4">
              What Your Donation Can Do
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Even a small contribution creates meaningful, lasting change for
              those in need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_ITEMS.map((item, i) => (
              <motion.div
                key={item.amount}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-xl p-6 text-center card-shadow hover:-translate-y-1 transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="font-display text-3xl font-bold text-orange-500 mb-2">
                  {item.amount}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Trust Us ──────────────────────────────────────── */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
                Why GlobalHope
              </span>
              <h2 className="font-display text-4xl font-bold text-foreground mt-2 mb-6">
                Transparent, Secure & Impactful Giving
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We believe every dollar should count. GlobalHope ensures that
                95% of your donation reaches beneficiaries directly, with full
                transparency and real-time impact tracking.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: "Bank-Level Security",
                    desc: "All transactions encrypted with 256-bit SSL. Powered by Stripe.",
                  },
                  {
                    icon: Users,
                    title: "Verified Campaigns",
                    desc: "Every campaign is manually verified by our team before going live.",
                  },
                  {
                    icon: Award,
                    title: "Trusted Globally",
                    desc: "Operating in 60+ countries with 340+ active campaigns.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img
                  src="/assets/generated/campaign-education.dim_600x400.jpg"
                  alt="Children in school"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-orange-500 rounded-2xl p-5 text-white shadow-donate">
                <div className="text-3xl font-display font-bold">95%</div>
                <div className="text-sm text-orange-100">
                  Funds to beneficiaries
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Get in Touch
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-2 mb-4">
              We'd Love to Hear From You
            </h2>
            <p className="text-muted-foreground">
              Have questions about a campaign or want to partner with us? Drop
              us a message.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-2xl p-8 card-shadow"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent! We'll get back to you within 24 hours.");
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="contact-name"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    data-ocid="contact.name_input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-email"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    data-ocid="contact.email_input"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="contact-message"
                  className="text-sm font-semibold mb-1.5 block"
                >
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us how we can help..."
                  rows={4}
                  required
                  data-ocid="contact.textarea"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 shadow-donate"
                data-ocid="contact.submit_button"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Sample campaigns for first-load feel ─── */
const SAMPLE_CAMPAIGNS = [
  {
    id: "sample-1",
    title: "Emergency Medical Care for 500 Children in Rural Kenya",
    description:
      "Provide life-saving vaccinations, nutrition support, and basic medical care to children in remote Kenyan villages who have no access to healthcare.",
    category: "Medical",
    currentAmount: 3240000n,
    targetAmount: 5000000n,
    imageIds: [] as string[],
    isActive: true,
    deadline: BigInt((Date.now() + 30 * 24 * 60 * 60 * 1000) * 1_000_000),
  },
  {
    id: "sample-2",
    title: "Build 10 Classrooms for Girls' Education in Afghanistan",
    description:
      "Help construct safe, secure classrooms to ensure young girls can continue their education despite ongoing challenges in their communities.",
    category: "Education",
    currentAmount: 7800000n,
    targetAmount: 10000000n,
    imageIds: [] as string[],
    isActive: true,
    deadline: BigInt((Date.now() + 45 * 24 * 60 * 60 * 1000) * 1_000_000),
  },
  {
    id: "sample-3",
    title: "Flood Relief: Rebuild 200 Homes in Bangladesh",
    description:
      "The 2025 monsoon floods devastated entire communities. Help us rebuild safe shelters for 200 displaced families before winter arrives.",
    category: "Disaster Relief",
    currentAmount: 15600000n,
    targetAmount: 20000000n,
    imageIds: [] as string[],
    isActive: true,
    deadline: BigInt((Date.now() + 20 * 24 * 60 * 60 * 1000) * 1_000_000),
  },
  {
    id: "sample-4",
    title: "Rescue & Rehabilitate 1000 Street Dogs in Mumbai",
    description:
      "Feed, vaccinate and find loving homes for street dogs suffering on Mumbai's streets.",
    category: "Animal Welfare",
    currentAmount: 1200000n,
    targetAmount: 3000000n,
    imageIds: [] as string[],
    isActive: true,
    deadline: BigInt((Date.now() + 60 * 24 * 60 * 60 * 1000) * 1_000_000),
  },
  {
    id: "sample-5",
    title: "Plant 100,000 Trees to Fight Deforestation in Amazon",
    description:
      "Restore critical Amazon rainforest habitat by planting native tree species with local communities.",
    category: "Environment",
    currentAmount: 5500000n,
    targetAmount: 8000000n,
    imageIds: [] as string[],
    isActive: true,
    deadline: BigInt((Date.now() + 90 * 24 * 60 * 60 * 1000) * 1_000_000),
  },
];

type NavigateFn = ReturnType<typeof useNavigate>;

function SampleCampaignCard({
  campaign,
  index,
  navigate,
}: {
  campaign: (typeof SAMPLE_CAMPAIGNS)[0];
  index: number;
  navigate: NavigateFn;
}) {
  function calcProgress(current: bigint, target: bigint): number {
    if (target === 0n) return 0;
    return Math.min(Number((current * 100n) / target), 100);
  }
  function formatCurrency(cents: bigint): string {
    return `$${(Number(cents) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }

  const progress = calcProgress(campaign.currentAmount, campaign.targetAmount);
  const catColors: Record<string, string> = {
    Medical: "bg-red-100 text-red-700",
    Education: "bg-blue-100 text-blue-700",
    "Disaster Relief": "bg-orange-100 text-orange-700",
    "Animal Welfare": "bg-green-100 text-green-700",
    Environment: "bg-emerald-100 text-emerald-700",
  };
  const catImages: Record<string, string> = {
    Medical: "/assets/generated/campaign-medical.dim_600x400.jpg",
    Education: "/assets/generated/campaign-education.dim_600x400.jpg",
    "Disaster Relief": "/assets/generated/campaign-disaster.dim_600x400.jpg",
    "Animal Welfare":
      "/assets/generated/campaign-animal-welfare.dim_600x400.jpg",
    Environment: "/assets/generated/campaign-environment.dim_600x400.jpg",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      data-ocid={`campaign_card.item.${index}`}
      className="bg-card rounded-xl overflow-hidden card-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={catImages[campaign.category]}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColors[campaign.category]}`}
          >
            {campaign.category}
          </span>
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
              {formatCurrency(campaign.currentAmount)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(campaign.targetAmount)}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-semibold text-orange-500">
              {progress}% funded
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>
            👥{" "}
            {campaign.category === "Medical"
              ? "856"
              : campaign.category === "Education"
                ? "1,284"
                : campaign.category === "Animal Welfare"
                  ? "432"
                  : campaign.category === "Environment"
                    ? "1,876"
                    : "2,143"}{" "}
            supporters
          </span>
          <span>
            {campaign.category === "Medical"
              ? "30"
              : campaign.category === "Education"
                ? "45"
                : campaign.category === "Animal Welfare"
                  ? "60"
                  : campaign.category === "Environment"
                    ? "90"
                    : "20"}{" "}
            days left
          </span>
        </div>

        <Button
          onClick={() => navigate({ to: "/campaigns" })}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition-all hover:shadow-donate"
          data-ocid={`campaign_card.donate_button.${index}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Donate Now
        </Button>
      </div>
    </motion.div>
  );
}
