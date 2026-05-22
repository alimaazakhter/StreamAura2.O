"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

interface MovieCardProps {
  item: MediaItem;
  index?: number;
}

export default function MovieCard({ item, index = 0 }: MovieCardProps) {
  const title = getTitle(item);
  const year = getYear(item);
  const rating = item.vote_average;
  const mediaType = item.media_type || ("title" in item ? "movie" : "tv");
  const detailPath = mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
  const posterUrl = getImageUrl(item.poster_path, "w500");

  const ratingColor =
    rating >= 7 ? "text-rating-green" : rating >= 5 ? "text-rating-yellow" : "text-rating-red";

  return (
    <Link
      href={detailPath}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-card transition-all duration-300 group-hover:ring-2 group-hover:ring-accent/50 group-hover:shadow-xl group-hover:shadow-accent/10 group-hover:scale-[1.03]">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 220px"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center justify-center absolute inset-0">
            <div className="w-14 h-14 bg-accent/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-lg shadow-accent/30">
              <Play size={24} className="fill-white text-white ml-1" />
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">
              {title}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>{year}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="capitalize">{mediaType === "tv" ? "Series" : "Movie"}</span>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs font-semibold">
          <Star size={10} className={`fill-current ${ratingColor}`} />
          <span className={ratingColor}>{formatRating(rating)}</span>
        </div>

        {/* Media Type Badge */}
        {mediaType === "tv" && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent/90 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            Series
          </div>
        )}
      </div>

      {/* Title Below Card */}
      <div className="mt-2 px-1">
        <p className="text-sm text-text-secondary group-hover:text-white transition-colors line-clamp-1">
          {title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{year}</p>
      </div>
    </Link>
  );
}
