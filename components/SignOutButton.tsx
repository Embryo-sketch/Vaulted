"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`inline-flex items-center gap-2 text-left ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" strokeLinecap="round" />
        <path d="m14 8 4 4-4 4M18 12H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Log out</span>
    </button>
  );
}
