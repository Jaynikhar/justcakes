import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { fetchMyOrders } from '../api/order.api.js';
import { apiMessage } from '../api/axios.js';
import { formatDate, formatINR } from '../utils/format.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Orders() {
  useDocumentTitle('My orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyOrders()
      .then(({ data }) => setOrders(data.data.orders))
      .catch((err) => setError(apiMessage(err, 'Your orders could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="container page">
      <h1>My orders</h1>

      {orders.length ? (
        <div className="stack mt-2">
          {orders.map((order) => (
            <article className="card" key={order._id}>
              <div className="row row--between">
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div className="text-small text-muted">{formatDate(order.createdAt)}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <ul className="text-small mt-1" style={{ paddingLeft: '1.1rem', margin: 0 }}>
                {order.items.map((item, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={index}>
                    {item.productNameSnapshot} · {item.weight} · × {item.quantity} — {formatINR(item.totalPrice)}
                  </li>
                ))}
              </ul>

              <div className="row row--between mt-2">
                <strong>{formatINR(order.total)}</strong>
                <Link to={`/profile/orders/${order._id}`} className="btn btn--primary btn--sm">
                  Track and rate
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          emoji="📦"
          title="No orders yet"
          message="Once you order a cake, it shows up here with live tracking."
          action={<Link to="/cakes" className="btn btn--primary btn--sm">Browse cakes</Link>}
        />
      )}
    </div>
  );
}
