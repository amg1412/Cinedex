import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';

export const SimilarMovies = ({ movies = [] }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <Link
            key={movie._id}
            to={`/movie/${movie._id}`}
            className="group"
          >
            <div className="card hover:shadow-xl transition overflow-hidden rounded-lg">
              <div className="relative mb-3 overflow-hidden rounded-lg aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800">
                <img
                  src={
                    movie.posterPath && movie.posterPath !== 'N/A'
                      ? movie.posterPath.includes('http')
                        ? movie.posterPath
                        : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                      : 'https://via.placeholder.com/300x450?text=No+Poster&bg=1a1f2b&textColor=e8c547'
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster&bg=1a1f2b&textColor=e8c547';
                  }}
                />
              </div>
              <h4 className="font-semibold text-sm line-clamp-2 text-text-primary group-hover:text-primary transition">
                {movie.title}
              </h4>
              
              {/* IMDb Rating */}
              {movie.rating > 0 && (
                <p className="text-xs text-primary font-bold mt-2">⭐ IMDb {movie.rating.toFixed(1)}</p>
              )}
              
              {/* Runtime */}
              {movie.runtime > 0 && (
                <p className="text-xs text-text-secondary">⏱️ {movie.runtime} min</p>
              )}

              <div className="mt-2">
                {movie.userRating !== 'N/A' && movie.userRating ? (
                  <StarRating rating={Number(movie.userRating)} size="sm" />
                ) : (
                  <span className="text-xs text-text-secondary">No user ratings</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
