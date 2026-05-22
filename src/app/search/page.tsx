import type { Metadata } from "next";
import MovieCard from "@/components/MovieCard";
import { searchMulti } from "@/lib/tmdb";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for movies, TV shows, and more on StreamAura.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1");

  let data = null;
  if (query) {
    data = await searchMulti(query, page);
  }

  // Filter out "person" results
  const results = data?.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <form action="/search" method="GET" className="mb-10">
          <div className="relative max-w-2xl mx-auto">
            <Search
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for movies, TV shows..."
              className="w-full pl-14 pr-6 py-4 bg-bg-secondary border border-border rounded-2xl text-lg text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
              autoFocus
            />
          </div>
        </form>

        {/* Results */}
        {query && results ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                {data?.total_results.toLocaleString()} results found
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
                {results.map((item, index) => (
                  <MovieCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🎬</p>
                <h2 className="text-xl font-semibold text-white mb-2">
                  No results found
                </h2>
                <p className="text-text-secondary">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                {page > 1 && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="px-6 py-3 glass glass-hover rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold text-white mb-2">
              Search StreamAura
            </h2>
            <p className="text-text-secondary">
              Find your favorite movies and TV shows
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
