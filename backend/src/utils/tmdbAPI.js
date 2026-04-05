import axios from 'axios';

const OMDB_BASE_URL = 'http://www.omdbapi.com';

// Get API key at runtime, not at import time
const getOmdbApiKey = () => process.env.OMDB_API_KEY || '1602a9da';

const omdbClient = axios.create({
  baseURL: OMDB_BASE_URL,
});

// Log on first request
let logged = false;
omdbClient.interceptors.request.use((config) => {
  if (!logged) {
    const key = getOmdbApiKey();
    console.log(`🔑 OMDB_API_KEY from env: ${process.env.OMDB_API_KEY}`);
    console.log(`🔑 Final OMDB_API_KEY being used: ${key}`);
    console.log(`🔑 OMDB_API_KEY loaded: ${key ? '✅ YES' : '❌ NO (undefined)'}`);
    logged = true;
  }
  config.params = config.params || {};
  config.params.apikey = getOmdbApiKey();
  const url = `${config.baseURL}${config.url}?${new URLSearchParams(config.params).toString()}`;
  console.log(`📡 OMDB Request: ${url.substring(0, 150)}...`);
  console.log(`📡 API Key being sent: "${config.params.apikey}"`);
  return config;
});

// Mock trending movies - fetching popular ones from OMDB
export const getTrendingMovies = async (page = 1) => {
  try {
    // OMDB doesn't have a trending endpoint, so we'll search popular terms
    const popularTitles = [
      'Inception',
      'The Shawshank Redemption',
      'The Dark Knight',
      'Pulp Fiction',
      'Forrest Gump',
      'Interstellar',
      'The Matrix',
      'Titanic',
      'Avatar',
      'The Avengers',
      'Gladiator',
      'The Lion King',
      'Jurassic Park',
      'The Godfather',
      'Star Wars',
      'Jaws',
      'E.T.',
      'Back to the Future',
      'The Sixth Sense',
      'Fight Club',
      'Goodfellas',
      'The Silence of the Lambs',
      'Se7en',
      'The Usual Suspects',
      'Reservation Dogs',
      'Oppenheimer',
      'Barbie',
      'Killers of the Flower Moon',
      'The Iron Giant',
      'Spirited Away',
    ];

    const movies = [];
    const titlesPerPage = 10;
    const startIdx = (page - 1) * titlesPerPage;

    console.log(`🔍 OMDB API Key available: ${!!getOmdbApiKey()}`);
    
    for (
      let i = startIdx;
      i < startIdx + titlesPerPage && i < popularTitles.length;
      i++
    ) {
      try {
        const title = popularTitles[i];
        console.log(`  Fetching: ${title}...`);
        
        const response = await omdbClient.get('/', {
          params: {
            apikey: getOmdbApiKey(),
            t: title,
            type: 'movie',
          },
        });

        if (response.data.Response === 'True') {
          movies.push({
            ...response.data,
            id: response.data.imdbID,
          });
          console.log(`    ✅ Found: ${response.data.Title}`);
        } else {
          console.log(`    ❌ Not found: ${response.data.Error}`);
        }
      } catch (err) {
        const statusCode = err.response?.status;
        const errorData = err.response?.data;
        console.warn(`  ❌ Error fetching ${popularTitles[i]}: ${err.message}  (Status: ${statusCode})`);
        if (errorData) {
          console.warn(`    Response data:`, errorData);
        }
      }
    }

    console.log(`🎬 OMDB returned total ${movies.length} movies`);
    return {
      results: movies,
      page,
      total_pages: Math.ceil(popularTitles.length / titlesPerPage),
    };
  } catch (error) {
    console.error('Error fetching trending movies:', error.message);
    throw error;
  }
};

export const searchMovies = async (query, filters = {}) => {
  try {
    const params = {
      apikey: getOmdbApiKey(),
      s: query,
      type: 'movie',
      page: filters.page || 1,
    };

    const response = await omdbClient.get('/', { params });

    if (response.data.Response === 'True') {
      return {
        results: response.data.Search || [],
        page: filters.page || 1,
        total_pages: Math.ceil((response.data.totalResults || 0) / 10),
      };
    }

    return {
      results: [],
      page: filters.page || 1,
      total_pages: 0,
    };
  } catch (error) {
    console.error('Error searching movies:', error.message);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    // movieId is actually the OMDB title name or imdbID
    const response = await omdbClient.get('/', {
      params: {
        apikey: getOmdbApiKey(),
        i: movieId,
        plot: 'full',
      },
    });

    if (response.data.Response === 'True') {
      // Parse cast from OMDB Actors field (comma-separated string)
      const cast = response.data.Actors
        ? response.data.Actors.split(',').map((actor, idx) => ({
            id: `${movieId}-actor-${idx}`,
            name: actor.trim(),
            character: 'N/A',
          }))
        : [];

      return {
        ...response.data,
        id: response.data.imdbID,
        overview: response.data.Plot,
        posterPath: response.data.Poster,
        releaseDate: response.data.Released,
        genres: response.data.Genre?.split(',').map((g) => g.trim()) || [],
        rating: parseFloat(response.data.imdbRating) || 0,
        cast: cast.slice(0, 5), // Top 5 cast members
      };
    }

    throw new Error('Movie not found');
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
    throw error;
  }
};

// OMDB doesn't have genre-based search, so we'll do a search-based approach
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    // Genre map for popular searches
    const genreMap = {
      action: 'action',
      comedy: 'comedy',
      drama: 'drama',
      horror: 'horror',
      scifi: 'science fiction',
      romance: 'romance',
      thriller: 'thriller',
    };

    const genre = genreMap[genreId] || genreId;

    const response = await omdbClient.get('/', {
      params: {
        apikey: getOmdbApiKey(),
        s: genre,
        type: 'movie',
        page,
      },
    });

    if (response.data.Response === 'True') {
      return {
        results: response.data.Search || [],
        page,
        total_pages: Math.ceil((response.data.totalResults || 0) / 10),
      };
    }

    return {
      results: [],
      page,
      total_pages: 0,
    };
  } catch (error) {
    console.error('Error fetching movies by genre:', error.message);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    // Return common genres since OMDB doesn't have a genres endpoint
    return [
      { id: 'action', name: 'Action' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'drama', name: 'Drama' },
      { id: 'horror', name: 'Horror' },
      { id: 'scifi', name: 'Science Fiction' },
      { id: 'romance', name: 'Romance' },
      { id: 'thriller', name: 'Thriller' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'mystery', name: 'Mystery' },
      { id: 'animation', name: 'Animation' },
    ];
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    throw error;
  }
};
