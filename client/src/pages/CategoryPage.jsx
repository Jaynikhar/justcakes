import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard.jsx';
import ReviewStrip from '../components/home/ReviewStrip.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRow } from '../components/common/Loader.jsx';
import { fetchProducts } from '../api/product.api.js';
import { fetchCategories } from '../api/category.api.js';
import { fetchLatestReviews } from '../api/review.api.js';
import { apiMessage } from '../api/axios.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle(category?.name || 'Category');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([fetchCategories(), fetchProducts({ category: slug, limit: 60 }), fetchLatestReviews(20)])
      .then(([categoryRes, productRes, reviewRes]) => {
        const found = categoryRes.data.data.categories.find((item) => item.slug === slug) || null;
        setCategory(found);
        setProducts(productRes.data.data.products);
        setReviews(reviewRes.data.data.reviews);
      })
      .catch((err) => setError(apiMessage(err, 'That category could not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="container page">
        <SkeletonRow count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <h1>{category?.name || 'Category'}</h1>
          {category?.description ? <p>{category.description}</p> : null}
        </div>
        <Link to="/cakes" className="btn btn--ghost btn--sm">All cakes</Link>
      </div>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState emoji="🧁" title="Nothing here yet" message="This category has no cakes on the menu." />
      )}

      <div className="mt-3">
        <ReviewStrip
          reviews={reviews.filter((review) =>
            products.some((product) => product.name === review.productNameSnapshot),
          )}
        />
      </div>
    </div>
  );
}
