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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  useClearUpiQrCode,
  useDeleteCampaign,
  useDonationStats,
  useImageBlob,
  useIsCallerAdmin,
  useSetUpiQrCode,
  useToggleCampaignStatus,
  useUpiQrCode,
  useUploadImage,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate, getCategoryInfo } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  DollarSign,
  Edit,
  Heart,
  ImagePlus,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  Save,
  Target,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

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

  // UPI settings
  const { data: upiQrImageId } = useUpiQrCode();
  const { data: upiQrUrl } = useImageBlob(upiQrImageId ?? undefined);
  const { mutateAsync: setUpiQrCode, isPending: isSettingQr } =
    useSetUpiQrCode();
  const { mutateAsync: clearUpiQrCode, isPending: isClearingQr } =
    useClearUpiQrCode();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [upiId, setUpiId] = useState(
    () => localStorage.getItem("upi_id") || "globalhope@upi",
  );
  const [editingUpiId, setEditingUpiId] = useState(false);
  const [upiIdDraft, setUpiIdDraft] = useState(upiId);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setUploadProgress(10);
      const imageId = `upi-qr-${Date.now()}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      setUploadProgress(40);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(40 + Math.round(pct * 0.5));
      });

      await uploadImage({
        id: imageId,
        contentType: file.type,
        originalName: file.name,
        size: BigInt(file.size),
        blob,
      });
      setUploadProgress(95);
      await setUpiQrCode(imageId);
      setUploadProgress(100);
      toast.success("UPI QR code uploaded successfully");
      setTimeout(() => setUploadProgress(0), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload QR code. Please try again.");
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearQr = async () => {
    try {
      await clearUpiQrCode();
      toast.success("UPI QR code removed");
    } catch {
      toast.error("Failed to remove QR code");
    }
  };

  const handleSaveUpiId = () => {
    localStorage.setItem("upi_id", upiIdDraft.trim());
    setUpiId(upiIdDraft.trim());
    setEditingUpiId(false);
    toast.success("UPI ID saved");
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
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
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

        {/* ─── UPI Payment Settings ─── */}
        <div
          className="bg-card rounded-xl card-shadow overflow-hidden"
          data-ocid="admin.upi_settings_panel"
        >
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">
                UPI Payment Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload your UPI QR code image. Donors will see this when
                choosing UPI payment.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold block">
                  UPI QR Code Image
                </Label>

                {/* Current QR preview */}
                {upiQrImageId && upiQrUrl ? (
                  <div className="relative w-fit">
                    <img
                      src={upiQrUrl}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain rounded-xl border-2 border-border bg-white p-2"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={handleClearQr}
                      disabled={isClearingQr}
                      data-ocid="admin.upi.remove_qr_button"
                    >
                      {isClearingQr ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ) : upiQrImageId === undefined ? (
                  <div className="w-40 h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full max-w-xs rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-ocid="admin.upi.dropzone"
                  >
                    <QrCode className="w-10 h-10 text-orange-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No QR code uploaded
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to upload your UPI QR code
                    </p>
                  </button>
                )}

                {/* Upload progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div
                    className="space-y-1"
                    data-ocid="admin.upi.upload_loading_state"
                  >
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpiQrUpload}
                    className="hidden"
                    id="upi-qr-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSettingQr}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    data-ocid="admin.upi.upload_button"
                  >
                    {isUploading || isSettingQr ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 mr-2" />
                        {upiQrImageId ? "Replace QR Code" : "Upload QR Code"}
                      </>
                    )}
                  </Button>
                </div>

                {upiQrImageId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        data-ocid="admin.upi.remove_qr_button"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove QR Code
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.upi.remove_qr_dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove UPI QR Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Donors will no longer see the UPI payment option with
                          a QR code. You can upload a new one at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.upi.remove_qr_cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearQr}
                          className="bg-destructive hover:bg-destructive/90"
                          data-ocid="admin.upi.remove_qr_confirm_button"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* UPI ID Section */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold block">UPI ID</Label>
                <p className="text-xs text-muted-foreground">
                  This UPI ID is shown to donors as the payment destination.
                  Stored locally in the browser.
                </p>

                {editingUpiId ? (
                  <div className="flex gap-2">
                    <Input
                      value={upiIdDraft}
                      onChange={(e) => setUpiIdDraft(e.target.value)}
                      placeholder="yourname@upi"
                      data-ocid="admin.upi.id_input"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveUpiId}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      data-ocid="admin.upi.save_id_button"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingUpiId(false);
                        setUpiIdDraft(upiId);
                      }}
                      data-ocid="admin.upi.cancel_edit_button"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <code className="text-sm font-mono font-semibold text-foreground flex-1">
                      {upiId}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUpiIdDraft(upiId);
                        setEditingUpiId(true);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      data-ocid="admin.upi.edit_id_button"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                )}

                <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-blue-700">
                    <p className="font-semibold mb-0.5">Instructions</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
                      <li>Upload your bank's UPI QR code image</li>
                      <li>Set your UPI ID above</li>
                      <li>
                        Donors will see the QR + UPI ID when choosing UPI
                        payment
                      </li>
                      <li>Verify UTR numbers in your UPI app manually</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
