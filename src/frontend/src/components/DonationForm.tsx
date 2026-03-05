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
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/context/CurrencyContext";
import {
  useCreateCheckoutSession,
  useImageBlob,
  useSubmitDonation,
  useUpiQrCode,
} from "@/hooks/useQueries";
import { getCurrencySymbol } from "@/lib/format";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  QrCode,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Campaign } from "../backend.d";

interface Props {
  campaign: Campaign;
}

// Narrowed list per spec
const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "INR",
  "GBP",
  "AED",
  "CAD",
  "AUD",
  "JPY",
  "SGD",
] as const;

const PRESET_AMOUNTS_USD = [10, 25, 50, 100, 250];

type PaymentTab = "card" | "upi";

export default function DonationForm({ campaign }: Props) {
  const { detectedCurrency, convertToUSD } = useCurrency();

  const [paymentTab, setPaymentTab] = useState<PaymentTab>("card");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState(() => {
    // Initialize from detected currency, but only if supported
    return (SUPPORTED_CURRENCIES as readonly string[]).includes(
      detectedCurrency,
    )
      ? detectedCurrency
      : "USD";
  });
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  const { mutateAsync: createCheckout, isPending: isCheckoutPending } =
    useCreateCheckoutSession();
  const { mutateAsync: submitDonation, isPending: isUpiPending } =
    useSubmitDonation();
  const { data: upiQrImageId } = useUpiQrCode();
  const { data: upiQrUrl } = useImageBlob(upiQrImageId ?? undefined);

  const effectiveAmount = isCustom
    ? Number.parseFloat(customAmount) || 0
    : selectedPreset || 0;

  const currencySymbol = getCurrencySymbol(currency);

  // Compute USD equivalent for preview + storage
  const amountInUSD =
    effectiveAmount > 0 ? convertToUSD(effectiveAmount, currency) : 0;

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveAmount || effectiveAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
      toast.error("Please provide your name and email");
      return;
    }
    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const priceInCents = BigInt(Math.round(effectiveAmount * 100));
      const amountUSDCents = BigInt(Math.round(amountInUSD * 100));
      const origin = window.location.origin;

      const params = new URLSearchParams({
        campaignId: campaign.id,
        currency,
        donorName: isAnonymous ? "Anonymous" : donorName,
        donorEmail: isAnonymous ? "" : donorEmail,
        donorPhone: donorPhone,
        isAnonymous: isAnonymous.toString(),
        amount: priceInCents.toString(),
        amountUSD: amountUSDCents.toString(),
      });

      const successUrl = `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}&${params.toString()}`;
      const cancelUrl = `${origin}/donate/cancel?campaignId=${campaign.id}`;

      const checkoutUrl = await createCheckout({
        items: [
          {
            productName: campaign.title,
            currency: currency.toLowerCase(),
            quantity: 1n,
            priceInCents,
            productDescription: `Donation to ${campaign.title}`,
          },
        ],
        successUrl,
        cancelUrl,
      });

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveAmount || effectiveAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    if (!utrNumber.trim()) {
      toast.error("Please enter your UPI Transaction ID (UTR number)");
      return;
    }
    if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
      toast.error("Please provide your name and email");
      return;
    }

    try {
      const priceInCents = BigInt(Math.round(effectiveAmount * 100));
      const amountUSDCents = BigInt(Math.round(amountInUSD * 100));
      await submitDonation({
        campaignId: campaign.id,
        amount: priceInCents,
        amountUSD: amountUSDCents,
        currency,
        donorName: isAnonymous ? "Anonymous" : donorName,
        donorEmail: isAnonymous ? "" : donorEmail,
        donorPhone,
        isAnonymous,
        paymentMethod: {
          __kind__: "bankTransfer",
          bankTransfer: { reference: utrNumber.trim() },
        },
      });
      setUpiSubmitted(true);
      toast.success("Donation recorded! Thank you for your generosity.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to record donation. Please try again.");
    }
  };

  if (upiSubmitted) {
    return (
      <div
        className="bg-card rounded-2xl p-8 card-shadow border border-border text-center space-y-4"
        data-ocid="donation_form.success_state"
      >
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="font-display font-bold text-xl text-foreground">
          Thank You!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your UPI donation has been recorded. Our team will verify your
          transaction shortly.
        </p>
        <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
          UTR Reference:{" "}
          <span className="font-mono font-semibold text-foreground">
            {utrNumber}
          </span>
        </p>
        <Button
          onClick={() => {
            setUpiSubmitted(false);
            setUtrNumber("");
          }}
          variant="outline"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          Make Another Donation
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow border border-border space-y-5">
      <div className="text-center mb-2">
        <h3 className="font-display font-bold text-lg text-foreground">
          Make a Donation
        </h3>
        <p className="text-sm text-muted-foreground">
          Your generosity changes lives
        </p>
      </div>

      {/* Payment method tabs */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          type="button"
          data-ocid="donation_form.card_tab"
          onClick={() => setPaymentTab("card")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
            paymentTab === "card"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Card / Stripe
        </button>
        <button
          type="button"
          data-ocid="donation_form.upi_tab"
          onClick={() => setPaymentTab("upi")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
            paymentTab === "upi"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          UPI
        </button>
      </div>

      {/* ─── Shared: Currency + Amount ─── */}
      <form
        onSubmit={paymentTab === "card" ? handleStripeSubmit : handleUpiSubmit}
        className="space-y-5"
      >
        {/* Currency */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              data-ocid="donation_form.currency_select"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {SUPPORTED_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {getCurrencySymbol(c)} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preset amounts */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">
            Donation Amount
          </Label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {PRESET_AMOUNTS_USD.map((amount, i) => (
              <button
                key={amount}
                type="button"
                data-ocid={`donation_form.amount_button.${i + 1}`}
                onClick={() => handlePresetClick(amount)}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                  !isCustom && selectedPreset === amount
                    ? "border-orange-500 bg-orange-500 text-white shadow-donate"
                    : "border-border bg-card text-foreground hover:border-orange-300"
                }`}
              >
                {currencySymbol}
                {amount}
              </button>
            ))}
            <button
              type="button"
              data-ocid="donation_form.amount_button.6"
              onClick={handleCustomClick}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                isCustom
                  ? "border-orange-500 bg-orange-500 text-white shadow-donate"
                  : "border-border bg-card text-foreground hover:border-orange-300"
              }`}
            >
              Custom
            </button>
          </div>
          {isCustom && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                {currencySymbol}
              </span>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                data-ocid="donation_form.amount_input"
                className="pl-8"
              />
            </div>
          )}
        </div>

        {/* ─── UPI-specific section ─── */}
        {paymentTab === "upi" && (
          <div className="space-y-4">
            {upiQrImageId && upiQrUrl ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scan QR to Pay
                </div>
                <img
                  src={upiQrUrl}
                  alt="UPI QR Code"
                  className="w-44 h-44 object-contain rounded-lg border border-border bg-white p-2"
                />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Pay to UPI ID</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {localStorage.getItem("upi_id") || "globalhope@upi"}
                  </p>
                </div>
              </div>
            ) : upiQrImageId === null ? (
              <div
                className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm"
                data-ocid="donation_form.error_state"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">
                    UPI QR not configured
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Please use card payment or contact admin to set up UPI QR
                    code.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-xl">
                <QrCode className="w-5 h-5 text-muted-foreground animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  Loading QR code...
                </span>
              </div>
            )}

            {/* UTR input */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                UPI Transaction ID (UTR) *
              </Label>
              <Input
                type="text"
                placeholder="e.g. 407812345678"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                data-ocid="donation_form.utr_input"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 12-digit UTR number from your UPI app after payment
              </p>
            </div>
          </div>
        )}

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <Label
            htmlFor="anonymous"
            className="text-sm font-medium cursor-pointer"
          >
            Donate anonymously
          </Label>
          <Switch
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            data-ocid="donation_form.anonymous_toggle"
          />
        </div>

        {/* Donor fields */}
        {!isAnonymous && (
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="donor-name"
                className="text-sm font-semibold mb-1.5 block"
              >
                Full Name *
              </Label>
              <Input
                id="donor-name"
                type="text"
                placeholder="Jane Doe"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                data-ocid="donation_form.name_input"
                required={!isAnonymous}
              />
            </div>
            <div>
              <Label
                htmlFor="donor-email"
                className="text-sm font-semibold mb-1.5 block"
              >
                Email Address *
              </Label>
              <Input
                id="donor-email"
                type="email"
                placeholder="jane@example.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                data-ocid="donation_form.email_input"
                required={!isAnonymous}
              />
            </div>
            <div>
              <Label
                htmlFor="donor-phone"
                className="text-sm font-semibold mb-1.5 block"
              >
                Phone{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="donor-phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                data-ocid="donation_form.phone_input"
              />
            </div>
          </div>
        )}

        {/* Amount preview */}
        {effectiveAmount > 0 && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-orange-700">
                Your donation:
              </span>
              <span className="text-lg font-bold text-orange-600">
                {currencySymbol}
                {effectiveAmount.toFixed(0)} {currency}
              </span>
            </div>
            {/* USD conversion preview for non-USD currencies */}
            {currency !== "USD" && amountInUSD > 0 && (
              <div className="flex justify-end">
                <span className="text-xs text-orange-500 font-medium">
                  ~${amountInUSD.toFixed(2)} USD
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        {paymentTab === "card" ? (
          <Button
            type="submit"
            disabled={isCheckoutPending || effectiveAmount <= 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 h-12 text-base shadow-donate transition-all hover:scale-[1.02]"
            data-ocid="donation_form.submit_button"
          >
            {isCheckoutPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Donate{" "}
                {effectiveAmount > 0
                  ? `${currencySymbol}${effectiveAmount.toFixed(0)}`
                  : "Now"}
              </>
            )}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isUpiPending || effectiveAmount <= 0 || !utrNumber.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 h-12 text-base shadow-donate transition-all hover:scale-[1.02]"
            data-ocid="donation_form.upi_submit_button"
          >
            {isUpiPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Confirm UPI Donation
              </>
            )}
          </Button>
        )}

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span>
            {paymentTab === "card"
              ? "Secured by Stripe · 256-bit SSL encryption"
              : "Your donation is recorded securely"}
          </span>
        </div>

        {/* GDPR notice */}
        <p className="text-xs text-muted-foreground text-center">
          Your data is processed in accordance with our{" "}
          <a
            href="/legal/privacy"
            className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>

        {/* Payment logos (card only) */}
        {paymentTab === "card" && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {["Visa", "MC", "AmEx", "PayPal", "GPay", "UPI"].map((method) => (
              <span
                key={method}
                className="text-xs font-semibold text-muted-foreground border border-border rounded px-2 py-0.5"
              >
                {method}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
