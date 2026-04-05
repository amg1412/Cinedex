import { useState } from 'react';

export const StarRating = ({ rating = 0, onRatingChange, interactive = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onTouchStart={() => interactive && setHoverRating(star)}
          onTouchEnd={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`${sizeClass} transition-all active:scale-95 ${
            interactive ? 'cursor-pointer hover:scale-110 touch-manipulation' : 'cursor-default'
          } ${star <= displayRating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300'}`}
          type="button"
          title={interactive ? `Rate ${star} stars` : undefined}
        >
          ★
        </button>
      ))}
      {rating > 0 && <span className="text-sm text-gray-600 font-medium">({rating}/5)</span>}
    </div>
  );
};
