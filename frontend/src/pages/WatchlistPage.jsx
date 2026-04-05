import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { watchlistAPI } from '../utils/api';
import { MovieCard } from '../components/MovieCard';
import { useAuth } from '../hooks/useAuth';

export const WatchlistPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please login to view your watchlist');
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const response = await watchlistAPI.get();
        setMovies(response.data.movies || []);
      } catch (err) {
        setError('Failed to load watchlist');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [isAuthenticated]);

  const handleRemove = async (movieId) => {
    try {
      await watchlistAPI.remove(movieId);
      setMovies(movies.filter((m) => m._id !== movieId));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  return (
    <MainLayout>
      <div className="container-main py-12">
        <h1 className="text-4xl font-bold text-secondary mb-4">📽️ My Watchlist</h1>
        <p className="text-gray-600 mb-8">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your watchlist
        </p>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-gray-500">Loading...</div>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div key={movie._id} className="relative">
                <MovieCard movie={movie} />
                <button
                  onClick={() => handleRemove(movie._id)}
                  className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-lg">Your watchlist is empty</p>
            <p className="text-gray-500 mt-2">Add movies from the Home or Search pages</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
