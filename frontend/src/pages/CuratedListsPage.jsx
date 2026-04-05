import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { curatedListAPI } from '../utils/api';

const CATEGORY_INFO = {
  trending: { icon: '🔥', label: 'Trending' },
  'top-rated': { icon: '⭐', label: 'Top Rated' },
  'new-releases': { icon: '🆕', label: 'New Releases' },
  'genre-specific': { icon: '🎭', label: 'By Genre' },
  themed: { icon: '🎬', label: 'Themed' },
  'staff-picks': { icon: '👌', label: 'Staff Picks' },
};

export const CuratedListsPage = () => {
  const [lists, setLists] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        const response = await curatedListAPI.getAll();
        setLists(response.data.lists || []);
      } catch (err) {
        console.error('Error fetching curated lists:', err);
        setError('Failed to load curated lists');
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const filteredLists = selectedCategory
    ? lists.filter((list) => list.category === selectedCategory)
    : lists;

  const categories = Object.keys(CATEGORY_INFO);

  return (
    <MainLayout>
      <div className="container-main py-12">
        <h1 className="text-4xl font-bold text-secondary mb-2">🎬 Curated Lists</h1>
        <p className="text-gray-600 mb-8">Discover handpicked collections of movies</p>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedCategory === null
                ? 'bg-primary text-secondary'
                : 'bg-gray-200 text-secondary hover:bg-gray-300'
            }`}
          >
            All Lists
          </button>
          {categories.map((category) => {
            const info = CATEGORY_INFO[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-primary text-secondary'
                    : 'bg-gray-200 text-secondary hover:bg-gray-300'
                }`}
              >
                <span>{info.icon}</span>
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Lists Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-xl text-gray-500">Loading curated lists...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <Link
                key={list._id}
                to={`/curated-lists/${list._id}`}
                className="group"
              >
                <div className="card hover:shadow-xl transition overflow-hidden h-full">
                  {/* List Cover */}
                  <div className="relative mb-4 overflow-hidden rounded-lg aspect-video bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
                    {list.coverImage ? (
                      <img
                        src={list.coverImage}
                        alt={list.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="text-6xl">{list.icon}</div>
                    )}
                  </div>

                  {/* List Info */}
                  <h3 className="font-bold text-xl text-secondary mb-2 line-clamp-2 group-hover:text-primary transition">
                    {list.title}
                  </h3>

                  {list.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {list.description}
                    </p>
                  )}

                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-lg">
                        {CATEGORY_INFO[list.category]?.icon}
                      </span>
                      <span className="font-medium text-gray-600">
                        {CATEGORY_INFO[list.category]?.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {list.movies.length} movies
                    </span>
                  </div>

                  {/* View Count */}
                  <div className="mt-3 text-xs text-gray-500">
                    👁️ {list.viewCount} views
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredLists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No lists found in this category</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
