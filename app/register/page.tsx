"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// CONFIG — keep in sync with AuthCard.tsx
// ---------------------------------------------------------------------------
const CONFIG = {
  appName: "Campus Connect",
  tagline: "Create your account to get started",
  logoUrl: "", // e.g. "/logo.png" — leave empty to show the upload placeholder
  signInHref: "/login",
};

export default function RegisterCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Couldn't create your account. Try again.");
        return;
      }

      setSuccess(true);

      // Auto sign-in right after registering, then redirect.
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes?.error) {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F2EF] px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="rounded-lg border border-[#E0DFDC] bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          {/* App identity */}
          <div className="mb-6 flex flex-col items-center text-center">
            <label
              htmlFor="app-logo-upload"
              className="group relative mb-4 flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#C7D6EA] bg-[#EAF3FE] transition-colors hover:border-[#0A66C2]"
              title="Add app logo"
            >
              {CONFIG.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={CONFIG.logoUrl} alt={`${CONFIG.appName} logo`} className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-[#0A66C2] transition-transform group-hover:scale-110" />
              )}
              <input id="app-logo-upload" type="file" accept="image/*" className="hidden" />
            </label>

            <h1 className="text-2xl font-semibold text-[#1D2226]">{CONFIG.appName}</h1>
            <p className="mt-1 text-sm text-[#56687A]">{CONFIG.tagline}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-[#F5C2C7] bg-[#FDECEE] px-3 py-2 text-sm text-[#A32D2D]">
              {error}
            </div>
          )}

          {success && !error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#B7E4C7] bg-[#EAFBF1] px-3 py-2 text-sm text-[#1E7C4C]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Account created — signing you in...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#1D2226]">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-md border border-[#B0B7C3] py-2.5 pl-9 pr-3 text-sm text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#1D2226]">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  className="w-full rounded-md border border-[#B0B7C3] py-2.5 pl-9 pr-3 text-sm text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#1D2226]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-md border border-[#B0B7C3] py-2.5 pl-9 pr-10 text-sm text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F9BA8] hover:text-[#1D2226]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordTooShort && <p className="mt-1 text-xs text-[#A32D2D]">At least 8 characters.</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-[#1D2226]">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-md border border-[#B0B7C3] py-2.5 pl-9 pr-3 text-sm text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                />
              </div>
              {passwordsMismatch && <p className="mt-1 text-xs text-[#A32D2D]">Passwords don&apos;t match.</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E0DFDC]" />
            <span className="text-xs font-medium text-[#8F9BA8]">or</span>
            <span className="h-px flex-1 bg-[#E0DFDC]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#B0B7C3] bg-white py-2.5 text-sm font-semibold text-[#1D2226] transition-colors hover:bg-[#F3F2EF]"
          >
            <GoogleIcon className="h-4 w-4" />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#56687A]">
            Already on {CONFIG.appName}?{" "}
            <a href={CONFIG.signInHref} className="font-semibold text-[#0A66C2] hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[#56687A]">
          {CONFIG.appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}