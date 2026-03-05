import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";

module {
  type CampaignId = Text;
  type DonationId = Text;
  type PaymentMethod = {
    #stripe : { sessionId : Text; status : Text };
    #bankTransfer : { reference : Text };
    #crypto : { walletAddress : Text; txHash : Text };
  };

  type Campaign = {
    id : CampaignId;
    title : Text;
    description : Text;
    imageIds : [Text];
    videoUrls : [Text];
    targetAmount : Nat;
    currentAmount : Nat;
    category : Text;
    deadline : Int;
    createdAt : Int;
    isActive : Bool;
  };

  type OldDonation = {
    id : DonationId;
    campaignId : CampaignId;
    donorName : Text;
    donorEmail : Text;
    donorPhone : Text;
    amount : Nat;
    currency : Text;
    paymentMethod : PaymentMethod;
    transactionId : Text;
    isAnonymous : Bool;
    createdAt : Int;
  };

  type NewDonation = {
    id : DonationId;
    campaignId : CampaignId;
    donorName : Text;
    donorEmail : Text;
    donorPhone : Text;
    amount : Nat;
    currency : Text;
    paymentMethod : PaymentMethod;
    transactionId : Text;
    isAnonymous : Bool;
    createdAt : Int;
    amountUSD : Nat; // Amount in USD cents
  };

  type CampaignInput = {
    title : Text;
    description : Text;
    imageIds : [Text];
    videoUrls : [Text];
    targetAmount : Nat;
    category : Text;
    deadline : Int;
  };

  type DonationInput = {
    campaignId : CampaignId;
    donorName : Text;
    donorEmail : Text;
    donorPhone : Text;
    amount : Nat;
    currency : Text;
    paymentMethod : PaymentMethod;
    isAnonymous : Bool;
    amountUSD : Nat; // Amount in USD cents
  };

  type ImageMetadata = {
    id : Text;
    originalName : Text;
    contentType : Text;
    uploadTime : Int;
    size : Nat;
    blob : Storage.ExternalBlob;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  type LegalPage = {
    id : Text;
    content : Text;
    updatedAt : Int;
  };

  type OldActor = {
    campaigns : Map.Map<CampaignId, Campaign>;
    donations : Map.Map<DonationId, OldDonation>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageMetadata : Map.Map<Text, ImageMetadata>;
    stripeConfig : ?Stripe.StripeConfiguration;
    upiQrImageId : ?Text;
  };

  type NewActor = {
    campaigns : Map.Map<CampaignId, Campaign>;
    donations : Map.Map<DonationId, NewDonation>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageMetadata : Map.Map<Text, ImageMetadata>;
    stripeConfig : ?Stripe.StripeConfiguration;
    upiQrImageId : ?Text;
    legalPages : Map.Map<Text, LegalPage>;
  };

  public func run(old : OldActor) : NewActor {
    let legalPages = Map.empty<Text, LegalPage>();

    // Migrate old donations to include default amountUSD
    let newDonations = old.donations.map<DonationId, OldDonation, NewDonation>(
      func(_id, oldDonation) {
        { oldDonation with amountUSD = 0 };
      }
    );

    {
      old with
      donations = newDonations;
      legalPages;
    };
  };
};
