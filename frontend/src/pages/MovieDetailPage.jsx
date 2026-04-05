import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { movieAPI, reviewAPI, watchlistAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { StarRating } from '../components/StarRating';
import { CastList } from '../components/CastList';
import { SimilarMovies } from '../components/SimilarMovies';
import { Recommendations } from '../components/Recommendations';
import { getTmdbCast, getTmdbSimilarMovies, getTmdbRecommendations } from '../services/tmdbClient';

export const MovieDetailPage = () => {
  const { movieId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getDetails(movieId);
      const movieData = response.data;
      setMovie(movieData);
      setReviews(movieData.reviews || []);

      // Fetch enriched data from TMDB directly
      if (movieData.tmdbMovieId) {
        try {
          const [cast, similar, recommendations] = await Promise.all([
            getTmdbCast(movieData.tmdbMovieId),
            getTmdbSimilarMovies(movieData.tmdbMovieId),
            getTmdbRecommendations(movieData.tmdbMovieId)
          ]);
          setMovie(prev => ({
            ...prev,
            enrichedCast: cast,
            similarMovies: similar,
            recommendations: recommendations
          }));
        } catch (tmdbErr) {
          console.warn('Failed to fetch TMDB enrichment data:', tmdbErr);
          // Continue without enrichment data (graceful degradation)
        }
      }

      // Check if in watchlist
      if (isAuthenticated) {
        try {
          const watchRes = await watchlistAPI.check(movieId);
          setInWatchlist(watchRes.data.inWatchlist);

          // Find user's review if exists
          const userRev = movieData.reviews?.find(
            (r) => r.userId._id === user?._id
          );
          if (userRev) {
            setUserReview(userRev);
            setRating(userRev.rating);
            setReviewText(userRev.reviewText);
          }
        } catch (e) {
          console.error('Error checking watchlist:', e);
        }
      }
    } catch (err) {
      setError('Failed to load movie details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId, isAuthenticated]);

  const handleWatchlistToggle = async () => {
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(movieId);
        setInWatchlist(false);
      } else {
        await watchlistAPI.add(movieId);
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Watchlist error:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to review');
      return;
    }

    try {
      setSubmitting(true);
      await reviewAPI.create(movieId, {
        rating: parseInt(rating),
        reviewText,
      });
      setReviewText('');
      setRating(5);
      await fetchMovieDetails();
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="text-xl text-text-secondary">🍿 Loading film details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <div className="container-main py-12">
          <div className="alert alert-error bg-red-900 text-red-100 p-4 rounded">{error || 'Film not found'}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Banner with Backdrop */}
      <div className="bg-gradient-to-b from-surface via-secondary to-secondary py-12 border-b border-gray-800">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Poster */}
            <div>
              <img
                src={
                  movie.posterPath && movie.posterPath !== 'N/A'
                    ? movie.posterPath.includes('http')
                      ? movie.posterPath
                      : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                    : 'https://via.placeholder.com/500x750?text=No+Poster&bg=1a1f2b&textColor=e8c547'
                }
                alt={movie.title}
                className="rounded-lg shadow-2xl w-full hover:shadow-primary/50 transition-all duration-300"
              />
              {isAuthenticated && (
                <button
                  onClick={handleWatchlistToggle}
                  className={`w-full mt-4 py-3 font-semibold rounded-lg transition duration-300 ${
                    inWatchlist
                      ? 'bg-accent text-secondary hover:bg-green-500'
                      : 'bg-surface border-2 border-primary text-primary hover:bg-primary hover:text-secondary'
                  }`}
                >
                  {inWatchlist ? '✓ Watched' : '+ Add to Watchlist'}
                </button>
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-3">
              <h1 className="text-5xl font-bold text-text-primary mb-2">{movie.title}</h1>
              <p className="text-text-secondary mb-4 text-lg">
                📅 {movie.releaseDate && new Date(movie.releaseDate).getFullYear()}
              </p>

              {/* IMDb Rating & Runtime Info */}
              <div className="mb-6 p-4 bg-surface border border-gray-700 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {movie.rating > 0 && (
                    <div>
                      <p className="text-text-secondary text-sm mb-1">IMDb Rating</p>
                      <p className="text-2xl font-bold text-primary">⭐ {movie.rating.toFixed(1)}/10</p>
                    </div>
                  )}
                  {movie.runtime > 0 && (
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Runtime</p>
                      <p className="text-2xl font-bold text-primary">⏱️ {movie.runtime} min</p>
                    </div>
                  )}
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Community Rating</p>
                    <p className="text-2xl font-bold text-accent">★ {movie.userRating}/5</p>
                  </div>
                </div>
              </div>

              {/* Reviews Count */}
              <div className="mb-6">
                <span className="text-text-secondary">
                  📝 {movie.reviewCount} user review{movie.reviewCount !== 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-text-primary leading-relaxed mb-6 text-base">
                {movie.overview}
              </p>

              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-text-primary mb-3">🎭 Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genreId) => (
                      <span
                        key={genreId}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm border border-primary/50 hover:bg-primary hover:text-secondary transition"
                      >
                        {genreId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container-main py-12">
        <h2 className="text-3xl font-bold text-primary mb-8">💬 Community Reviews</h2>

        {/* Review Form */}
        {isAuthenticated && !userReview && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              ✍️ Share Your Thoughts
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-text-primary mb-3">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of this film?"
                  className="input-field min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? '⏳ Submitting...' : '📤 Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      👤 {review.userId?.username}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ⭐ {review.rating}
                  </span>
                </div>
                <p className="text-text-primary mb-3">{review.reviewText}</p>
                <p className="text-sm text-text-secondary">
                  ♥️ {review.likeCount} like{review.likeCount !== 1 ? 's' : ''}
                </p>
              </div>
            ))
          ) : (
            <p className="text-text-secondary">No reviews yet. Be the first to review this film!</p>
          )}
        </div>

        {/* Cast Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-4xl font-bold text-primary mb-8">🎭 Cast & Crew</h2>
          {(movie.enrichedCast && movie.enrichedCast.length > 0) || (movie.cast && movie.cast.length > 0) ? (
            <CastList cast={movie.enrichedCast || movie.cast} />
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">Cast information coming soon</p>
            </div>
          )}
        </div>

        {/* More Like This Section */}
        {(movie.similarMovies?.length > 0 || movie.recommendations?.length > 0) && (
          <div className="mt-16 pt-8 border-t border-gray-800">
            <h2 className="text-4xl font-bold text-primary mb-8">🎬 More Like This</h2>
            
            {/* Similar Films */}
            {movie.similarMovies && movie.similarMovies.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-semibold text-accent mb-6">📽️ Similar Films</h3>
                <SimilarMovies movies={movie.similarMovies} />
              </div>
            )}

            {/* Recommendations */}
            {movie.recommendations && movie.recommendations.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold text-accent mb-6">💡 You Might Enjoy</h3>
                <Recommendations movies={movie.recommendations} />
              </div>
            )}
          </div>
        )}

        {/* No recommendations state */}
        {(!movie.similarMovies || movie.similarMovies.length === 0) &&
          (!movie.recommendations || movie.recommendations.length === 0) && (
            <div className="mt-16 pt-8 border-t border-gray-800 text-center py-12">
              <p className="text-text-secondary text-lg">🔍 More films coming soon</p>
              <p className="text-text-secondary text-sm mt-2">Recommendations will appear as this film is enriched</p>
            </div>
          )}
      </div>
    </MainLayout>
  );
};
