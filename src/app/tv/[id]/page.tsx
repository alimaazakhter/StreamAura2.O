import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getSimilarTV,
  getBackdropUrl,
  getImageUrl,
  formatRating,
  formatDate,
  getTrailerKey,
} from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import TrailerButton from "./TrailerButton";
import WatchlistBtn from "./WatchlistBtn";
import MovieReviews from "@/components/MovieReviews";

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTVDetails(parseInt(id));
  return {
    title: show.name,
    description: show.overview,
  };
}

export default async function TVDetailPage({ params }: TVPageProps) {
  const { id } = await params;
  const tvId = parseInt(id);

  const [show, credits, videos, similar] = await Promise.all([
    getTVDetails(tvId),
    getTVCredits(tvId),
    getTVVideos(tvId),
    getSimilarTV(tvId),
  ]);

  const trailerKey = getTrailerKey(videos.results);
  const cast = credits.cast.slice(0, 12);
  const ratingColor =
    show.vote_average >= 7
      ? "text-rating-green"
      : show.vote_average >= 5
      ? "text-rating-yellow"
      : "text-rating-red";

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[70vh] min-h-[500px]">
        {show.backdrop_path && (
          <Image
            src={getBackdropUrl(show.backdrop_path)}
            alt={show.name}
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
                src={getImageUrl(show.poster_path, "w500")}
                alt={show.name}
                width={288}
                height={432}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 animate-slide-up">
            {show.tagline && (
              <p className="text-accent text-sm font-medium uppercase tracking-wider mb-2">
                {show.tagline}
              </p>
            )}

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              {show.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
              <span className={`flex items-center gap-1 font-bold text-lg ${ratingColor}`}>
                ★ {formatRating(show.vote_average)}
              </span>
              <span className="text-text-muted">({show.vote_count.toLocaleString()} votes)</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">{formatDate(show.first_air_date)}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">
                {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
              </span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-text-secondary">{show.number_of_episodes} Episodes</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}`}
                  className="px-4 py-1.5 glass rounded-full text-sm text-text-secondary hover:text-white hover:border-accent/30 transition-all"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
              <p className="text-text-secondary leading-relaxed text-base max-w-3xl">
                {show.overview}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {trailerKey && (
                <TrailerButton videoKey={trailerKey} title={show.name} />
              )}
              <WatchlistBtn
                item={{
                  id: show.id,
                  title: show.name,
                  poster_path: show.poster_path,
                  vote_average: show.vote_average,
                  media_type: "tv",
                  first_air_date: show.first_air_date,
                  addedAt: 0,
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {show.created_by.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Created By</p>
                  <p className="text-white text-sm">
                    {show.created_by.map((c) => c.name).join(", ")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Status</p>
                <p className="text-white text-sm">{show.status}</p>
              </div>
              {show.networks.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Network</p>
                  <p className="text-white text-sm">{show.networks[0].name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="glass rounded-xl p-3 text-center hover:bg-bg-glass-hover transition-all"
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
        <MovieReviews mediaId={id} mediaType="tv" />

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-8">
            <MovieRow
              title="Similar Shows"
              icon="🎯"
              items={similar.results.map((s) => ({ ...s, media_type: "tv" as const }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
