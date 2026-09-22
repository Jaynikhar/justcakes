import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export function ProductCarousel({ products = [] }) {
  const trackRef = useRef(null);

  const scrollBy = (amount) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <div className="carousel">
      <button
        type="button"
        className="carousel__nav carousel__nav--prev"
        onClick={() => scrollBy(-320)}
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="carousel__track" ref={trackRef} tabIndex={0} aria-label="Product list">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <button
        type="button"
        className="carousel__nav carousel__nav--next"
        onClick={() => scrollBy(320)}
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default ProductCarousel;
