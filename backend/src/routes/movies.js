import express from 'express';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  getMoviesByGenre,
  getGenres,
} from '../utils/tmdbAPI.js';
import { getMovieByImdbId } from '../utils/tmdbClient.js';
import { enrichMovieWithTmdb } from '../utils/movieEnrichment.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function to save/update movie in DB
const syncMovieToDb = async (omdbMovie) => {
  // OMDB returns imdbID, we'll use it as the unique identifier
  const movieData = {
    tmdbId: omdbMovie.id || omdbMovie.imdbID,
    title: omdbMovie.Title || omdbMovie.title,
    overview: omdbMovie.overview || omdbMovie.Plot || '',
    releaseDate: omdbMovie.releaseDate || omdbMovie.Released,
    posterPath: omdbMovie.posterPath || omdbMovie.Poster,
    genres: Array.isArray(omdbMovie.genres)
      ? omdbMovie.genres
      : (omdbMovie.Genre?.split(',').map((g) => g.trim()) || []),
    rating: parseFloat(omdbMovie.rating || omdbMovie.imdbRating) || 0,
    voteCount: parseInt(omdbMovie.imdbVotes) || 0,
    popularity: 0,
    cast: omdbMovie.cast || [],
  };

  let movie = await Movie.findOne({ tmdbId: movieData.tmdbId });

  if (!movie) {
    movie = await Movie.create(movieData);
  } else {
    // Update rating, popularity, cast, and runtime
    movie.rating = movieData.rating;
    movie.voteCount = movieData.voteCount;
    movie.cast = movieData.cast;
    movie.runtime = movieData.runtime || 0;
    await movie.save();
  }

  return movie;
};

// Get trending movies
router.get(
  '/trending',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    console.log(`📽️ Fetching trending movies, page ${page}`);
    const omdbData = await getTrendingMovies(page);
    
    console.log(`✅ OMDB returned ${omdbData.results.length} movies`);
    if (omdbData.results.length === 0) {
      return res.json({
        page: omdbData.page,
        totalPages: omdbData.total_pages,
        movies: [],
        warning: 'No movies returned from OMDB. Check API key.',
      });
    }

    // Sync movies to local DB
    const moviesWithReviews = await Promise.all(
      omdbData.results.map(async (omdbMovie) => {
        const movie = await syncMovieToDb(omdbMovie);
        const reviews = await Review.find({ movieId: movie._id });
        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 'N/A';

        return {
          ...movie.toObject(),
          userRating: avgRating,
          reviewCount: reviews.length,
        };
      })
    );

    console.log(`✅ Returning ${moviesWithReviews.length} movies to frontend`);
    res.json({
      page: omdbData.page,
      totalPages: omdbData.total_pages,
      movies: moviesWithReviews,
    });
  })
);

// Search movies
router.get(
  '/search',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { q, page = 1, type = 'movies' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Note: OMDB API support for TV shows would require additional setup
    // For now, we search movies regardless of type parameter
    const omdbData = await searchMovies(q, { page });

    // Sync movies to DB
    const moviesWithReviews = await Promise.all(
      omdbData.results.map(async (omdbMovie) => {
        try {
          const movie = await syncMovieToDb(omdbMovie);
          const reviews = await Review.find({ movieId: movie._id });
          const avgRating =
            reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : 'N/A';

          return {
            ...movie.toObject(),
            userRating: avgRating,
            reviewCount: reviews.length,
          };
        } catch (err) {
          console.error('Error syncing movie:', err);
          return null;
        }
      })
    );

    res.json({
      page: omdbData.page,
      totalPages: omdbData.total_pages,
      movies: moviesWithReviews.filter((m) => m !== null),
    });
  })
);

