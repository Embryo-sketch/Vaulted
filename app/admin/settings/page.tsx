"use client";

import { useState } from "react";

type NotificationKey = "newSignups" | "newSupportMessages" | "pendingVerifications";

const notificationItems: { key: NotificationKey; label: string; desc: string }[] = [
  { key: "newSignups", label: "New user signups", desc: "Get notified when someone creates an account" },
  { key: "newSupportMessages", label: "New support messages", desc: "Get notified when a user sends a chat message" },
  { key: "pendingVerifications", label: "Pending verification requests", desc: "Get notified when a user is awaiting verification" },
];

export default function AdminSettingsPage() {
  // Profile
  const [fullName, setFullName] = useState("Admin User");
  const [email, setEmail] = useState("admin@vaulted.com");
  const [profileSaved, setProfileSaved] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    newSignups: true,
    newSupportMessages: true,
    pendingVerifications: true,
  });

  function handleSaveProfile() {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function handleUpdatePassword() {
    if (!currentPassword || !newPassword) return;
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">
        Admin settings
      </h1>
      <p className="text-paper-dim text-[14.5px] mb-8">
        Manage your own admin account — separate from user accounts.
      </p>

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
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
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
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5"
              >
                Save changes
              </button>
              {profileSaved && (
                <span className="text-[13px] text-moss">Saved</span>
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
                    ? "Enabled — recommended for admin accounts"
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
                disabled={!currentPassword || !newPassword}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 disabled:opacity-40"
              >
                Update password
              </button>
              {passwordSaved && (
                <span className="text-[13px] text-moss">Password updated</span>
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
      </div>
    </div>
  );
}