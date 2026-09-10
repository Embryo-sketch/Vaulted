// Deposit addresses are kept separate from crypto-data.ts on purpose —
// crypto-data.ts is market data (price, name, network) shared everywhere,
// while these are broker/account-specific addresses. Keying by symbol lets
// us pull name/network from ASSETS and just store the address here.
//
// These are placeholder addresses — replace each value with the real
// broker-assigned address once available. Add a symbol here (that also
// exists in ASSETS) to make a new coin depositable.
export const DEPOSIT_ADDRESSES: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976",
  USDT: "0x4E2b2e2a258f6f2E9c1c2b7C4D1a9f3B8E9dC5F1",
  USDC: "0x9F8b3A1c7D2e4F5a6B7c8D9e0F1a2B3c4D5e6F70",
  SOL: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  BNB: "bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23",
  XRP: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
  ADA: "addr1qxy2lpan99fcnhhwvrn9pfp5tv2wgqwvv0f2ncxu4qx4pk",
  DOGE: "D8vFz4p1L37jdg1jXHYSbLJyzXFYzYqR3d",
  MATIC: "0x2C1b3F4a5D6e7F8091A2b3C4d5E6f70819A2b3C",
};

export function getDepositAddress(sym: string): string | undefined {
  return DEPOSIT_ADDRESSES[sym];
}