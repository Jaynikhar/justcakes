import { Star } from 'lucide-react';

export function StarRating({ value = 0, size = 16 }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="stars" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rounded ? 'currentColor' : 'none'}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 26 }) {
  return (
    <span className="stars stars--input" role="radiogroup" aria-label="Choose a rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={star <= value ? 'is-on' : ''}
          onClick={() => onChange(star)}
        >
          <Star size={size} fill={star <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </span>
  );
}

export default StarRating;
