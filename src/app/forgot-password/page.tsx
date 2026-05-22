"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetUrl(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      if (data.isMock) {
        setIsMockMode(true);
        setResetUrl(data.resetUrl);
      } else {
        setIsMockMode(false);
        setSuccessMessage(data.message);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-primary" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Card */}
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
          <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <KeyRound size={22} className="text-accent animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-text-secondary text-sm mt-1">
            We will help you recover your account securely
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rating-red/10 border border-rating-red/20 rounded-xl flex items-center gap-3 text-rating-red text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Real Production Success Interface */}
        {successMessage && (
          <div className="space-y-6">
            <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-accent/25 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Check Your Email!</h3>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                  We have dispatched a secure password recovery link to <span className="text-white font-semibold">{email}</span>. 
                  Please check your inbox (and spam folder) to reset your password.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-text-secondary hover:text-white text-sm transition-colors pt-2"
            >
              <ArrowLeft size={16} />
              Return to Sign In
            </Link>
          </div>
        )}

        {/* Local Sandbox / Developer Test Interface */}
        {resetUrl && isMockMode && (
          <div className="space-y-6">
            <div className="p-5 bg-accent/10 border border-accent/20 rounded-2xl text-center space-y-4">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Sandbox Link Dispatched!</h3>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  Since no <code className="bg-white/10 px-1 py-0.5 rounded text-white text-[11px]">RESEND_API_KEY</code> has been configured in your local environment yet, we have generated a mock sandbox reset link below:
                </p>
              </div>
              
              <Link
                href={resetUrl}
                className="inline-block w-full py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40"
              >
                Reset Password Now
              </Link>
            </div>

            <button
              onClick={() => {
                setResetUrl(null);
                setIsMockMode(false);
              }}
              className="w-full text-center text-text-secondary hover:text-white text-xs transition-colors py-2"
            >
              Try another email address
            </button>
          </div>
        )}

        {/* Initial Input Form */}
        {!successMessage && !resetUrl && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-text-secondary hover:text-white text-sm transition-colors pt-2"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
