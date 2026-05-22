import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to view your profile statistics." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user details with reviews, watchlist, and login logs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
        },
        watchlist: {
          orderBy: { addedAt: "desc" },
        },
        loginLogs: {
          orderBy: { loggedInAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in Supabase." },
        { status: 404 }
      );
    }

    const reviewCount = user.reviews.length;
    const watchlistCount = user.watchlist.length;
    const loginCount = user.loginLogs.length;

    // Estimate watch hours: (watchlist items * 2 hours) + (reviews * 1.5 hours) + base mock starting hours
    const totalWatchHours = Math.max(0, watchlistCount * 2 + reviewCount * 1.5);

    // Dynamic Experience Points (XP)
    const xp = (reviewCount * 100) + (watchlistCount * 50) + (loginCount * 10);
    const xpPerLevel = 300;
    const currentLevel = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXp = xp % xpPerLevel;

    // Night Owl logic check: item added/reviewed between 11 PM and 5 AM
    const hasNightActivity = [
      ...user.reviews.map((r: any) => r.createdAt),
      ...user.watchlist.map((w: any) => w.addedAt),
      ...user.loginLogs.map((l: any) => l.loggedInAt)
    ].some((date: any) => {
      const hours = new Date(date).getHours();
      return hours >= 23 || hours <= 5;
    });

    // Badge descriptions and unlock conditions
    const badges = [
      {
        id: "first_step",
        name: "First Step",
        description: "Began your streaming journey with StreamAura.",
        icon: "🚀",
        requirement: "Create a StreamAura account",
        isUnlocked: true, // Always unlocked if logged in
      },
      {
        id: "collector_apprentice",
        name: "Collector Apprentice",
        description: "Curated a modest watchlist of favorite titles.",
        icon: "🍿",
        requirement: "Save 3 movies or TV series to your Watchlist",
        isUnlocked: watchlistCount >= 3,
      },
      {
        id: "super_collector",
        name: "Super Collector",
        description: "Created a massive catalog of films and series.",
        icon: "👑",
        requirement: "Save 10 movies or TV series to your Watchlist",
        isUnlocked: watchlistCount >= 10,
      },
      {
        id: "cinema_critic",
        name: "Cinema Critic",
        description: "Expressed your cinematic views with a review.",
        icon: "✍️",
        requirement: "Publish your first movie/show review",
        isUnlocked: reviewCount >= 1,
      },
      {
        id: "review_veteran",
        name: "Review Veteran",
        description: "Shared detailed opinions on multiple projects.",
        icon: "🏆",
        requirement: "Publish 5 movie or show reviews",
        isUnlocked: reviewCount >= 5,
      },
      {
        id: "frequent_streamer",
        name: "Frequent Streamer",
        description: "Regularly logging in for daily entertainment.",
        icon: "⚡",
        requirement: "Sign in to StreamAura at least 3 times",
        isUnlocked: loginCount >= 3,
      },
      {
        id: "night_owl",
        name: "Night Owl",
        description: "Active after dark. Watching or reviewing late at night.",
        icon: "🦉",
        requirement: "Add a title or review between 11:00 PM and 5:00 AM",
        isUnlocked: hasNightActivity,
      },
    ];

    // Combine recent actions into a unified timeline
    const activityTimeline = [
      ...user.reviews.map((r: any) => ({
        type: "review",
        text: `Reviewed media (Rating: ${r.rating}/10)`,
        date: r.createdAt,
      })),
      ...user.watchlist.map((w: any) => ({
        type: "watchlist",
        text: `Added "${w.title}" to Watchlist`,
        date: w.addedAt,
      })),
      ...user.loginLogs.map((l: any) => ({
        type: "login",
        text: "Logged in to StreamAura",
        date: l.loggedInAt,
      }))
    ]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Return top 10 activities

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        watchlistCount,
        reviewCount,
        loginCount,
        totalWatchHours,
      },
      gamification: {
        xp,
        currentLevel,
        currentLevelXp,
        nextLevelXpNeeded: xpPerLevel,
      },
      badges,
      timeline: activityTimeline,
    });

  } catch (error: any) {
    console.error("Fetch profile statistics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile statistics" },
      { status: 500 }
    );
  }
}
