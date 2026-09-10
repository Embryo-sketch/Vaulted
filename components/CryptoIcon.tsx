"use client";

import { useState } from "react";

type CryptoIconProps = {
  sym: string;
  size?: number;
  className?: string;
};

/**
 * Renders a real, colored logo for a given ticker symbol via a public
 * icon CDN. If the symbol has no icon available (or the request fails),
 * it falls back to the ticker text inside a badge circle, so this never
 * breaks for a coin that isn't in the icon set.
 */
export default function CryptoIcon({ sym, size = 28, className = "" }: CryptoIconProps) {
  const [errored, setErrored] = useState(false);
  const symbol = sym.toLowerCase();

  if (errored) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-mono bg-slate-2 text-gold border border-line shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {sym.slice(0, 4)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol}.svg`}
      alt={sym}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`rounded-full shrink-0 bg-slate-2 border border-line ${className}`}
      style={{ width: size, height: size }}
    />
  );
}