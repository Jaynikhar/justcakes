import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { fetchProduct } from '../api/product.api.js';
import { fetchPaymentConfig } from '../api/dashboard.api.js';
import { placeOrder } from '../api/order.api.js';
import { apiMessage } from '../api/axios.js';
import { formatINR } from '../utils/format.js';
import { firstImage, upiPaymentString } from '../utils/media.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { idOrSlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [payment, setPayment] = useState({ upiId: '', payeeName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    deliveryAddress: '',
    deliveryPreference: '',
    customization: '',
    notes: '',
    weight: state?.weight || '',
    flavour: state?.flavour || '',
    quantity: state?.quantity || 1,
  });

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || '',
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
      whatsappNumber: current.whatsappNumber || user.whatsappNumber || '',
      deliveryAddress: current.deliveryAddress || user.address || '',
    }));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProduct(idOrSlug), fetchPaymentConfig().catch(() => null)])
      .then(([productRes, paymentRes]) => {
        const item = productRes.data.data.product;
        setProduct(item);
        setForm((current) => ({
          ...current,
          weight: current.weight || item.pricing?.[0]?.label || '',
          flavour: current.flavour || item.flavours?.[0] || '',
        }));
        if (paymentRes) setPayment(paymentRes.data.data.payment);
      })
      .catch((err) => setError(apiMessage(err, 'Checkout could not load.')))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const estimated = useMemo(() => {
    if (!product) return 0;
    const variant = product.pricing?.find((entry) => entry.label === form.weight);
    return (variant?.price ?? product.defaultPrice) * Number(form.quantity || 1);
  }, [product, form.weight, form.quantity]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setScreenshot(file);
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!screenshot) {
      setFormError('Upload the payment screenshot so the bakery can confirm the payment.');
      return;
    }

    const payload = new FormData();
    payload.append(
      'items',
      JSON.stringify([
        {
          productId: product._id,
          quantity: Number(form.quantity),
          weight: form.weight,
          flavour: form.flavour,
          customization: form.customization,
        },
      ]),
    );
    ['name', 'email', 'phone', 'whatsappNumber', 'deliveryAddress', 'deliveryPreference', 'notes'].forEach(
      (field) => payload.append(field, form[field] || ''),
    );
    payload.append('paymentScreenshot', screenshot);

    setSubmitting(true);
    try {
      const { data } = await placeOrder(payload);
      toast.success('Order placed');
      navigate(`/order-placed/${data.data.order._id}`, { replace: true });
    } catch (err) {
      setFormError(apiMessage(err, 'The order could not be placed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page"><Loader label="Preparing your order…" /></div>;
  if (error) return <div className="container page"><ErrorState message={error} /></div>;
  if (!product) return null;

  const upiString = upiPaymentString({
    upiId: payment.upiId,
    payeeName: payment.payeeName,
    amount: estimated,
    note: `Just Cakes — ${product.name}`,
  });
  const qrSrc = upiString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`
    : '';

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <p className="text-muted">Confirm your details, pay by UPI and upload the screenshot.</p>

      {formError ? <div className="form-error mt-2">{formError}</div> : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="checkout-grid mt-2">
          <div className="stack">
            <section className="panel">
              <h2>Your details</h2>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="whatsappNumber">WhatsApp</label>
                  <input id="whatsappNumber" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="deliveryAddress">Delivery address</label>
                <textarea id="deliveryAddress" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="deliveryPreference">Preferred takeaway date and time</label>
                <input id="deliveryPreference" name="deliveryPreference" value={form.deliveryPreference} onChange={handleChange} placeholder="e.g. Saturday evening" />
              </div>
            </section>

            <section className="panel">
              <h2>Your cake</h2>
              <div className="row">
                {firstImage(product) ? (
                  <img src={firstImage(product)} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                ) : null}
                <div>
                  <strong>{product.name}</strong>
                  <div className="text-small text-muted">{product.categoryId?.name}</div>
                </div>
              </div>

              <div className="form-grid mt-2">
                <div className="field">
                  <label htmlFor="weight">Price</label>
                  <select id="weight" name="weight" value={form.weight} onChange={handleChange} required>
                    {product.pricing.map((entry) => (
                      <option key={entry.label} value={entry.label}>
                        {entry.label} — {formatINR(entry.price)}
                      </option>
                    ))}
                  </select>
                </div>
                {product.flavours?.length ? (
                  <div className="field">
                    <label htmlFor="flavour">Flavour</label>
                    <select id="flavour" name="flavour" value={form.flavour} onChange={handleChange}>
                      {product.flavours.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="field">
                  <label htmlFor="quantity">Quantity</label>
                  <input id="quantity" name="quantity" type="number" min="1" max="50" value={form.quantity} onChange={handleChange} required />
                </div>
              </div>

              <div className="field">
                <label htmlFor="customization">Message or decoration on the cake</label>
                <input id="customization" name="customization" value={form.customization} onChange={handleChange} placeholder="e.g. Happy Birthday Aarav" />
              </div>
              <div className="field">
                <label htmlFor="notes">Anything else we should know</label>
                <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} />
              </div>
            </section>

            <section className="panel">
              <h2>Pay and upload the screenshot</h2>
              <div className="qr-box">
                {qrSrc ? (
                  <>
                    <img src={qrSrc} alt="UPI payment QR code" />
                    <div className="text-small">
                      <strong>{payment.payeeName}</strong>
                      <div>{payment.upiId}</div>
                    </div>
                  </>
                ) : (
                  <p className="text-small text-muted" style={{ margin: 0 }}>
                    The bakery has not published UPI details yet. Call the shop to arrange payment.
                  </p>
                )}
                <div className="text-small">Pay {formatINR(estimated)} and screenshot the confirmation.</div>
              </div>

              <div className="file-drop mt-2">
                <label htmlFor="paymentScreenshot" className="btn btn--ghost btn--sm">Choose screenshot</label>
                <input
                  id="paymentScreenshot"
                  name="paymentScreenshot"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile}
                  style={{ display: 'block', margin: '0.6rem auto 0' }}
                  required
                />
                <span className="field-hint">Only you and the bakery can view this file.</span>
                {preview ? <img className="file-preview" src={preview} alt="Payment screenshot preview" /> : null}
              </div>
            </section>
          </div>

          <aside className="panel" style={{ position: 'sticky', top: '88px' }}>
            <h2>Order summary</h2>
            <div className="summary-line">
              <span>{product.name} × {form.quantity}</span>
              <span>{formatINR(estimated)}</span>
            </div>
            <div className="summary-line text-muted text-small">
              <span>{form.weight}{form.flavour ? ` · ${form.flavour}` : ''}</span>
            </div>
            <div className="summary-line">
              <span>Takeaway from the bakery</span>
              <span>894, Jawahar Nagar, Konch,<br/> Uttar Pradesh 285205</span>
              
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatINR(estimated)}</span>
            </div>
            {/* <p className="text-small text-muted mt-1">
              The server recalculates this total from the menu before saving your order.
            </p> */}
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}
