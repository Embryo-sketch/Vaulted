"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIMEOUT_MS = 30 * 60 * 1000;

export default function SessionTimeout() {
  const router = useRouter();
  const lastActivity = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOut = useRef(false);

  useEffect(() => {
    lastActivity.current = Date.now();
    async function signOutForInactivity() {
      if (signingOut.current) return;
      signingOut.current = true;
      await createClient().auth.signOut();
      router.replace("/login?reason=timeout");
      router.refresh();
    }
    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      const remaining = TIMEOUT_MS - (Date.now() - lastActivity.current);
      if (remaining <= 0) void signOutForInactivity();
      else timer.current = setTimeout(() => void signOutForInactivity(), remaining);
    }
    function recordActivity() {
      lastActivity.current = Date.now();
      schedule();
    }
    function checkVisibility() {
      if (!document.hidden) schedule();
    }
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkVisibility);
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, recordActivity));
      document.removeEventListener("visibilitychange", checkVisibility);
    };
  }, [router]);
  return null;
}
