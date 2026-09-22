export type InvestmentTier = {
  id: string;
  name: string;
  min: number;
  max: number | null; // null = no upper bound
  apr: number; // annual percentage rate, realistic range
  description: string;
};

// Realistic APR tiers — in line with what legitimate crypto staking/yield
// products typically offer (roughly 4-13% APR). Higher tiers get a
// modestly better rate, not an implausible one.
export const INVESTMENT_TIERS: InvestmentTier[] = [
  {
    id: "starter",
    name: "Starter",
    min: 200,
    max: 200,
    apr: 4.5,
    description: "A low-commitment way to start growing a deposit.",
  },
  {
    id: "growth",
    name: "Growth",
    min: 500,
    max: 500,
    apr: 6.2,
    description: "For deposits you're comfortable leaving to grow longer-term.",
  },
  {
    id: "advanced",
    name: "Advanced",
    min: 1000,
    max: 1000,
    apr: 8.1,
    description: "A stronger rate for larger, more established positions.",
  },
  {
    id: "premium",
    name: "Premium",
    min: 5000,
    max: 5000,
    apr: 10.4,
    description: "Our premium rate for high-value deposits.",
  },
  {
    id: "elite",
    name: "Elite",
    min: 10000,
    max: 10000,
    apr: 12.8,
    description: "Our highest tier for established positions.",
  },
];

export function getTierForAmount(amount: number): InvestmentTier | undefined {
  return INVESTMENT_TIERS.find(
    (t) => amount >= t.min && (t.max === null || amount <= t.max)
  );
}

export function formatTierRange(tier: InvestmentTier): string {
  if (tier.max === tier.min) {
    return `$${tier.min.toLocaleString()}`;
  }
  if (tier.max === null) {
    return `$${tier.min.toLocaleString()}+`;
  }
  return `$${tier.min.toLocaleString()} – $${tier.max.toLocaleString()}`;
}
