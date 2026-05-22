"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Star, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";

interface ReviewUser {
  name: string | null;
  image: string | null;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  user: ReviewUser;
}

interface MovieReviewsProps {
  mediaId: string;
  mediaType: string;
}

export default function MovieReviews({ mediaId, mediaType }: MovieReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState(10);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?mediaId=${mediaId}&mediaType=${mediaType}`);
        const data = await res.url ? await res.json() : null;
        if (data?.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [mediaId, mediaType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write a review message before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaType,
          content,
          rating,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Add new review at the top
      setReviews((prev) => [data.review, ...prev]);
      setContent("");
      setRating(10);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-600/5 pointer-events-none" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Community Reviews</h2>
          <p className="text-text-muted text-xs">Share your ratings & thoughts with others</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rating-red/10 border border-rating-red/20 rounded-xl flex items-center gap-3 text-rating-red text-sm animate-shake">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Review Input Box */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-10 space-y-5 p-5 bg-white/5 border border-white/5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-white text-sm font-semibold">Your Rating:</span>
            {/* 10 Star System */}
            <div className="flex items-center gap-1.5">
              {[...Array(10)].map((_, index) => {
                const starValue = index + 1;
                const isGold = (hoveredRating !== null ? starValue <= hoveredRating : starValue <= rating);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="focus:outline-none transition-transform hover:scale-125 duration-100"
                  >
                    <Star
                      size={20}
                      className={`transition-colors ${
                        isGold ? "fill-rating-yellow text-rating-yellow" : "text-white/20"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-rating-yellow text-sm font-bold ml-2">
                {hoveredRating !== null ? hoveredRating : rating}/10
              </span>
            </div>
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think of this title? Share your spoiler-free thoughts..."
              rows={4}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm resize-none"
              disabled={submitting}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-accent/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Review
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-white/5 border border-white/5 rounded-2xl text-center space-y-3">
          <p className="text-text-secondary text-sm">
            You must be signed in to submit reviews and rate this title.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-accent/20"
          >
            Sign In to Share Review
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="text-accent animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 border border-white/5 bg-white/5 rounded-2xl space-y-3 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-card border border-white/10 shrink-0">
                    <img
                      src={review.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(review.user.name || "User")}`}
                      alt={review.user.name || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">{review.user.name || "Anonymous User"}</h4>
                    <p className="text-text-muted text-[10px]">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-rating-yellow/10 border border-rating-yellow/20 rounded-full shrink-0">
                  <Star size={14} className="fill-rating-yellow text-rating-yellow" />
                  <span className="text-rating-yellow text-xs font-bold">{review.rating}/10</span>
                </div>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line pl-1">
                {review.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 space-y-2 border border-dashed border-white/10 rounded-2xl">
            <p className="text-text-secondary text-sm">No reviews yet for this title.</p>
            <p className="text-text-muted text-xs">Be the first to rate and write a community review!</p>
          </div>
        )}
      </div>
    </section>
  );
}
