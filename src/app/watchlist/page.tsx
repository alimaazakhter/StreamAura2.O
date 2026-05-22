"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl, formatRating } from "@/lib/tmdb";
import { Trash2, Star, Heart } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, count } = useWatchlist();

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart size={32} className="text-accent fill-accent" />
            My Watchlist
          </h1>
          <p className="text-text-secondary">
            {count} {count === 1 ? "title" : "titles"} saved
          </p>
        </div>

        {count > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchlist.map((item) => {
              const detailPath =
                item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
              const ratingColor =
                item.vote_average >= 7
                  ? "text-rating-green"
                  : item.vote_average >= 5
                  ? "text-rating-yellow"
                  : "text-rating-red";

              return (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="glass rounded-2xl overflow-hidden group hover:border-accent/30 transition-all animate-fade-in"
                >
                  <div className="flex gap-4 p-4">
                    {/* Poster */}
                    <Link href={detailPath} className="shrink-0">
                      <div className="w-24 h-36 rounded-xl overflow-hidden bg-bg-card">
                        <Image
                          src={getImageUrl(item.poster_path, "w200")}
                          alt={item.title}
                          width={96}
                          height={144}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link href={detailPath}>
                        <h3 className="text-white font-semibold text-sm group-hover:text-accent transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
                        <span className={`flex items-center gap-0.5 font-medium ${ratingColor}`}>
                          <Star size={10} className="fill-current" />
                          {formatRating(item.vote_average)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-text-muted" />
                        <span className="capitalize">
                          {item.media_type === "tv" ? "Series" : "Movie"}
                        </span>
                      </div>

                      <div className="mt-auto pt-3">
                        <button
                          onClick={() => removeFromWatchlist(item.id, item.media_type)}
                          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-7xl mb-6">🎬</p>
            <h2 className="text-2xl font-bold text-white mb-3">
              Your watchlist is empty
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Start exploring movies and TV shows, then add your favorites to
              keep track of what you want to watch.
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
