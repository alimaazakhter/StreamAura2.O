"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, Send, Sparkles, Star, Film, Loader2 } from "lucide-react";

interface MovieRecommendation {
  id: number;
  title: string;
  type: string;
  poster: string | null;
  rating: number;
  year: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  movies?: MovieRecommendation[];
}

export default function Chatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Aura, your StreamAura AI guide. Ask me to suggest movies based on your favorite genres, directors, actors, or ask about cast members! 🍿",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Watch for video player state on document.body class List
  useEffect(() => {
    setIsVideoActive(document.body.classList.contains("video-player-active"));

    const observer = new MutationObserver(() => {
      setIsVideoActive(document.body.classList.contains("video-player-active"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle outside clicks to close chat window
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".chatbot-trigger-btn")
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build conversation history payload
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        console.warn("[Chatbot] API error:", res.statusText);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I ran into an error connecting to my database. Please try again in a moment! ⚠️",
          },
        ]);
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          movies: data.movies,
        },
      ]);
    } catch (err) {
      console.warn("[Chatbot] Connection failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an error connecting to my database. Please try again in a moment! ⚠️",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleans custom recommendation tags [Movie: Title] into bold title for clean chat display
  const renderCleanMessageContent = (content: string) => {
    const parts = content.split(/(\[(?:Movie|Show):\s*[^\]]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(Movie|Show):\s*([^\]]+)\]$/);
      if (match) {
        return <strong key={index} className="text-accent font-bold">{match[2]}</strong>;
      }
      return part;
    });
  };

  const suggestionChips = [
    { label: "Sci-Fi Thrillers 🚀", prompt: "Suggest some mind-bending sci-fi movies like Interstellar" },
    { label: "Best Comedies 🍿", prompt: "What are some highly-rated comedies to watch?" },
    { label: "Action Classics 🎬", prompt: "Suggest top action thriller movies with gladiators or warriors" },
    { label: "Who directed Inception? 🎥", prompt: "Who directed the movie Inception, and who was in the cast?" },
  ];

  if (isVideoActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[180] flex flex-col items-end font-sans">
      
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="w-[90vw] sm:w-[400px] h-[550px] bg-[#0c0c16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in-scale z-[190]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-bg-secondary to-[#15152a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0c0c16] rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white text-sm font-bold flex items-center gap-1.5 leading-none">
                  Aura <span className="text-[10px] bg-accent/15 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">AI Guide</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5 font-medium">Ready to recommend movies</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-tr-none shadow-lg shadow-accent/15"
                      : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {renderCleanMessageContent(msg.content)}
                </div>

                {/* Recommendations Carousel */}
                {msg.role === "assistant" && msg.movies && msg.movies.length > 0 && (
                  <div className="w-full mt-3">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                      <Film size={10} /> Suggestions inside StreamAura:
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
                      {msg.movies.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => {
                            router.push(`/${movie.type}/${movie.id}`);
                            setIsOpen(false);
                          }}
                          className="min-w-[120px] max-w-[120px] bg-[#121225] border border-white/5 rounded-xl overflow-hidden hover:border-accent/40 hover:scale-[1.03] transition-all duration-300 cursor-pointer flex flex-col group shadow-lg"
                        >
                          <div className="aspect-[2/3] w-full bg-slate-900 relative">
                            {movie.poster ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${movie.poster}`}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px] font-semibold text-center p-2 bg-slate-900">
                                No Image
                              </div>
                            )}
                            <div className="absolute top-1 right-1 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Star size={8} className="fill-yellow-500 text-yellow-500" />
                              <span className="text-[8px] text-white font-bold">{movie.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="p-2 flex flex-col flex-1 justify-between bg-bg-secondary/40">
                            <h4 className="text-white text-[10px] font-bold truncate group-hover:text-accent transition-colors">
                              {movie.title}
                            </h4>
                            <p className="text-text-muted text-[9px] font-semibold mt-0.5">
                              {movie.year} • <span className="capitalize">{movie.type === "tv" ? "Show" : "Movie"}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white/5 border border-white/5 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-accent" />
                  <span className="text-[10px] font-medium text-text-muted">Aura is searching cinema DB...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Only shows if no conversation active beyond introduction) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-white/5 bg-[#090912]">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestionChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip.prompt)}
                    className="text-[10px] font-medium px-2.5 py-1.5 bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 text-text-secondary hover:text-white rounded-lg transition-all active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-[#0a0a14] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about movies, actors, directors..."
              className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-accent/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white disabled:bg-white/5 disabled:text-text-muted transition-all duration-300 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md shadow-accent/15"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-trigger-btn w-14 h-14 rounded-full bg-gradient-to-r from-accent to-[#d0006b] hover:from-accent-hover hover:to-[#b0005a] text-white flex items-center justify-center shadow-xl shadow-accent/25 hover:shadow-accent/40 hover:scale-110 active:scale-90 transition-all duration-300 relative group border border-white/20"
        aria-label="Toggle AI Movie Assistant"
      >
        <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping opacity-75 group-hover:animate-none"></span>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
      
    </div>
  );
}
