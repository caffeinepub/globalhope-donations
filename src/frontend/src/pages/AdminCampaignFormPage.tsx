import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCampaign,
  useCreateCampaign,
  useIsCallerAdmin,
  useUpdateCampaign,
  useUploadImage,
} from "@/hooks/useQueries";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

const CATEGORIES = [
  "Medical",
  "Animal Welfare",
  "Education",
  "Disaster Relief",
  "Environment",
  "Children",
];

function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function AdminCampaignFormPage() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Extract id from pathname for edit mode
  const editMatch = pathname.match(/\/admin\/campaigns\/(.+)\/edit/);
  const id = editMatch ? editMatch[1] : undefined;
  const isEdit = !!id;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: existingCampaign, isLoading: campaignLoading } =
    useCampaign(id);
  const { mutateAsync: createCampaign, isPending: isCreating } =
    useCreateCampaign();
  const { mutateAsync: updateCampaign, isPending: isUpdating } =
    useUpdateCampaign();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Medical");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([""]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate({ to: "/admin" });
    }
  }, [isAdmin, adminLoading, navigate]);

  // Pre-fill form for edit mode
  useEffect(() => {
    if (isEdit && existingCampaign) {
      setTitle(existingCampaign.title);
      setDescription(existingCampaign.description);
      setCategory(existingCampaign.category);
      setTargetAmount((Number(existingCampaign.targetAmount) / 100).toString());
      const deadlineDate = new Date(
        Number(existingCampaign.deadline / 1_000_000n),
      );
      setDeadline(deadlineDate.toISOString().split("T")[0]);
      setVideoUrls(
        existingCampaign.videoUrls.length > 0
          ? existingCampaign.videoUrls
          : [""],
      );
      setImageIds(existingCampaign.imageIds);
    }
  }, [isEdit, existingCampaign]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newIds: string[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      const imgId = generateId();
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        const blobWithProgress = blob.withUploadProgress((p) =>
          setUploadProgress(p),
        );

        await uploadImage({
          id: imgId,
          contentType: file.type,
          originalName: file.name,
          size: BigInt(file.size),
          blob: blobWithProgress,
        });

        newIds.push(imgId);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setImageIds((prev) => [...prev, ...newIds]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setUploadProgress(0);
  };

  const removeImage = (idx: number) => {
    setImageIds((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const addVideoUrl = () => setVideoUrls((prev) => [...prev, ""]);
  const updateVideoUrl = (idx: number, val: string) =>
    setVideoUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));
  const removeVideoUrl = (idx: number) =>
    setVideoUrls((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      toast.error("Enter a valid target amount");
      return;
    }
    if (!deadline) {
      toast.error("Deadline is required");
      return;
    }

    const targetAmountCents = BigInt(Math.round(Number(targetAmount) * 100));
    const deadlineNs = BigInt(new Date(deadline).getTime()) * 1_000_000n;
    const validVideoUrls = videoUrls.filter((u) => u.trim());

    const input = {
      title: title.trim(),
      description: description.trim(),
      category,
      targetAmount: targetAmountCents,
      deadline: deadlineNs,
      videoUrls: validVideoUrls,
      imageIds,
    };

    try {
      if (isEdit && id) {
        await updateCampaign({ campaignId: id, input });
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign(input);
        toast.success("Campaign created successfully!");
      }
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to ${isEdit ? "update" : "create"} campaign. Please try again.`,
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const isLoadingData = adminLoading || (isEdit && campaignLoading);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (isEdit && !existingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center" data-ocid="campaign_form.error_state">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Campaign Not Found
          </h2>
          <Button
            onClick={() => navigate({ to: "/admin/dashboard" })}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-foreground text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin/dashboard" })}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>
          <h1 className="font-display font-bold text-lg">
            {isEdit ? "Edit" : "Create"} Campaign
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 card-shadow space-y-5">
            <h2 className="font-display font-bold text-lg border-b border-border pb-3">
              Campaign Details
            </h2>

            <div>
              <Label
                htmlFor="title"
                className="text-sm font-semibold mb-1.5 block"
              >
                Campaign Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Emergency Medical Care for Children in Kenya"
                required
                data-ocid="campaign_form.title_input"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-semibold mb-1.5 block"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the campaign, its goals, and how funds will be used..."
                rows={6}
                required
                data-ocid="campaign_form.description_textarea"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  className="text-sm font-semibold mb-1.5 block"
                >
                  Category *
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="category"
                    data-ocid="campaign_form.category_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="target"
                  className="text-sm font-semibold mb-1.5 block"
                >
                  Target Amount (USD) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    step="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000"
                    className="pl-7"
                    required
                    data-ocid="campaign_form.target_input"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="deadline"
                className="text-sm font-semibold mb-1.5 block"
              >
                Campaign Deadline *
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                data-ocid="campaign_form.deadline_input"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-card rounded-xl p-6 card-shadow space-y-4">
            <h2 className="font-display font-bold text-lg border-b border-border pb-3">
              Campaign Images
            </h2>

            {/* Upload area */}
            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="campaign_form.dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
                data-ocid="campaign_form.upload_button"
              />
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-orange-500" />
                )}
              </div>
              {isUploading ? (
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="progress-bar mt-2 max-w-xs mx-auto">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </>
              )}
            </button>

            {/* Image previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previewUrls.map((url) => (
                  <div
                    key={url}
                    className="relative rounded-lg overflow-hidden aspect-square bg-muted"
                  >
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(previewUrls.indexOf(url))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageIds.length > 0 && previewUrls.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>{imageIds.length} image(s) uploaded</span>
              </div>
            )}
          </div>

          {/* Video URLs */}
          <div className="bg-card rounded-xl p-6 card-shadow space-y-4">
            <h2 className="font-display font-bold text-lg border-b border-border pb-3">
              Video Links{" "}
              <span className="text-muted-foreground font-normal text-sm">
                (optional)
              </span>
            </h2>

            <div className="space-y-3">
              {videoUrls.map((url, i) => (
                <div
                  key={`video-${i}-${url.slice(0, 8)}`}
                  className="flex gap-2"
                >
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => updateVideoUrl(i, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1"
                  />
                  {videoUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removeVideoUrl(i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVideoUrl}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Video URL
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/dashboard" })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-donate"
              data-ocid="campaign_form.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Campaign" : "Create Campaign"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
