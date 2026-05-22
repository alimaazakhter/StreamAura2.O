"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import TrailerModal from "@/components/TrailerModal";

interface TrailerButtonProps {
  videoKey: string;
  title: string;
}

export default function TrailerButton({ videoKey, title }: TrailerButtonProps) {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTrailer(true)}
        className="flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-95"
      >
        <Play size={20} className="fill-white" />
        Watch Trailer
      </button>

      {showTrailer && (
        <TrailerModal
          videoKey={videoKey}
          title={title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </>
  );
}
