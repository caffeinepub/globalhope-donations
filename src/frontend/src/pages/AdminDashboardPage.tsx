import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAllCampaigns,
  useAllDonations,
  useDeleteCampaign,
  useDonationStats,
  useIsCallerAdmin,
  useToggleCampaignStatus,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate, getCategoryInfo } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import {
  DollarSign,
  Edit,
  Heart,
  Loader2,
  LogOut,
  Plus,
  Target,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: campaigns, isLoading: campaignsLoading } = useAllCampaigns();
  const { data: donations, isLoading: donationsLoading } = useAllDonations();
  const { data: stats, isLoading: statsLoading } = useDonationStats();

  const { mutateAsync: deleteCampaign } = useDeleteCampaign();
  const { mutateAsync: toggleStatus, isPending: isToggling } =
    useToggleCampaignStatus();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate({ to: "/admin" });
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted successfully");
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await toggleStatus(id);
      toast.success("Campaign status updated");
    } catch {
      toast.error("Failed to update campaign status");
    } finally {
      setTogglingId(null);
    }
  };

  const [totalRaised, totalDonations, totalCampaigns] = stats ?? [0n, 0n, 0n];

  const statCards = [
    {
      label: "Total Raised",
      value: formatCurrency(totalRaised, "USD"),
      icon: DollarSign,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Total Campaigns",
      value: totalCampaigns.toString(),
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Donations",
      value: totalDonations.toString(),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Active Campaigns",
      value: campaigns?.filter((c) => c.isActive).length.toString() ?? "0",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-foreground text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">
                GlobalHope <span className="text-orange-400">Admin</span>
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                {identity?.getPrincipal().toString().slice(0, 20)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate({ to: "/admin/campaigns/new" })}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              data-ocid="admin.create_campaign_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clear();
                navigate({ to: "/admin" });
              }}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-5 card-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {card.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Campaigns table */}
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Campaigns</h2>
            <span className="text-sm text-muted-foreground">
              {campaigns?.length ?? 0} total
            </span>
          </div>

          {campaignsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (campaigns?.length ?? 0) === 0 ? (
            <div className="p-12 text-center" data-ocid="admin.campaigns_table">
              <p className="text-muted-foreground">No campaigns yet.</p>
              <Button
                onClick={() => navigate({ to: "/admin/campaigns/new" })}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Create First Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.campaigns_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns?.map((campaign, i) => {
                    const cat = getCategoryInfo(campaign.category);
                    return (
                      <TableRow
                        key={campaign.id}
                        data-ocid={`admin.campaigns.row.${i + 1}`}
                      >
                        <TableCell className="font-medium max-w-[200px]">
                          <span className="line-clamp-1 text-sm">
                            {campaign.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}
                          >
                            {cat.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-orange-600">
                          {formatCurrency(campaign.currentAmount, "USD")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatCurrency(campaign.targetAmount, "USD")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(campaign.deadline)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.isActive ? "default" : "secondary"
                            }
                            className={
                              campaign.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : ""
                            }
                          >
                            {campaign.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                navigate({
                                  to: "/admin/campaigns/$id/edit",
                                  params: { id: campaign.id },
                                })
                              }
                              data-ocid={`admin.edit_button.${i + 1}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            {/* Toggle */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggle(campaign.id)}
                              disabled={
                                togglingId === campaign.id || isToggling
                              }
                              data-ocid={`admin.toggle_button.${i + 1}`}
                            >
                              {togglingId === campaign.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : campaign.isActive ? (
                                <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  data-ocid={`admin.delete_button.${i + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-ocid="admin.delete.dialog">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Campaign?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "
                                    {campaign.title}" and all associated data.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="admin.delete.cancel_button">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(campaign.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                    data-ocid="admin.delete.confirm_button"
                                  >
                                    {deletingId === campaign.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Donations table */}
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Recent Donations</h2>
            <span className="text-sm text-muted-foreground">
              {donations?.length ?? 0} total
            </span>
          </div>

          {donationsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (donations?.length ?? 0) === 0 ? (
            <div className="p-12 text-center" data-ocid="admin.donations_table">
              <p className="text-muted-foreground">No donations yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.donations_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Anonymous</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations?.slice(0, 50).map((donation, i) => (
                    <TableRow
                      key={donation.id}
                      data-ocid={`admin.donations.row.${i + 1}`}
                    >
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {donation.isAnonymous
                              ? "Anonymous"
                              : donation.donorName}
                          </div>
                          {!donation.isAnonymous && donation.donorEmail && (
                            <div className="text-xs text-muted-foreground">
                              {donation.donorEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        {formatCurrency(donation.amount, donation.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {donation.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {donation.paymentMethod.__kind__}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(donation.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            donation.isAnonymous ? "secondary" : "outline"
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
          )}
        </div>
      </div>
    </div>
  );
}
