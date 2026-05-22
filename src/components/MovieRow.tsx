"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import MovieCard from "./MovieCard";
import type { MediaItem } from "@/lib/types";

interface MovieRowProps {
  title: string;
  icon?: string;
  items: MediaItem[];
  viewAllHref?: string;
}

export default function MovieRow({ title, icon, items, viewAllHref }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 400);
    }
  };

  if (!items.length) return null;

  return (
    <section className="relative py-6 lg:py-8">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors group"
            >
              View All
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative group/row">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto scroll-smooth"
        >
          {items.map((item, index) => (
            <MovieCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Scroll Arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-bg-primary to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity z-10"
            aria-label="Scroll left"
          >
            <div className="p-2 bg-bg-card/80 backdrop-blur-sm rounded-full text-white hover:bg-accent/80 transition-colors">
              <ChevronLeft size={20} />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-bg-primary to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity z-10"
            aria-label="Scroll right"
          >
            <div className="p-2 bg-bg-card/80 backdrop-blur-sm rounded-full text-white hover:bg-accent/80 transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
