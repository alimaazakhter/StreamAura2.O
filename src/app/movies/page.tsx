import type { Metadata } from "next";
import MovieCard from "@/components/MovieCard";
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse popular, top rated, and upcoming movies on StreamAura.",
};

interface MoviesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

const categories = [
  { key: "popular", label: "Popular", icon: "🔥" },
  { key: "top_rated", label: "Top Rated", icon: "⭐" },
  { key: "now_playing", label: "Now Playing", icon: "🎬" },
  { key: "upcoming", label: "Upcoming", icon: "🚀" },
];

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const category = params.category || "popular";
  const page = parseInt(params.page || "1");

  let data;
  switch (category) {
    case "top_rated":
      data = await getTopRatedMovies(page);
      break;
    case "now_playing":
      data = await getNowPlayingMovies(page);
      break;
    case "upcoming":
      data = await getUpcomingMovies(page);
      break;
    default:
      data = await getPopularMovies(page);
  }

  const currentCategory = categories.find((c) => c.key === category) || categories[0];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            {currentCategory.icon} {currentCategory.label} Movies
          </h1>
          <p className="text-text-secondary">
            Discover the best movies curated for you
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <a
              key={cat.key}
              href={`/movies?category=${cat.key}`}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                category === cat.key
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "glass glass-hover text-text-secondary hover:text-white"
              }`}
            >
              {cat.icon} {cat.label}
            </a>
          ))}
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {data.results.map((movie, index) => (
            <MovieCard key={movie.id} item={movie} index={index} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          {page > 1 && (
            <a
              href={`/movies?category=${category}&page=${page - 1}`}
              className="px-6 py-3 glass glass-hover rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
            >
              ← Previous
            </a>
          )}
          <span className="px-4 py-2 text-text-secondary text-sm">
            Page {page} of {Math.min(data.total_pages, 500)}
          </span>
          {page < Math.min(data.total_pages, 500) && (
            <a
              href={`/movies?category=${category}&page=${page + 1}`}
              className="px-6 py-3 glass glass-hover rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
            >
              Next →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
