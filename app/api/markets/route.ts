const COINS = "bitcoin,ethereum,solana,avalanche-2";

export async function GET(request: Request) {
  try {
    const requestedIds = new URL(request.url).searchParams.get("ids");
    const ids = requestedIds && /^[a-z0-9,-]+$/.test(requestedIds) ? requestedIds : COINS;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h%2C7d`,
      { next: { revalidate: 45 } },
    );
    if (!response.ok) throw new Error(`Market provider returned ${response.status}`);
    const data = await response.json();
    return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=60" } });
  } catch {
    return Response.json({ error: "Live market data is temporarily unavailable." }, { status: 503 });
  }
}
