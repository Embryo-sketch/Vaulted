"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        options: {
          data: { full_name: String(formData.get("name")) },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setMessage("Check your email to confirm your account, then log in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="OPEN AN ACCOUNT" title="Own your first asset in minutes.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] text-paper-dim mb-2"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[13px] text-paper-dim mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] text-paper-dim mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold text-ink font-medium text-[15px] py-3.5 mt-2"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
        {error && <p className="text-[13px] text-red-300">{error}</p>}
      </form>

      {message && <div className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-5">
        <div className="w-full max-w-[400px] bg-slate border border-gold p-6 md:p-8 shadow-xl">
          <div className="font-mono text-gold text-[12px] mb-3">ONE MORE STEP</div>
          <h2 className="font-serif text-[24px] mb-3">Check your email</h2>
          <p className="text-paper-dim text-[14px] leading-relaxed">{message}</p>
          <Link href="/login" className="inline-block mt-6 bg-gold text-ink font-medium px-5 py-2.5 text-[14px]">Go to log in</Link>
        </div>
      </div>}

      <p className="text-[12.5px] text-paper-dim mt-6 leading-relaxed">
        By continuing, you agree to Vaulted&apos;s Terms and acknowledge the
        Privacy Policy.
      </p>

      <p className="text-[14px] text-paper-dim mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-paper border-b border-paper-dim">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
