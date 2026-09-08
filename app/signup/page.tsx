import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell eyebrow="OPEN AN ACCOUNT" title="Own your first asset in minutes.">
      <form className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] text-paper-dim mb-2"
          >
            Full name
          </label>
          <input
            id="name"
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
            type="password"
            placeholder="At least 8 characters"
            className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          className="bg-gold text-ink font-medium text-[15px] py-3.5 mt-2"
        >
          Create account
        </button>
      </form>

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