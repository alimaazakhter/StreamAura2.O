"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Play, Lock, X, LogIn, UserPlus } from "lucide-react";
import MoviePlayerModal from "@/components/MoviePlayerModal";

interface PlayButtonProps {
  title: string;
}

export default function PlayButton({ title }: PlayButtonProps) {
  const { data: session } = useSession();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePlayClick = () => {
    if (session) {
      setShowPlayer(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handlePlayClick}
        className="flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-95"
      >
        <Play size={20} className="fill-white" />
        Play Movie
      </button>

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-fade-in">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative w-full max-w-md mx-4 glass rounded-3xl p-8 sm:p-10 animate-fade-in-scale text-center">
            {/* Close */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X size={20} />
            </button>

            {/* Lock Icon */}
            <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-6 text-accent animate-pulse">
              <Lock size={28} />
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-white mb-2">Streaming Portal Locked</h2>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
              To watch <span className="text-white font-semibold">"{title}"</span> and unlock our full library of HD streams, please sign in or create an account.
            </p>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <LogIn size={18} />
                Sign In to Stream
              </Link>
              
              <Link
                href="/signup"
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-white/10 hover:scale-[1.01]"
              >
                <UserPlus size={18} />
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayer && (
        <MoviePlayerModal title={title} onClose={() => setShowPlayer(false)} />
      )}
    </>
  );
}
