import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { fetchAllOrders } from '../../api/order.api.js';
import { apiMessage } from '../../api/axios.js';
import { formatDate, formatINR } from '../../utils/format.js';
import { STATUS_LABELS } from '../../utils/constants.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function OwnerOrders() {
  useDocumentTitle('Orders');
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchAllOrders({ status, search, page, limit: 20 })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setMeta(data.meta || { page: 1, pages: 1 });
      })
      .catch((err) => setError(apiMessage(err, 'Orders could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, search, page]);

  return (
    <div className="container page stack-lg">
      <h1>Orders</h1>
      <OwnerNav />

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Order number, name or phone"
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value.trim());
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length ? (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerSnapshot.name}</td>
                    <td>{order.customerSnapshot.phone}</td>
                    <td>{order.items.map((item) => item.productNameSnapshot).join(', ')}</td>
                    <td>{formatINR(order.total)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td><Link to={`/owner/orders/${order._id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.pages > 1 ? (
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-small">Page {meta.page} of {meta.pages}</span>
              <button type="button" className="btn btn--ghost btn--sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState emoji="🧾" title="No orders match this view" message="Clear the filters to see everything." />
      )}
    </div>
  );
}
