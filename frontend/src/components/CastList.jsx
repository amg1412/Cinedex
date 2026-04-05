export const CastList = ({ cast = [] }) => {
  if (!cast || cast.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary italic">🎭 Cast information not yet available</p>
        <p className="text-xs text-text-secondary mt-2">Check back soon for cast details</p>
      </div>
    );
  }

  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

  const generateAvatarColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700',
      'from-red-500 to-red-700',
      'from-green-500 to-green-700',
      'from-yellow-500 to-yellow-700',
      'from-indigo-500 to-indigo-700',
      'from-cyan-500 to-cyan-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.map((actor, index) => (
        <div
          key={actor.id}
          className="group text-center"
        >
          {/* Actor Image/Avatar */}
          <div
            className={`relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br ${generateAvatarColor(
              index
            )} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}
          >
            {actor.profilePath || actor.profileUrl ? (
              <img
                src={actor.profileUrl || `${TMDB_IMAGE_BASE}${actor.profilePath}`}
                alt={actor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                  const initials = actor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  e.target.parentElement.innerHTML = `<span class="text-xl font-bold text-white">${initials}</span>`;
                }}
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {actor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            )}
          </div>

          {/* Actor Name */}
          <h4 className="font-semibold text-sm line-clamp-2 text-text-primary group-hover:text-primary transition">
            {actor.name}
          </h4>

          {/* Character */}
          {(actor.character || actor.roles?.[0]) && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1">
              as {actor.character || actor.roles?.[0].character || 'N/A'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
