// TMDb API TypeScript Interfaces

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  media_type?: string;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  origin_country: string[];
  original_language: string;
  media_type?: string;
}

export type MediaItem = (Movie | TVShow) & { media_type?: string };

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: Genre[];
  status: string;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
}

export interface TVDetails {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: Genre[];
  status: string;
  homepage: string;
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string; profile_path: string | null }[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

export interface TMDbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  media_type: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  addedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

