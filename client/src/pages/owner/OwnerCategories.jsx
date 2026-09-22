import { useEffect, useState } from 'react';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ImageField from '../../components/owner/ImageField.jsx';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../api/category.api.js';
import { apiMessage } from '../../api/axios.js';
import { imageUrl } from '../../utils/media.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const blank = { name: '', description: '', displayOrder: 0, isActive: true };

export default function OwnerCategories() {
  useDocumentTitle('Categories');
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    fetchCategories({ all: 'true' })
      .then(({ data }) => setCategories(data.data.categories))
      .catch((err) => setError(apiMessage(err, 'Categories could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({});
    setForm(blank);
    setFile(null);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setFile(null);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('displayOrder', String(form.displayOrder || 0));
    payload.append('isActive', String(form.isActive));
    if (file) payload.append('image', file);

    setSaving(true);
    try {
      if (editing?._id) {
        await updateCategory(editing._id, payload);
        toast.success('Category updated');
      } else {
        await createCategory(payload);
        toast.success('Category added');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That category could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteCategory(target._id);
      toast.success('Category deleted');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That category could not be deleted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page stack-lg">
      <div className="row row--between">
        <h1>Categories</h1>
        <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>Add category</button>
      </div>

      <OwnerNav />

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : categories.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Order</th>
                <th>Shown</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="row">
                      {category.image ? (
                        <img src={imageUrl(category.image)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                      ) : null}
                      {category.name}
                    </div>
                  </td>
                  <td className="text-small">{category.description || '—'}</td>
                  <td>{category.displayOrder}</td>
                  <td>
                    <span className={category.isActive ? 'badge badge--success' : 'badge badge--muted'}>
                      {category.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="row">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(category)}>Edit</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => setTarget(category)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState emoji="🗂️" title="No categories yet" message="Add a category before adding cakes." />
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?._id ? `Edit ${editing.name}` : 'Add category'}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="cat-name">Name</label>
            <input id="cat-name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="cat-description">Description</label>
            <textarea id="cat-description" name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="cat-order">Display order</label>
            <input id="cat-order" name="displayOrder" type="number" min="0" value={form.displayOrder} onChange={handleChange} />
          </div>
          <ImageField
            label="Category image"
            name="cat-image"
            onChange={setFile}
            existingUrl={editing?.image ? imageUrl(editing.image) : ''}
          />
          <div className="checkbox-row">
            <input id="cat-active" name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
            <label htmlFor="cat-active">Show on the storefront</label>
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Saving…' : 'Save category'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete ${target?.name}?`}
        message="Categories holding products cannot be deleted. Move the cakes first."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
