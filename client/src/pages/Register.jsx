import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiMessage } from '../api/axios.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const initial = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  whatsappNumber: '',
  address: '',
};

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Both passwords need to match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }

    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      toast.success('Account created');
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'That account could not be created.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-shell">
      <div className="panel auth-card" style={{ width: 'min(620px, 100%)' }}>
        <h1>Create your account</h1>
        <p className="text-muted">We use these details to prefill your orders.</p>

        {error ? <div className="form-error mt-2">{error}</div> : null}

        <form onSubmit={handleSubmit} noValidate className="mt-2">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" required />
            </div>
            <div className="field">
              <label htmlFor="whatsappNumber">WhatsApp number</label>
              <input id="whatsappNumber" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} />
              <span className="field-hint">Leave blank to use your phone number.</span>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">Delivery address</label>
            <textarea id="address" name="address" value={form.address} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-small mt-2">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
