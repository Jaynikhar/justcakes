import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { fetchSales, fetchSummary } from '../../api/dashboard.api.js';
import { fetchAllOrders } from '../../api/order.api.js';
import { apiMessage } from '../../api/axios.js';
import { formatDate, formatINR } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function OwnerDashboard() {
  useDocumentTitle('Owner dashboard');
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([fetchSummary(), fetchSales({ months: 6 }), fetchAllOrders({ limit: 8 })])
      .then(([summaryRes, salesRes, orderRes]) => {
        setSummary(summaryRes.data.data.summary);
        setSales(salesRes.data.data.sales);
        setRecent(orderRes.data.data.orders);
      })
      .catch((err) => setError(apiMessage(err, 'The dashboard could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;

  const cards = [
    { label: "Today's orders", value: summary.dailyOrders },
    { label: 'This month', value: summary.monthlyOrders },
    { label: 'This year', value: summary.yearlyOrders },
    { label: 'Waiting on you', value: summary.pendingOrders },
    { label: 'Total sales', value: formatINR(summary.totalSales) },
    { label: 'Sales this month', value: formatINR(summary.monthlySales) },
    { label: 'Customers', value: summary.totalCustomers },
    { label: 'Products', value: summary.totalProducts },
  ];

  return (
    <div className="container page stack-lg">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted">Signed in as {user?.name} · {user?.email}</p>
      </div>

      <OwnerNav />

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-card__value">{card.value}</div>
            <div className="stat-card__label">{card.label}</div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="section-head">
          <h2>Latest orders</h2>
          <Link to="/owner/orders" className="btn btn--ghost btn--sm">All orders</Link>
        </div>
        {recent.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerSnapshot.name}</td>
                    <td>{order.items.length}</td>
                    <td>{formatINR(order.total)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td><Link to={`/owner/orders/${order._id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No orders yet.</p>
        )}
      </section>

      <div className="form-grid">
        <section className="panel">
          <h2>Sales by month</h2>
          {sales?.monthly?.length ? (
            <div className="stack">
              {sales.monthly.map((row) => (
                <div className="summary-line" key={row.label}>
                  <span>{row.label}</span>
                  <span>{row.orders} orders · {formatINR(row.sales)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No sales recorded yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Best sellers</h2>
          {sales?.topProducts?.length ? (
            <div className="stack">
              {sales.topProducts.map((row) => (
                <div className="summary-line" key={row.product}>
                  <span>{row.product}</span>
                  <span>{row.quantity} sold · {formatINR(row.sales)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Nothing sold yet.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Sales by category</h2>
        {sales?.byCategory?.length ? (
          <div className="stack">
            {sales.byCategory.map((row) => (
              <div className="summary-line" key={row.category}>
                <span>{row.category}</span>
                <span>{row.quantity} items · {formatINR(row.sales)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No category sales yet.</p>
        )}
      </section>
    </div>
  );
}
