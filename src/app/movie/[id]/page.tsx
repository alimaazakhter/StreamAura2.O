import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getBackdropUrl,
  getImageUrl,
  formatRating,
  formatRuntime,
  formatDate,
  getTrailerKey,
} from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import TrailerButton from "./TrailerButton";
import WatchlistBtn from "./WatchlistBtn";
import PlayButton from "./PlayButton";
import MovieReviews from "@/components/MovieReviews";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(parseInt(id));
  return {
    title: movie.title,
    description: movie.overview,
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: movie.backdrop_path
        ? [{ url: getBackdropUrl(movie.backdrop_path, "w1280") }]
        : [],
    },
  };
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id);

  const [movie, credits, videos, similar] = await Promise.all([
    getMovieDetails(movieId),
    getMovieCredits(movieId),
    getMovieVideos(movieId),
    getSimilarMovies(movieId),
  ]);

  const trailerKey = getTrailerKey(videos.results);
  const director = credits.crew.find((c) => c.job === "Director");
  const cast = credits.cast.slice(0, 12);
  const ratingColor =
    movie.vote_average >= 7
      ? "text-rating-green"
      : movie.vote_average >= 5
      ? "text-rating-yellow"
      : "text-rating-red";

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[70vh] min-h-[500px]">
        {movie.backdrop_path && (
          <Image
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-80 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Poster */}
          <div className="shrink-0 hidden lg:block">
            <div className="w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                width={288}
                height={432}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 animate-slide-up">
            {/* Tagline */}
            {movie.tagline && (
              <p className="text-accent text-sm font-medium uppercase tracking-wider mb-2">
                {movie.tagline}
              </p>
            )}

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              {movie.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
              <span className={`flex items-center gap-1 font-bold text-lg ${ratingColor}`}>
                ★ {formatRating(movie.vote_average)}
              </span>
              <span className="text-text-muted">({movie.vote_count.toLocaleString()} votes)</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">{formatDate(movie.release_date)}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">{formatRuntime(movie.runtime)}</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}`}
                  className="px-4 py-1.5 glass rounded-full text-sm text-text-secondary hover:text-white hover:border-accent/30 transition-all"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
              <p className="text-text-secondary leading-relaxed text-base max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <PlayButton title={movie.title} />
              {trailerKey && (
                <TrailerButton videoKey={trailerKey} title={movie.title} />
              )}
              <WatchlistBtn
                item={{
                  id: movie.id,
                  title: movie.title,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  media_type: "movie",
                  release_date: movie.release_date,
                  addedAt: 0,
                }}
              />
              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 glass glass-hover rounded-xl text-sm font-medium text-text-secondary hover:text-white transition-all"
                >
                  View on IMDb
                </a>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {director && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Director</p>
                  <p className="text-white text-sm">{director.name}</p>
                </div>
              )}
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Status</p>
                <p className="text-white text-sm">{movie.status}</p>
              </div>
              {movie.budget > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-white text-sm">${(movie.budget / 1_000_000).toFixed(0)}M</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Revenue</p>
                  <p className="text-white text-sm">${(movie.revenue / 1_000_000).toFixed(0)}M</p>
                </div>
              )}
              {movie.spoken_languages.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Language</p>
                  <p className="text-white text-sm">{movie.spoken_languages[0].english_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="glass rounded-xl p-3 text-center hover:bg-bg-glass-hover transition-all group"
                >
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-bg-card">
                    <Image
                      src={getImageUrl(member.profile_path, "w185")}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-sm font-medium truncate">{member.name}</p>
                  <p className="text-text-muted text-xs truncate">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community Reviews & Star Ratings */}
        <MovieReviews mediaId={id} mediaType="movie" />

        {/* Similar Movies */}
        {similar.results.length > 0 && (
          <div className="mt-8">
            <MovieRow
              title="Similar Movies"
              icon="🎯"
              items={similar.results}
            />
          </div>
        )}
      </div>
    </div>
  );
}
