"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface MoviePlayerModalProps {
  title: string;
  onClose: () => void;
}

interface VideoSource {
  label: string;
  url: string;
}

export default function MoviePlayerModal({ title, onClose }: MoviePlayerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video Sources
  const [sources, setSources] = useState<VideoSource[]>([
    {
      label: "Demo Cinema 1 (Oceans)",
      url: "https://vjs.zencdn.net/v/oceans.mp4",
    },
    {
      label: "Demo Cinema 2 (Sintel Trailer)",
      url: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    },
  ]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [localFileWarning, setLocalFileWarning] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch local file details if uploaded
  useEffect(() => {
    const checkLocalFile = async () => {
      try {
        const res = await fetch("/api/videos/local-file");
        if (res.ok) {
          const data = await res.json();
          if (data.file) {
            // Smart Auto-Selection: if the local filename matches the movie title, replace sources with ONLY the local file
            const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cleanTitle = clean(title);
            const cleanFile = clean(data.file.name);
            const isMatch = cleanFile.includes(cleanTitle) || cleanTitle.includes(cleanFile);

            if (isMatch) {
              setSources([
                {
                  label: "HD Server (Local)",
                  url: data.file.url,
                },
              ]);
              setActiveSourceIndex(0);

              // If the user uploaded a file with .mkv, alert them of potential codec failures
              if (data.file.extension === ".mkv") {
                setLocalFileWarning(
                  "Note: You uploaded an .mkv file. Web browsers do not natively play all MKV encodings. If it fails to play, we recommend converting it to .mp4 (H.264)."
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to query local video file API:", err);
      }
    };
    checkLocalFile();
  }, [title]);

  // Keyboard Shortcuts & Body Overflow Lock
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    document.body.classList.add("video-player-active");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "escape":
          e.preventDefault();
          onClose();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      setMounted(false);
      document.body.style.overflow = "";
      document.body.classList.remove("video-player-active");
      window.removeEventListener("keydown", handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onClose]);

  // Autoplay on mount/source change
  useEffect(() => {
    setMediaError(null);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [activeSourceIndex]);

  // Controls Visibility Timer (Auto Hide)
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSourceSelector(false);
      }, 3000);
    }
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Video Events
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const onWaiting = () => setIsBuffering(true);
  const onPlaying = () => {
    setIsBuffering(false);
    setMediaError(null);
  };

  const handleVideoError = () => {
    setIsBuffering(false);
    if (videoRef.current && videoRef.current.error) {
      const code = videoRef.current.error.code;
      if (code === 1) setMediaError("The video download was aborted.");
      else if (code === 2) setMediaError("A network error occurred. The video failed to download.");
      else if (code === 3) setMediaError("The video playback was aborted due to corruption or format codec incompatibility.");
      else if (code === 4) setMediaError("The video could not be loaded, either because the server or network failed or because the format is not supported by your web browser.");
      else setMediaError("An unexpected error occurred while loading this video.");
    } else {
      setMediaError("Could not connect to the streaming server or play this video format.");
    }
  };

  // Playback Operations
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Listen for fullscreen change event (e.g. if exited via browser controls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Format Helper
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const pad = (num: number) => String(num).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[150] bg-black flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Node */}
      <video
        ref={videoRef}
        src={sources[activeSourceIndex].url}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        onError={handleVideoError}
        playsInline
      />

      {/* Buffering/Loading Indicator */}
      {isBuffering && !mediaError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={50} className="text-accent animate-spin" />
            <p className="text-white text-sm font-medium tracking-wide">Buffering Cinema Stream...</p>
          </div>
        </div>
      )}

      {/* Error Boundary Overlay */}
      {mediaError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20 animate-fade-in">
          <div className="max-w-md w-11/12 text-center p-8 bg-bg-secondary border border-white/10 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
              <VolumeX size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Streaming Error</h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              {mediaError}
            </p>
            <p className="text-text-muted text-[11px] mb-8 leading-relaxed">
              Tip: The cloud server might be offline or blocked by your network. Open <span className="text-white font-semibold">Switch Stream</span> in the top right to play your local file.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setMediaError(null);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                  }
                }}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Retry Stream
              </button>
              <button
                onClick={() => setShowSourceSelector(!showSourceSelector)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Switch Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codec Warnings */}
      {localFileWarning && showControls && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 max-w-lg w-11/12 bg-rating-yellow/10 border border-rating-yellow/30 p-3 rounded-xl text-rating-yellow text-xs flex gap-2.5 backdrop-blur-md animate-fade-in">
          <span className="font-bold shrink-0">⚠️ Compatibility Alert:</span>
          <p className="leading-relaxed">{localFileWarning}</p>
        </div>
      )}

      {/* Play/Pause Overlay animation */}
      {!showControls && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center text-white scale-125 opacity-100 transition-all duration-300">
            <Pause size={32} className="fill-white" />
          </div>
        </div>
      )}

      {/* Top Bar Controls */}
      <div
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95"
            aria-label="Back to movie details"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-white text-base sm:text-lg font-bold">{title}</h1>
            <p className="text-text-secondary text-xs font-semibold">
              Currently playing: <span className="text-accent font-bold">{sources[activeSourceIndex].label}</span>
            </p>
          </div>
        </div>

        {/* Source Selector button */}
        {sources.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                showSourceSelector
                  ? "bg-accent border-accent text-white"
                  : "bg-white/5 border-white/10 hover:border-white/20 text-text-secondary hover:text-white"
              }`}
            >
              <Settings size={16} />
              Switch Stream
            </button>

            {showSourceSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-white/10 rounded-2xl p-2.5 shadow-2xl z-[160] animate-fade-in-scale">
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-wider px-2 py-1 border-b border-white/5 mb-1.5">
                  Select Media Source
                </p>
                <div className="space-y-1">
                  {sources.map((src, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveSourceIndex(index);
                        setShowSourceSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeSourceIndex === index
                          ? "bg-accent/15 border border-accent/20 text-accent"
                          : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end px-6 pb-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber Area */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-white text-xs font-bold font-mono">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group py-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent outline-none transition-all group-hover:h-1.5"
              style={{
                background: `linear-gradient(to right, #e50914 0%, #e50914 ${
                  (currentTime / (duration || 1)) * 100
                }%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
          </div>
          <span className="text-white text-xs font-bold font-mono">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controllers Layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-accent transition-colors hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
            </button>

            {/* Skip 10s Rewind */}
            <button
              onClick={() => skip(-10)}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Rewind 10s"
            >
              <RotateCcw size={20} />
            </button>

            {/* Skip 10s Forward */}
            <button
              onClick={() => skip(10)}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Forward 10s"
            >
              <RotateCw size={20} />
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-accent transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent outline-none transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, #e50914 0%, #e50914 ${
                    (isMuted ? 0 : volume) * 100
                  }%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              {[0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    playbackSpeed === speed
                      ? "bg-accent border-accent text-white"
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-all hover:scale-105">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
