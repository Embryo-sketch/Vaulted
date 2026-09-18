"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  status: "Verified" | "Pending" | "Suspended";
  created_at: string;
};

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function statusColor(status: string) {
  if (status === "Verified") return "text-moss";
  if (status === "Suspended") return "text-rust";
  return "text-gold";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, status, created_at")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        return;
      }
      setProfile(data);
    }
    void load();
  }, []);

  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">Profile</h1>

      {error && <p className="mb-6 text-[14px] text-rust">{error}</p>}

      {!profile ? (
        <p className="text-paper-dim">Loading…</p>
      ) : (
        <div className="flex flex-col gap-8 max-w-[560px]">
          <div className="flex items-center gap-4 bg-slate border border-line px-6 py-6">
            <div className="w-14 h-14 rounded-full bg-slate-2 border border-line flex items-center justify-center font-mono text-[18px] text-gold shrink-0">
              {getInitials(profile.full_name, profile.email)}
            </div>
            <div>
              <div className="text-[17px] font-serif">{profile.full_name || "Unnamed user"}</div>
              <div className="text-[13px] text-paper-dim mt-1">{profile.email}</div>
            </div>
          </div>

          <section>
            <h2 className="font-mono text-[12.5px] text-gold mb-5">ACCOUNT DETAILS</h2>
            <div className="flex flex-col">
              <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
                <span className="text-paper-dim">Full name</span>
                <span>{profile.full_name || "—"}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
                <span className="text-paper-dim">Email</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
                <span className="text-paper-dim">Member since</span>
                <span className="font-mono">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
                <span className="text-paper-dim">Account status</span>
                <span className={`font-mono ${statusColor(profile.status)}`}>
                  {profile.status.toUpperCase()}
                </span>
              </div>
            </div>
          </section>

          <Link
            href="/dashboard/settings"
            className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 self-start"
          >
            Edit in Settings
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
