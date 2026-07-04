"use client";

import { useState, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ImagePlus, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// CONFIG — edit these to personalize the card
// ---------------------------------------------------------------------------
const CONFIG = {
  appName: "Campus Connect",
  tagline: "Sign in to stay connected with your campus",
  logoUrl: "", // e.g. "/logo.png" — leave empty to show the upload placeholder
  signUpHref: "/register",
};

type View = "sign-in" | "forgot-email" | "forgot-otp" | "reset-password" | "reset-success";

const OTP_LENGTH = 6;

export default function AuthCard() {
  const [view, setView] = useState<View>("sign-in");

  // sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // forgot-password state
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const resetMessages = () => setError("");

  // ---- sign in with credentials -------------------------------------------
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  // ---- forgot password: send OTP ------------------------------------------
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (!res.ok) throw new Error();
      setView("forgot-otp");
    } catch {
      setError("Couldn't send the code. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP input handling ---------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim().slice(0, OTP_LENGTH);
    if (!/^[0-9]+$/.test(pasted)) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < OTP_LENGTH) next.push("");
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: code }),
      });
      if (!res.ok) throw new Error();
      setView("reset-password");
    } catch {
      setError("That code didn't work. Check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetMessages();
    setOtp(Array(OTP_LENGTH).fill(""));
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
    } catch {
      setError("Couldn't resend the code.");
    }
  };

  // ---- reset password -------------------------------------------------------
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otp.join(""), password: newPassword }),
      });
      if (!res.ok) throw new Error();
      setView("reset-success");
    } catch {
      setError("Couldn't reset your password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const backToSignIn = () => {
    resetMessages();
    setResetEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setNewPassword("");
    setConfirmPassword("");
    setView("sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F2EF] px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* Card */}
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

            {view === "sign-in" && (
              <>
                <h1 className="text-2xl font-semibold text-[#1D2226]">{CONFIG.appName}</h1>
                <p className="mt-1 text-sm text-[#56687A]">{CONFIG.tagline}</p>
              </>
            )}
            {view === "forgot-email" && (
              <>
                <h1 className="text-xl font-semibold text-[#1D2226]">Forgot password</h1>
                <p className="mt-1 text-sm text-[#56687A]">
                  Enter your email and we&apos;ll send a verification code.
                </p>
              </>
            )}
            {view === "forgot-otp" && (
              <>
                <h1 className="text-xl font-semibold text-[#1D2226]">Enter the code</h1>
                <p className="mt-1 text-sm text-[#56687A]">
                  We sent a 6-digit code to <span className="font-medium text-[#1D2226]">{resetEmail}</span>
                </p>
              </>
            )}
            {view === "reset-password" && (
              <>
                <h1 className="text-xl font-semibold text-[#1D2226]">Create new password</h1>
                <p className="mt-1 text-sm text-[#56687A]">Choose a strong password you haven&apos;t used before.</p>
              </>
            )}
            {view === "reset-success" && (
              <>
                <h1 className="text-xl font-semibold text-[#1D2226]">Password reset</h1>
                <p className="mt-1 text-sm text-[#56687A]">You can now sign in with your new password.</p>
              </>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-[#F5C2C7] bg-[#FDECEE] px-3 py-2 text-sm text-[#A32D2D]">
              {error}
            </div>
          )}

          {/* -------------------- SIGN IN -------------------- */}
          {view === "sign-in" && (
            <>
              <form onSubmit={handleSignIn} className="space-y-4">
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
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-[#1D2226]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        resetMessages();
                        setView("forgot-email");
                      }}
                      className="text-sm font-semibold text-[#0A66C2] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-[#E0DFDC]" />
                <span className="text-xs font-medium text-[#8F9BA8]">or</span>
                <span className="h-px flex-1 bg-[#E0DFDC]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#B0B7C3] bg-white py-2.5 text-sm font-semibold text-[#1D2226] transition-colors hover:bg-[#F3F2EF]"
              >
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </button>

              <p className="mt-6 text-center text-sm text-[#56687A]">
                New to {CONFIG.appName}?{" "}
                <a href={CONFIG.signUpHref} className="font-semibold text-[#0A66C2] hover:underline">
                  Join now
                </a>
              </p>
            </>
          )}

          {/* -------------------- FORGOT: ENTER EMAIL -------------------- */}
          {view === "forgot-email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-[#1D2226]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                    placeholder="you@campus.edu"
                    className="w-full rounded-md border border-[#B0B7C3] py-2.5 pl-9 pr-3 text-sm text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send code
              </button>

              <BackToSignIn onClick={backToSignIn} />
            </form>
          )}

          {/* -------------------- FORGOT: ENTER OTP -------------------- */}
          {view === "forgot-otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-11 rounded-md border border-[#B0B7C3] text-center text-lg font-semibold text-[#1D2226] outline-none transition-colors focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify code
              </button>

              <p className="text-center text-sm text-[#56687A]">
                Didn&apos;t get it?{" "}
                <button type="button" onClick={handleResendOtp} className="font-semibold text-[#0A66C2] hover:underline">
                  Resend code
                </button>
              </p>

              <BackToSignIn onClick={backToSignIn} />
            </form>
          )}

          {/* -------------------- RESET PASSWORD -------------------- */}
          {view === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-[#1D2226]">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9BA8]" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset password
              </button>
            </form>
          )}

          {/* -------------------- SUCCESS -------------------- */}
          {view === "reset-success" && (
            <button
              type="button"
              onClick={backToSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
            >
              Back to sign in
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[#56687A]">
          {CONFIG.appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function BackToSignIn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-[#56687A] hover:text-[#1D2226]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to sign in
    </button>
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