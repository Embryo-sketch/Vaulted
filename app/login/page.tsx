"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: replace with real authentication once the backend is wired up
    router.push("/dashboard");
  }

  return (
    <AuthShell eyebrow="LOG IN" title="Welcome back.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] text-paper-dim mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-[13px] text-paper-dim">
              Password
            </label>
            <a href="#" className="text-[13px] text-paper-dim border-b border-paper-dim">
              Forgot?
            </a>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          className="bg-gold text-ink font-medium text-[15px] py-3.5 mt-2"
        >
          Log in
        </button>
      </form>

      <p className="text-[14px] text-paper-dim mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-paper border-b border-paper-dim">
          Open one
        </Link>
      </p>
    </AuthShell>
  );
}
