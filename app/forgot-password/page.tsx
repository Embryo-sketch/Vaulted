"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell eyebrow="RESET PASSWORD" title="Check your email.">
        <p className="text-paper-dim text-[14.5px] leading-relaxed">
          If an account exists for <span className="text-paper">{email}</span>, we&apos;ve
          sent a link to reset your password. It expires shortly, so use it soon.
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 text-[14px] text-paper border-b border-paper-dim"
        >
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="RESET PASSWORD" title="Forgot your password?">
      <p className="text-paper-dim text-[14.5px] mb-8 leading-relaxed">
        Enter the email on your account and we&apos;ll send you a link to reset it.
      </p>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-[13px] text-paper-dim mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold text-ink font-medium text-[15px] py-3.5 mt-2 disabled:opacity-40"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
        {error && <p className="text-[13px] text-red-300">{error}</p>}
      </form>

      <p className="text-[14px] text-paper-dim mt-8">
        Remembered it?{" "}
        <Link href="/login" className="text-paper border-b border-paper-dim">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}