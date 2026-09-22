import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductViewer from '../components/product/ProductViewer.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Loader from '../components/common/Loader.jsx';
import { fetchProduct } from '../api/product.api.js';
import { fetchProductReviews } from '../api/review.api.js';
import { apiMessage } from '../api/axios.js';
import { formatDate, formatINR } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [weight, setWeight] = useState('');
  const [flavour, setFlavour] = useState('');
  const [quantity, setQuantity] = useState(1);

  useDocumentTitle(product?.name || 'Cake');

  const load = () => {
    setLoading(true);
    setError('');
    fetchProduct(idOrSlug)
      .then(({ data }) => {
        const item = data.data.product;
        setProduct(item);
        setWeight(item.pricing?.[0]?.label || '');
        setFlavour(item.flavours?.[0] || '');
        return fetchProductReviews(item._id);
      })
      .then((response) => setReviews(response?.data.data.reviews || []))
      .catch((err) => setError(apiMessage(err, 'That cake could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);

  const selectedPrice = useMemo(() => {
    if (!product) return 0;
    const variant = product.pricing?.find((entry) => entry.label === weight);
    return (variant?.price ?? product.defaultPrice) * quantity;
  }, [product, weight, quantity]);

  const goToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: `/checkout/${product.slug || product._id}` },
          message: 'Sign in or create an account to place an order.',
        },
      });
      return;
    }
    navigate(`/checkout/${product.slug || product._id}`, { state: { weight, flavour, quantity } });
  };

  if (loading) return <div className="container page"><Loader label="Bringing out the cake…" /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;
  if (!product) return null;

  return (
    <div className="container page">
      <div className="product-detail">
        <ProductViewer images={product.images} name={product.name} />

        <div>
          <h1>{product.name}</h1>
          <div className="row">
            <StarRating value={product.ratingAverage} />
            <span className="text-small text-muted">
              {product.ratingCount ? `${product.ratingAverage} from ${product.ratingCount} rating(s)` : 'No ratings yet'}
            </span>
            {product.categoryId?.name ? <span className="badge">{product.categoryId.name}</span> : null}
            {!product.isAvailable ? <span className="badge badge--danger">Sold out</span> : null}
          </div>

          <p className="mt-2">{product.description || 'Baked fresh to order.'}</p>

          {product.pricing?.length ? (
            <div className="field">
              <label id="weight-label">Size</label>
              <div className="option-group" role="radiogroup" aria-labelledby="weight-label">
                {product.pricing.map((entry) => (
                  <button
                    key={entry.label}
                    type="button"
                    role="radio"
                    aria-checked={weight === entry.label}
                    className={`option-chip ${weight === entry.label ? 'is-selected' : ''}`}
                    onClick={() => setWeight(entry.label)}
                  >
                    {entry.label} · {formatINR(entry.price)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {product.flavours?.length ? (
            <div className="field">
              <label id="flavour-label">Flavour</label>
              <div className="option-group" role="radiogroup" aria-labelledby="flavour-label">
                {product.flavours.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={flavour === item}
                    className={`option-chip ${flavour === item ? 'is-selected' : ''}`}
                    onClick={() => setFlavour(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="field">
            <label id="qty-label">Quantity</label>
            <div className="qty" aria-labelledby="qty-label">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Reduce quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(50, q + 1))} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="price-line">{formatINR(selectedPrice)}</div>
          <p className="text-small text-muted">The bakery confirms the final price when the order is created.</p>

          <button
            type="button"
            className="btn btn--primary"
            onClick={goToCheckout}
            disabled={!product.isAvailable}
          >
            {product.isAvailable ? 'Buy now' : 'Currently unavailable'}
          </button>
        </div>
      </div>

      <section className="mt-3">
        <h2>What customers said</h2>
        {reviews.length ? (
          <div className="product-grid">
            {reviews.map((review) => (
              <article className="card" key={review._id}>
                <div className="row row--between">
                  <strong>{review.userNameSnapshot}</strong>
                  <StarRating value={review.rating} size={14} />
                </div>
                <p className="text-small mt-1">{review.description}</p>
                <span className="text-small text-muted">{formatDate(review.createdAt)}</span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState emoji="⭐" title="No ratings yet" message="Ratings appear once delivered orders are rated." />
        )}
      </section>
    </div>
  );
}
