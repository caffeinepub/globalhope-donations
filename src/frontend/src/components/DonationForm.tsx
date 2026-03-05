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
import { useCreateCheckoutSession } from "@/hooks/useQueries";
import { getCurrencySymbol } from "@/lib/format";
import { CreditCard, Heart, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Campaign } from "../backend.d";

interface Props {
  campaign: Campaign;
}

const PRESET_AMOUNTS_USD = [10, 25, 50, 100, 250];
const CURRENCIES = ["USD", "EUR", "INR", "GBP", "AED", "CAD", "AUD"] as const;

export default function DonationForm({ campaign }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const { mutateAsync: createCheckout, isPending } = useCreateCheckoutSession();

  const effectiveAmount = isCustom
    ? Number.parseFloat(customAmount) || 0
    : selectedPreset || 0;

  const currencySymbol = getCurrencySymbol(currency);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const origin = window.location.origin;

      const params = new URLSearchParams({
        campaignId: campaign.id,
        currency,
        donorName: isAnonymous ? "Anonymous" : donorName,
        donorEmail: isAnonymous ? "" : donorEmail,
        donorPhone: donorPhone,
        isAnonymous: isAnonymous.toString(),
        amount: priceInCents.toString(),
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-6 card-shadow border border-border space-y-5"
    >
      <div className="text-center mb-2">
        <h3 className="font-display font-bold text-lg text-foreground">
          Make a Donation
        </h3>
        <p className="text-sm text-muted-foreground">
          Your generosity changes lives
        </p>
      </div>

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
          <SelectContent>
            {CURRENCIES.map((c) => (
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
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-orange-700">
              Your donation:
            </span>
            <span className="text-lg font-bold text-orange-600">
              {currencySymbol}
              {effectiveAmount.toFixed(0)} {currency}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending || effectiveAmount <= 0}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 h-12 text-base shadow-donate transition-all hover:scale-[1.02] pulse-ring"
        data-ocid="donation_form.submit_button"
      >
        {isPending ? (
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

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>Secured by Stripe · 256-bit SSL encryption</span>
      </div>

      {/* Payment logos */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {["Visa", "MC", "AmEx", "PayPal"].map((method) => (
          <span
            key={method}
            className="text-xs font-semibold text-muted-foreground border border-border rounded px-2 py-0.5"
          >
            {method}
          </span>
        ))}
      </div>
    </form>
  );
}
