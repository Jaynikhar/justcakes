import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import { createProduct, fetchProduct, updateProduct } from '../../api/product.api.js';
import { fetchCategories } from '../../api/category.api.js';
import { apiMessage } from '../../api/axios.js';
import { imageUrl } from '../../utils/media.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const emptyForm = {
  name: '',
  description: '',
  categoryId: '',
  flavours: '',
  isAvailable: true,
  isFeatured: false,
};

export default function OwnerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  useDocumentTitle(isEdit ? 'Edit product' : 'Add product');

  const [form, setForm] = useState(emptyForm);
  const [pricing, setPricing] = useState([{ label: '0.5 Kg', price: '' }]);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [keepImages, setKeepImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories({ all: 'true' })
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchProduct(id)
      .then(({ data }) => {
        const product = data.data.product;
        setForm({
          name: product.name,
          description: product.description || '',
          categoryId: product.categoryId?._id || product.categoryId || '',
          flavours: (product.flavours || []).join(', '),
          isAvailable: product.isAvailable,
          isFeatured: product.isFeatured,
        });
        setPricing(product.pricing.map((entry) => ({ label: entry.label, price: String(entry.price) })));
        setExistingImages(product.images || []);
        setKeepImages((product.images || []).map((image) => image.publicId));
      })
      .catch((err) => setError(apiMessage(err, 'That product could not load.')))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const setPriceRow = (index, key, value) => {
    setPricing((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const cleanPricing = pricing
      .filter((row) => row.label.trim() && row.price !== '')
      .map((row) => ({ label: row.label.trim(), price: Number(row.price) }));

    if (!cleanPricing.length) {
      setError('Add at least one size with a price.');
      return;
    }

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('categoryId', form.categoryId);
    payload.append(
      'flavours',
      JSON.stringify(form.flavours.split(',').map((item) => item.trim()).filter(Boolean)),
    );
    payload.append('pricing', JSON.stringify(cleanPricing));
    payload.append('isAvailable', String(form.isAvailable));
    payload.append('isFeatured', String(form.isFeatured));
    if (isEdit) payload.append('keepImages', JSON.stringify(keepImages));
    files.forEach((file) => payload.append('images', file));

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product added');
      }
      navigate('/owner/products');
    } catch (err) {
      setError(apiMessage(err, 'That product could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page"><Loader /></div>;

  return (
    <div className="container page stack-lg">
      <h1>{isEdit ? 'Edit product' : 'Add product'}</h1>
      <OwnerNav />

      <form className="panel" onSubmit={handleSubmit} noValidate>
        {error ? <div className="form-error">{error}</div> : null}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="flavours">Flavours</label>
          <input id="flavours" name="flavours" value={form.flavours} onChange={handleChange} placeholder="Chocolate, Vanilla" />
          <span className="field-hint">Separate flavours with a comma.</span>
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
          <legend style={{ fontWeight: 700, color: 'var(--color-brown)', fontSize: '0.9rem' }}>
            Sizes and prices
          </legend>
          {pricing.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="row" key={index} style={{ marginBottom: '0.5rem' }}>
              <input
                aria-label={`Size label ${index + 1}`}
                value={row.label}
                onChange={(event) => setPriceRow(index, 'label', event.target.value)}
                placeholder="0.5 Kg"
                style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
              />
              <input
                aria-label={`Price ${index + 1}`}
                type="number"
                min="0"
                value={row.price}
                onChange={(event) => setPriceRow(index, 'price', event.target.value)}
                placeholder="350"
                style={{ width: 120, padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPricing((current) => current.filter((_, i) => i !== index))}
                disabled={pricing.length === 1}
                aria-label="Remove this size"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setPricing((current) => [...current, { label: '', price: '' }])}
          >
            Add another size
          </button>
        </fieldset>

        {existingImages.length ? (
          <div className="field">
            <label>Current photos</label>
            <div className="row">
              {existingImages.map((image) => {
                const kept = keepImages.includes(image.publicId);
                return (
                  <button
                    key={image.publicId}
                    type="button"
                    className={`viewer__thumb ${kept ? 'is-active' : ''}`}
                    style={{ width: 72, height: 72, opacity: kept ? 1 : 0.4 }}
                    onClick={() =>
                      setKeepImages((current) =>
                        kept ? current.filter((item) => item !== image.publicId) : [...current, image.publicId],
                      )
                    }
                    aria-pressed={kept}
                    aria-label={kept ? 'Remove this photo' : 'Keep this photo'}
                  >
                    <img src={imageUrl(image)} alt="" />
                  </button>
                );
              })}
            </div>
            <span className="field-hint">Click a photo to drop it when you save.</span>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="images">Add photos</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
          <span className="field-hint">Up to 5 images, 3 MB each. The first one is used on the cards.</span>
        </div>

        <div className="checkbox-row">
          <input id="isAvailable" name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} />
          <label htmlFor="isAvailable">Available to order</label>
        </div>
        <div className="checkbox-row">
          <input id="isFeatured" name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={handleChange} />
          <label htmlFor="isFeatured">Feature this cake</label>
        </div>

        <div className="row">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/owner/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
