import { supabase } from "@/lib/supabase";

export type PaywallConfig = {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  benefits: string[];
  ctaText: string;
  secondaryText: string;
  legalText: string;
  checkoutUrl: string;
  monthlyPrice: string | null;
  yearlyPrice: string | null;
  currency: string | null;
};

const FALLBACK_PAYWALL: PaywallConfig = {
  id: "fallback",
  key: "all_access",
  title: "Join to continue",
  subtitle: "Full access to every program, premium workout, and recipe.",
  benefits: [
    "All weeks, all sessions",
    "Premium individual workouts",
    "Progress tracking",
    "Recipes library",
  ],
  ctaText: "Continue on website",
  secondaryText: "Not now",
  legalText:
    "Payments are handled on the website. Manage your plan anytime in Profile.",
  checkoutUrl: "https://barbata.app/join",
  monthlyPrice: "$9.99",
  yearlyPrice: "$79",
  currency: "USD",
};

type PaywallRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  benefits: unknown;
  cta_text: string | null;
  secondary_text: string | null;
  legal_text: string | null;
  checkout_url: string | null;
  monthly_price: string | null;
  yearly_price: string | null;
  currency: string | null;
};

function parseBenefits(value: unknown): string[] {
  if (!Array.isArray(value)) return FALLBACK_PAYWALL.benefits;

  return value
    .map((item) => String(item))
    .filter((item) => item.trim().length > 0);
}

function mapPaywall(row: PaywallRow): PaywallConfig {
  return {
    id: row.id,
    key: row.key,
    title: row.title || FALLBACK_PAYWALL.title,
    subtitle: row.subtitle || FALLBACK_PAYWALL.subtitle,
    benefits: parseBenefits(row.benefits),
    ctaText: row.cta_text || FALLBACK_PAYWALL.ctaText,
    secondaryText: row.secondary_text || FALLBACK_PAYWALL.secondaryText,
    legalText: row.legal_text || FALLBACK_PAYWALL.legalText,
    checkoutUrl: row.checkout_url || FALLBACK_PAYWALL.checkoutUrl,
    monthlyPrice: row.monthly_price,
    yearlyPrice: row.yearly_price,
    currency: row.currency,
  };
}

export async function getPaywallConfig(key = "all_access") {
  const { data, error } = await supabase
    .from("paywall_configs")
    .select(
      `
      id,
      key,
      title,
      subtitle,
      benefits,
      cta_text,
      secondary_text,
      legal_text,
      checkout_url,
      monthly_price,
      yearly_price,
      currency
    `,
    )
    .eq("key", key)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.log("❌ paywall config query error:", error);
    return FALLBACK_PAYWALL;
  }

  if (!data) {
    console.log("⚠️ paywall config not found, using fallback:", key);
    return FALLBACK_PAYWALL;
  }

  console.log("✅ paywall config:", data.key);
  return mapPaywall(data as PaywallRow);
}