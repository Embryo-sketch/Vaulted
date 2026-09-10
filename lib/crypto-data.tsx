export type Asset = {
  sym: string;
  name: string;
  network: string;
  price: number;
  change24h: number; // percent, e.g. 1.82 or -0.6
  change7d: number;
  marketCap: number; // in dollars
};

// Single source of truth for every supported asset.
// Add a new coin here and it becomes available everywhere
// (ticker, markets table, holdings, deposit wallets) automatically.
export const ASSETS: Asset[] = [
  { sym: "BTC", name: "Bitcoin", network: "Bitcoin network", price: 61204.11, change24h: 1.82, change7d: 6.4, marketCap: 1_200_000_000_000 },
  { sym: "ETH", name: "Ethereum", network: "ERC-20", price: 3412.9, change24h: 3.1, change7d: -1.2, marketCap: 410_500_000_000 },
  { sym: "SOL", name: "Solana", network: "Solana network", price: 142.08, change24h: -0.6, change7d: 9.8, marketCap: 64_200_000_000 },
  { sym: "AVAX", name: "Avalanche", network: "Avalanche C-Chain", price: 28.44, change24h: 0.94, change7d: 2.1, marketCap: 11_100_000_000 },
  { sym: "USDT", name: "Tether", network: "ERC-20", price: 1.0, change24h: 0.01, change7d: 0.0, marketCap: 118_000_000_000 },
  { sym: "USDC", name: "USD Coin", network: "ERC-20", price: 1.0, change24h: 0.0, change7d: 0.01, marketCap: 34_000_000_000 },
  { sym: "BNB", name: "BNB", network: "BEP-20", price: 584.2, change24h: 0.62, change7d: 3.4, marketCap: 85_000_000_000 },
  { sym: "XRP", name: "XRP", network: "XRP Ledger", price: 0.582, change24h: -0.78, change7d: -2.1, marketCap: 32_800_000_000 },
  { sym: "DOGE", name: "Dogecoin", network: "Dogecoin network", price: 0.164, change24h: -1.4, change7d: 4.2, marketCap: 23_600_000_000 },
  { sym: "ADA", name: "Cardano", network: "Cardano network", price: 0.612, change24h: 0.82, change7d: -0.9, marketCap: 21_400_000_000 },
  { sym: "MATIC", name: "Polygon", network: "Polygon network", price: 0.921, change24h: -0.32, change7d: 1.6, marketCap: 8_900_000_000 },
  { sym: "DOT", name: "Polkadot", network: "Polkadot network", price: 7.42, change24h: 1.15, change7d: 3.3, marketCap: 10_200_000_000 },
  { sym: "LINK", name: "Chainlink", network: "ERC-20", price: 14.88, change24h: 2.04, change7d: 5.7, marketCap: 9_100_000_000 },
];

export function getAsset(sym: string): Asset | undefined {
  return ASSETS.find((a) => a.sym === sym);
}

// A user's holding is just a symbol + amount owned.
// Everything else (price, value, change) is derived from ASSETS,
// so updating a price in one place updates every screen that shows it.
export type HoldingInput = {
  sym: string;
  amount: number;
};

export const HOLDINGS: HoldingInput[] = [
  { sym: "BTC", amount: 0.912 },
  { sym: "ETH", amount: 4.22 },
  { sym: "SOL", amount: 120.4 },
  { sym: "AVAX", amount: 58.0 },
];

export type HoldingWithValue = HoldingInput & {
  asset: Asset;
  value: number;
};

export function getHoldingsWithValues(): HoldingWithValue[] {
  return HOLDINGS.filter((h) => getAsset(h.sym)).map((h) => {
    const asset = getAsset(h.sym)!;
    return { ...h, asset, value: h.amount * asset.price };
  });
}

export function getPortfolioTotal(): number {
  return getHoldingsWithValues().reduce((sum, h) => sum + h.value, 0);
}