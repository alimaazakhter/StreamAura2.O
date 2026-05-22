"use client";

import { Heart } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { WatchlistItem } from "@/lib/types";

interface WatchlistBtnProps {
  item: WatchlistItem;
}

export default function WatchlistBtn({ item }: WatchlistBtnProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inList = isInWatchlist(item.id, item.media_type);

  return (
    <button
      onClick={() => toggleWatchlist(item)}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
        inList
          ? "bg-accent/20 text-accent border border-accent/30"
          : "glass glass-hover text-white"
      }`}
    >
      <Heart size={18} className={inList ? "fill-accent text-accent" : ""} />
      {inList ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
