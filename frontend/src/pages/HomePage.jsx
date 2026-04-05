import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { MovieCard } from '../components/MovieCard';
import { movieAPI } from '../utils/api';

export const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTrendingMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getTrending(page);
      setMovies(response.data.movies);
    } catch (err) {
      setError('Failed to load trending movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingMovies();
  }, [page]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-surface to-secondary py-16">
        <div className="container-main">
          <h1 className="text-5xl font-bold text-primary mb-4">
            🎬 Welcome to CineHive
          </h1>
          <p className="text-text-secondary text-lg mb-2">
            Your personal film catalog. Log, rate, review, and discover with a community of film lovers.
          </p>
          <p className="text-text-secondary text-sm mb-8">
            Explore trending films, track your watchlist, and share your favorite four.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-main py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-2">
              🔥 Trending Now
            </h2>
            <p className="text-text-secondary">What everyone's watching and logging</p>
          </div>
        </div>

        {error && <div className="alert alert-error mb-6 bg-red-900 text-red-100 p-4 rounded">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-text-secondary">🍿 Loading films...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} onWatchlistChange={fetchTrendingMovies} />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-center py-2 text-primary font-bold text-lg">Page {page}</span>
              <button onClick={() => setPage(page + 1)} className="btn-secondary">
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};
