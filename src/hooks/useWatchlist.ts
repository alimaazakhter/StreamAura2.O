"use client";

import { useState, useEffect, useCallback } from "react";
import type { WatchlistItem } from "@/lib/types";

const WATCHLIST_KEY = "streamaura_watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        setWatchlist([]);
      }
    }
  }, []);

  const saveToStorage = (items: WatchlistItem[]) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
    setWatchlist(items);
  };

  const addToWatchlist = useCallback(
    (item: WatchlistItem) => {
      const exists = watchlist.some(
        (w) => w.id === item.id && w.media_type === item.media_type
      );
      if (!exists) {
        saveToStorage([...watchlist, { ...item, addedAt: Date.now() }]);
      }
    },
    [watchlist]
  );

  const removeFromWatchlist = useCallback(
    (id: number, mediaType: "movie" | "tv") => {
      saveToStorage(
        watchlist.filter((w) => !(w.id === id && w.media_type === mediaType))
      );
    },
    [watchlist]
  );

  const isInWatchlist = useCallback(
    (id: number, mediaType: "movie" | "tv") => {
      return watchlist.some(
        (w) => w.id === id && w.media_type === mediaType
      );
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (item: WatchlistItem) => {
      if (isInWatchlist(item.id, item.media_type)) {
        removeFromWatchlist(item.id, item.media_type);
      } else {
        addToWatchlist(item);
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    count: watchlist.length,
  };
}
