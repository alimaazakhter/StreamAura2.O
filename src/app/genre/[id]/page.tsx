import type { Metadata } from "next";
import MovieCard from "@/components/MovieCard";
import { discoverByGenre } from "@/lib/tmdb";

interface GenrePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: GenrePageProps): Promise<Metadata> {
  const params = await searchParams;
  const name = params.name || "Genre";
  return {
    title: `${name} Movies & Shows`,
    description: `Browse the best ${name} movies and TV shows on StreamAura.`,
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { id } = await params;
  const search = await searchParams;
  const genreId = parseInt(id);
  const genreName = search.name || "Genre";
  const page = parseInt(search.page || "1");

  const data = await discoverByGenre(genreId, page);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            {genreName}
          </h1>
          <p className="text-text-secondary">
            Explore the best {genreName.toLowerCase()} movies and shows
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {data.results.map((item, index) => (
            <MovieCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          {page > 1 && (
            <a
              href={`/genre/${genreId}?name=${genreName}&page=${page - 1}`}
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
              href={`/genre/${genreId}?name=${genreName}&page=${page + 1}`}
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
