"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      
      // Reset success message state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        {error && (
          <div className="mb-6 max-w-5xl mx-auto p-4 bg-rating-red/10 border border-rating-red/20 rounded-xl flex items-center gap-3 text-rating-red text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="glass rounded-3xl p-8 animate-fade-in">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-rating-green/15 rounded-full flex items-center justify-center mx-auto text-rating-green animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-white">Message Dispatched Successfully!</h3>
                <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out! Your submission has been saved to Airtable and sent to our team's Slack channel. We'll be in touch soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-colors mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What's this about?"
                      className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    rows={5}
                    className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none text-sm"
                    required
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Email</p>
                    <p className="text-text-secondary text-sm">support@streamaura.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Live Chat</p>
                    <p className="text-text-secondary text-sm">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">FAQ</h3>
              <div className="space-y-3">
                {[
                  {
                    q: "How do I create an account?",
                    a: "Click 'Sign Up' in the top right, fill in your details, and start streaming instantly."
                  },
                  {
                    q: "Is StreamAura free to use?",
                    a: "Yes! It is completely free to search movies, create watchlists, and write reviews."
                  },
                  {
                    q: "How do I add movies to my watchlist?",
                    a: "Go to any movie or TV show page and click the '+ Watchlist' button to sync it to your account."
                  },
                  {
                    q: "Can I download movies offline?",
                    a: "Offline downloads aren't supported, but you can play local video files instantly using our matcher."
                  }
                ].map((item) => (
                  <details key={item.q} className="group">
                    <summary className="text-text-secondary text-sm cursor-pointer hover:text-white transition-colors list-none flex items-center justify-between py-2 border-b border-border">
                      {item.q}
                      <span className="text-text-muted group-open:rotate-45 transition-transform text-lg">+</span>
                    </summary>
                    <p className="text-text-muted text-sm py-3 leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
