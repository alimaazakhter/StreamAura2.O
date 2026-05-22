import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request payload. Messages history array required." },
        { status: 400 }
      );
    }

    // Identify the latest user query to generate mock responses if API key is missing
    const latestUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 1. Fallback / Mock Mode: if Gemini API key is not configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      console.warn("[Gemini Chat API] Running in Sandbox/Mock mode (GEMINI_API_KEY missing)");
      
      let replyText = "Hello! I am Aura, your StreamAura Movie Assistant. Since the Gemini API key is not set up yet, here are some sample recommendations:";
      let queryWords = latestUserMessage.split(/\s+/);
      
      if (queryWords.some((w: string) => ["sci-fi", "scifi", "space", "robot", "tech"].includes(w))) {
        replyText = "For mind-bending sci-fi fans, I highly recommend checking out these masterpiece titles: \n\n1. [Movie: Interstellar] - A stunning voyage through space and time.\n2. [Movie: Tears of Steel] - A cyberpunk short with robotic visual effects.\n3. [Movie: Inception] - A heist set inside the dream state.";
      } else if (queryWords.some((w: string) => ["action", "thriller", "fight", "superhero"].includes(w))) {
        replyText = "If you want high-octane action and suspense, check these out right away:\n\n1. [Movie: The Dark Knight] - The ultimate superhero crime drama.\n2. [Movie: Gladiator] - A legendary tale of betrayal and honor.\n3. [Movie: The Punisher] - A gritty vengeance story.";
      } else if (queryWords.some((w: string) => ["animation", "cartoon", "family", "funny"].includes(w))) {
        replyText = "Perfect films for family night or a good laugh:\n\n1. [Movie: Big Buck Bunny] - A hilarious revenge story of a giant rabbit.\n2. [Movie: Toy Story] - The classic animation that started it all.\n3. [Movie: Sintel] - A stunning, fantasy project.";
      } else {
        replyText = "How can I help you today? You can ask me to suggest movies based on your mood, such as action thriller or family animation, or inquire about directors and actors! Here are some general top-rated titles:\n\n1. [Movie: The Shawshank Redemption] - The highest rated drama of all time.\n2. [Movie: Interstellar] - Nolan's space travel sci-fi adventure.";
      }

      const resolvedMovies = await resolveMovieCards(replyText);

      return NextResponse.json({
        text: replyText,
        movies: resolvedMovies,
        isMock: true
      });
    }

    // 2. Real Gemini API Flow
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : m.role,
      parts: [{ text: m.content || "" }]
    }));

    const systemInstruction = {
      parts: [{
        text: `You are Aura, the official intelligent AI Movie & Series Recommender for the streaming platform "StreamAura".
Your job is to recommend movies, series, or answer cinema trivia (cast, crew, release dates, directors, genres, and plot details).
Always respond in brief, engaging, and user-friendly Markdown formatting. Keep your answers concise and conversational.

CRITICAL FORMATTING RULE:
Whenever you recommend, suggest, or mention a movie or TV show that the user might want to watch, you MUST write its exact title enclosed in custom brackets like this:
- For movies: [Movie: Movie Title] (e.g. [Movie: Interstellar] or [Movie: Inception])
- For TV shows/series: [Show: Show Title] (e.g. [Show: Breaking Bad] or [Show: Stranger Things])

Do not embed links inside these brackets. Our application scans for these brackets and dynamically renders clickable movie poster cards under your chat bubble to allow users to play them instantly. You can recommend up to 4 titles in a single turn.`
      }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Gemini API direct call failed:", errData);
      throw new Error(errData?.error?.message || "Failed to query Gemini AI model.");
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that query. Please try again.";

    // Parse the recommendations and search TMDb
    const resolvedMovies = await resolveMovieCards(candidateText);

    return NextResponse.json({
      text: candidateText,
      movies: resolvedMovies,
      isMock: false
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat query." },
      { status: 500 }
    );
  }
}

/**
 * Parses tags like [Movie: Title] or [Show: Title] from text response
 * and queries TMDb to resolve full movie/show details for rendering.
 */
async function resolveMovieCards(text: string) {
  const movieRegex = /\[Movie:\s*([^\]]+)\]/g;
  const showRegex = /\[Show:\s*([^\]]+)\]/g;

  const movieMatches = [...text.matchAll(movieRegex)].map(m => ({ title: m[1].trim(), type: "movie" }));
  const showMatches = [...text.matchAll(showRegex)].map(m => ({ title: m[1].trim(), type: "tv" }));

  const allMatches = [...movieMatches, ...showMatches];
  if (allMatches.length === 0) return [];

  // Deduplicate matched search titles
  const uniqueMatches = allMatches.filter((item, index, self) =>
    self.findIndex(t => t.title.toLowerCase() === item.title.toLowerCase()) === index
  );

  // Search TMDb in parallel (limit to top 4 recommendations to keep it super fast)
  const resolvedPromises = uniqueMatches.slice(0, 4).map(async (match) => {
    try {
      const searchRes = await searchMulti(match.title, 1);
      if (searchRes.results && searchRes.results.length > 0) {
        const item = searchRes.results[0]; // Best matched search result
        const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : "";
        const year = releaseDate ? new Date(releaseDate).getFullYear().toString() : "N/A";
        
        const title = "title" in item ? item.title : "name" in item ? item.name : match.title;

        return {
          id: item.id,
          title,
          type: item.media_type || match.type,
          poster: item.poster_path || null,
          rating: item.vote_average || 0,
          year
        };
      }
    } catch (err) {
      console.error(`TMDb auto-resolve failed for ${match.title}:`, err);
    }
    return null;
  });

  const results = await Promise.all(resolvedPromises);
  
  // Return non-null results, deduplicated by TMDb ID
  const validResults = results.filter((item): item is NonNullable<typeof item> => item !== null);
  return validResults.filter((item, index, self) =>
    self.findIndex(m => m.id === item.id) === index
  );
}
