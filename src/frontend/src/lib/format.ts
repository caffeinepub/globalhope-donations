/** Convert bigint cents (e.g. 5000n) to a display amount in dollars/euros */
export function formatCurrency(cents: bigint, currency = "USD"): string {
  const amount = Number(cents) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

/** Convert bigint nanoseconds to a JavaScript Date */
export function bigintNsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

/** Format a bigint nanosecond timestamp to a readable date string */
export function formatDate(ns: bigint): string {
  const date = bigintNsToDate(ns);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a bigint nanosecond timestamp to a relative "X days left" */
export function formatDeadline(ns: bigint): string {
  const deadline = bigintNsToDate(ns);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Ended";
  if (diffDays === 0) return "Last day!";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}

/** Calculate progress percentage capped at 100 */
export function calcProgress(current: bigint, target: bigint): number {
  if (target === 0n) return 0;
  const pct = Number((current * 100n) / target);
  return Math.min(pct, 100);
}

/** Format a number compactly (e.g., 1200 → "1.2K") */
export function formatCompact(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export const CURRENCIES = [
  "USD",
  "EUR",
  "INR",
  "GBP",
  "AED",
  "CAD",
  "AUD",
  "SGD",
  "JPY",
  "MYR",
  "NGN",
  "ZAR",
  "BDT",
  "PKR",
] as const;

export type Currency = (typeof CURRENCIES)[number];

/** Get currency symbol */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£",
    AED: "د.إ",
    CAD: "C$",
    AUD: "A$",
    SGD: "S$",
    JPY: "¥",
    MYR: "RM",
    NGN: "₦",
    ZAR: "R",
    BDT: "৳",
    PKR: "₨",
  };
  return symbols[currency] ?? currency;
}

/** Get category display info */
export function getCategoryInfo(category: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    Medical: { label: "Medical", color: "bg-red-100 text-red-700" },
    "Animal Welfare": {
      label: "Animal Welfare",
      color: "bg-green-100 text-green-700",
    },
    Education: { label: "Education", color: "bg-blue-100 text-blue-700" },
    "Disaster Relief": {
      label: "Disaster Relief",
      color: "bg-orange-100 text-orange-700",
    },
    Environment: {
      label: "Environment",
      color: "bg-emerald-100 text-emerald-700",
    },
    Children: { label: "Children", color: "bg-purple-100 text-purple-700" },
  };
  return (
    map[category] ?? { label: category, color: "bg-gray-100 text-gray-700" }
  );
}
