"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No valid token was supplied in the reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md glass rounded-3xl p-8 sm:p-10 animate-fade-in-scale">
      <div className="text-center mb-8">
        <Link href="/">
          <Image
            src="/logo-v5.png"
            alt="StreamAura"
            width={160}
            height={45}
            className="h-10 w-auto mx-auto mb-4"
          />
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Password</h1>
        <p className="text-text-secondary text-sm mt-1">
          Choose a strong, secure password
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rating-red/10 border border-rating-red/20 rounded-xl flex items-center gap-3 text-rating-red text-sm animate-shake">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success ? (
        <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 size={24} className="text-accent animate-bounce" />
          </div>
          <h3 className="text-white font-bold text-lg">Password Reset Completed!</h3>
          <p className="text-text-secondary text-sm">
            Your password has been successfully updated. Redirecting to the Login page in a few seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-12 pr-12 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                required
                minLength={8}
                disabled={loading || !token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                disabled={loading || !token}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                required
                minLength={8}
                disabled={loading || !token}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating Password...
              </>
            ) : (
              "Save Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-primary" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[150px]" />
      </div>

      <Suspense fallback={
        <div className="relative w-full max-w-md glass rounded-3xl p-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={36} className="text-accent animate-spin" />
          <p className="text-white text-sm">Loading security keys...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
