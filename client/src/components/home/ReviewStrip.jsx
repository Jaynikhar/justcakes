import { StarRating } from '../common/StarRating.jsx';

/** Reviews slide right to left and pause on hover or keyboard focus. */
export function ReviewStrip({ reviews = [] }) {
  if (!reviews.length) return null;

  const loop = reviews.length < 4 ? [...reviews, ...reviews, ...reviews] : reviews;
  const track = [...loop, ...loop];

  return (
    <div className="review-strip" aria-label="Customer reviews">
      <div className="review-strip__track">
        {track.map((review, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <article className="review-card" key={`${review._id}-${index}`} aria-hidden={index >= loop.length}>
            <div className="review-card__name">{review.userNameSnapshot}</div>
            <div className="review-card__product">{review.productNameSnapshot}</div>
            <StarRating value={review.rating} size={14} />
            <p>{review.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ReviewStrip;