// Get movie details
router.get(
  '/:movieId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    let movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // CRITICAL: Ensure tmdbMovieId is set BEFORE returning response
    // Frontend needs this to call TMDB APIs directly
    if (!movie.tmdbMovieId) {
      try {
        console.log(`🔍 Fetching TMDB ID for ${movie.title}...`);
        const tmdbMovie = await getMovieByImdbId(movie.tmdbId);
        if (tmdbMovie && tmdbMovie.id) {
          movie.tmdbMovieId = tmdbMovie.id;
          await movie.save();
          console.log(`✅ Found TMDB ID: ${tmdbMovie.id}`);
        } else {
          console.log(`⚠️ Could not find ${movie.title} on TMDB`);
        }
      } catch (err) {
        console.warn(`⚠️ Error fetching TMDB ID: ${err.message}`);
        // Continue without it - frontend will handle gracefully
      }
    }

    // Enrich if never enriched before (or older than 7 days)
    // DO NOT WAIT FOR ENRICHMENT - run it in background!
    const shouldEnrich = !movie.lastEnrichedAt || 
      (Date.now() - movie.lastEnrichedAt.getTime()) / (1000 * 60 * 60 * 24) >= 7;
    
    if (shouldEnrich && movie.tmdbMovieId) {
      // Start enrichment in background (don't wait for it)
      console.log(`🔄 Starting background enrichment for ${movie.title}...`);
      enrichMovieWithTmdb(movie)
        .then(() => {
          console.log(`✅ Background enrichment completed for ${movie.title}`);
        })
        .catch((err) => {
          console.warn(`⚠️ Background enrichment failed for ${movie.title}: ${err.message}`);
        });
    }

    // Fetch reviews
    const reviews = await Review.find({ movieId: movie._id })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    // Fetch related movies with their ratings
    let similarMoviesData = [];
    let recommendationsData = [];

    if (movie.similarMovies && movie.similarMovies.length > 0) {
      try {
        const similarMovies = await Movie.find({
          _id: { $in: movie.similarMovies },
        })
          .select('title posterPath rating _id')
          .limit(6);
        
        const similarReviews = await Review.find({
          movieId: { $in: movie.similarMovies },
        });

        similarMoviesData = similarMovies.map((sim) => {
          const simReviews = similarReviews.filter(
            (r) => r.movieId.toString() === sim._id.toString()
          );
          return {
            ...sim.toObject(),
            userRating:
              simReviews.length > 0
                ? (simReviews.reduce((sum, r) => sum + r.rating, 0) / simReviews.length).toFixed(1)
                : 'N/A',
            reviewCount: simReviews.length,
          };
        });
      } catch (err) {
        console.error('Error fetching similar movies:', err);
      }
    }

    if (movie.recommendations && movie.recommendations.length > 0) {
      try {
        const recommendations = await Movie.find({
          _id: { $in: movie.recommendations },
        })
          .select('title posterPath rating _id')
          .limit(6);
        
        const recReviews = await Review.find({
          movieId: { $in: movie.recommendations },
        });

        recommendationsData = recommendations.map((rec) => {
          const recRevs = recReviews.filter(
            (r) => r.movieId.toString() === rec._id.toString()
          );
          return {
            ...rec.toObject(),
            userRating:
              recRevs.length > 0
                ? (recRevs.reduce((sum, r) => sum + r.rating, 0) / recRevs.length).toFixed(1)
                : 'N/A',
            reviewCount: recRevs.length,
          };
        });
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    }

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A';

    res.json({
      ...movie.toObject(),
      userRating: avgRating,
      reviewCount: reviews.length,
      reviews,
      similarMovies: similarMoviesData,
      recommendations: recommendationsData,
    });
  })
);

// Get movies by genre
router.get(
  '/genre/:genreId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { genreId } = req.params;
    const { page = 1 } = req.query;

    const omdbData = await getMoviesByGenre(genreId, page);

    const moviesWithReviews = await Promise.all(
      omdbData.results.map(async (omdbMovie) => {
        try {
          const movie = await syncMovieToDb(omdbMovie);
          const reviews = await Review.find({ movieId: movie._id });
          const avgRating =
            reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : 'N/A';

          return {
            ...movie.toObject(),
            userRating: avgRating,
            reviewCount: reviews.length,
          };
        } catch (err) {
          console.error('Error syncing movie:', err);
          return null;
        }
      })
    );

    res.json({
      page: omdbData.page,
      totalPages: omdbData.total_pages,
      movies: moviesWithReviews.filter((m) => m !== null),
    });
  })
);

