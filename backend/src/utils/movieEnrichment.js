import Movie from '../models/Movie.js';
import {
  getMovieByImdbId,
  getMovieCast,
  getSimilarMovies,
  getMovieRecommendations,
} from './tmdbClient.js';

/**
 * Simple enrichment - fetch TMDB data and link movies
 */
export const enrichMovieWithTmdb = async (movie) => {
  try {
    if (movie.lastEnrichedAt) {
      const daysSince = (Date.now() - movie.lastEnrichedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return movie;
    }

    console.log(`🔄 Enriching ${movie.title}...`);

    const tmdbMovie = await getMovieByImdbId(movie.tmdbId);
    if (!tmdbMovie) {
      console.log(`   ⚠️ Not on TMDB`);
      movie.lastEnrichedAt = new Date();
      await movie.save();
      return movie;
    }

    movie.tmdbMovieId = tmdbMovie.id;
    console.log(`   ✅ Found on TMDB`);

    // Cast
    const cast = await getMovieCast(tmdbMovie.id);
    if (cast.length > 0) {
      movie.enrichedCast = cast;
      console.log(`   ✅ Cast: ${cast.length}`);
    }

    // Similar movies
    const similar = await getSimilarMovies(tmdbMovie.id);
    if (similar.length > 0) {
      const titles = similar.map(m => m.title);
      const linked = await Movie.find({ title: { $in: titles } }).select('_id');
      movie.similarMovies = linked.map(m => m._id);
      console.log(`   ✅ Similar: ${linked.length}/${similar.length}`);
    }

    // Recommendations
    const recs = await getMovieRecommendations(tmdbMovie.id);
    if (recs.length > 0) {
      const titles = recs.map(m => m.title);
      const linked = await Movie.find({ title: { $in: titles } }).select('_id');
      movie.recommendations = linked.map(m => m._id);
      console.log(`   ✅ Recs: ${linked.length}/${recs.length}`);
    }

    movie.lastEnrichedAt = new Date();
    await movie.save();
    console.log(`   ✅ Done`);

    return movie;
  } catch (error) {
    console.error(`❌ Enrichment failed for ${movie.title}: ${error.message}`);
    movie.lastEnrichedAt = new Date();
    try { await movie.save(); } catch (e) {}
    return movie;
  }
};

/**
 * Enrich multiple movies (for batch operations)
 */
export const enrichMoviesWithTmdb = async (movies) => {
  const enrichedMovies = [];
  for (const movie of movies) {
    const enriched = await enrichMovieWithTmdb(movie);
    enrichedMovies.push(enriched);
  }
  return enrichedMovies;
};
