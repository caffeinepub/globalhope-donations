import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Include prefabricated components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  public type CampaignId = Text;
  public type DonationId = Text;
  public type PaymentMethod = {
    #stripe : { sessionId : Text; status : Text };
    #bankTransfer : { reference : Text };
    #crypto : { walletAddress : Text; txHash : Text };
  };

  public type Campaign = {
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

  public type Donation = {
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

  public type CampaignStats = {
    totalRaised : Nat;
    supporterCount : Nat;
  };

  public type CampaignInput = {
    title : Text;
    description : Text;
    imageIds : [Text];
    videoUrls : [Text];
    targetAmount : Nat;
    category : Text;
    deadline : Int;
  };

  public type DonationInput = {
    campaignId : CampaignId;
    donorName : Text;
    donorEmail : Text;
    donorPhone : Text;
    amount : Nat;
    currency : Text;
    paymentMethod : PaymentMethod;
    isAnonymous : Bool;
  };

  public type ImageMetadata = {
    id : Text;
    originalName : Text;
    contentType : Text;
    uploadTime : Int;
    size : Nat;
    blob : Storage.ExternalBlob;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // Helper functions
  module Campaign {
    public func compareByCreationDate(a : Campaign, b : Campaign) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };

    public func compareByDeadline(a : Campaign, b : Campaign) : Order.Order {
      Int.compare(a.deadline, b.deadline);
    };

    public func compareByAmountRaised(a : Campaign, b : Campaign) : Order.Order {
      Nat.compare(b.currentAmount, a.currentAmount);
    };
  };

  // User profile management
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Campaign management
  let campaigns = Map.empty<CampaignId, Campaign>();
  var lastCampaignId = 100000;
  func generateCampaignId() : CampaignId {
    lastCampaignId += 1;
    lastCampaignId.toText();
  };

  public shared ({ caller }) func createCampaign(input : CampaignInput) : async CampaignId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let id = generateCampaignId();
    let campaign : Campaign = {
      id;
      title = input.title;
      description = input.description;
      imageIds = input.imageIds;
      videoUrls = input.videoUrls;
      targetAmount = input.targetAmount;
      currentAmount = 0;
      category = input.category;
      deadline = input.deadline;
      createdAt = Time.now();
      isActive = true;
    };

    campaigns.add(id, campaign);
    id;
  };

  public query func getCampaign(campaignId : CampaignId) : async ?Campaign {
    campaigns.get(campaignId);
  };

  public query func getAllCampaigns() : async [Campaign] {
    let iter = campaigns.values();
    iter.toArray();
  };

  public query func getActiveCampaigns() : async [Campaign] {
    campaigns.values().filter(func(c) { c.isActive }).toArray();
  };

  public query func getCampaignStats(campaignId : CampaignId) : async CampaignStats {
    let donationsArray = donations.values().toArray();
    let campaignDonations = donationsArray.filter(
      func(d) { d.campaignId == campaignId }
    );
    {
      totalRaised = campaignDonations.foldLeft(
        0,
        func(acc, d) { acc + d.amount },
      );
      supporterCount = campaignDonations.size();
    };
  };

  public query func getCampaignsSortedByCreationDate() : async [Campaign] {
    campaigns
      .values()
      .toArray()
      .sort(Campaign.compareByCreationDate);
  };

  public query func getCampaignsSortedByDeadline() : async [Campaign] {
    campaigns
      .values()
      .toArray()
      .sort(Campaign.compareByDeadline);
  };

  public query func getCampaignsSortedByAmountRaised() : async [Campaign] {
    campaigns
      .values()
      .toArray()
      .sort(Campaign.compareByAmountRaised);
  };

  public shared ({ caller }) func updateCampaign(campaignId : CampaignId, input : CampaignInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?existing) {
        let updated : Campaign = {
          id = campaignId;
          title = input.title;
          description = input.description;
          imageIds = input.imageIds;
          videoUrls = input.videoUrls;
          targetAmount = input.targetAmount;
          currentAmount = existing.currentAmount;
          category = input.category;
          deadline = input.deadline;
          createdAt = existing.createdAt;
          isActive = existing.isActive;
        };
        campaigns.add(campaignId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCampaign(campaignId : CampaignId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    campaigns.remove(campaignId);
  };

  public shared ({ caller }) func toggleCampaignStatus(campaignId : CampaignId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?existing) {
        let updated : Campaign = {
          id = existing.id;
          title = existing.title;
          description = existing.description;
          imageIds = existing.imageIds;
          videoUrls = existing.videoUrls;
          targetAmount = existing.targetAmount;
          currentAmount = existing.currentAmount;
          category = existing.category;
          deadline = existing.deadline;
          createdAt = existing.createdAt;
          isActive = not existing.isActive;
        };
        campaigns.add(campaignId, updated);
      };
    };
  };

  // Donation management
  let donations = Map.empty<DonationId, Donation>();
  var lastDonationId = 800000;
  func generateDonationId() : DonationId {
    lastDonationId += 1;
    lastDonationId.toText();
  };

  public shared ({ caller }) func submitDonation(input : DonationInput) : async DonationId {
    let campaign = switch (campaigns.get(input.campaignId)) {
      case (null) { Runtime.trap("Invalid campaign ID") };
      case (?c) { c };
    };

    let id = generateDonationId();
    let donation : Donation = {
      id;
      campaignId = input.campaignId;
      donorName = input.donorName;
      donorEmail = input.donorEmail;
      donorPhone = input.donorPhone;
      amount = input.amount;
      currency = input.currency;
      paymentMethod = input.paymentMethod;
      transactionId = generateTransactionId();
      isAnonymous = input.isAnonymous;
      createdAt = Time.now();
    };

    donations.add(id, donation);
    updateCampaignAmount(campaign.id, input.amount);
    id;
  };

  func generateTransactionId() : Text {
    let id = lastDonationId + Time.now();
    id.toText();
  };

  func updateCampaignAmount(campaignId : CampaignId, amount : Nat) {
    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?existing) {
        let updated : Campaign = {
          id = existing.id;
          title = existing.title;
          description = existing.description;
          imageIds = existing.imageIds;
          videoUrls = existing.videoUrls;
          targetAmount = existing.targetAmount;
          currentAmount = existing.currentAmount + amount;
          category = existing.category;
          deadline = existing.deadline;
          createdAt = existing.createdAt;
          isActive = existing.isActive;
        };
        campaigns.add(campaignId, updated);
      };
    };
  };

  public query ({ caller }) func getAllDonations() : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    donations.values().toArray();
  };

  public query ({ caller }) func getCampaignDonations(campaignId : CampaignId) : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let allDonations = donations.values().toArray();
    allDonations.filter(func(d) { d.campaignId == campaignId });
  };

  public query func getDonationStats() : async (Nat, Nat, Nat) {
    let totalDonations = donations.size();
    let totalAmount = donations.values().toArray().foldLeft(
      0,
      func(acc, d) { acc + d.amount },
    );
    let uniqueDonorEmails = Set.empty<Text>();
    donations.values().forEach(func(d) { uniqueDonorEmails.add(d.donorEmail) });
    let supporterCount = uniqueDonorEmails.size();
    (totalAmount, totalDonations, supporterCount);
  };

  public query ({ caller }) func getDonationsByCampaign(campaignId : CampaignId) : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let all = donations.values().toArray();
    all.filter(
      func(d) { d.campaignId == campaignId }
    );
  };

  // Payment methods
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Image storage
  let imageMetadata = Map.empty<Text, ImageMetadata>();
  public shared ({ caller }) func uploadImage(id : Text, contentType : Text, originalName : Text, size : Nat, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    imageMetadata.add(
      id,
      {
        id;
        originalName;
        contentType;
        uploadTime = Time.now();
        size;
        blob;
      },
    );
  };

  public query func getImageMetadata(id : Text) : async ?ImageMetadata {
    imageMetadata.get(id);
  };

  public query func getAllImageMetadata() : async [ImageMetadata] {
    imageMetadata.values().toArray();
  };

  public query func getImageBlob(id : Text) : async ?Storage.ExternalBlob {
    switch (imageMetadata.get(id)) {
      case (null) { null };
      case (?meta) { ?meta.blob };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getImageArrival() : async Blob {
    let input : Blob = "\08";
    Blob.fromArray(input.toArray());
  };
};
