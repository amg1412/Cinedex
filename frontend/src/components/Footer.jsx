export const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-gray-800 mt-16">
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">🎬 CineHive</h3>
            <p className="text-text-secondary">
              Your social movie database. Log, rate, review, and discover films you love with friends.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4\">Quick Links</h4>
            <ul className="text-text-secondary space-y-2">
              <li>
                <a href="/" className="hover:text-primary transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-primary transition">
                  Search
                </a>
              </li>
              <li>
                <a href="/watchlist" className="hover:text-primary transition">
                  Watchlist
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">Account</h4>
            <ul className="text-text-secondary space-y-2">
              <li>
                <a href="/login" className="hover:text-primary transition">
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-primary transition">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">About</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              CineHive is a social movie database where you can log, rate, and share your favorite films. 
              Built with React, Node.js, and MongoDB for an optimal viewing experience.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-text-secondary text-sm">
              <h4 className="font-semibold text-text-primary mb-2">Data Sources</h4>
              <p>
                Movie data provided by <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-yellow-300 transition">OMDB</a> and <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-yellow-300 transition">TMDB</a> APIs.
              </p>
            </div>
            <div className="text-text-secondary text-sm">
              <h4 className="font-semibold text-text-primary mb-2">Disclaimer</h4>
              <p>
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-text-secondary text-sm">
            <p>&copy; 2026 CineHive. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
