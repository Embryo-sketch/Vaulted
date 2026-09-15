"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/client";

type NotificationKey = "priceAlerts" | "txConfirmations" | "productUpdates";

const notificationItems: { key: NotificationKey; label: string; desc: string }[] = [
  { key: "priceAlerts", label: "Price alerts", desc: "Get notified on significant price moves" },
  { key: "txConfirmations", label: "Transaction confirmations", desc: "Email me when a trade completes" },
  { key: "productUpdates", label: "Product updates", desc: "Occasional news about new features" },
];

export default function SettingsPage() {
  const router = useRouter();

  // Profile — loaded from Supabase, kept in sync with what's on the account
  const [userId, setUserId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notifications — still local-only, not yet backed by the database
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    priceAlerts: true,
    txConfirmations: true,
    productUpdates: false,
  });

  // Danger zone
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? user.email ?? "");
        setOriginalEmail(data.email ?? user.email ?? "");
      }
      setLoadingProfile(false);
    }
    void load();
  }, []);

  async function handleSaveProfile() {
    if (!userId) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);

    const supabase = createClient();

    const { error: nameError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (nameError) {
      setProfileError(nameError.message);
      setSavingProfile(false);
      return;
    }

    const emailChanged = email.trim() !== originalEmail.trim();
    if (emailChanged) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        setProfileError(emailError.message);
        setSavingProfile(false);
        return;
      }
      setProfileMessage(
        "Name saved. Check your new email for a confirmation link — your login email won't change until you confirm it.",
      );
    } else {
      setProfileMessage("Saved.");
    }

    setSavingProfile(false);
    setTimeout(() => setProfileMessage(null), 4000);
  }

  async function handleUpdatePassword() {
    if (!currentPassword || !newPassword) return;
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();

    // Confirm the current password is correct before changing it.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: originalEmail,
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordError("Current password is incorrect.");
      setSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPassword(false);

    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setPasswordMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPasswordMessage(null), 3000);
  }

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCloseAccount() {
    if (!confirmingClose) {
      setConfirmingClose(true);
      return;
    }
    // TODO: real account closure once withdrawal + offboarding flow exists
    router.push("/login");
  }

  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">
        Settings
      </h1>

      <div className="flex flex-col gap-10 max-w-[560px]">
        {/* Profile */}
        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-5">PROFILE</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loadingProfile}
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingProfile}
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || loadingProfile}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 disabled:opacity-40"
              >
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
              {profileMessage && (
                <span className="text-[13px] text-moss">{profileMessage}</span>
              )}
              {profileError && (
                <span className="text-[13px] text-rust">{profileError}</span>
              )}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-gold mb-5">SECURITY</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex items-center justify-between bg-slate border border-line px-5 py-4">
              <div>
                <div className="text-[14.5px]">Two-factor authentication</div>
                <div className="text-[12.5px] text-paper-dim mt-1">
                  {twoFactorEnabled
                    ? "Enabled — your account has an extra layer of security"
                    : "Add an extra layer of security to your account"}
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`text-[13px] px-3.5 py-1.5 shrink-0 ml-4 ${
                  twoFactorEnabled
                    ? "border border-line text-paper-dim"
                    : "border border-gold text-gold"
                }`}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdatePassword}
                disabled={!currentPassword || !newPassword || savingPassword}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 disabled:opacity-40"
              >
                {savingPassword ? "Updating…" : "Update password"}
              </button>
              {passwordMessage && (
                <span className="text-[13px] text-moss">{passwordMessage}</span>
              )}
              {passwordError && (
                <span className="text-[13px] text-rust">{passwordError}</span>
              )}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-gold mb-5">
            NOTIFICATIONS
          </h2>
          <div className="flex flex-col gap-4">
            {notificationItems.map((item) => {
              const on = notifications[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-line last:border-b-0"
                >
                  <div>
                    <div className="text-[14.5px]">{item.label}</div>
                    <div className="text-[12.5px] text-paper-dim mt-1">
                      {item.desc}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    aria-pressed={on}
                    aria-label={`Toggle ${item.label}`}
                    className={`w-10 h-5 relative shrink-0 ml-4 transition-colors ${
                      on ? "bg-gold" : "bg-slate-2 border border-line"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 absolute top-[2px] transition-all ${
                        on ? "left-[22px] bg-ink" : "left-[2px] bg-paper-dim"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger zone */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-rust mb-5">
            DANGER ZONE
          </h2>
          <div className="flex items-center justify-between bg-slate border border-rust px-5 py-4">
            <div>
              <div className="text-[14.5px]">Close account</div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                {confirmingClose
                  ? "Click again to permanently confirm closure"
                  : "Withdraw all funds and permanently delete your account"}
              </div>
            </div>
            <button
              onClick={handleCloseAccount}
              onBlur={() => setConfirmingClose(false)}
              className={`text-[13px] px-3.5 py-1.5 shrink-0 ml-4 ${
                confirmingClose
                  ? "bg-rust text-paper border border-rust"
                  : "border border-rust text-rust"
              }`}
            >
              {confirmingClose ? "Confirm close" : "Close account"}
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}