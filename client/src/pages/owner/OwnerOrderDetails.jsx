import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import OrderTimeline from '../../components/common/OrderTimeline.jsx';
import StatusBadge, { PaymentBadge } from '../../components/common/StatusBadge.jsx';
import {
  fetchOrderForOwner,
  paymentScreenshotUrl,
  updateOrderStatus,
  updatePaymentStatus,
} from '../../api/order.api.js';
import { apiMessage } from '../../api/axios.js';
import { formatDateTime, formatINR } from '../../utils/format.js';
import { ORDER_FLOW, STATUS_LABELS } from '../../utils/constants.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function OwnerOrderDetails() {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order');

  const load = () => {
    setLoading(true);
    setError('');
    fetchOrderForOwner(id)
      .then(({ data }) => {
        setOrder(data.data.order);
        setStatus(data.data.order.status);
      })
      .catch((err) => setError(apiMessage(err, 'That order could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const saveStatus = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await updateOrderStatus(id, { status, note });
      setOrder(data.data.order);
      setNote('');
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(apiMessage(err, 'The status could not be updated.'));
    } finally {
      setBusy(false);
    }
  };

  const setPayment = async (paymentStatus) => {
    try {
      const { data } = await updatePaymentStatus(id, { paymentStatus });
      setOrder(data.data.order);
      toast.success('Payment status updated');
    } catch (err) {
      toast.error(apiMessage(err, 'The payment status could not be updated.'));
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

      <OwnerNav />

      <div className="form-grid">
        <section className="panel">
          <h2>Customer</h2>
          <p className="text-small"><strong>Name:</strong> {order.customerSnapshot.name}</p>
          <p className="text-small"><strong>Email:</strong> {order.customerSnapshot.email}</p>
          <p className="text-small">
            <strong>Phone:</strong> <a href={`tel:${order.customerSnapshot.phone}`}>{order.customerSnapshot.phone}</a>
          </p>
          {order.customerSnapshot.whatsappNumber ? (
            <p className="text-small">
              <strong>WhatsApp:</strong>{' '}
              <a
                href={`https://wa.me/${order.customerSnapshot.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                {order.customerSnapshot.whatsappNumber}
              </a>
            </p>
          ) : null}
          <p className="text-small"><strong>Address:</strong> {order.deliveryAddress}</p>
          {order.deliveryPreference ? (
            <p className="text-small"><strong>Preferred time:</strong> {order.deliveryPreference}</p>
          ) : null}
          {order.notes ? <p className="text-small"><strong>Notes:</strong> {order.notes}</p> : null}
        </section>

        <section className="panel">
          <h2>Payment</h2>
          <p className="text-small"><strong>Method:</strong> {order.paymentMethod}</p>
          <p className="text-small"><strong>Total:</strong> {formatINR(order.total)}</p>
          {order.paymentScreenshot ? (
            <>
              <a className="btn btn--ghost btn--sm" href={paymentScreenshotUrl(order._id)} target="_blank" rel="noreferrer">
                Open payment screenshot
              </a>
              <div className="row mt-2">
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setPayment('VERIFIED')}>
                  Mark verified
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPayment('REJECTED')}>
                  Mark rejected
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted text-small">No screenshot attached.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Items</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cake</th>
                <th>Size</th>
                <th>Flavour</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
                <th>Customization</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index}>
                  <td>{item.productNameSnapshot}</td>
                  <td>{item.weight}</td>
                  <td>{item.flavour || '—'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatINR(item.unitPrice)}</td>
                  <td>{formatINR(item.totalPrice)}</td>
                  <td>{item.customization || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </section>

      <div className="form-grid">
        <section className="panel">
          <h2>Update tracking</h2>
          <form onSubmit={saveStatus}>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {[...ORDER_FLOW, 'CANCELLED'].map((value) => (
                  <option key={value} value={value}>{STATUS_LABELS[value]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="note">Note for the record</label>
              <input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
            </div>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save status'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>History</h2>
          <OrderTimeline status={order.status} history={order.statusHistory} />
        </section>
      </div>

      <Link to="/owner/orders" className="btn btn--ghost">Back to orders</Link>
    </div>
  );
}
