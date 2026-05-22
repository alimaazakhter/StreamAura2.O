// TMDb API Service Layer

import type {
  Movie,
  TVShow,
  MovieDetails,
  TVDetails,
  Credits,
  Video,
  Genre,
  TMDbResponse,
  MediaItem,
} from "./types";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

// Image URL helpers
export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/no-poster.svg";
  return `${IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = "original"): string => {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
};

// Generic fetch helper
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: API_KEY || "",
    ...params,
  });

  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDb API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ─── Trending ─────────────────────────────────────────────
export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDbResponse<MediaItem>> {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
}

// ─── Movies ───────────────────────────────────────────────
export async function getPopularMovies(page: number = 1): Promise<TMDbResponse<Movie>> {
  return tmdbFetch("/movie/popular", { page: page.toString() });
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDbResponse<Movie>> {
  return tmdbFetch("/movie/top_rated", { page: page.toString() });
}

export async function getNowPlayingMovies(page: number = 1): Promise<TMDbResponse<Movie>> {
  return tmdbFetch("/movie/now_playing", { page: page.toString() });
}

export async function getUpcomingMovies(page: number = 1): Promise<TMDbResponse<Movie>> {
  return tmdbFetch("/movie/upcoming", { page: page.toString() });
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch(`/movie/${id}`);
}

export async function getMovieCredits(id: number): Promise<Credits> {
  return tmdbFetch(`/movie/${id}/credits`);
}

export async function getMovieVideos(id: number): Promise<{ results: Video[] }> {
  return tmdbFetch(`/movie/${id}/videos`);
}

export async function getSimilarMovies(id: number): Promise<TMDbResponse<Movie>> {
  return tmdbFetch(`/movie/${id}/similar`);
}

// ─── TV Shows ─────────────────────────────────────────────
export async function getPopularTV(page: number = 1): Promise<TMDbResponse<TVShow>> {
  return tmdbFetch("/tv/popular", { page: page.toString() });
}

export async function getTopRatedTV(page: number = 1): Promise<TMDbResponse<TVShow>> {
  return tmdbFetch("/tv/top_rated", { page: page.toString() });
}

export async function getAiringTodayTV(page: number = 1): Promise<TMDbResponse<TVShow>> {
  return tmdbFetch("/tv/airing_today", { page: page.toString() });
}

export async function getTVDetails(id: number): Promise<TVDetails> {
  return tmdbFetch(`/tv/${id}`);
}

export async function getTVCredits(id: number): Promise<Credits> {
  return tmdbFetch(`/tv/${id}/credits`);
}

export async function getTVVideos(id: number): Promise<{ results: Video[] }> {
  return tmdbFetch(`/tv/${id}/videos`);
}

export async function getSimilarTV(id: number): Promise<TMDbResponse<TVShow>> {
  return tmdbFetch(`/tv/${id}/similar`);
}

// ─── Genres ───────────────────────────────────────────────
export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  return tmdbFetch("/genre/movie/list");
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  return tmdbFetch("/genre/tv/list");
}

export async function discoverByGenre(
  genreId: number,
  page: number = 1,
  mediaType: "movie" | "tv" = "movie"
): Promise<TMDbResponse<Movie | TVShow>> {
  return tmdbFetch(`/discover/${mediaType}`, {
    with_genres: genreId.toString(),
    page: page.toString(),
    sort_by: "popularity.desc",
  });
}

// ─── Search ───────────────────────────────────────────────
export async function searchMulti(
  query: string,
  page: number = 1
): Promise<TMDbResponse<MediaItem>> {
  return tmdbFetch("/search/multi", {
    query,
    page: page.toString(),
    include_adult: "false",
  });
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDbResponse<Movie>> {
  return tmdbFetch("/search/movie", {
    query,
    page: page.toString(),
  });
}

// ─── Utility ──────────────────────────────────────────────
export function getTrailerKey(videos: Video[]): string | null {
  const trailer =
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v) => v.site === "YouTube");
  return trailer?.key || null;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRuntime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export function getTitle(item: MediaItem): string {
  return "title" in item ? item.title : "name" in item ? item.name : "Unknown";
}

export function getReleaseDate(item: MediaItem): string {
  return "release_date" in item
    ? item.release_date
    : "first_air_date" in item
    ? item.first_air_date
    : "";
}

export function getYear(item: MediaItem): string {
  const date = getReleaseDate(item);
  return date ? new Date(date).getFullYear().toString() : "N/A";
}
