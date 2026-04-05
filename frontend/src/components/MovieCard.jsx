import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI, watchlistAPI } from '../utils/api';
import { StarRating } from './StarRating';

export const MovieCard = ({ movie, onWatchlistChange }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const response = await watchlistAPI.check(movie._id);
        setInWatchlist(response.data.inWatchlist);
      } catch (err) {
        // Silently fail - user might not be logged in
      }
    };

    checkWatchlist();
  }, [movie._id]);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (inWatchlist) {
        await watchlistAPI.remove(movie._id);
        setInWatchlist(false);
      } else {
        await watchlistAPI.add(movie._id);
        setInWatchlist(true);
      }
      onWatchlistChange?.();
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const userRating = Number(movie.userRating);

  return (
    <Link to={`/movie/${movie._id}`} className="group">
      <div className="card h-full overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-primary bg-surface">
        {/* Poster - Hero Visual */}
        <div className="relative mb-4 overflow-hidden rounded-lg aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800">
          <img
            src={
              movie.posterPath && movie.posterPath !== 'N/A'
                ? movie.posterPath.includes('http')
                  ? movie.posterPath
                  : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                : 'https://via.placeholder.com/500x750?text=No+Poster&bg=1a1f2b&textColor=e8c547'
            }
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster&bg=1a1f2b&textColor=e8c547';
            }}
          />
          
          {/* Rating Badge */}
          {userRating > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-secondary px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ★ {userRating.toFixed(1)}
            </div>
          )}

          {/* Watchlist Button */}
          <button
            onClick={handleWatchlistToggle}
            disabled={loading}
            className={`absolute top-2 right-2 p-2.5 rounded-full transition-all duration-200 shadow-lg hover:scale-110 ${
              inWatchlist
                ? 'bg-primary text-secondary'
                : 'bg-surface/80 text-primary hover:bg-primary hover:text-secondary'
            }`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {loading ? '⋯' : (inWatchlist ? '♥' : '♡')}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-text-primary line-clamp-2 mb-2 group-hover:text-primary transition">
          {movie.title}
        </h3>

        {/* IMDb Rating & Runtime */}
        <div className="mb-2 flex items-center justify-between text-xs">
          {movie.rating > 0 && (
            <span className="text-primary font-bold">⭐ IMDb: {movie.rating.toFixed(1)}/10</span>
          )}
          {movie.runtime > 0 && (
            <span className="text-text-secondary">⏱️ {movie.runtime}m</span>
          )}
        </div>

        {/* User Rating Stars */}
        <div className="mb-3">
          {userRating > 0 ? (
            <StarRating rating={userRating} size="sm" />
          ) : (
            <div className="text-xs text-text-secondary italic">No user ratings</div>
          )}
        </div>

        {/* Review Count & Year */}
        <div className="flex justify-between items-center text-xs text-text-secondary">
          <span>📝 {movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}</span>
          {movie.releaseDate && (
            <span className="font-medium text-primary">{new Date(movie.releaseDate).getFullYear()}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
