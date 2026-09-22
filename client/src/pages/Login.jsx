import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiMessage } from '../api/axios.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/profile';
  const notice = location.state?.message;

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(user.role === 'OWNER' ? '/owner' : redirectTo, { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Sign in failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-shell">
      <div className="panel auth-card">
        <h1>Sign in</h1>
        <p className="text-muted">Orders and ratings need an account.</p>

        {notice ? <div className="badge badge--warning mt-1">{notice}</div> : null}
        {error ? <div className="form-error mt-2">{error}</div> : null}

        <form onSubmit={handleSubmit} noValidate className="mt-2">
          <div className="field">
            <label htmlFor="identifier">Username or email</label>
            <input
              id="identifier"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-small mt-2">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
