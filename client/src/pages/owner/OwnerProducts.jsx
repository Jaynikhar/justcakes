import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import OwnerNav from '../../components/owner/OwnerNav.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { deleteProduct, fetchProducts } from '../../api/product.api.js';
import { apiMessage } from '../../api/axios.js';
import { formatINR } from '../../utils/format.js';
import { firstImage } from '../../utils/media.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function OwnerProducts() {
  useDocumentTitle('Products');
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    fetchProducts({ limit: 100 })
      .then(({ data }) => setProducts(data.data.products))
      .catch((err) => setError(apiMessage(err, 'Products could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteProduct(target._id);
      toast.success(`${target.name} deleted`);
      setTarget(null);
      load();
    } catch (err) {
      toast.error(apiMessage(err, 'That product could not be deleted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page stack-lg">
      <div className="row row--between">
        <h1>Products</h1>
        <Link to="/owner/products/new" className="btn btn--primary btn--sm">
          <Plus size={16} /> Add product
        </Link>
      </div>

      <OwnerNav />

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : products.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cake</th>
                <th>Category</th>
                <th>Prices</th>
                <th>Rating</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="row">
                      {firstImage(product) ? (
                        <img src={firstImage(product)} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                      ) : null}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.categoryId?.name || '—'}</td>
                  <td>
                    {product.pricing.map((entry) => `${entry.label}: ${formatINR(entry.price)}`).join(' · ')}
                  </td>
                  <td>{product.ratingCount ? `${product.ratingAverage} (${product.ratingCount})` : '—'}</td>
                  <td>{product.salesCount}</td>
                  <td>
                    <span className={product.isAvailable ? 'badge badge--success' : 'badge badge--muted'}>
                      {product.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                    {product.isFeatured ? <span className="badge">Featured</span> : null}
                  </td>
                  <td>
                    <div className="row">
                      <Link to={`/owner/products/${product._id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => setTarget(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          emoji="🎂"
          title="No products yet"
          message="Add your first cake so it appears on the storefront."
          action={<Link to="/owner/products/new" className="btn btn--primary btn--sm">Add product</Link>}
        />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete ${target?.name}?`}
        message="The cake and its ratings are removed. Past orders keep their own copy of the details."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
