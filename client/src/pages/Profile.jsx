import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiMessage } from '../api/axios.js';
import { changePasswordRequest } from '../api/auth.api.js';
import { fetchMyOrders } from '../api/order.api.js';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { formatDate, formatINR } from '../utils/format.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Profile() {
  useDocumentTitle('My profile');
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      whatsappNumber: user.whatsappNumber || '',
      address: user.address || '',
    });
  }, [user]);

  useEffect(() => {
    fetchMyOrders()
      .then(({ data }) => setOrders(data.data.orders.slice(0, 5)))
      .catch(() => setOrders([]));
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateUser(form);
      toast.success('Profile updated');
    } catch (err) {
      setError(apiMessage(err, 'Your profile could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    setPasswordBusy(true);
    try {
      await changePasswordRequest(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(apiMessage(err, 'The password could not be changed.'));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="container page stack-lg">
      <div>
        <h1>My profile</h1>
        <p className="text-muted">These details prefill every order you place.</p>
      </div>

      <section className="panel">
        <h2>Contact details</h2>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={handleSave} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsappNumber">WhatsApp</label>
              <input id="whatsappNumber" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="address">Delivery address</label>
            <textarea id="address" name="address" value={form.address} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Change password</h2>
        <form onSubmit={handlePassword}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(event) => setPasswords((p) => ({ ...p, currentPassword: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={passwords.newPassword}
                onChange={(event) => setPasswords((p) => ({ ...p, newPassword: event.target.value }))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn--ghost" disabled={passwordBusy}>
            {passwordBusy ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Recent orders</h2>
          <Link to="/profile/orders" className="btn btn--ghost btn--sm">All orders</Link>
        </div>
        {orders.length ? (
          <div className="stack">
            {orders.map((order) => (
              <div className="card row row--between" key={order._id}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div className="text-small text-muted">
                    {formatDate(order.createdAt)} · {order.items.length} item(s) · {formatINR(order.total)}
                  </div>
                </div>
                <div className="row">
                  <StatusBadge status={order.status} />
                  <Link to={`/profile/orders/${order._id}`} className="btn btn--ghost btn--sm">Open</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No orders yet. <Link to="/cakes">Pick a cake</Link>.</p>
        )}
      </section>
    </div>
  );
}
