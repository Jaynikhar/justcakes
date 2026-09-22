import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ImageField from '../../components/owner/ImageField.jsx';
import {
  createSlide,
  deleteSlide,
  fetchAllSlides,
  reorderSlides,
  updateSlide,
} from '../../api/slide.api.js';
import { apiMessage } from '../../api/axios.js';
import { imageUrl } from '../../utils/media.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const blank = { title: '', subtitle: '', ctaText: '', ctaLink: '', isActive: true };

export default function OwnerSlides() {
  useDocumentTitle('Slideshow');
  const toast = useToast();

  const [slides, setSlides] = useState([]);
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
    fetchAllSlides()
      .then(({ data }) => setSlides(data.data.slides))
      .catch((err) => setError(apiMessage(err, 'Slides could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({});
    setForm(blank);
    setFile(null);
  };

  const openEdit = (slide) => {
    setEditing(slide);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      isActive: slide.isActive,
    });
    setFile(null);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!editing?._id && !file) {
      toast.error('Choose an image for the slide.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
    if (file) payload.append('image', file);

    setSaving(true);
    try {
      if (editing?._id) {
        await updateSlide(editing._id, payload);
        toast.success('Slide updated');
      } else {
        await createSlide(payload);
        toast.success('Slide added');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That slide could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, direction) => {
    const next = [...slides];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setSlides(next);
    try {
      await reorderSlides(next.map((slide, position) => ({ id: slide._id, displayOrder: position })));
      toast.success('Slide order saved');
    } catch (err) {
      toast.error(apiMessage(err, 'The new order could not be saved.'));
      load();
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteSlide(target._id);
      toast.success('Slide deleted');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That slide could not be deleted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page stack-lg">
      <div className="row row--between">
        <h1>Homepage slideshow</h1>
        <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>Add slide</button>
      </div>

      <OwnerNav />

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : slides.length ? (
        <div className="stack">
          {slides.map((slide, index) => (
            <article className="card row row--between" key={slide._id}>
              <div className="row">
                <img
                  src={imageUrl(slide.image)}
                  alt=""
                  style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div>
                  <strong>{slide.title || 'Untitled slide'}</strong>
                  <div className="text-small text-muted">{slide.subtitle || 'No subtitle'}</div>
                  {slide.ctaText ? (
                    <div className="text-small">Button: {slide.ctaText} → {slide.ctaLink || '/'}</div>
                  ) : null}
                  <span className={slide.isActive ? 'badge badge--success' : 'badge badge--muted'}>
                    {slide.isActive ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="row">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                  <ArrowUp size={15} />
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => move(index, 1)} disabled={index === slides.length - 1} aria-label="Move down">
                  <ArrowDown size={15} />
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(slide)}>Edit</button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => setTarget(slide)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          emoji="🖼️"
          title="No slides yet"
          message="Until you add one, the homepage shows a plain welcome banner."
        />
      )}

      <Modal open={Boolean(editing)} title={editing?._id ? 'Edit slide' : 'Add slide'} onClose={() => setEditing(null)}>
        <form onSubmit={save}>
          <ImageField
            label="Slide image"
            name="slide-image"
            onChange={setFile}
            existingUrl={editing?.image ? imageUrl(editing.image) : ''}
            hint="Wide banner images work best (roughly 1600 × 600)."
          />
          <div className="field">
            <label htmlFor="slide-title">Title</label>
            <input id="slide-title" name="title" value={form.title} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="slide-subtitle">Subtitle</label>
            <input id="slide-subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="slide-cta">Button text</label>
              <input id="slide-cta" name="ctaText" value={form.ctaText} onChange={handleChange} placeholder="See the cakes" />
            </div>
            <div className="field">
              <label htmlFor="slide-link">Button link</label>
              <input id="slide-link" name="ctaLink" value={form.ctaLink} onChange={handleChange} placeholder="/cakes" />
            </div>
          </div>
          <div className="checkbox-row">
            <input id="slide-active" name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
            <label htmlFor="slide-active">Show on the homepage</label>
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Saving…' : 'Save slide'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this slide?"
        message="It disappears from the homepage immediately."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
