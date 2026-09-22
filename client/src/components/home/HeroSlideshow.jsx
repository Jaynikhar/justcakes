import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrl } from '../../utils/media.js';

const INTERVAL = 2000;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function HeroSlideshow({ slides = [], loading = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = useMemo(() => slides.filter((slide) => slide.isActive !== false), [slides]);

  const next = useCallback(() => {
    setIndex((current) => (active.length ? (current + 1) % active.length : 0));
  }, [active.length]);

  const prev = useCallback(() => {
    setIndex((current) => (active.length ? (current - 1 + active.length) % active.length : 0));
  }, [active.length]);

  useEffect(() => {
    if (active.length < 2 || paused || prefersReducedMotion()) return undefined;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [active.length, paused, next]);

  useEffect(() => {
    if (index >= active.length) setIndex(0);
  }, [active.length, index]);

  if (loading) {
    return <div className="hero skeleton" aria-hidden="true" />;
  }

  if (!active.length) {
    return (
      <section className="hero hero--empty">
        <div>
          <h1>Fresh baked with love</h1>
          <p style={{ margin: '0 auto 1rem' }}>
            Signature cakes, premium creations and everyday treats — baked to order.
          </p>
          <Link to="/cakes" className="btn btn--brown">See the cakes</Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured cakes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {active.map((slide, slideIndex) => (
        <div
          key={slide._id}
          className={`hero__slide ${slideIndex === index ? 'is-active' : ''}`}
          aria-hidden={slideIndex !== index}
        >
          <img
            src={imageUrl(slide.image)}
            alt={slide.title || 'Just Cakes banner'}
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
          />
          {slide.title || slide.subtitle || slide.ctaText ? (
            <div className="hero__overlay">
              <div className="container">
                {slide.title ? <h2>{slide.title}</h2> : null}
                {slide.subtitle ? <p>{slide.subtitle}</p> : null}
                {slide.ctaText && slide.ctaLink ? (
                  <Link to={slide.ctaLink} className="btn btn--primary">
                    {slide.ctaText}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ))}

      {active.length > 1 ? (
        <>
          <button type="button" className="hero__control hero__control--prev" onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hero__control hero__control--next" onClick={next} aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
          <div className="hero__dots">
            {active.map((slide, slideIndex) => (
              <button
                key={slide._id}
                type="button"
                className={`hero__dot ${slideIndex === index ? 'is-active' : ''}`}
                onClick={() => setIndex(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default HeroSlideshow;
