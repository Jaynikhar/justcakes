import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlideshow from '../components/home/HeroSlideshow.jsx';
import ProductCarousel from '../components/product/ProductCarousel.jsx';
import ReviewStrip from '../components/home/ReviewStrip.jsx';
import StatsSection from '../components/home/StatsSection.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRow } from '../components/common/Loader.jsx';
import { fetchActiveSlides } from '../api/slide.api.js';
import { fetchCategories } from '../api/category.api.js';
import { fetchProducts } from '../api/product.api.js';
import { fetchLatestReviews } from '../api/review.api.js';
import { fetchPublicStats } from '../api/dashboard.api.js';
import { apiMessage } from '../api/axios.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Home() {
  useDocumentTitle('');
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [slideRes, categoryRes, reviewRes, statsRes] = await Promise.all([
        fetchActiveSlides(),
        fetchCategories(),
        fetchLatestReviews(12),
        fetchPublicStats(),
      ]);

      const categoryList = categoryRes.data.data.categories;
      setSlides(slideRes.data.data.slides);
      setCategories(categoryList);
      setReviews(reviewRes.data.data.reviews);
      setStats(statsRes.data.data.stats);

      const productResults = await Promise.all(
        categoryList.map((category) =>
          fetchProducts({ category: category.slug, limit: 12 })
            .then(({ data }) => [category.slug, data.data.products])
            .catch(() => [category.slug, []]),
        ),
      );
      setProductsByCategory(Object.fromEntries(productResults));
    } catch (err) {
      setError(apiMessage(err, 'The storefront could not load.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="container page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const reviewsFor = (categoryName) =>
    reviews.filter((review) => review.productNameSnapshot && review.categoryName === categoryName);

  return (
    <>
      <HeroSlideshow slides={slides} loading={loading} />

      <section className="section section--cream">
        <div className="container text-center">
          <h1>Fresh baked with love</h1>
          <p style={{ margin: '0 auto 1.25rem' }}>
            Signature cakes, premium creations and everyday treats — baked the day you order them,
            with prices set by the bakery and never by a middleman.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link to="/cakes" className="btn btn--primary">Browse the menu</Link>
            <Link to="/contact" className="btn btn--ghost">Order something custom</Link>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container section">
          <SkeletonRow count={4} />
        </div>
      ) : (
        categories.map((category, index) => {
          const items = productsByCategory[category.slug] || [];
          return (
            <section
              key={category._id}
              className={`section ${index % 2 === 0 ? 'section--white' : ''}`}
              id={category.slug}
            >
              <div className="container">
                <div className="section-head">
                  <div>
                    <h2>{category.name}</h2>
                    {category.description ? <p>{category.description}</p> : null}
                  </div>
                  <Link to={`/category/${category.slug}`} className="btn btn--ghost btn--sm">
                    See all
                  </Link>
                </div>

                {items.length ? (
                  <ProductCarousel products={items} />
                ) : (
                  <EmptyState
                    emoji="🍰"
                    title={`No ${category.name.toLowerCase()} on the menu yet`}
                    message="The bakery adds cakes to this section from the dashboard."
                  />
                )}

                <ReviewStrip
                  reviews={reviews.filter((review) =>
                    items.some((item) => item.name === review.productNameSnapshot),
                  )}
                />
              </div>
            </section>
          );
        })
      )}

      <StatsSection stats={stats} />

      <section className="section">
        <div className="container text-center">
          <h2>Something special coming up?</h2>
          <p style={{ margin: '0 auto 1.25rem' }}>
            Tell us the flavour, the weight and the message on top. We bake it and deliver it fresh.
          </p>
          <Link to="/cakes" className="btn btn--brown">Pick a cake</Link>
        </div>
      </section>
    </>
  );
}
