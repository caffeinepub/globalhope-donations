import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Campaign,
  CampaignInput,
  CampaignStats,
  Donation,
  DonationInput,
  ShoppingItem,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Campaign Queries ──────────────────────────────────────

export function useActiveCampaigns() {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "active"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveCampaigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCampaigns() {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCampaigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCampaign(campaignId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign | null>({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      if (!actor || !campaignId) return null;
      return actor.getCampaign(campaignId);
    },
    enabled: !!actor && !isFetching && !!campaignId,
  });
}

export function useCampaignStats(campaignId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<CampaignStats>({
    queryKey: ["campaignStats", campaignId],
    queryFn: async () => {
      if (!actor || !campaignId) return { totalRaised: 0n, supporterCount: 0n };
      return actor.getCampaignStats(campaignId);
    },
    enabled: !!actor && !isFetching && !!campaignId,
  });
}

export function useCampaignDonations(campaignId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ["campaignDonations", campaignId],
    queryFn: async () => {
      if (!actor || !campaignId) return [];
      return actor.getCampaignDonations(campaignId);
    },
    enabled: !!actor && !isFetching && !!campaignId,
  });
}

export function useCampaignsSortedByAmount() {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "sortedByAmount"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCampaignsSortedByAmountRaised();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Queries ─────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ["donations", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDonationStats() {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, bigint, bigint]>({
    queryKey: ["donationStats"],
    queryFn: async () => {
      if (!actor) return [0n, 0n, 0n];
      return actor.getDonationStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeSession", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (data.__kind__ === "completed" || data.__kind__ === "failed")
        return false;
      return 3000;
    },
  });
}

export function useImageBlob(imageId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["imageBlob", imageId],
    queryFn: async () => {
      if (!actor || !imageId) return null;
      const blob = await actor.getImageBlob(imageId);
      if (!blob) return null;
      return blob.getDirectURL();
    },
    enabled: !!actor && !isFetching && !!imageId,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}

// ─── Mutations ─────────────────────────────────────────────

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useSubmitDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DonationInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitDonation(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({
        queryKey: ["campaignStats", variables.campaignId],
      });
      queryClient.invalidateQueries({ queryKey: ["donationStats"] });
    },
  });
}

export function useCreateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CampaignInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCampaign(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      input,
    }: { campaignId: string; input: CampaignInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCampaign(campaignId, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({
        queryKey: ["campaign", variables.campaignId],
      });
    },
  });
}

export function useDeleteCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useToggleCampaignStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleCampaignStatus(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUploadImage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      contentType,
      originalName,
      size,
      blob,
    }: {
      id: string;
      contentType: string;
      originalName: string;
      size: bigint;
      blob: import("../backend").ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return actor.uploadImage(
        id,
        contentType,
        originalName,
        size,
        blob as any,
      );
    },
  });
}

// ─── UPI QR Code ───────────────────────────────────────────

export function useUpiQrCode() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["upiQrCode"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUpiQrCode();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUpiQrCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setUpiQrCode(imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upiQrCode"] });
    },
  });
}

export function useClearUpiQrCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearUpiQrCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upiQrCode"] });
    },
  });
}
