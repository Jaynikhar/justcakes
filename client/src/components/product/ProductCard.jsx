import { Link, useNavigate } from 'react-router-dom';
import { StarRating } from '../common/StarRating.jsx';
import { formatINR } from '../../utils/format.js';
import { firstImage } from '../../utils/media.js';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const image = firstImage(product);
  const firstPrice = product.pricing?.[0];

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug || product._id}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <span className="product-card__fallback">🎂</span>
        )}
      </Link>

      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={`/product/${product.slug || product._id}`}>{product.name}</Link>
        </h3>

        <div className="rating-line">
          <StarRating value={product.ratingAverage} size={14} />
          <span>
            {product.ratingCount ? `${product.ratingAverage} (${product.ratingCount})` : 'Taste & rate!'}
          </span>
        </div>

        <div className="product-card__meta">
          {product.flavours?.length ? <span>{product.flavours[0]}</span> : null}
          {firstPrice ? <span>{firstPrice.label}</span> : null}
          {!product.isAvailable ? <span className="badge badge--muted">Sold out</span> : null}
        </div>

        <div className="product-card__price">
          {firstPrice ? formatINR(firstPrice.price) : formatINR(product.defaultPrice)}
        </div>

        <div className="product-card__actions">
          <Link to={`/product/${product.slug || product._id}`} className="btn btn--ghost btn--sm">
            View
          </Link>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={!product.isAvailable}
            onClick={() => navigate(`/checkout/${product.slug || product._id}`)}
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
