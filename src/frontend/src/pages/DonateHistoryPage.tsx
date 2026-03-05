import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDonationStats } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import { Heart, History, Loader2, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LocalDonation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  isAnonymous: boolean;
}

function loadLocalDonations(email: string): LocalDonation[] {
  try {
    const all: LocalDonation[] = JSON.parse(
      localStorage.getItem("donations_history") ?? "[]",
    );
    return all.filter(
      (d) => d.donorEmail.toLowerCase() === email.toLowerCase(),
    );
  } catch {
    return [];
  }
}

export default function DonateHistoryPage() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<LocalDonation[]>([]);

  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDonationStats();
  const [totalRaised, totalDonations] = stats ?? [0n, 0n];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSearching(true);
    setSearchEmail(email.trim());

    setTimeout(() => {
      const found = loadLocalDonations(email.trim());
      setResults(found);
      setHasSearched(true);
      setIsSearching(false);
    }, 600);
  };

  const totalPersonal = results.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="py-16 bg-foreground text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 70%, oklch(0.68 0.19 46) 0%, transparent 50%), radial-gradient(circle at 70% 30%, oklch(0.72 0.21 55) 0%, transparent 50%)",
            }}
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-2xl orange-gradient flex items-center justify-center mx-auto mb-5">
                <History className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                Donation History
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto">
                Look up your previous donations by email address. Track your
                impact and see where your generosity has gone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {statsLoading ? (
              <div className="flex gap-8 justify-center">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-orange-500">
                    {formatCurrency(totalRaised, "USD")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 justify-center">
                    <Heart className="w-3.5 h-3.5 text-orange-400 fill-orange-100" />
                    Total Raised Globally
                  </div>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-foreground">
                    {totalDonations.toString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 justify-center">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    Total Donations Made
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 card-shadow border border-border"
            >
              <div className="text-center mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Look Up Your Donations
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Enter your email address to see your donation history. If you
                  made donations in this session, they will appear here.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="history-email"
                    className="text-sm font-semibold"
                  >
                    Your Email Address
                  </Label>
                  <Input
                    id="history-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSearching}
                    autoComplete="email"
                    className="h-12 text-base"
                    data-ocid="donate_history.email_input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSearching || !email.trim()}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all hover:scale-[1.01]"
                  data-ocid="donate_history.search_button"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Look Up My Donations
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 leading-relaxed text-center">
                  <strong>Note:</strong> Donation history is stored locally in
                  your browser. Donations made on other devices or browsers may
                  not appear here.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pb-16 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-5xl mx-auto">
              {results.length === 0 ? (
                <div
                  className="bg-card rounded-2xl p-12 card-shadow border border-border text-center"
                  data-ocid="donate_history.empty_state"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    No donations found
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    No donation records were found for{" "}
                    <strong>{searchEmail}</strong>. Donations are tracked
                    locally in your current browser session.
                  </p>
                  <Button
                    onClick={() => navigate({ to: "/campaigns" })}
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Make Your First Donation
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl p-5 card-shadow border border-border text-center">
                      <div className="font-display text-2xl font-bold text-orange-500">
                        {results.length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Total Donations
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-5 card-shadow border border-border text-center">
                      <div className="font-display text-2xl font-bold text-foreground">
                        ${totalPersonal.toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Total Contributed
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-5 card-shadow border border-border text-center">
                      <div className="font-display text-2xl font-bold text-foreground">
                        {new Set(results.map((r) => r.campaignId)).size}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Campaigns Supported
                      </div>
                    </div>
                  </div>

                  {/* Results table */}
                  <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                      <h3 className="font-display font-bold text-lg">
                        Your Donation History
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Showing donations for {searchEmail}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table data-ocid="donate_history.table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Anonymous</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((donation, i) => (
                            <TableRow
                              key={donation.id}
                              data-ocid={`donate_history.item.${i + 1}`}
                            >
                              <TableCell className="font-medium text-sm max-w-[180px]">
                                <span className="line-clamp-1">
                                  {donation.campaignTitle || "Campaign"}
                                </span>
                              </TableCell>
                              <TableCell className="font-semibold text-orange-600">
                                {donation.currency} {donation.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {donation.currency}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {donation.paymentMethod}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {new Date(
                                  donation.createdAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    donation.isAnonymous
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {donation.isAnonymous ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}