// Get all genres
router.get(
  '/genres/all',
  asyncHandler(async (req, res) => {
    const genres = await getGenres();
    res.json(genres);
  })
);

// Get similar movies for a specific movie
router.get(
  '/:movieId/similar',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.movieId)
      .populate('similarMovies');

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // If no similar movies cached, try to enrich with timeout
    if (!movie.similarMovies || movie.similarMovies.length === 0) {
      try {
        console.log(`🔄 Enriching similar movies for ${movie.title}...`);
        await Promise.race([
          enrichMovieWithTmdb(movie),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Enrichment timeout')), 15000))
        ]);
        await movie.populate('similarMovies');
        console.log(`✅ Similar movies enriched for ${movie.title}`);
      } catch (err) {
        console.warn(`⚠️ Failed to enrich similar movies for ${movie.title}: ${err.message}`);
        // Return what we have (empty is ok)
      }
    }

    const reviews = await Review.find({
      movieId: { $in: movie.similarMovies?.map((m) => m._id) || [] },
    });

    const similarWithRatings = (movie.similarMovies || []).map((sim) => {
      const simReviews = reviews.filter((r) => r.movieId.toString() === sim._id.toString());
      const avgRating =
        simReviews.length > 0
          ? (simReviews.reduce((sum, r) => sum + r.rating, 0) / simReviews.length).toFixed(1)
          : 'N/A';

      return {
        ...sim.toObject(),
        userRating: avgRating,
        reviewCount: simReviews.length,
      };
    });

    res.json({
      movieId: movie._id,
      movieTitle: movie.title,
      similarMovies: similarWithRatings,
      count: similarWithRatings.length,
    });
  })
);

// Get recommendations for a specific movie
router.get(
  '/:movieId/recommendations',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.movieId)
      .populate('recommendations');

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // If no recommendations cached, try to enrich with timeout
    if (!movie.recommendations || movie.recommendations.length === 0) {
      try {
        console.log(`🔄 Enriching recommendations for ${movie.title}...`);
        await Promise.race([
          enrichMovieWithTmdb(movie),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Enrichment timeout')), 15000))
        ]);
        await movie.populate('recommendations');
        console.log(`✅ Recommendations enriched for ${movie.title}`);
      } catch (err) {
        console.warn(`⚠️ Failed to enrich recommendations for ${movie.title}: ${err.message}`);
        // Return what we have (empty is ok)
      }
    }

    const reviews = await Review.find({
      movieId: { $in: movie.recommendations?.map((m) => m._id) || [] },
    });

    const recommendationsWithRatings = (movie.recommendations || []).map((rec) => {
      const recReviews = reviews.filter((r) => r.movieId.toString() === rec._id.toString());
      const avgRating =
        recReviews.length > 0
          ? (recReviews.reduce((sum, r) => sum + r.rating, 0) / recReviews.length).toFixed(1)
          : 'N/A';

      return {
        ...rec.toObject(),
        userRating: avgRating,
        reviewCount: recReviews.length,
      };
    });

    res.json({
      movieId: movie._id,
      movieTitle: movie.title,
      recommendations: recommendationsWithRatings,
      count: recommendationsWithRatings.length,
    });
  })
);

// Get enriched cast (with photos from TMDB)
router.get(
  '/:movieId/cast',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // If no enriched cast, try to enrich with timeout
    if (!movie.enrichedCast || movie.enrichedCast.length === 0) {
      try {
        console.log(`🔄 Enriching cast for ${movie.title}...`);
        await Promise.race([
          enrichMovieWithTmdb(movie),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Enrichment timeout')), 15000))
        ]);
        console.log(`✅ Cast enriched for ${movie.title}`);
      } catch (err) {
        console.warn(`⚠️ Failed to enrich cast for ${movie.title}: ${err.message}`);
        // Return what we have (original cast is ok)
      }
    }

    res.json({
      movieId: movie._id,
      movieTitle: movie.title,
      cast: movie.enrichedCast?.length > 0 ? movie.enrichedCast : movie.cast,
      source: movie.enrichedCast?.length > 0 ? 'tmdb' : 'omdb',
    });
  })
);

export default router;
