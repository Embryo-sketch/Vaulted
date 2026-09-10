import { formatCurrency, formatPercent } from "@/lib/format";

type PortfolioCardProps = {
  total: number;
  changePercent: number;
  sparkline?: number[];
  label?: string;
};

const defaultSparkline = [
  38, 34, 36, 28, 30, 20, 24, 16, 18, 10, 14, 8, 12, 6, 9, 4, 7,
];

export default function PortfolioCard({
  total,
  changePercent,
  sparkline = defaultSparkline,
  label = "Total portfolio value",
}: PortfolioCardProps) {
  const up = changePercent >= 0;
  const width = 500;
  const step = width / (sparkline.length - 1);
  const points = sparkline
    .map((y, i) => `${i * step},${y}`)
    .join(" ");

  return (
    <div className="bg-slate border border-line px-6 md:px-7 py-6 md:py-7">
      <div className="text-[14px] text-paper-dim mb-2">{label}</div>
      <div className="flex items-baseline gap-3 mb-6 flex-wrap">
        <span className="font-mono text-[30px] md:text-[36px]">
          {formatCurrency(total)}
        </span>
        <span
          className={`font-mono text-[14px] ${up ? "text-moss" : "text-rust"}`}
        >
          {formatPercent(changePercent)}
        </span>
      </div>
      <svg
        width="100%"
        height="60"
        viewBox={`0 0 ${width} 60`}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={up ? "#4F7A5C" : "#9C4A34"}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}