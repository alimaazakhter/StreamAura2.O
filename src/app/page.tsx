import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from "@/lib/tmdb";

export default async function HomePage() {
  const [trending, popularMovies, popularTV, topRated, nowPlaying, upcoming] =
    await Promise.all([
      getTrending("all", "week"),
      getPopularMovies(),
      getPopularTV(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getUpcomingMovies(),
    ]);

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner items={trending.results} />

      {/* Content Rows */}
      <div className="-mt-16 relative z-10">
        <MovieRow
          title="Trending This Week"
          icon="🔥"
          items={trending.results}
          viewAllHref="/movies"
        />

        <MovieRow
          title="Popular Movies"
          icon="🎬"
          items={popularMovies.results}
          viewAllHref="/movies"
        />

        <MovieRow
          title="Popular TV Series"
          icon="📺"
          items={popularTV.results.map((s) => ({ ...s, media_type: "tv" as const }))}
          viewAllHref="/series"
        />

        <MovieRow
          title="Top Rated"
          icon="⭐"
          items={topRated.results}
          viewAllHref="/movies"
        />

        <MovieRow
          title="Now Playing"
          icon="🎪"
          items={nowPlaying.results}
          viewAllHref="/movies"
        />

        <MovieRow
          title="Coming Soon"
          icon="🚀"
          items={upcoming.results}
          viewAllHref="/movies"
        />
      </div>
    </>
  );
}
