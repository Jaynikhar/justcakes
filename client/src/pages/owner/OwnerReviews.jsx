import { useEffect, useState } from 'react';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { StarRating } from '../../components/common/StarRating.jsx';
import { deleteReview, fetchAllReviews, updateReview } from '../../api/review.api.js';
import { apiMessage } from '../../api/axios.js';
import { formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function OwnerReviews() {
  useDocumentTitle('Reviews');
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    fetchAllReviews()
      .then(({ data }) => setReviews(data.data.reviews))
      .catch((err) => setError(apiMessage(err, 'Reviews could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleApproval = async (review) => {
    try {
      const { data } = await updateReview(review._id, { isApproved: !review.isApproved });
      setReviews((current) =>
        current.map((item) => (item._id === review._id ? data.data.review : item)),
      );
      toast.success(data.data.review.isApproved ? 'Review is public' : 'Review hidden');
    } catch (err) {
      toast.error(apiMessage(err, 'That review could not be updated.'));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteReview(target._id);
      toast.success('Review deleted');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That review could not be deleted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page stack-lg">
      <h1>Reviews</h1>
      <OwnerNav />

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : reviews.length ? (
        <div className="stack">
          {reviews.map((review) => (
            <article className="card" key={review._id}>
              <div className="row row--between">
                <div>
                  <strong>{review.userNameSnapshot}</strong>
                  <div className="text-small text-muted">
                    {review.productNameSnapshot} · {formatDate(review.createdAt)}
                  </div>
                </div>
                <StarRating value={review.rating} size={15} />
              </div>
              <p className="text-small mt-1">{review.description}</p>
              <div className="row">
                <span className={review.isApproved ? 'badge badge--success' : 'badge badge--muted'}>
                  {review.isApproved ? 'Public' : 'Hidden'}
                </span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleApproval(review)}>
                  {review.isApproved ? 'Hide' : 'Show'}
                </button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => setTarget(review)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState emoji="⭐" title="No reviews yet" message="Ratings appear once customers rate delivered orders." />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this review?"
        message="The product rating is recalculated afterwards."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
