"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
      setCheckingSession(false);
    }
    void checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <AuthShell eyebrow="RESET PASSWORD" title="One moment.">
        <p className="text-paper-dim text-[14.5px]">Checking your reset link…</p>
      </AuthShell>
    );
  }

  if (!hasSession) {
    return (
      <AuthShell eyebrow="RESET PASSWORD" title="This link has expired.">
        <p className="text-paper-dim text-[14.5px] leading-relaxed">
          Reset links only work once and expire after a short time. Request a new one to
          continue.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-8 text-[14px] text-paper border-b border-paper-dim"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell eyebrow="RESET PASSWORD" title="Password updated.">
        <p className="text-paper-dim text-[14.5px]">Taking you to log in…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="RESET PASSWORD" title="Choose a new password.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className="block text-[13px] text-paper-dim mb-2">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-[13px] text-paper-dim mb-2">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold text-ink font-medium text-[15px] py-3.5 mt-2 disabled:opacity-40"
        >
          {isSubmitting ? "Saving…" : "Save new password"}
        </button>
        {error && <p className="text-[13px] text-red-300">{error}</p>}
      </form>
    </AuthShell>
  );
}