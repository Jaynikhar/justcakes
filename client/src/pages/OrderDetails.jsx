import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import OrderTimeline from '../components/common/OrderTimeline.jsx';
import StatusBadge, { PaymentBadge } from '../components/common/StatusBadge.jsx';
import Modal from '../components/common/Modal.jsx';
import { StarInput } from '../components/common/StarRating.jsx';
import { fetchMyOrder, paymentScreenshotUrl } from '../api/order.api.js';
import { createReview, fetchReviewEligibility } from '../api/review.api.js';
import { apiMessage } from '../api/axios.js';
import { formatDateTime, formatINR } from '../utils/format.js';
import { REVIEWABLE_STATUSES } from '../utils/constants.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function OrderDetails() {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eligibility, setEligibility] = useState({});
  const [ratingFor, setRatingFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order');

  const loadEligibility = async (loaded) => {
    if (!REVIEWABLE_STATUSES.includes(loaded.status)) return;
    const unique = [...new Set(loaded.items.map((item) => String(item.productId)))];
    const results = await Promise.all(
      unique.map((productId) =>
        fetchReviewEligibility(productId)
          .then(({ data }) => [productId, data.data])
          .catch(() => [productId, { eligible: false }]),
      ),
    );
    setEligibility(Object.fromEntries(results));
  };

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyOrder(id)
      .then(({ data }) => {
        setOrder(data.data.order);
        return loadEligibility(data.data.order);
      })
      .catch((err) => setError(apiMessage(err, 'That order could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const submitRating = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createReview({
        productId: ratingFor.productId,
        orderId: order._id,
        rating,
        description,
      });
      toast.success('Thanks for the rating');
      setRatingFor(null);
      setDescription('');
      setRating(5);
      await loadEligibility(order);
    } catch (err) {
      toast.error(apiMessage(err, 'That rating could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;
  if (!order) return null;

  return (
    <div className="container page stack-lg">
      <div className="row row--between">
        <div>
          <h1>Order {order.orderNumber}</h1>
          <p className="text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="row">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      <section className="panel">
        <h2>Tracking</h2>
        <OrderTimeline status={order.status} history={order.statusHistory} />
      </section>

      <section className="panel">
        <h2>What you ordered</h2>
        <div className="stack">
          {order.items.map((item, index) => {
            const info = eligibility[String(item.productId)];
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div className="card" key={index}>
                <div className="row row--between">
                  <div>
                    <strong>{item.productNameSnapshot}</strong>
                    <div className="text-small text-muted">
                      {item.weight}{item.flavour ? ` · ${item.flavour}` : ''} · × {item.quantity}
                    </div>
                    {item.customization ? (
                      <div className="text-small">On the cake: {item.customization}</div>
                    ) : null}
                  </div>
                  <div className="text-small"><strong>{formatINR(item.totalPrice)}</strong></div>
                </div>

                {info?.eligible ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm mt-2"
                    onClick={() => setRatingFor({ productId: String(item.productId), name: item.productNameSnapshot })}
                  >
                    Add rating
                  </button>
                ) : info?.reason === 'ALREADY_REVIEWED' ? (
                  <span className="badge badge--success mt-2">You rated this cake</span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="summary-total">
          <span>Total paid</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </section>

      <section className="panel">
        <h2>Delivery and payment</h2>
        <p className="text-small"><strong>Address:</strong> {order.deliveryAddress}</p>
        <p className="text-small"><strong>Phone:</strong> {order.customerSnapshot.phone}</p>
        {order.customerSnapshot.whatsappNumber ? (
          <p className="text-small"><strong>WhatsApp:</strong> {order.customerSnapshot.whatsappNumber}</p>
        ) : null}
        {order.deliveryPreference ? (
          <p className="text-small"><strong>Preferred time:</strong> {order.deliveryPreference}</p>
        ) : null}
        {order.paymentScreenshot ? (
          <a className="btn btn--ghost btn--sm" href={paymentScreenshotUrl(order._id)} target="_blank" rel="noreferrer">
            View my payment screenshot
          </a>
        ) : null}
      </section>

      <Link to="/profile/orders" className="btn btn--ghost">Back to my orders</Link>

      <Modal open={Boolean(ratingFor)} title={`Rate ${ratingFor?.name || ''}`} onClose={() => setRatingFor(null)}>
        <form onSubmit={submitRating}>
          <div className="field">
            <label id="rating-label">Your rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div className="field">
            <label htmlFor="review-text">Tell others about it</label>
            <textarea
              id="review-text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={4}
              maxLength={600}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Saving…' : 'Post rating'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
