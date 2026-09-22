import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Loader from '../components/common/Loader.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { fetchMyOrder } from '../api/order.api.js';
import { apiMessage } from '../api/axios.js';
import { formatINR } from '../utils/format.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function OrderPlaced() {
  useDocumentTitle('Order placed');
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrder(id)
      .then(({ data }) => setOrder(data.data.order))
      .catch((err) => setError(apiMessage(err, 'That order could not load.')))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><ErrorState message={error} /></div>;

  return (
    <div className="container page">
      <div className="panel text-center">
        <CheckCircle2 size={44} color="var(--color-success)" style={{ margin: '0 auto' }} />
        <h1>Your order is in the oven queue</h1>
        <p className="text-muted" style={{ margin: '0 auto 1rem' }}>
          Order <strong>{order.orderNumber}</strong> for {formatINR(order.total)} has been received.
          The bakery verifies your payment screenshot and starts baking.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to={`/profile/orders/${order._id}`} className="btn btn--primary">Track this order</Link>
          <Link to="/cakes" className="btn btn--ghost">Order something else</Link>
        </div>
      </div>
    </div>
  );
}
