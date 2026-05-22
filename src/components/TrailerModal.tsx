"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

export default function TrailerModal({ videoKey, title, onClose }: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    document.body.classList.add("video-player-active");
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      document.body.classList.remove("video-player-active");
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-5xl mx-4 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Close trailer"
        >
          <X size={28} />
        </button>

        {/* Title */}
        <p className="absolute -top-12 left-0 text-white/80 text-sm font-medium truncate max-w-[80%]">
          {title}
        </p>

        {/* YouTube Player */}
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${title} - Trailer`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
