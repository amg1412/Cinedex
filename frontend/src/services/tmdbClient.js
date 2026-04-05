/**
 * TMDB API Client - Direct Frontend Integration
 * Fetches cast, similar movies, and recommendations directly from TMDB
 * No backend proxy needed
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Helper to build TMDB URLs
const buildTmdbUrl = (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

// Cache for TMDB responses (5 minute TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Get cast from TMDB by movie ID
 */
export const getTmdbCast = async (tmdbMovieId) => {
  const cacheKey = `cast_${tmdbMovieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = buildTmdbUrl(`/movie/${tmdbMovieId}/credits`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`TMDB cast fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const cast = (data.cast || [])
      .slice(0, 10)
      .map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path
          ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
          : null,
      }));

    setCached(cacheKey, cast);
    return cast;
  } catch (error) {
    console.warn(`TMDB cast fetch error: ${error.message}`);
    return [];
  }
};

/**
 * Get similar movies from TMDB by movie ID
 */
export const getTmdbSimilarMovies = async (tmdbMovieId, limit = 6) => {
  const cacheKey = `similar_${tmdbMovieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = buildTmdbUrl(`/movie/${tmdbMovieId}/similar`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`TMDB similar movies fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const similar = (data.results || [])
      .slice(0, limit)
      .map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : null,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
      }));

    setCached(cacheKey, similar);
    return similar;
  } catch (error) {
    console.warn(`TMDB similar movies fetch error: ${error.message}`);
    return [];
  }
};

/**
 * Get recommendations from TMDB by movie ID
 */
export const getTmdbRecommendations = async (tmdbMovieId, limit = 6) => {
  const cacheKey = `recommendations_${tmdbMovieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = buildTmdbUrl(`/movie/${tmdbMovieId}/recommendations`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`TMDB recommendations fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const recommendations = (data.results || [])
      .slice(0, limit)
      .map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : null,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
      }));

    setCached(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.warn(`TMDB recommendations fetch error: ${error.message}`);
    return [];
  }
};

/**
 * Get movie by IMDb ID - for reverse lookup
 */
export const getTmdbMovieByImdbId = async (imdbId) => {
  const cacheKey = `tmdb_movie_${imdbId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = buildTmdbUrl(`/find/${imdbId}`, {
      external_source: 'imdb_id',
    });
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`TMDB lookup failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const movie = data.movie_results?.[0];
    
    if (movie) {
      setCached(cacheKey, movie);
    }
    return movie || null;
  } catch (error) {
    console.warn(`TMDB lookup error: ${error.message}`);
    return null;
  }
};

export default {
  getTmdbCast,
  getTmdbSimilarMovies,
  getTmdbRecommendations,
  getTmdbMovieByImdbId,
};
