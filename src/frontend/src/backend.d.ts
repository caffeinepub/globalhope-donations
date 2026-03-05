import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface CampaignInput {
    title: string;
    description: string;
    deadline: bigint;
    videoUrls: Array<string>;
    imageIds: Array<string>;
    targetAmount: bigint;
    category: string;
}
export type PaymentMethod = {
    __kind__: "stripe";
    stripe: {
        status: string;
        sessionId: string;
    };
} | {
    __kind__: "bankTransfer";
    bankTransfer: {
        reference: string;
    };
} | {
    __kind__: "crypto";
    crypto: {
        walletAddress: string;
        txHash: string;
    };
};
export type CampaignId = string;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DonationInput {
    donorPhone: string;
    paymentMethod: PaymentMethod;
    donorName: string;
    isAnonymous: boolean;
    campaignId: CampaignId;
    currency: string;
    donorEmail: string;
    amount: bigint;
}
export interface Donation {
    id: DonationId;
    donorPhone: string;
    paymentMethod: PaymentMethod;
    createdAt: bigint;
    donorName: string;
    isAnonymous: boolean;
    campaignId: CampaignId;
    currency: string;
    donorEmail: string;
    amount: bigint;
    transactionId: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface CampaignStats {
    totalRaised: bigint;
    supporterCount: bigint;
}
export interface Campaign {
    id: CampaignId;
    title: string;
    createdAt: bigint;
    description: string;
    deadline: bigint;
    isActive: boolean;
    videoUrls: Array<string>;
    imageIds: Array<string>;
    targetAmount: bigint;
    category: string;
    currentAmount: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type DonationId = string;
export interface ImageMetadata {
    id: string;
    originalName: string;
    contentType: string;
    blob: ExternalBlob;
    size: bigint;
    uploadTime: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCampaign(input: CampaignInput): Promise<CampaignId>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteCampaign(campaignId: CampaignId): Promise<void>;
    getActiveCampaigns(): Promise<Array<Campaign>>;
    getAllCampaigns(): Promise<Array<Campaign>>;
    getAllDonations(): Promise<Array<Donation>>;
    getAllImageMetadata(): Promise<Array<ImageMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaign(campaignId: CampaignId): Promise<Campaign | null>;
    getCampaignDonations(campaignId: CampaignId): Promise<Array<Donation>>;
    getCampaignStats(campaignId: CampaignId): Promise<CampaignStats>;
    getCampaignsSortedByAmountRaised(): Promise<Array<Campaign>>;
    getCampaignsSortedByCreationDate(): Promise<Array<Campaign>>;
    getCampaignsSortedByDeadline(): Promise<Array<Campaign>>;
    getDonationStats(): Promise<[bigint, bigint, bigint]>;
    getDonationsByCampaign(campaignId: CampaignId): Promise<Array<Donation>>;
    getImageArrival(): Promise<Uint8Array>;
    getImageBlob(id: string): Promise<ExternalBlob | null>;
    getImageMetadata(id: string): Promise<ImageMetadata | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitDonation(input: DonationInput): Promise<DonationId>;
    toggleCampaignStatus(campaignId: CampaignId): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCampaign(campaignId: CampaignId, input: CampaignInput): Promise<void>;
    uploadImage(id: string, contentType: string, originalName: string, size: bigint, blob: ExternalBlob): Promise<void>;
}
