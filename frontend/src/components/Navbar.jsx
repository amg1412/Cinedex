import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('movies'); // 'movies' or 'tv'

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${contentType}`);
      setSearchQuery('');
    }
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    
    // If on search page, navigate with the new type parameter
    if (location.pathname === '/search') {
      const currentQuery = searchParams.get('q');
      if (currentQuery) {
        navigate(`/search?q=${encodeURIComponent(currentQuery)}&type=${newType}`);
      }
    }
  };

  // Sync contentType with URL parameter when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const type = searchParams.get('type') || 'movies';
      setContentType(type);
    }
  }, [location.pathname, searchParams]);

  // Get avatar letter from user email or name
  const getAvatarLetter = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Generate consistent color from user email
  const getAvatarColor = () => {
    const colors = [
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
    ];
    const index = (user?.email?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <nav className="bg-secondary border-b border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container-main flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:text-yellow-300 transition">
          🎬 CineHive
        </Link>

        {/* Content Type Tabs */}
        <div className="hidden md:flex gap-2 ml-6">
          <button
            onClick={() => handleContentTypeChange('movies')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              contentType === 'movies'
                ? 'bg-primary text-secondary'
                : 'bg-surface text-text-primary border border-gray-700 hover:border-primary'
            }`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => handleContentTypeChange('tv')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              contentType === 'tv'
                ? 'bg-primary text-secondary'
                : 'bg-surface text-text-primary border border-gray-700 hover:border-primary'
            }`}
          >
            📺 TV Shows
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8">
          <input
            type="text"
            placeholder="Search movies, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-l-lg focus:outline-none text-text-primary bg-surface border border-gray-700 focus:border-primary"
          />
          <button type="submit" className="px-6 bg-primary text-secondary font-semibold rounded-r-lg hover:bg-yellow-400 transition">
            Search
          </button>
        </form>

        {/* Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <div className={`w-10 h-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {getAvatarLetter()}
                </div>
                <span className="hidden sm:inline text-text-primary">{user?.displayName || user?.email?.split('@')[0]}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface text-text-primary rounded-lg shadow-xl border border-gray-700 py-2">
                  <Link to={`/profile/${user?._id}`} className="block px-4 py-2 hover:bg-gray-700 hover:text-primary transition">
                    👤 Profile
                  </Link>
                  <Link to="/watchlist" className="block px-4 py-2 hover:bg-gray-700 hover:text-primary transition">
                    📋 Watchlist
                  </Link>
                  <Link to="/lists" className="block px-4 py-2 hover:bg-gray-700 hover:text-primary transition">
                    📚 Lists
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-primary border-t border-gray-700 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <form onSubmit={handleSearch} className="md:hidden container-main pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none text-black"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
      </form>
    </nav>
  );
};
