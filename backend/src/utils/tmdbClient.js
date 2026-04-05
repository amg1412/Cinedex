import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const getTmdbApiKey = () => process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
});

tmdbClient.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.api_key = getTmdbApiKey();
  return config;
});

// SIMPLE, RELIABLE TMDB FUNCTIONS - No complex retries

export const getMovieByImdbId = async (imdbId) => {
  try {
    const response = await tmdbClient.get('/find/' + imdbId, {
      params: { external_source: 'imdb_id' },
    });
    return response.data.movie_results?.[0] || null;
  } catch (error) {
    console.warn(`⚠️ TMDB lookup failed for ${imdbId}: ${error.message}`);
    return null;
  }
};

export const getMovieCast = async (tmdbMovieId) => {
  try {
    const response = await tmdbClient.get(`/movie/${tmdbMovieId}/credits`);
    return (response.data.cast || [])
      .slice(0, 10)
      .map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path ? `${TMDB_IMAGE_BASE}${actor.profile_path}` : null,
      }));
  } catch (error) {
    console.warn(`⚠️ TMDB cast fetch failed: ${error.message}`);
    return [];
  }
};

export const getSimilarMovies = async (tmdbMovieId, limit = 6) => {
  try {
    const response = await tmdbClient.get(`/movie/${tmdbMovieId}/similar`);
    return (response.data.results || [])
      .slice(0, limit)
      .map((movie) => ({
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      }));
  } catch (error) {
    console.warn(`⚠️ TMDB similar movies fetch failed: ${error.message}`);
    return [];
  }
};

export const getMovieRecommendations = async (tmdbMovieId, limit = 6) => {
  try {
    const response = await tmdbClient.get(`/movie/${tmdbMovieId}/recommendations`);
    return (response.data.results || [])
      .slice(0, limit)
      .map((movie) => ({
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      }));
  } catch (error) {
    console.warn(`⚠️ TMDB recommendations fetch failed: ${error.message}`);
    return [];
  }
};

export const searchMoviesTmdb = async (query, page = 1) => {
  try {
    const response = await tmdbClient.get('/search/movie', { params: { query, page } });
    return {
      results: (response.data.results || []).map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
      })),
      totalPages: response.data.total_pages,
      page: response.data.page,
    };
  } catch (error) {
    console.warn(`⚠️ TMDB search failed: ${error.message}`);
    return { results: [], totalPages: 0, page };
  }
};

export default tmdbClient;
