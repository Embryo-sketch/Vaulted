import { ReactNode } from "react";

type CornerFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A hairline gold border with small corner brackets at each corner —
 * the "certificate/ledger" framing motif used across the redesign.
 * Wrap any section or card in this for the new visual language.
 */
export default function CornerFrame({ children, className = "" }: CornerFrameProps) {
  return (
    <div className={`relative border border-gold/40 ${className}`}>
      <span className="absolute -top-px -left-px w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-gold" />
      <span className="absolute -top-px -right-px w-4 h-4 border-t-[1.5px] border-r-[1.5px] border-gold" />
      <span className="absolute -bottom-px -left-px w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-gold" />
      <span className="absolute -bottom-px -right-px w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-gold" />
      {children}
    </div>
  );
}