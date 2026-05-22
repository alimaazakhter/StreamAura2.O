"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Film,
  MessageSquare,
  Clock,
  Key,
  Lock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Loader2,
  ChevronLeft
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  isUnlocked: boolean;
}

interface StatItem {
  watchlistCount: number;
  reviewCount: number;
  loginCount: number;
  totalWatchHours: number;
}

interface Gamification {
  xp: number;
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXpNeeded: number;
}

interface Activity {
  type: string;
  text: string;
  date: string;
}

interface ProfileData {
  profile: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  stats: StatItem;
  gamification: Gamification;
  badges: Badge[];
  timeline: Activity[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProfileData() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchProfileData();
  }, [status]);

  if (status === "loading" || loadingStats) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent" size={40} />
          <p className="text-text-muted text-sm font-medium">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !profileData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 pt-20">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rating-red/10 border border-rating-red/20 flex items-center justify-center text-rating-red mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-text-muted text-sm mb-6 leading-relaxed">
            You must be logged in to view your watch statistics and dynamic badges.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-95"
          >
            Sign In Account
          </Link>
        </div>
      </div>
    );
  }

  const { profile, stats, gamification, badges, timeline } = profileData;
  const xpPercent = Math.min(
    100,
    Math.round((gamification.currentLevelXp / gamification.nextLevelXpNeeded) * 100)
  );

  return (
    <div className="min-h-screen bg-bg-primary text-white pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
            {/* Glowing Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            {/* Avatar block */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-accent/40 shadow-lg shadow-accent/15 flex items-center justify-center bg-accent/20">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-extrabold">
                    {profile.name ? profile.name[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-accent to-[#d0006b] border border-white/15 px-3 py-1 rounded-full text-xs font-black shadow-md tracking-wider">
                LVL {gamification.currentLevel}
              </span>
            </div>

            {/* Profile Info & XP details */}
            <div className="flex-1 text-center sm:text-left w-full">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                {profile.name || "User Aura"}
              </h1>
              <p className="text-sm text-text-muted mb-4 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                {profile.email}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-text-secondary font-semibold mb-6">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-accent" /> Member since: {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </span>
              </div>

              {/* XP Progression Bar */}
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-text-secondary flex items-center gap-1">
                    <TrendingUp size={13} className="text-accent" /> Level Progress
                  </span>
                  <span className="text-white">
                    {gamification.currentLevelXp} / {gamification.nextLevelXpNeeded} XP
                  </span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-[#d0006b] rounded-full shadow-inner transition-all duration-1000 relative"
                    style={{ width: `${xpPercent}%` }}
                  >
                    <span className="absolute top-0 right-0 w-1.5 h-full bg-white/30 animate-pulse"></span>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-2 font-medium">
                  Earn +100 XP per Review, +50 XP per Watchlist item, and +10 XP per Sign In!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Box / Level Status */}
          <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl bg-gradient-to-br from-[#121225] to-[#0c0c16]">
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-accent/5 rounded-full blur-[60px] pointer-events-none"></div>
            <div>
              <span className="text-[10px] font-black bg-accent/15 text-accent border border-accent/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Aura Status
              </span>
              <h2 className="text-2xl font-bold mt-4 text-white">
                {gamification.currentLevel >= 5 ? "Cinephile Legend" : gamification.currentLevel >= 3 ? "Movie Guru" : "Casual Viewer"}
              </h2>
              <p className="text-xs text-text-muted mt-2 leading-relaxed font-medium">
                {gamification.currentLevel >= 5
                  ? "Outstanding! You are a master of cinema trivia and collection. Aura salutes your dedication to films!"
                  : gamification.currentLevel >= 3
                  ? "Great job! You are building a strong collection and writing insightful thoughts. Keep reviewing to level up!"
                  : "You're just starting your story. Add your favorite movies to your watchlist and post review comments to reach Guru status!"}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-secondary font-bold">
              <span>Total Experience Points:</span>
              <span className="text-accent text-sm font-black">{gamification.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Film className="text-blue-400" size={20} />}
            label="Saved Movies"
            value={stats.watchlistCount}
            subtext="In Watchlist"
          />
          <StatCard
            icon={<MessageSquare className="text-emerald-400" size={20} />}
            label="Reviews Published"
            value={stats.reviewCount}
            subtext="Shared Comments"
          />
          <StatCard
            icon={<Clock className="text-amber-400" size={20} />}
            label="Watch Time"
            value={`${stats.totalWatchHours.toFixed(1)}h`}
            subtext="Estimated Hours"
          />
          <StatCard
            icon={<Key className="text-purple-400" size={20} />}
            label="Sign Ins Logged"
            value={stats.loginCount}
            subtext="Sessions Audited"
          />
        </div>

        {/* Grid Sections: Badges & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unlocked Badges Block */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              🏆 Unlocked Achievements
              <span className="text-xs bg-white/5 border border-white/10 text-text-secondary px-2.5 py-1 rounded-full font-bold">
                {badges.filter(b => b.isUnlocked).length} / {badges.length} Unlocked
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 relative overflow-hidden group ${
                    badge.isUnlocked
                      ? "bg-accent/5 border-accent/30 shadow-lg shadow-accent/5 hover:border-accent/60 hover:scale-[1.02] cursor-default"
                      : "bg-white/2 border-white/5 grayscale opacity-50"
                  }`}
                >
                  {/* Badge Icon bubble */}
                  <div
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                      badge.isUnlocked
                        ? "bg-gradient-to-br from-accent/20 to-[#d0006b]/20 border border-accent/20 group-hover:scale-110 transition-transform duration-300"
                        : "bg-white/5 border border-white/5"
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {/* Description details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-xs font-extrabold text-white mb-0.5 truncate flex items-center gap-1.5">
                      {badge.name}
                      {badge.isUnlocked && (
                        <CheckCircle2 size={13} className="text-accent shrink-0" />
                      )}
                    </h4>
                    <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                      {badge.isUnlocked ? badge.description : badge.requirement}
                    </p>
                  </div>

                  {/* Lock Indicator */}
                  {!badge.isUnlocked && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Audit Logs */}
          <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">🕒 Recent Activity</h3>
            
            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-[1px] before:bg-white/10">
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs font-semibold">
                  No activity logged yet.
                </div>
              ) : (
                timeline.map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center z-10 border text-white ${
                        act.type === "review"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : act.type === "watchlist"
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                          : "bg-purple-500/20 border-purple-500/40 text-purple-400"
                      }`}
                    >
                      {act.type === "review" ? (
                        <MessageSquare size={12} />
                      ) : act.type === "watchlist" ? (
                        <Film size={12} />
                      ) : (
                        <Key size={12} />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[11px] font-bold text-slate-200">{act.text}</p>
                      <span className="text-[9px] text-text-muted font-semibold">
                        {new Date(act.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:border-white/20 transition-all shadow-md group">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase text-text-muted tracking-wider truncate">
          {label}
        </p>
        <h4 className="text-lg font-black text-white my-0.5 leading-none">{value}</h4>
        <p className="text-[9px] text-text-secondary font-medium truncate">{subtext}</p>
      </div>
    </div>
  );
}
