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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CampaignStatus,
  useAllCampaigns,
  useAllDonations,
  useClearUpiQrCode,
  useDeleteCampaign,
  useDonationStats,
  useGetLegalPage,
  useImageBlob,
  useSaveLegalPage,
  useSetCampaignStatus,
  useSetUpiQrCode,
  useUpiQrCode,
  useUploadImage,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate, getCategoryInfo } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Edit,
  FileText,
  Heart,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  PauseCircle,
  Phone,
  Plus,
  QrCode,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

// ─── Contact Message type ──────────────────────────────────
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// ─── Helpers ───────────────────────────────────────────────
function loadMessages(): ContactMessage[] {
  try {
    return JSON.parse(localStorage.getItem("contact_messages") ?? "[]");
  } catch {
    return [];
  }
}

function saveMessages(msgs: ContactMessage[]) {
  localStorage.setItem("contact_messages", JSON.stringify(msgs));
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading: campaignsLoading } = useAllCampaigns();
  const { data: donations, isLoading: donationsLoading } = useAllDonations();
  const { data: stats, isLoading: statsLoading } = useDonationStats();

  const { mutateAsync: deleteCampaign } = useDeleteCampaign();
  const { mutateAsync: setCampaignStatus, isPending: isStatusPending } =
    useSetCampaignStatus();

  // UPI settings
  const { data: upiQrImageId } = useUpiQrCode();
  const { data: upiQrUrl } = useImageBlob(upiQrImageId ?? undefined);
  const { mutateAsync: setUpiQrCode, isPending: isSettingQr } =
    useSetUpiQrCode();
  const { mutateAsync: clearUpiQrCode, isPending: isClearingQr } =
    useClearUpiQrCode();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingStatusId, setSettingStatusId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [upiId, setUpiId] = useState(
    () => localStorage.getItem("upi_id") || "globalhope@upi",
  );
  const [editingUpiId, setEditingUpiId] = useState(false);
  const [upiIdDraft, setUpiIdDraft] = useState(upiId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contact messages state
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    loadMessages(),
  );

  // Auth guard using localStorage
  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") !== "true") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const adminEmail = localStorage.getItem("admin_email") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    navigate({ to: "/admin" });
  };

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

  const handleSetStatus = async (id: string, status: CampaignStatus) => {
    setSettingStatusId(id);
    try {
      await setCampaignStatus({ campaignId: id, status });
      toast.success(`Campaign status set to ${status}`);
    } catch {
      toast.error("Failed to update campaign status");
    } finally {
      setSettingStatusId(null);
    }
  };

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Upload failed. Please check file format or size.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
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

  // Messages handlers
  const handleMarkRead = (id: string) => {
    const updated = messages.map((m) =>
      m.id === id ? { ...m, isRead: true } : m,
    );
    setMessages(updated);
    saveMessages(updated);
    toast.success("Message marked as read");
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
    toast.success("Message deleted");
  };

  // Users/Donors computed from donations
  interface DonorSummary {
    name: string;
    email: string;
    phone: string;
    totalDonated: bigint;
    donationCount: number;
    lastDonation: bigint;
  }

  const donorMap = new Map<string, DonorSummary>();
  if (donations) {
    for (const d of donations) {
      const key = d.isAnonymous
        ? `anon-${d.id}`
        : d.donorEmail || `nomail-${d.id}`;
      const existing = donorMap.get(key);
      if (existing) {
        existing.totalDonated += d.amount;
        existing.donationCount += 1;
        if (d.createdAt > existing.lastDonation) {
          existing.lastDonation = d.createdAt;
        }
      } else {
        donorMap.set(key, {
          name: d.isAnonymous ? "Anonymous" : d.donorName,
          email: d.isAnonymous ? "—" : d.donorEmail,
          phone: d.isAnonymous ? "—" : d.donorPhone,
          totalDonated: d.amount,
          donationCount: 1,
          lastDonation: d.createdAt,
        });
      }
    }
  }
  const donors = Array.from(donorMap.values()).sort((a, b) =>
    Number(b.totalDonated - a.totalDonated),
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const [totalRaised, totalDonations] = stats ?? [0n, 0n];

  const activeCampaigns =
    campaigns?.filter((c) => c.status === CampaignStatus.active).length ?? 0;
  const pausedCampaigns =
    campaigns?.filter((c) => c.status === CampaignStatus.paused).length ?? 0;
  const completedCampaigns =
    campaigns?.filter((c) => c.status === CampaignStatus.completed).length ?? 0;
  const draftCampaigns =
    campaigns?.filter((c) => c.status === CampaignStatus.draft).length ?? 0;

  const statCards = [
    {
      label: "Total Raised",
      value: formatCurrency(totalRaised, "USD"),
      icon: DollarSign,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Active Campaigns",
      value: activeCampaigns.toString(),
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Donations",
      value: totalDonations.toString(),
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Paused / Draft",
      value: `${pausedCampaigns} / ${draftCampaigns}`,
      icon: PauseCircle,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Completed",
      value: completedCampaigns.toString(),
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Total Campaigns",
      value: (campaigns?.length ?? 0).toString(),
      icon: Users,
      color: "text-slate-500",
      bg: "bg-slate-50",
    },
  ];

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
              <p className="text-xs text-white/50 mt-0.5 max-w-[200px] truncate">
                {adminEmail}
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
              onClick={handleLogout}
              className="text-white/70 hover:text-white hover:bg-white/10"
              data-ocid="admin.logout_button"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                        data-ocid="admin.upi.remove_qr_open_modal_button"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove QR Code
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.upi.remove_qr.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove UPI QR Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Donors will no longer see the UPI payment option with
                          a QR code. You can upload a new one at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.upi.remove_qr.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearQr}
                          className="bg-destructive hover:bg-destructive/90"
                          data-ocid="admin.upi.remove_qr.confirm_button"
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

        {/* ─── Main Tabs: Campaigns / Donations / Messages / Users / Legal ─── */}
        <Tabs defaultValue="campaigns" className="space-y-0">
          <TabsList className="h-auto p-1 bg-muted rounded-xl flex-wrap gap-1 mb-6">
            <TabsTrigger
              value="campaigns"
              className="rounded-lg font-semibold"
              data-ocid="admin.campaigns.tab"
            >
              <Target className="w-4 h-4 mr-1.5" />
              Campaigns
              {campaigns && (
                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                  {campaigns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="donations"
              className="rounded-lg font-semibold"
              data-ocid="admin.donations.tab"
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Donations
              {donations && (
                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                  {donations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-lg font-semibold"
              data-ocid="admin.messages.tab"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Messages
              {unreadCount > 0 && (
                <Badge className="ml-2 text-xs font-normal bg-orange-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg font-semibold"
              data-ocid="admin.users.tab"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Users / Donors
              {donors.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                  {donors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="legal"
              className="rounded-lg font-semibold"
              data-ocid="admin.legal.tab"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Legal Pages
            </TabsTrigger>
          </TabsList>

          {/* ─── Campaigns Tab ─── */}
          <TabsContent value="campaigns">
            <div className="bg-card rounded-xl card-shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-lg">Campaigns</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {campaigns?.length ?? 0} total
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/admin/campaigns/new" })}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New
                  </Button>
                </div>
              </div>

              {campaignsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (campaigns?.length ?? 0) === 0 ? (
                <div
                  className="p-12 text-center"
                  data-ocid="admin.campaigns.empty_state"
                >
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
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns?.map((campaign, i) => {
                        const cat = getCategoryInfo(campaign.category);
                        const progress =
                          campaign.targetAmount > 0n
                            ? Math.min(
                                100,
                                Number(
                                  (campaign.currentAmount * 100n) /
                                    campaign.targetAmount,
                                ),
                              )
                            : 0;
                        const statusOptions = [
                          {
                            value: CampaignStatus.active,
                            label: "Set Active",
                            color: "text-green-600",
                          },
                          {
                            value: CampaignStatus.paused,
                            label: "Pause",
                            color: "text-amber-600",
                          },
                          {
                            value: CampaignStatus.completed,
                            label: "Mark Complete",
                            color: "text-blue-600",
                          },
                          {
                            value: CampaignStatus.draft,
                            label: "Move to Draft",
                            color: "text-slate-500",
                          },
                        ].filter((opt) => opt.value !== campaign.status);

                        const statusBadgeClass =
                          campaign.status === CampaignStatus.active
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : campaign.status === CampaignStatus.paused
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : campaign.status === CampaignStatus.completed
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-100";

                        return (
                          <TableRow
                            key={campaign.id}
                            data-ocid={`admin.campaigns.row.${i + 1}`}
                          >
                            <TableCell className="font-medium max-w-[180px]">
                              <span className="line-clamp-1 text-sm">
                                {campaign.title}
                              </span>
                              <span className="text-xs text-muted-foreground block">
                                {formatDate(campaign.deadline)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}
                              >
                                {cat.label}
                              </span>
                            </TableCell>
                            <TableCell className="min-w-[160px]">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium text-orange-600">
                                    {formatCurrency(
                                      campaign.currentAmount,
                                      "USD",
                                    )}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {formatCurrency(
                                      campaign.targetAmount,
                                      "USD",
                                    )}
                                  </span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <span className="text-xs text-orange-500 font-semibold">
                                  {progress}% funded
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={statusBadgeClass}
                              >
                                {campaign.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
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

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      disabled={
                                        settingStatusId === campaign.id ||
                                        isStatusPending
                                      }
                                      data-ocid={`admin.campaigns.status_dropdown.${i + 1}`}
                                    >
                                      {settingStatusId === campaign.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    data-ocid={`admin.campaigns.status_menu.${i + 1}`}
                                  >
                                    {statusOptions.map((opt) => (
                                      <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() =>
                                          handleSetStatus(
                                            campaign.id,
                                            opt.value,
                                          )
                                        }
                                        className={opt.color}
                                      >
                                        {opt.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>

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
                                        {campaign.title}" and all associated
                                        data. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel data-ocid="admin.delete.cancel_button">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(campaign.id)
                                        }
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
          </TabsContent>

          {/* ─── Donations Tab ─── */}
          <TabsContent value="donations">
            <div className="bg-card rounded-xl card-shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-lg">
                  Recent Donations
                </h2>
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
                <div
                  className="p-12 text-center"
                  data-ocid="admin.donations.empty_state"
                >
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
          </TabsContent>

          {/* ─── Messages Tab ─── */}
          <TabsContent value="messages">
            <div className="bg-card rounded-xl card-shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-bold text-lg">
                    Contact Messages
                  </h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-orange-500 text-white">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {messages.length} total
                </span>
              </div>

              {messages.length === 0 ? (
                <div
                  className="p-12 text-center"
                  data-ocid="admin.messages.empty_state"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    No messages yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact form submissions will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.messages_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((msg, i) => (
                        <TableRow
                          key={msg.id}
                          data-ocid={`admin.messages.row.${i + 1}`}
                          className={!msg.isRead ? "bg-orange-50/40" : ""}
                        >
                          <TableCell className="font-medium text-sm">
                            {msg.name}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[160px]">
                                  {msg.email}
                                </span>
                              </div>
                              {msg.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{msg.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {msg.message}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={msg.isRead ? "secondary" : "default"}
                              className={
                                msg.isRead
                                  ? ""
                                  : "bg-orange-500 text-white hover:bg-orange-500"
                              }
                            >
                              {msg.isRead ? "Read" : "Unread"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!msg.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleMarkRead(msg.id)}
                                  data-ocid={`admin.messages.read_button.${i + 1}`}
                                >
                                  Mark Read
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                    data-ocid={`admin.messages.delete_button.${i + 1}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent data-ocid="admin.messages.delete.dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Message?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the message
                                      from {msg.name}. This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel data-ocid="admin.messages.delete.cancel_button">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteMessage(msg.id)
                                      }
                                      className="bg-destructive hover:bg-destructive/90"
                                      data-ocid="admin.messages.delete.confirm_button"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Users / Donors Tab ─── */}
          <TabsContent value="users">
            <div className="bg-card rounded-xl card-shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-lg">
                  Users / Donors
                </h2>
                <span className="text-sm text-muted-foreground">
                  {donors.length} unique donors
                </span>
              </div>

              {donationsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : donors.length === 0 ? (
                <div
                  className="p-12 text-center"
                  data-ocid="admin.users.empty_state"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    No donors yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Donor records will appear here once donations are made.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.users_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Total Donated</TableHead>
                        <TableHead># Donations</TableHead>
                        <TableHead>Last Donation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.map((donor, i) => (
                        <TableRow
                          key={`${donor.email}-${i}`}
                          data-ocid={`admin.users.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {donor.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {donor.email}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {donor.phone || "—"}
                          </TableCell>
                          <TableCell className="font-semibold text-orange-600">
                            {formatCurrency(donor.totalDonated, "USD")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {donor.donationCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(donor.lastDonation)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Legal Pages Tab ─── */}
          <TabsContent value="legal">
            <LegalPagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Legal Pages Editor ────────────────────────────────────

const LEGAL_PAGES = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "donor-privacy", label: "Donor Privacy" },
] as const;

type LegalPageId = (typeof LEGAL_PAGES)[number]["id"];

function LegalPageEditor({ id, label }: { id: LegalPageId; label: string }) {
  const { data: legalPage, isLoading } = useGetLegalPage(id);
  const { mutateAsync: savePage, isPending: isSaving } = useSaveLegalPage();
  const [draft, setDraft] = useState("");
  const [initialised, setInitialised] = useState(false);

  // Populate draft when data arrives
  useEffect(() => {
    if (!initialised && legalPage !== undefined) {
      setDraft(legalPage?.content ?? "");
      setInitialised(true);
    }
  }, [legalPage, initialised]);

  const handleSave = async () => {
    try {
      await savePage({ id, content: draft });
      toast.success(`${label} saved`);
    } catch {
      toast.error(`Failed to save ${label}`);
    }
  };

  const handleClear = () => {
    setDraft("");
  };

  return (
    <div
      className="space-y-3"
      data-ocid={`admin.legal.${id.replace(/-/g, "_")}.panel`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter HTML or plain text. Leave empty to show the default built-in
            content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {draft && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground text-xs"
              data-ocid={`admin.legal.${id.replace(/-/g, "_")}.secondary_button`}
            >
              Clear (use default)
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            data-ocid={`admin.legal.${id.replace(/-/g, "_")}.save_button`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton
          className="w-full"
          style={{ height: 200 }}
          data-ocid={`admin.legal.${id.replace(/-/g, "_")}.loading_state`}
        />
      ) : (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Enter custom HTML content for the ${label} page. Leave empty to use the built-in default content.`}
          className="min-h-[300px] font-mono text-xs leading-relaxed resize-y"
          data-ocid={`admin.legal.${id.replace(/-/g, "_")}.textarea`}
        />
      )}

      {isSaving && (
        <div
          className="flex items-center gap-2 text-xs text-orange-600"
          data-ocid={`admin.legal.${id.replace(/-/g, "_")}.loading_state`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Saving to blockchain...
        </div>
      )}
    </div>
  );
}

function LegalPagesTab() {
  const [activeId, setActiveId] = useState<LegalPageId>("privacy");

  return (
    <div className="bg-card rounded-xl card-shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <FileText className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg">Legal Pages</h2>
          <p className="text-xs text-muted-foreground">
            Customise legal page content. Leave empty to use built-in defaults.
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Sub-tab buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEGAL_PAGES.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActiveId(page.id)}
              data-ocid={`admin.legal.${page.id.replace(/-/g, "_")}.tab`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeId === page.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Editor for active page */}
        {LEGAL_PAGES.map((page) =>
          activeId === page.id ? (
            <LegalPageEditor key={page.id} id={page.id} label={page.label} />
          ) : null,
        )}
      </div>
    </div>
  );
}
