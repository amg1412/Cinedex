import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { MovieCard } from '../components/MovieCard';
import { movieAPI } from '../utils/api';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const contentType = searchParams.get('type') || 'movies';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [localQuery, setLocalQuery] = useState(query);

  const performSearch = async (searchQuery, pageNum = 1, type = 'movies') => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const filters = type ? { type } : {};
      const response = await movieAPI.search(searchQuery, pageNum, filters);
      setMovies(response.data.movies || []);
      setTotalPages(response.data.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to search movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setLocalQuery(query);
      performSearch(query, 1, contentType);
    }
  }, [query, contentType]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      performSearch(localQuery, 1, contentType);
    }
  };

  return (
    <MainLayout>
      <div className="container-main py-12">
        <h1 className="text-4xl font-bold text-secondary mb-8">Search Results</h1>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-gray-500">Searching...</div>
          </div>
        ) : movies.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">
              Found {movies.length} results for "{localQuery}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => performSearch(localQuery, Math.max(1, page - 1), contentType)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-center py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => performSearch(localQuery, page + 1, contentType)}
                  disabled={page >= totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          query && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No movies found for "{query}". Try another search!
              </p>
            </div>
          )
        )}
      </div>
    </MainLayout>
  );
};
