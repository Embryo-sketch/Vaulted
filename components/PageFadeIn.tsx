"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Fades page content in once on mount (not scroll-triggered) — used inside
 * DashboardShell so every dashboard page gets a subtle, non-repetitive
 * entrance without needing to touch each page individually.
 */
export default function PageFadeIn({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {children}
    </div>
  );
}