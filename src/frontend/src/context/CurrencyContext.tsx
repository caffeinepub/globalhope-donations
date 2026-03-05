import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Country code → currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  CA: "CAD",
  AU: "AUD",
  SG: "SGD",
  JP: "JPY",
  // Euro zone
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  FI: "EUR",
  IE: "EUR",
  GR: "EUR",
  LU: "EUR",
  SI: "EUR",
  SK: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  MT: "EUR",
  CY: "EUR",
};

const CACHE_KEY = "exchange_rates_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

interface CurrencyContextValue {
  detectedCurrency: string;
  rates: Record<string, number>;
  convertToUSD: (amount: number, fromCurrency: string) => number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  detectedCurrency: "USD",
  rates: {},
  convertToUSD: (amount) => amount,
});

function loadCachedRates(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: RateCache = JSON.parse(raw);
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache.rates;
  } catch {
    return null;
  }
}

function saveCachedRates(rates: Record<string, number>) {
  try {
    const cache: RateCache = { rates, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [detectedCurrency, setDetectedCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Detect user country via IP geolocation
      let currency = "USD";
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        if (geoRes.ok) {
          const geo = await geoRes.json();
          const countryCode: string = geo.country_code ?? "";
          currency = COUNTRY_CURRENCY_MAP[countryCode] ?? "USD";
        }
      } catch {
        // Fall back to USD
      }

      if (cancelled) return;
      setDetectedCurrency(currency);

      // 2. Load exchange rates (cached or fresh)
      const cached = loadCachedRates();
      if (cached) {
        setRates(cached);
        return;
      }

      try {
        const rateRes = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD",
        );
        if (rateRes.ok) {
          const data = await rateRes.json();
          const fetchedRates: Record<string, number> = data.rates ?? {};
          if (!cancelled) {
            setRates(fetchedRates);
            saveCachedRates(fetchedRates);
          }
        }
      } catch {
        // Fallback: rates remain empty {}
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  function convertToUSD(amount: number, fromCurrency: string): number {
    if (fromCurrency === "USD") return amount;
    const rate = rates[fromCurrency];
    if (!rate || rate === 0) return amount; // fallback: assume 1:1
    return amount / rate;
  }

  return (
    <CurrencyContext.Provider value={{ detectedCurrency, rates, convertToUSD }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
