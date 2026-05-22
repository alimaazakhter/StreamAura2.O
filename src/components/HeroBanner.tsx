"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getBackdropUrl, getTitle, getYear, formatRating } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

interface HeroBannerProps {
  items: MediaItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const heroItems = items.slice(0, 6);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % heroItems.length);
  }, [currentIndex, heroItems.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + heroItems.length) % heroItems.length);
  }, [currentIndex, heroItems.length, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!heroItems.length) return null;

  const current = heroItems[currentIndex];
  const title = getTitle(current);
  const year = getYear(current);
  const rating = current.vote_average;
  const mediaType = current.media_type || "movie";
  const detailPath = mediaType === "tv" ? `/tv/${current.id}` : `/movie/${current.id}`;

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Images */}
      {heroItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={getBackdropUrl(item.backdrop_path)}
            alt={getTitle(item)}
            fill
            className="object-cover object-center"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/30" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div
            key={current.id}
            className="max-w-2xl animate-slide-up"
          >
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Trending
              </span>
              <span className="text-text-secondary text-sm">
                #{currentIndex + 1} Today
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
              <div className="flex items-center gap-1 text-rating-green font-semibold">
                <Star size={16} className="fill-rating-green" />
                {formatRating(rating)}
              </div>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">{year}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="px-2 py-0.5 border border-text-muted text-text-secondary text-xs rounded">
                {mediaType === "tv" ? "TV Series" : "Movie"}
              </span>
            </div>

            {/* Overview */}
            <p className="text-text-secondary text-base lg:text-lg leading-relaxed mb-8 line-clamp-3">
              {current.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={detailPath}
                className="flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-95"
              >
                <Play size={20} className="fill-white" />
                Watch Now
              </Link>
              <Link
                href={detailPath}
                className="flex items-center gap-2 px-8 py-3.5 glass glass-hover text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Info size={20} />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all hidden md:block"
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all hidden md:block"
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {heroItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 h-2 bg-accent"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
