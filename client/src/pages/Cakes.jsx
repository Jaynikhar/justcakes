import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRow } from '../components/common/Loader.jsx';
import { fetchProducts } from '../api/product.api.js';
import { fetchCategories } from '../api/category.api.js';
import { apiMessage } from '../api/axios.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Cakes() {
  useDocumentTitle('All cakes');
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => setCategories([]));
  }, []);

  const load = () => {
    setLoading(true);
    setError('');
    fetchProducts({ category, search, sort, limit: 60 })
      .then(({ data }) => setProducts(data.data.products))
      .catch((err) => setError(apiMessage(err, 'The menu could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <h1>Our cakes</h1>
          <p>Everything on the counter today.</p>
        </div>
      </div>

      <div className="panel mt-2">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Chocolate, rasmalai…"
              defaultValue={search}
              onChange={(event) => setParam('search', event.target.value.trim())}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(event) => setParam('category', event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(event) => setParam('sort', event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="rating">Best rated</option>
              <option value="popular">Most ordered</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <SkeletonRow count={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🔎"
            title="Nothing matched that"
            message="Try a different flavour or clear the filters."
          />
        )}
      </div>
    </div>
  );
}
